const { pool } = require('./db');

async function addToMedico(medicoId, especialidadId) {
  try {
    const [result] = await pool.query(
      `INSERT INTO MedicoEspecialidad (medicoId, especialidadId)
       VALUES (:medicoId, :especialidadId)`,
      { medicoId: Number(medicoId), especialidadId: Number(especialidadId) }
    );
    return { id: result.insertId, medicoId: Number(medicoId), especialidadId: Number(especialidadId) };
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') {
      const err = new Error('La especialidad ya está asignada a este médico');
      err.status = 409;
      throw err;
    }
    if (e && e.code === 'ER_NO_REFERENCED_ROW_2') {
      const err = new Error('El médico o la especialidad no existen');
      err.status = 400;
      throw err;
    }
    throw e;
  }
}

async function removeFromMedico(medicoId, especialidadId) {
  const [result] = await pool.query(
    `DELETE FROM MedicoEspecialidad
      WHERE medicoId = :medicoId AND especialidadId = :especialidadId`,
    { medicoId: Number(medicoId), especialidadId: Number(especialidadId) }
  );
  return result.affectedRows > 0;
}

async function listByMedico(medicoId, { page = 1, size = 20 } = {}) {
  const offset = (page - 1) * size;
  const params = { medicoId: Number(medicoId), limit: Number(size), offset };

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM MedicoEspecialidad me
       JOIN Especialidad e ON e.id = me.especialidadId
      WHERE me.medicoId = :medicoId`,
    { medicoId: Number(medicoId) }
  );

  const [rows] = await pool.query(
    `SELECT e.id, e.nombre, e.descripcion
       FROM MedicoEspecialidad me
       JOIN Especialidad e ON e.id = me.especialidadId
      WHERE me.medicoId = :medicoId
   ORDER BY e.nombre ASC
      LIMIT :limit OFFSET :offset`,
    params
  );

  return { data: rows, meta: { page: Number(page), size: Number(size), total } };
}

/* Extra opcional: listar médicos por especialidad (útil para filtros) */
async function listMedicosByEspecialidad(especialidadId, { page = 1, size = 20 } = {}) {
  const offset = (page - 1) * size;
  const params = { especialidadId: Number(especialidadId), limit: Number(size), offset };

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM MedicoEspecialidad me
       JOIN Medico m ON m.id = me.medicoId
      WHERE me.especialidadId = :especialidadId`,
    { especialidadId: Number(especialidadId) }
  );

  const [rows] = await pool.query(
    `SELECT m.id, m.hospitalId, m.nombres, m.apellidos, m.email, m.activo
       FROM MedicoEspecialidad me
       JOIN Medico m ON m.id = me.medicoId
      WHERE me.especialidadId = :especialidadId
   ORDER BY m.apellidos ASC, m.nombres ASC
      LIMIT :limit OFFSET :offset`,
    params
  );

  return { data: rows, meta: { page: Number(page), size: Number(size), total } };
}

module.exports = { addToMedico, removeFromMedico, listByMedico, listMedicosByEspecialidad };
