const { pool } = require('./db');

async function list({ page = 1, size = 20, q = '' }) {
  const offset = (page - 1) * size;
  let where = '';
  const params = { limit: Number(size), offset: Number(offset) };

  if (q) {
    where = 'WHERE nombre LIKE :q';
    params.q = `%${q}%`;
  }

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM Especialidad ${where}`, params
  );

  const [rows] = await pool.query(
    `SELECT id, nombre, descripcion
       FROM Especialidad ${where}
   ORDER BY nombre ASC
      LIMIT :limit OFFSET :offset`, params
  );

  return { data: rows, meta: { page: Number(page), size: Number(size), total } };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, nombre, descripcion
       FROM Especialidad
      WHERE id = :id`, { id: Number(id) }
  );
  return rows[0] || null;
}

async function create(dto) {
  try {
    const [result] = await pool.query(
      `INSERT INTO Especialidad (nombre, descripcion)
       VALUES (:nombre, :descripcion)`, dto
    );
    return findById(result.insertId);
  } catch (e) {
    // manejar duplicado de nombre (UNIQUE)
    if (e && e.code === 'ER_DUP_ENTRY') {
      const err = new Error('Ya existe una especialidad con ese nombre');
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function update(id, dto) {
  const fields = [];
  const params = { id: Number(id) };

  if (dto.nombre !== undefined) { fields.push('nombre = :nombre'); params.nombre = dto.nombre; }
  if (dto.descripcion !== undefined) { fields.push('descripcion = :descripcion'); params.descripcion = dto.descripcion; }

  if (!fields.length) return findById(id);

  try {
    const setClause = fields.join(', ');
    const [result] = await pool.query(
      `UPDATE Especialidad SET ${setClause} WHERE id = :id`, params
    );
    if (result.affectedRows === 0) return null;
    return findById(id);
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') {
      const err = new Error('Ya existe una especialidad con ese nombre');
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function remove(id) {
  const [result] = await pool.query(
    `DELETE FROM Especialidad WHERE id = :id`, { id: Number(id) }
  );
  return result.affectedRows > 0;
}

module.exports = { list, findById, create, update, remove };
