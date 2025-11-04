const { pool } = require('./db');

// Listado con paginación y filtros (hospitalId, q por nombre/apellido/email, tipo)
async function list({ page = 1, size = 20, q = '', hospitalId, tipo }) {
  const offset = (page - 1) * size;
  const params = { limit: Number(size), offset: Number(offset) };

  const whereParts = [];
  if (hospitalId) {
    whereParts.push('e.hospitalId = :hospitalId');
    params.hospitalId = Number(hospitalId);
  }
  if (tipo) {
    whereParts.push('e.tipo = :tipo');
    params.tipo = tipo;
  }
  if (q) {
    whereParts.push('(e.nombres LIKE :q OR e.apellidos LIKE :q OR e.email LIKE :q)');
    params.q = `%${q}%`;
  }
  const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM empleado e
       ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT e.id, e.hospitalId, e.nombres, e.apellidos, e.tipo, e.email, e.telefono, e.activo,
            h.nombre AS hospitalNombre
       FROM empleado e
       JOIN hospital h ON h.id = e.hospitalId
       ${where}
   ORDER BY e.apellidos ASC, e.nombres ASC
      LIMIT :limit OFFSET :offset`,
    params
  );

  return { data: rows, meta: { page: Number(page), size: Number(size), total } };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT e.id, e.hospitalId, e.nombres, e.apellidos, e.tipo, e.email, e.telefono, e.activo,
            h.nombre AS hospitalNombre
       FROM empleado e
       JOIN hospital h ON h.id = e.hospitalId
      WHERE e.id = :id`,
    { id: Number(id) }
  );
  return rows[0] || null;
}

async function create(dto) {
  try {
    // Verificar si el email ya existe en usuario o empleado
    if (dto.email) {
      const [existingUser] = await pool.query(
        `SELECT id FROM usuario WHERE email = :email 
         UNION
         SELECT id FROM empleado WHERE email = :email 
         LIMIT 1`,
        { email: dto.email }
      );
      
      if (existingUser.length > 0) {
        const err = new Error('El correo electrónico ya está registrado en el sistema');
        err.status = 409; // Conflict
        throw err;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO empleado (hospitalId, nombres, apellidos, tipo, email, telefono, activo)
       VALUES (:hospitalId, :nombres, :apellidos, :tipo, :email, :telefono, COALESCE(:activo, TRUE))`,
      {
        hospitalId: dto.hospitalId,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        tipo: dto.tipo,
        email: dto.email || null,
        telefono: dto.telefono || null,
        activo: dto.activo ?? true
      }
    );

    const empleadoId = result.insertId;
    return findById(empleadoId);
  } catch (e) {
    // FK hospital inexistente
    if (e && e.code === 'ER_NO_REFERENCED_ROW_2') {
      const err = new Error('El hospital indicado no existe');
      err.status = 400;
      throw err;
    }
    
    throw e;
  }
}

async function update(id, dto) {
  const fields = [];
  const params = { id: Number(id) };

  // Verificar si el email ya existe en usuario o empleado (excluyendo el empleado actual)
  if (dto.email !== undefined) {
    const [existingUser] = await pool.query(
      `SELECT id FROM usuario WHERE email = :email 
       UNION
       SELECT id FROM empleado WHERE email = :email AND id != :empleadoId
       LIMIT 1`,
      { email: dto.email, empleadoId: Number(id) }
    );
    
    if (existingUser.length > 0) {
      const err = new Error('El correo electrónico ya está registrado en el sistema');
      err.status = 409; // Conflict
      throw err;
    }
    
    fields.push('email = :email');
    params.email = dto.email;
  }

  if (dto.hospitalId !== undefined) { fields.push('hospitalId = :hospitalId'); params.hospitalId = Number(dto.hospitalId); }
  if (dto.nombres !== undefined)    { fields.push('nombres = :nombres');       params.nombres = dto.nombres; }
  if (dto.apellidos !== undefined)  { fields.push('apellidos = :apellidos');   params.apellidos = dto.apellidos; }
  if (dto.tipo !== undefined)       { fields.push('tipo = :tipo');             params.tipo = dto.tipo; }
  if (dto.telefono !== undefined)   { fields.push('telefono = :telefono');     params.telefono = dto.telefono; }
  if (dto.activo !== undefined)     { fields.push('activo = :activo');         params.activo = dto.activo; }

  if (!fields.length) return findById(id);

  const setClause = fields.join(', ');
  try {
    const [result] = await pool.query(
      `UPDATE empleado SET ${setClause} WHERE id = :id`,
      params
    );
    if (result.affectedRows === 0) return null;
    return findById(id);
  } catch (e) {
    if (e && e.code === 'ER_NO_REFERENCED_ROW_2') {
      const err = new Error('El hospital indicado no existe');
      err.status = 400;
      throw err;
    }
    throw e;
  }
}

async function remove(id) {
  const [result] = await pool.query(
    `DELETE FROM empleado WHERE id = :id`,
    { id: Number(id) }
  );
  return result.affectedRows > 0;
}

// Obtener estadísticas de empleados por hospital
async function getStatsByHospital(hospitalId) {
  const [rows] = await pool.query(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
       SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos,
       tipo,
       COUNT(*) as cantidad_por_tipo
     FROM empleado 
     WHERE hospitalId = :hospitalId 
     GROUP BY tipo
     ORDER BY cantidad_por_tipo DESC`,
    { hospitalId: Number(hospitalId) }
  );
  return rows;
}

module.exports = { list, findById, create, update, remove, getStatsByHospital };
