const { pool } = require('./db');

// listado general con filtros (para admin)
async function list({ page=1, size=20, hospitalId, medicoId, estado, desde, hasta, q }) {
  const offset = (page-1)*size;
  const params = { limit:+size, offset, };
  const where = [];

  if (hospitalId) { where.push('c.hospitalId = :hospitalId'); params.hospitalId = +hospitalId; }
  if (medicoId)   { where.push('c.medicoId = :medicoId');     params.medicoId   = +medicoId;   }
  if (estado)     { where.push('c.estado = :estado');         params.estado     = estado;      }
  if (desde)      { where.push('c.fechaInicio >= :desde');    params.desde      = desde;       }
  if (hasta)      { where.push('c.fechaFin    <= :hasta');    params.hasta      = hasta;       }
  if (q)          { where.push('(c.pacienteNombre LIKE :q OR c.motivo LIKE :q)'); params.q = `%${q}%`; }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM Cita c ${whereSQL}`, params);

  const [rows] = await pool.query(
    `SELECT c.*, m.nombres AS medicoNombres, m.apellidos AS medicoApellidos
       FROM Cita c
       JOIN Medico m ON m.id = c.medicoId
      ${whereSQL}
   ORDER BY c.fechaInicio DESC
      LIMIT :limit OFFSET :offset`, params);

  return { data: rows, meta: { page:+page, size:+size, total } };
}

async function listByMedico(medicoId, { page=1, size=20, estado, desde, hasta } = {}) {
  return list({ page, size, medicoId, estado, desde, hasta });
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT * FROM Cita WHERE id = :id`, { id:+id });
  return rows[0] || null;
}

async function createAdmin(dto) {
  const [r] = await pool.query(
    `INSERT INTO Cita
     (hospitalId, medicoId, pacienteId, motivo, pacienteNombre, fechaInicio, fechaFin, estado, creadaPorId)
     VALUES (:hospitalId, :medicoId, :pacienteId, :motivo, :pacienteNombre, :fechaInicio, :fechaFin, 'PROGRAMADA', :creadaPorId)`,
    dto
  );
  return findById(r.insertId);
}

async function createByMedico({ medico, payload, userId }) {
  // hospitalId se toma del médico
  const dto = {
    hospitalId: medico.hospitalId,
    medicoId: medico.id,
    pacienteId: payload.pacienteId,
    motivo: payload.motivo,
    pacienteNombre: payload.pacienteNombre || '', // si decides capturar nombre libre además del pacienteId
    fechaInicio: payload.fechaInicio,
    fechaFin: payload.fechaFin,
    creadaPorId: userId
  };
  return createAdmin(dto);
}

async function updateAdmin(id, dto, userId) {
  const fields = [];
  const params = { id:+id, actualizadaPorId: userId };

  for (const k of ['hospitalId','medicoId','pacienteId','motivo','pacienteNombre','fechaInicio','fechaFin','estado']) {
    if (dto[k] !== undefined) { fields.push(`${k} = :${k}`); params[k] = dto[k]; }
  }
  if (!fields.length) return findById(id);
  const set = fields.join(', ') + ', updatedAt = NOW(), actualizadaPorId = :actualizadaPorId';
  const [res] = await pool.query(`UPDATE Cita SET ${set} WHERE id = :id`, params);
  if (res.affectedRows===0) return null;
  return findById(id);
}

// Reprogramar por médico: solo fechas, solo si la cita aún no empezó y le pertenece
async function reprogramarByMedico({ citaId, medicoId, fechaInicio, fechaFin, userId }) {
  // Verificar pertenencia y que no haya iniciado
  const [rows] = await pool.query(
    `SELECT id, medicoId, fechaInicio FROM Cita WHERE id = :id AND medicoId = :medicoId`,
    { id:+citaId, medicoId:+medicoId }
  );
  const cita = rows[0];
  if (!cita) return { notFound: true };

  const now = new Date();
  if (new Date(cita.fechaInicio) <= now) {
    return { locked: true }; // ya inició/pasó
  }

  const [res] = await pool.query(
    `UPDATE Cita
        SET fechaInicio = :fechaInicio,
            fechaFin    = :fechaFin,
            updatedAt   = NOW(),
            actualizadaPorId = :userId
      WHERE id = :id`,
    { id:+citaId, fechaInicio, fechaFin, userId:+userId }
  );
  if (res.affectedRows===0) return { notFound: true };
  return { data: await findById(citaId) };
}

async function remove(id) {
  const [r] = await pool.query(`DELETE FROM Cita WHERE id = :id`, { id:+id });
  return r.affectedRows > 0;
}

module.exports = {
  list, listByMedico, findById,
  createAdmin, createByMedico, updateAdmin, reprogramarByMedico, remove
};
