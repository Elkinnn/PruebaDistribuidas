require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/infrastructure/persistence/db');

(async () => {
  try {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@demo.com';
    const pass = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(pass, 10);

    await pool.query(
      `INSERT INTO usuario (email, password, rol, activo)
       VALUES (?, ?, 'ADMIN_GLOBAL', TRUE)
       ON DUPLICATE KEY UPDATE email = email`,
      [email, hash]
    );
    console.log('✔ Admin creado:', email, 'pass:', pass);
    process.exit(0);
  } catch (e) {
    console.error('✘ Error creando admin:', e.message);
    process.exit(1);
  }
})();
