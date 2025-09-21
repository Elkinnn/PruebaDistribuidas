const { pool } = require('./db');
const { v4: uuid } = require('uuid');
const repo = require('../../infrastructure/persistence/hospital.repo');


async function list({ page = 1, size = 20, q = '' }) {
  const offset = (page - 1) * size;

  let where = '';
  const params = { limit: Number(size), offset: Number(offset) };

  if (q) {
    where = 'WHERE nombre LIKE :q';
    params.q = `%${q}%`;
  }

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM Hospital ${where}`, params
  );

  const [rows] = await pool.query(
    `SELECT id, nombre, direccion, telefono, activo
     FROM Hospital ${where}
     ORDER BY nombre ASC
     LIMIT :limit OFFSET :offset`, params
  );

  return { data: rows, meta: { page: Number(page), size: Number(size), total } };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, nombre, direccion, telefono, activo
     FROM Hospital WHERE id = :id`, { id }
  );
  return rows[0] || null;
}

async function create(dto) {
  const id = uuid();
  await pool.query(
    `INSERT INTO Hospital (id, nombre, direccion, telefono, activo)
     VALUES (:id, :nombre, :direccion, :telefono, COALESCE(:activo, TRUE))`,
    { id, ...dto }
  );
  return findById(id);
}

async function update(id, dto) {
  // Solo campos permitidos
  const fields = [];
  const params = { id };

  if (dto.nombre !== undefined) { fields.push('nombre = :nombre'); params.nombre = dto.nombre; }
  if (dto.direccion !== undefined) { fields.push('direccion = :direccion'); params.direccion = dto.direccion; }
  if (dto.telefono !== undefined) { fields.push('telefono = :telefono'); params.telefono = dto.telefono; }
  if (dto.activo !== undefined) { fields.push('activo = :activo'); params.activo = dto.activo; }

  if (!fields.length) return findById(id);

  const setClause = fields.join(', ');
  const [result] = await pool.query(
    `UPDATE Hospital SET ${setClause} WHERE id = :id`, params
  );
  if (result.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query(
    `DELETE FROM Hospital WHERE id = :id`, { id }
  );
  return result.affectedRows > 0;
}

module.exports = { list, findById, create, update, remove };
