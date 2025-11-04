#!/usr/bin/env node

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/infrastructure/persistence/db');

async function createTestUsers() {
  console.log('[INFO] Creando usuarios de prueba...');

  try {
    // Crear admin de prueba
    const adminEmail = 'admin@test.com';
    const adminPassword = 'admin123';
    const adminHash = await bcrypt.hash(adminPassword, 10);

    // Verificar si el admin ya existe
    const [existingAdmin] = await pool.query(
      'SELECT id FROM usuario WHERE email = ?',
      [adminEmail]
    );

    if (existingAdmin.length === 0) {
      await pool.query(
        `INSERT INTO usuario (email, password, rol, activo) 
         VALUES (?, ?, 'ADMIN_GLOBAL', TRUE)`,
        [adminEmail, adminHash]
      );
      console.log('[SUCCESS] Admin creado:', adminEmail, '| Password:', adminPassword);
    } else {
      console.log('[INFO] Admin ya existe:', adminEmail);
    }


    console.log('\n[SUCCESS] Usuario de prueba creado exitosamente!');
    console.log('\n[CREDENTIALS] Credenciales para Postman:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('[ERROR] Error creando usuarios:', error);
  } finally {
    await pool.end();
  }
}

createTestUsers();
