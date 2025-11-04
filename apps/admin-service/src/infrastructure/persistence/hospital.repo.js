// apps/admin-service/src/infrastructure/persistence/hospital.repo.js
const { pool } = require('./db');

/**
 * Lista hospitales con paginación y búsqueda opcional por nombre.
 * @param {Object} opts
 * @param {number} opts.page
 * @param {number} opts.size
 * @param {string} opts.q
 */
async function list({ page = 1, size = 20, q = '' }) {
  const offset = (page - 1) * size;

  let where = '';
  const params = { limit: Number(size), offset: Number(offset) };

  if (q) {
    where = 'WHERE nombre LIKE :q';
    params.q = `%${q}%`;
  }

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM hospital ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT id, nombre, direccion, telefono, activo
       FROM hospital ${where}
   ORDER BY nombre ASC
      LIMIT :limit OFFSET :offset`,
    params
  );

  return {
    data: rows,
    meta: { page: Number(page), size: Number(size), total }
  };
}

/**
 * Busca un hospital por ID.
 * @param {number} id
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, nombre, direccion, telefono, activo
       FROM hospital
      WHERE id = :id`,
    { id: Number(id) }
  );
  return rows[0] || null;
}

/**
 * Crea un hospital. El ID lo genera MySQL (AUTO_INCREMENT).
 * @param {Object} dto
 */
async function create(dto) {
  const [result] = await pool.query(
    `INSERT INTO hospital (nombre, direccion, telefono, activo)
     VALUES (:nombre, :direccion, :telefono, COALESCE(:activo, TRUE))`,
    dto
  );
  // insertId = ID autogenerado por MySQL
  return findById(result.insertId);
}

/**
 * Actualiza un hospital por ID (solo campos presentes en dto).
 * @param {number} id
 * @param {Object} dto
 */
async function update(id, dto) {
  const fields = [];
  const params = { id: Number(id) };

  if (dto.nombre !== undefined)    { fields.push('nombre = :nombre');       params.nombre = dto.nombre; }
  if (dto.direccion !== undefined) { fields.push('direccion = :direccion'); params.direccion = dto.direccion; }
  if (dto.telefono !== undefined)  { fields.push('telefono = :telefono');   params.telefono = dto.telefono; }
  if (dto.activo !== undefined)    { fields.push('activo = :activo');       params.activo = dto.activo; }

  if (!fields.length) return findById(id);

  const setClause = fields.join(', ');
  const [result] = await pool.query(
    `UPDATE hospital SET ${setClause} WHERE id = :id`,
    params
  );

  if (result.affectedRows === 0) return null;
  return findById(id);
}

/**
 * Elimina un hospital por ID.
 * @param {number} id
 */
async function remove(id) {
  const [result] = await pool.query(
    `DELETE FROM hospital WHERE id = :id`,
    { id: Number(id) }
  );
  return result.affectedRows > 0;
}

module.exports = { list, findById, create, update, remove };
