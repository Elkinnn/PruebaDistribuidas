#!/usr/bin/env node

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/infrastructure/persistence/db');

async function createTestUsers() {
  console.log('🔧 Creando usuarios de prueba...');

  try {
    // Crear admin de prueba
    const adminEmail = 'admin@test.com';
    const adminPassword = 'admin123';
    const adminHash = await bcrypt.hash(adminPassword, 10);

    // Verificar si el admin ya existe
    const [existingAdmin] = await pool.query(
      'SELECT id FROM Usuario WHERE email = ?',
      [adminEmail]
    );

    if (existingAdmin.length === 0) {
      await pool.query(
        `INSERT INTO Usuario (email, password, rol, activo) 
         VALUES (?, ?, 'ADMIN_GLOBAL', TRUE)`,
        [adminEmail, adminHash]
      );
      console.log('✅ Admin creado:', adminEmail, '| Password:', adminPassword);
    } else {
      console.log('ℹ️  Admin ya existe:', adminEmail);
    }


    console.log('\n🎉 Usuario de prueba creado exitosamente!');
    console.log('\n📋 Credenciales para Postman:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ ADMIN:                                  │');
    console.log('│ Email: admin@test.com                   │');
    console.log('│ Password: admin123                      │');
    console.log('└─────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await pool.end();
  }
}

createTestUsers();
