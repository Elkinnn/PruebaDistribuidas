const { pool } = require('./db');
const bcrypt = require('bcryptjs');

// Listado con paginación y filtros (hospitalId, q por nombre/apellido/email)
async function list({ page = 1, size = 20, q = '', hospitalId }) {
  const offset = (page - 1) * size;
  const params = { limit: Number(size), offset: Number(offset) };

  const whereParts = [];
  if (hospitalId) {
    whereParts.push('m.hospitalId = :hospitalId');
    params.hospitalId = Number(hospitalId);
  }
  if (q) {
    whereParts.push('(m.nombres LIKE :q OR m.apellidos LIKE :q OR m.email LIKE :q)');
    params.q = `%${q}%`;
  }
  const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM Medico m
       ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT m.id, m.hospitalId, m.nombres, m.apellidos, m.email, m.activo,
            h.nombre AS hospitalNombre
       FROM Medico m
       JOIN Hospital h ON h.id = m.hospitalId
       ${where}
   ORDER BY m.apellidos ASC, m.nombres ASC
      LIMIT :limit OFFSET :offset`,
    params
  );

  return { data: rows, meta: { page: Number(page), size: Number(size), total } };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT m.id, m.hospitalId, m.nombres, m.apellidos, m.email, m.activo,
            h.nombre AS hospitalNombre
       FROM Medico m
       JOIN Hospital h ON h.id = m.hospitalId
      WHERE m.id = :id`,
    { id: Number(id) }
  );
  return rows[0] || null;
}

async function create(dto) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Crear el médico
    const [medicoResult] = await conn.query(
      `INSERT INTO Medico (hospitalId, nombres, apellidos, email, activo)
       VALUES (:hospitalId, :nombres, :apellidos, :email, COALESCE(:activo, TRUE))`,
      {
        hospitalId: dto.hospitalId,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        email: dto.email,
        activo: dto.activo ?? true
      }
    );

    const medicoId = medicoResult.insertId;

    // 2. Crear el usuario asociado
    const passwordHash = await bcrypt.hash(dto.password, 10);
    
    await conn.query(
      `INSERT INTO Usuario (email, password, rol, medicoId, activo)
       VALUES (:email, :password, 'MEDICO', :medicoId, TRUE)`,
      {
        email: dto.email,
        password: passwordHash,
        medicoId: medicoId
      }
    );

    await conn.commit();
    return findById(medicoId);
  } catch (e) {
    await conn.rollback();
    
    // UNIQUE (hospitalId, email) en Medico
    if (e && e.code === 'ER_DUP_ENTRY' && e.sqlMessage.includes('uk_medico_hospital_email')) {
      const err = new Error('Ya existe un médico con ese email en ese hospital');
      err.status = 409;
      throw err;
    }
    
    // UNIQUE email en Usuario
    if (e && e.code === 'ER_DUP_ENTRY' && e.sqlMessage.includes('email')) {
      const err = new Error('Ya existe un usuario con ese email');
      err.status = 409;
      throw err;
    }
    
    // FK hospital inexistente
    if (e && e.code === 'ER_NO_REFERENCED_ROW_2') {
      const err = new Error('El hospital indicado no existe');
      err.status = 400;
      throw err;
    }
    
    throw e;
  } finally {
    conn.release();
  }
}

async function update(id, dto) {
  const fields = [];
  const params = { id: Number(id) };

  if (dto.hospitalId !== undefined) { fields.push('hospitalId = :hospitalId'); params.hospitalId = Number(dto.hospitalId); }
  if (dto.nombres !== undefined)    { fields.push('nombres = :nombres');       params.nombres = dto.nombres; }
  if (dto.apellidos !== undefined)  { fields.push('apellidos = :apellidos');   params.apellidos = dto.apellidos; }
  if (dto.email !== undefined)      { fields.push('email = :email');           params.email = dto.email; }
  if (dto.activo !== undefined)     { fields.push('activo = :activo');         params.activo = dto.activo; }

  if (!fields.length) return findById(id);

  const setClause = fields.join(', ');
  try {
    const [result] = await pool.query(
      `UPDATE Medico SET ${setClause} WHERE id = :id`,
      params
    );
    if (result.affectedRows === 0) return null;
    return findById(id);
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') {
      const err = new Error('Ya existe un médico con ese email en ese hospital');
      err.status = 409;
      throw err;
    }
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
    `DELETE FROM Medico WHERE id = :id`,
    { id: Number(id) }
  );
  return result.affectedRows > 0;
}

module.exports = { list, findById, create, update, remove };
