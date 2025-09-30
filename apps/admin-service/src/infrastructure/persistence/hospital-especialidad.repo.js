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
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // 1. Eliminar la asignación hospital-especialidad
    const [result] = await conn.query(
      `DELETE FROM HospitalEspecialidad
        WHERE hospitalId = :hospitalId AND especialidadId = :especialidadId`,
      { hospitalId: Number(hospitalId), especialidadId: Number(especialidadId) }
    );
    
    if (result.affectedRows === 0) {
      await conn.rollback();
      return false;
    }
    
    // 2. Limpiar especialidades huérfanas de médicos del hospital
    // Eliminar todas las asignaciones de esta especialidad a médicos de este hospital
    await conn.query(
      `DELETE me FROM MedicoEspecialidad me
       INNER JOIN Medico m ON me.medicoId = m.id
       WHERE m.hospitalId = :hospitalId AND me.especialidadId = :especialidadId`,
      { hospitalId: Number(hospitalId), especialidadId: Number(especialidadId) }
    );
    
    console.log(`[CLEANUP] Especialidad ${especialidadId} eliminada del hospital ${hospitalId} y limpiadas referencias huérfanas`);
    
    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    console.error('[CLEANUP ERROR] Error eliminando especialidad del hospital:', error);
    throw error;
  } finally {
    conn.release();
  }
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

/**
 * Limpia especialidades huérfanas de médicos
 * Elimina asignaciones de médicos a especialidades que ya no están disponibles en su hospital
 */
async function cleanupOrphanedEspecialidades() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Encontrar y eliminar especialidades huérfanas
    const [orphaned] = await conn.query(
      `DELETE me FROM MedicoEspecialidad me
       INNER JOIN Medico m ON me.medicoId = m.id
       LEFT JOIN HospitalEspecialidad he ON he.hospitalId = m.hospitalId AND he.especialidadId = me.especialidadId
       WHERE he.especialidadId IS NULL`
    );
    
    console.log(`[CLEANUP] Especialidades huérfanas limpiadas: ${orphaned.affectedRows} registros eliminados`);
    
    await conn.commit();
    return orphaned.affectedRows;
  } catch (error) {
    await conn.rollback();
    console.error('[CLEANUP ERROR] Error limpiando especialidades huérfanas:', error);
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = { 
  addToHospital, 
  removeFromHospital, 
  listByHospital, 
  cleanupOrphanedEspecialidades 
};
