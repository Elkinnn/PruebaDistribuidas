// apps/admin-service/src/infrastructure/persistence/cita.repo.js
const { pool } = require('./db');

/* ============================
   Normalizadores
   ============================ */
function normStr(s) { return (s ?? '').trim(); }
function normEmail(s) { return normStr(s).toLowerCase(); }
function normPhone(s) { return normStr(s).replace(/\D+/g, ''); } // solo dígitos

/* ============================
   Snapshot ligero para Cita
   ============================ */
function snapshotFromPaciente(p) {
  const nombre = [p.nombres ?? '', p.apellidos ?? ''].join(' ').trim();
  return {
    pacienteNombre: nombre || null,
    pacienteTelefono: p.telefono || null,
    pacienteEmail: p.email || null,
  };
}

/* ============================
   Búsqueda de Paciente
   Orden: documento → email → teléfono → (nombre + fechaNacimiento)
   ============================ */
async function findPaciente(conn, hospitalId, p) {
  const documento = normStr(p.documento);
  const email = normEmail(p.email);
  const telefono = normPhone(p.telefono);
  const nombres = normStr(p.nombres);
  const apellidos = normStr(p.apellidos);
  const fechaNacimiento = p.fechaNacimiento ?? null;

  if (documento) {
    const [r] = await conn.query(
      `SELECT id FROM Paciente
       WHERE hospitalId = :hospitalId AND documento = :documento
       LIMIT 1`,
      { hospitalId, documento }
    );
    if (r.length) return r[0];
  }

  if (email) {
    const [r] = await conn.query(
      `SELECT id FROM Paciente
       WHERE hospitalId = :hospitalId AND LOWER(email) = :email
       LIMIT 1`,
      { hospitalId, email }
    );
    if (r.length) return r[0];
  }

  if (telefono) {
    // compara 'solo dígitos' en BD
    const [r] = await conn.query(
      `SELECT id FROM Paciente
       WHERE hospitalId = :hospitalId
         AND REPLACE(REPLACE(REPLACE(REPLACE(telefono,' ',''),'-',''),'(',''),')','') = :telefono
       LIMIT 1`,
      { hospitalId, telefono }
    );
    if (r.length) return r[0];
  }

  if (nombres && apellidos && fechaNacimiento) {
    const [r] = await conn.query(
      `SELECT id FROM Paciente
       WHERE hospitalId = :hospitalId
         AND nombres = :nombres
         AND apellidos = :apellidos
         AND fechaNacimiento = :fechaNacimiento
       LIMIT 1`,
      { hospitalId, nombres, apellidos, fechaNacimiento }
    );
    if (r.length) return r[0];
  }

  return null;
}

/* ============================
   Crea paciente si no existe (con manejo de duplicidad)
   ============================ */
async function ensurePacienteId(conn, hospitalId, paciente) {
  // normaliza entrada
  paciente = {
    ...paciente,
    documento: normStr(paciente.documento),
    email: normEmail(paciente.email),
    telefono: normPhone(paciente.telefono),
    nombres: normStr(paciente.nombres),
    apellidos: normStr(paciente.apellidos),
  };

  // intenta encontrar antes de crear
  const found = await findPaciente(conn, hospitalId, paciente);
  if (found) return found.id;

  try {
    const [ins] = await conn.query(
      `INSERT INTO Paciente
        (hospitalId, nombres, apellidos, fechaNacimiento, sexo, telefono, email, documento, activo)
       VALUES
        (:hospitalId, :nombres, :apellidos, :fechaNacimiento, :sexo, :telefono, :email, :documento, 1)`,
      {
        hospitalId,
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        fechaNacimiento: paciente.fechaNacimiento ?? null,
        sexo: paciente.sexo ?? null,
        telefono: paciente.telefono || null,
        email: paciente.email || null,
        documento: paciente.documento || null,
      }
    );
    return ins.insertId;
  } catch (e) {
    // Si hay UNIQUE y se dio condición de carrera → re-busca y devuelve el existente
    if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
      const again = await findPaciente(conn, hospitalId, paciente);
      if (again) return again.id;
    }
    throw e;
  }
}

/* ============================
   Solapes
   ============================ */
async function hasOverlapConn(conn, { medicoId, fechaInicio, fechaFin, excludeId }) {
  const params = { medicoId, inicio: fechaInicio, fin: fechaFin };
  let exclude = '';
  if (excludeId) { exclude = 'AND c.id <> :excludeId'; params.excludeId = +excludeId; }

  const [rows] = await conn.query(
    `SELECT c.id FROM Cita c
      WHERE c.medicoId = :medicoId
        AND c.estado IN ('PROGRAMADA')
        ${exclude}
        AND (:inicio < c.fechaFin)
        AND (:fin    > c.fechaInicio)
      LIMIT 1`,
    params
  );
  return rows.length > 0;
}

/* ============================
   Lectura por id
   ============================ */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT
       id, hospitalId, medicoId, pacienteId,
       pacienteNombre, pacienteTelefono, pacienteEmail,
       motivo, fechaInicio, fechaFin, estado,
       creadaPorId, actualizadaPorId, createdAt, updatedAt
     FROM Cita
     WHERE id = :id
     LIMIT 1`,
    { id: +id }
  );
  return rows[0] || null;
}

/* ============================
   Crear cita (ADMIN)
   ============================ */
async function createAdmin(dto) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // coherencia médico-hospital
    const [[{ okHosp }]] = await conn.query(
      `SELECT COUNT(*) okHosp FROM Medico WHERE id = :medicoId AND hospitalId = :hospitalId`,
      { medicoId: +dto.medicoId, hospitalId: +dto.hospitalId }
    );
    if (!okHosp) { const err = new Error('El médico no pertenece a ese hospital'); err.status = 400; throw err; }

    // solape
    if (await hasOverlapConn(conn, {
      medicoId: +dto.medicoId,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      excludeId: null,
    })) { const err = new Error('El horario se solapa con otra cita del mismo médico'); err.status = 409; throw err; }

    // resolver paciente
    let pacienteId = dto.pacienteId ? +dto.pacienteId : null;
    let snap = { pacienteNombre: null, pacienteTelefono: null, pacienteEmail: null };

    if (!pacienteId && dto.paciente) {
      pacienteId = await ensurePacienteId(conn, +dto.hospitalId, dto.paciente);
      snap = snapshotFromPaciente(dto.paciente);
    } else if (pacienteId) {
      const [pr] = await conn.query(
        `SELECT nombres, apellidos, telefono, email FROM Paciente WHERE id = :id LIMIT 1`,
        { id: pacienteId }
      );
      if (!pr.length) { const err = new Error('pacienteId no existe'); err.status = 400; throw err; }
      snap = snapshotFromPaciente(pr[0]);
    }

    const [ins] = await conn.query(
      `INSERT INTO Cita
       (hospitalId, medicoId, pacienteId, pacienteNombre, pacienteTelefono, pacienteEmail,
        motivo, fechaInicio, fechaFin, estado, creadaPorId)
       VALUES
       (:hospitalId, :medicoId, :pacienteId, :pacienteNombre, :pacienteTelefono, :pacienteEmail,
        :motivo, :fechaInicio, :fechaFin, 'PROGRAMADA', :creadaPorId)`,
      {
        hospitalId: +dto.hospitalId,
        medicoId: +dto.medicoId,
        pacienteId,
        ...snap,
        motivo: dto.motivo,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin,
        creadaPorId: dto.creadaPorId ?? null,
      }
    );

    await conn.commit();
    return findById(ins.insertId);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* ============================
   Crear cita (MÉDICO)
   ============================ */
async function createByMedico({ medico, payload, userId }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (await hasOverlapConn(conn, {
      medicoId: +medico.id,
      fechaInicio: payload.fechaInicio,
      fechaFin: payload.fechaFin,
      excludeId: null,
    })) { const err = new Error('El horario se solapa con otra cita del mismo médico'); err.status = 409; throw err; }

    let pacienteId = payload.pacienteId ? +payload.pacienteId : null;
    let snap = { pacienteNombre: null, pacienteTelefono: null, pacienteEmail: null };

    if (!pacienteId && payload.paciente) {
      pacienteId = await ensurePacienteId(conn, +medico.hospitalId, payload.paciente);
      snap = snapshotFromPaciente(payload.paciente);
    } else if (pacienteId) {
      const [pr] = await conn.query(
        `SELECT nombres, apellidos, telefono, email FROM Paciente WHERE id = :id LIMIT 1`,
        { id: pacienteId }
      );
      if (!pr.length) { const err = new Error('pacienteId no existe'); err.status = 400; throw err; }
      snap = snapshotFromPaciente(pr[0]);
    }

    const [ins] = await conn.query(
      `INSERT INTO Cita
       (hospitalId, medicoId, pacienteId, pacienteNombre, pacienteTelefono, pacienteEmail,
        motivo, fechaInicio, fechaFin, estado, creadaPorId)
       VALUES
       (:hospitalId, :medicoId, :pacienteId, :pacienteNombre, :pacienteTelefono, :pacienteEmail,
        :motivo, :fechaInicio, :fechaFin, 'PROGRAMADA', :creadaPorId)`,
      {
        hospitalId: +medico.hospitalId,
        medicoId: +medico.id,
        pacienteId,
        ...snap,
        motivo: payload.motivo,
        fechaInicio: payload.fechaInicio,
        fechaFin: payload.fechaFin,
        creadaPorId: userId ?? null,
      }
    );

    await conn.commit();
    return findById(ins.insertId);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* ============================
   Exports
   ============================ */
module.exports = {
  // lecturas
  findById,

  // creación
  createAdmin,
  createByMedico,

  // (si tienes más funciones en este archivo, añádelas aquí)
  // list,
  // listByMedico,
  // updateAdmin,
  // remove,
  // reprogramarByMedico,
};
