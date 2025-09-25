const { pool } = require('./db');

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, email, password, rol, activo
       FROM Usuario
      WHERE email = :email AND activo = TRUE`,
    { email }
  );
  return rows[0] || null;
}

async function createAdmin({ email, hash }) {
  const [result] = await pool.query(
    `INSERT INTO Usuario (email, password, rol, activo)
     VALUES (:email, :password, 'ADMIN_GLOBAL', TRUE)`,
    { email, password: hash }
  );
  return result.insertId;
}

async function createMedicoUser({ email, hash, medicoId }) {
  const [result] = await pool.query(
    `INSERT INTO Usuario (email, password, rol, medicoId, activo)
     VALUES (:email, :password, 'MEDICO', :medicoId, TRUE)`,
    { email, password: hash, medicoId: Number(medicoId) }
  );
  return result.insertId;
}

module.exports = { findByEmail, createAdmin, createMedicoUser };
