const { pool } = require('../../infrastructure/persistence/db');

/** Carga el registro del médico (id, hospitalId) a partir del usuario logueado (req.user.id) */
async function loadMedico(req, res, next) {
  try {
    // el token trae { id, email, rol }. Si es médico, su usuario debe tener medicoId
    const [rows] = await pool.query(
      `SELECT u.medicoId, m.hospitalId, m.id
         FROM usuario u
         JOIN medico m ON m.id = u.medicoId
        WHERE u.id = :id AND u.rol = 'MEDICO' AND u.activo = TRUE`,
      { id: req.user.id }
    );
    const row = rows[0];
    if (!row) return res.status(403).json({ error: 'FORBIDDEN', message: 'No es médico o no está vinculado' });
    req.medico = { id: row.id, hospitalId: row.hospitalId };
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { loadMedico };
