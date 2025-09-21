const { pool } = require('./db');

async function addToHospital(hospitalId, especialidadId) {
  try {
    const [result] = await pool.query(
      `INSERT INTO HospitalEspecialidad (hospitalId, especialidadId)
       VALUES (:hospitalId, :especialidadId)`,
      { hospitalId: Number(hospitalId), especialidadId: Number(especialidadId) }
    );
    return { id: result.insertId, hospitalId: Number(hospitalId), especialidadId: Number(especialidadId) };
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') {
      const err = new Error('La especialidad ya está asignada a este hospital');
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function removeFromHospital(hospitalId, especialidadId) {
  const [result] = await pool.query(
    `DELETE FROM HospitalEspecialidad
      WHERE hospitalId = :hospitalId AND especialidadId = :especialidadId`,
    { hospitalId: Number(hospitalId), especialidadId: Number(especialidadId) }
  );
  return result.affectedRows > 0;
}

async function listByHospital(hospitalId, { page = 1, size = 20 } = {}) {
  const offset = (page - 1) * size;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM HospitalEspecialidad he
       JOIN Especialidad e ON e.id = he.especialidadId
      WHERE he.hospitalId = :hospitalId`,
    { hospitalId: Number(hospitalId) }
  );

  const [rows] = await pool.query(
    `SELECT e.id, e.nombre, e.descripcion
       FROM HospitalEspecialidad he
       JOIN Especialidad e ON e.id = he.especialidadId
      WHERE he.hospitalId = :hospitalId
   ORDER BY e.nombre ASC
      LIMIT :limit OFFSET :offset`,
    { hospitalId: Number(hospitalId), limit: Number(size), offset }
  );

  return { data: rows, meta: { page: Number(page), size: Number(size), total } };
}

module.exports = { addToHospital, removeFromHospital, listByHospital };
