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
       c.id, c.hospitalId, c.medicoId, c.pacienteId,
       c.pacienteNombre, c.pacienteTelefono, c.pacienteEmail,
       c.motivo, c.fechaInicio, c.fechaFin, c.estado,
       c.creadaPorId, c.actualizadaPorId, c.createdAt, c.updatedAt,
       h.nombre as hospitalNombre,
       m.nombres as medicoNombres, m.apellidos as medicoApellidos,
       p.nombres as pacienteNombres, p.apellidos as pacienteApellidos,
       p.documento as pacienteDocumento, p.telefono as pacienteTelefonoCompleto,
       p.email as pacienteEmailCompleto, p.fechaNacimiento as pacienteFechaNacimiento,
       p.sexo as pacienteSexo
     FROM Cita c
     LEFT JOIN Hospital h ON c.hospitalId = h.id
     LEFT JOIN Medico m ON c.medicoId = m.id
     LEFT JOIN Paciente p ON c.pacienteId = p.id
     WHERE c.id = :id
     LIMIT 1`,
    { id: +id }
  );
  
  if (!rows[0]) return null;
  
  const cita = rows[0];
  
  // Construir objeto de respuesta con la estructura esperada por el frontend
  return {
    id: cita.id,
    hospitalId: cita.hospitalId,
    medicoId: cita.medicoId,
    pacienteId: cita.pacienteId,
    pacienteNombre: cita.pacienteNombre,
    pacienteTelefono: cita.pacienteTelefono,
    pacienteEmail: cita.pacienteEmail,
    motivo: cita.motivo,
    fechaInicio: cita.fechaInicio,
    fechaFin: cita.fechaFin,
    estado: cita.estado,
    creadaPorId: cita.creadaPorId,
    actualizadaPorId: cita.actualizadaPorId,
    createdAt: cita.createdAt,
    updatedAt: cita.updatedAt,
    hospitalNombre: cita.hospitalNombre,
    medicoNombres: cita.medicoNombres,
    medicoApellidos: cita.medicoApellidos,
    // Información completa del paciente para edición
    pacienteInfo: cita.pacienteId ? {
      nombres: cita.pacienteNombres,
      apellidos: cita.pacienteApellidos,
      documento: cita.pacienteDocumento,
      telefono: cita.pacienteTelefonoCompleto,
      email: cita.pacienteEmailCompleto,
      fechaNacimiento: cita.pacienteFechaNacimiento,
      sexo: cita.pacienteSexo
    } : null
  };
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
        :motivo, :fechaInicio, :fechaFin, :estado, :creadaPorId)`,
      {
        hospitalId: +dto.hospitalId,
        medicoId: +dto.medicoId,
        pacienteId,
        ...snap,
        motivo: dto.motivo,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin,
        estado: dto.estado || 'PROGRAMADA', // Usar el estado del DTO o PROGRAMADA por defecto
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
   Listar citas (ADMIN)
   ============================ */
async function list(filters = {}) {
  const {
    page = 1,
    size = 20,
    hospitalId,
    medicoId,
    estado,
    desde,
    hasta,
    q
  } = filters;

  let where = [];
  let params = {};

  if (hospitalId && !isNaN(hospitalId)) {
    where.push('c.hospitalId = :hospitalId');
    params.hospitalId = +hospitalId;
  }
  if (medicoId && !isNaN(medicoId)) {
    where.push('c.medicoId = :medicoId');
    params.medicoId = +medicoId;
  }
  if (estado) {
    where.push('c.estado = :estado');
    params.estado = estado;
  }
  if (desde) {
    where.push('c.fechaInicio >= :desde');
    params.desde = desde;
  }
  if (hasta) {
    where.push('c.fechaInicio <= :hasta');
    params.hasta = hasta;
  }
  if (q) {
    where.push('(c.pacienteNombre LIKE :q OR c.motivo LIKE :q)');
    params.q = `%${q}%`;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Contar total
  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM Cita c ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  // Obtener datos paginados
  const offset = (page - 1) * size;
  const [rows] = await pool.query(
    `SELECT
       c.id, c.hospitalId, c.medicoId, c.pacienteId,
       c.pacienteNombre, c.pacienteTelefono, c.pacienteEmail,
       c.motivo, c.fechaInicio, c.fechaFin, c.estado,
       c.creadaPorId, c.actualizadaPorId, c.createdAt, c.updatedAt,
       h.nombre as hospitalNombre,
       m.nombres as medicoNombres, m.apellidos as medicoApellidos
     FROM Cita c
     LEFT JOIN Hospital h ON c.hospitalId = h.id
     LEFT JOIN Medico m ON c.medicoId = m.id
     ${whereClause}
     ORDER BY c.fechaInicio DESC
     LIMIT :offset, :size`,
    { ...params, offset, size }
  );

  return {
    data: rows,
    pagination: {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size)
    }
  };
}

/* ============================
   Listar citas por médico
   ============================ */
async function listByMedico(medicoId, filters = {}) {
  const {
    page = 1,
    size = 20,
    estado,
    desde,
    hasta
  } = filters;

  let where = ['c.medicoId = :medicoId'];
  let params = { medicoId: +medicoId };

  if (estado) {
    where.push('c.estado = :estado');
    params.estado = estado;
  }
  if (desde) {
    where.push('c.fechaInicio >= :desde');
    params.desde = desde;
  }
  if (hasta) {
    where.push('c.fechaInicio <= :hasta');
    params.hasta = hasta;
  }

  const whereClause = `WHERE ${where.join(' AND ')}`;

  // Contar total
  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM Cita c ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  // Obtener datos paginados
  const offset = (page - 1) * size;
  const [rows] = await pool.query(
    `SELECT
       c.id, c.hospitalId, c.medicoId, c.pacienteId,
       c.pacienteNombre, c.pacienteTelefono, c.pacienteEmail,
       c.motivo, c.fechaInicio, c.fechaFin, c.estado,
       c.creadaPorId, c.actualizadaPorId, c.createdAt, c.updatedAt,
       h.nombre as hospitalNombre
     FROM Cita c
     LEFT JOIN Hospital h ON c.hospitalId = h.id
     ${whereClause}
     ORDER BY c.fechaInicio DESC
     LIMIT :offset, :size`,
    { ...params, offset, size }
  );

  return {
    data: rows,
    pagination: {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size)
    }
  };
}

/* ============================
   Actualizar cita (ADMIN)
   ============================ */
async function updateAdmin(id, dto, userId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar que la cita existe
    const existing = await findById(id);
    if (!existing) {
      await conn.rollback();
      return null;
    }

    // Si se cambia médico, verificar coherencia hospital-médico
    if (dto.medicoId && dto.hospitalId) {
      const [[{ okHosp }]] = await conn.query(
        `SELECT COUNT(*) okHosp FROM Medico WHERE id = :medicoId AND hospitalId = :hospitalId`,
        { medicoId: +dto.medicoId, hospitalId: +dto.hospitalId }
      );
      if (!okHosp) {
        const err = new Error('El médico no pertenece a ese hospital');
        err.status = 400;
        throw err;
      }
    }

    // Si se cambian fechas, verificar solape
    if (dto.fechaInicio || dto.fechaFin) {
      const fechaInicio = dto.fechaInicio || existing.fechaInicio;
      const fechaFin = dto.fechaFin || existing.fechaFin;
      const medicoId = dto.medicoId || existing.medicoId;

      if (await hasOverlapConn(conn, {
        medicoId: +medicoId,
        fechaInicio,
        fechaFin,
        excludeId: +id,
      })) {
        const err = new Error('El horario se solapa con otra cita del mismo médico');
        err.status = 409;
        throw err;
      }
    }

    // Construir query de actualización
    const updates = [];
    const params = { id: +id, actualizadaPorId: userId };

    if (dto.hospitalId !== undefined) {
      updates.push('hospitalId = :hospitalId');
      params.hospitalId = +dto.hospitalId;
    }
    if (dto.medicoId !== undefined) {
      updates.push('medicoId = :medicoId');
      params.medicoId = +dto.medicoId;
    }
    if (dto.motivo !== undefined) {
      updates.push('motivo = :motivo');
      params.motivo = dto.motivo;
    }
    if (dto.fechaInicio !== undefined) {
      updates.push('fechaInicio = :fechaInicio');
      params.fechaInicio = dto.fechaInicio;
    }
    if (dto.fechaFin !== undefined) {
      updates.push('fechaFin = :fechaFin');
      params.fechaFin = dto.fechaFin;
    }
    if (dto.estado !== undefined) {
      updates.push('estado = :estado');
      params.estado = dto.estado;
    }

    if (updates.length === 0) {
      await conn.rollback();
      return existing;
    }

    updates.push('actualizadaPorId = :actualizadaPorId');
    updates.push('updatedAt = NOW()');

    await conn.query(
      `UPDATE Cita SET ${updates.join(', ')} WHERE id = :id`,
      params
    );

    await conn.commit();
    return findById(id);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* ============================
   Eliminar cita
   ============================ */
async function remove(id) {
  const [result] = await pool.query(
    'DELETE FROM Cita WHERE id = :id',
    { id: +id }
  );
  return result.affectedRows > 0;
}

/* ============================
   Reprogramar cita (MÉDICO)
   ============================ */
async function reprogramarByMedico({ citaId, medicoId, fechaInicio, fechaFin, userId }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar que la cita existe y pertenece al médico
    const [cita] = await conn.query(
      `SELECT id, estado, fechaInicio FROM Cita 
       WHERE id = :citaId AND medicoId = :medicoId`,
      { citaId: +citaId, medicoId: +medicoId }
    );

    if (!cita.length) {
      await conn.rollback();
      return { notFound: true };
    }

    const citaData = cita[0];

    // Verificar que no esté en el pasado
    if (new Date(citaData.fechaInicio) < new Date()) {
      await conn.rollback();
      return { locked: true };
    }

    // Verificar solape
    if (await hasOverlapConn(conn, {
      medicoId: +medicoId,
      fechaInicio,
      fechaFin,
      excludeId: +citaId,
    })) {
      await conn.rollback();
      return { overlap: true };
    }

    // Actualizar cita
    await conn.query(
      `UPDATE Cita 
       SET fechaInicio = :fechaInicio, fechaFin = :fechaFin, 
           actualizadaPorId = :userId, updatedAt = NOW()
       WHERE id = :citaId`,
      { citaId: +citaId, fechaInicio, fechaFin, userId }
    );

    await conn.commit();
    return { data: await findById(citaId) };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* ============================
   KPIs para Dashboard
   ============================ */
async function getKpisDashboard({ desde, hasta, hospitalId } = {}) {
  let where = [];
  let params = {};

  if (desde) {
    where.push('c.fechaInicio >= :desde');
    params.desde = desde;
  }
  if (hasta) {
    where.push('c.fechaInicio <= :hasta');
    params.hasta = hasta;
  }
  if (hospitalId && !isNaN(hospitalId)) {
    where.push('c.hospitalId = :hospitalId');
    params.hospitalId = +hospitalId;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // 1. Total de citas en el rango
  const [totalResult] = await pool.query(
    `SELECT COUNT(*) as total FROM Cita c ${whereClause}`,
    params
  );
  const totalCitas = totalResult[0].total;

  // 2. Citas canceladas
  const canceladasWhere = whereClause ? `${whereClause} AND c.estado = 'CANCELADA'` : `WHERE c.estado = 'CANCELADA'`;
  const [canceladasResult] = await pool.query(
    `SELECT COUNT(*) as canceladas FROM Cita c ${canceladasWhere}`,
    params
  );
  const canceladas = canceladasResult[0].canceladas;

  // 3. Citas atendidas
  const atendidasWhere = whereClause ? `${whereClause} AND c.estado = 'ATENDIDA'` : `WHERE c.estado = 'ATENDIDA'`;
  const [atendidasResult] = await pool.query(
    `SELECT COUNT(*) as atendidas FROM Cita c ${atendidasWhere}`,
    params
  );
  const atendidas = atendidasResult[0].atendidas;

  // 4. Citas programadas
  const programadasWhere = whereClause ? `${whereClause} AND c.estado = 'PROGRAMADA'` : `WHERE c.estado = 'PROGRAMADA'`;
  const [programadasResult] = await pool.query(
    `SELECT COUNT(*) as programadas FROM Cita c ${programadasWhere}`,
    params
  );
  const programadas = programadasResult[0].programadas;

  // 5. Tiempo medio de consulta (en minutos) para citas atendidas
  const tiempoWhere = whereClause 
    ? `${whereClause} AND c.estado = 'ATENDIDA' AND c.fechaInicio IS NOT NULL AND c.fechaFin IS NOT NULL`
    : `WHERE c.estado = 'ATENDIDA' AND c.fechaInicio IS NOT NULL AND c.fechaFin IS NOT NULL`;
  const [tiempoResult] = await pool.query(
    `SELECT AVG(TIMESTAMPDIFF(MINUTE, c.fechaInicio, c.fechaFin)) as tiempoMedio 
     FROM Cita c 
     ${tiempoWhere}`,
    params
  );
  const tiempoMedio = tiempoResult[0].tiempoMedio || 0;

  // Calcular porcentajes
  const porcentajeCanceladas = totalCitas > 0 ? (canceladas / totalCitas * 100) : 0;
  const porcentajeAtendidas = totalCitas > 0 ? (atendidas / totalCitas * 100) : 0;
  const porcentajeProgramadas = totalCitas > 0 ? (programadas / totalCitas * 100) : 0;

  return {
    totalCitas,
    canceladas,
    atendidas,
    programadas,
    porcentajeCanceladas: Math.round(porcentajeCanceladas * 100) / 100,
    porcentajeAtendidas: Math.round(porcentajeAtendidas * 100) / 100,
    porcentajeProgramadas: Math.round(porcentajeProgramadas * 100) / 100,
    tiempoMedioConsulta: Math.round(tiempoMedio * 100) / 100
  };
}

/* ============================
   Exports
   ============================ */
module.exports = {
  // lecturas
  findById,
  list,
  listByMedico,

  // creación
  createAdmin,
  createByMedico,

  // actualización
  updateAdmin,
  reprogramarByMedico,

  // eliminación
  remove,

  // KPIs
  getKpisDashboard,

  // cancelar citas pasadas automáticamente
  async cancelarCitasPasadas() {
    const conn = await pool.getConnection();
    try {
      // Usar NOW() de MySQL que respeta la zona horaria del servidor
      const now = new Date().toISOString();
      
      // Debug: Mostrar la hora actual y las citas que se van a cancelar
      console.log(`🕐 Hora actual (UTC): ${now}`);
      
      // Primero consultar qué citas se van a cancelar para debug
      const [citasParaCancelar] = await conn.query(
        `SELECT id, fechaInicio, fechaFin, estado 
         FROM Cita 
         WHERE estado = 'PROGRAMADA' 
           AND fechaFin < NOW()`,
        {}
      );
      
      console.log(`📋 Citas encontradas para cancelar: ${citasParaCancelar.length}`);
      citasParaCancelar.forEach(cita => {
        console.log(`  - Cita ${cita.id}: ${cita.fechaInicio} → ${cita.fechaFin} (${cita.estado})`);
      });
      
      // Actualizar citas programadas que ya pasaron su fecha de fin
      // Usar NOW() de MySQL que respeta la zona horaria del servidor
      const [result] = await conn.query(
        `UPDATE Cita 
         SET estado = 'CANCELADA', updatedAt = NOW()
         WHERE estado = 'PROGRAMADA' 
           AND fechaFin < NOW()`,
        {}
      );

      return {
        citasCanceladas: result.affectedRows,
        mensaje: `Se cancelaron ${result.affectedRows} citas pasadas automáticamente`
      };
    } catch (e) {
      throw e;
    } finally {
      conn.release();
    }
  },

};
