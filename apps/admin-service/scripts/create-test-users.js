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

    // Crear médico de prueba
    const medicoEmail = 'medico@test.com';
    const medicoPassword = 'medico123';
    const medicoHash = await bcrypt.hash(medicoPassword, 10);

    // Verificar si el médico ya existe
    const [existingMedico] = await pool.query(
      'SELECT id FROM Usuario WHERE email = ?',
      [medicoEmail]
    );

    if (existingMedico.length === 0) {
      // Primero necesitamos crear un médico en la tabla Medico
      // Asumimos que existe un hospital con ID 1, si no existe lo creamos
      const [hospitales] = await pool.query('SELECT id FROM Hospital LIMIT 1');
      let hospitalId;

      if (hospitales.length === 0) {
        // Crear hospital de prueba
        const [result] = await pool.query(
          `INSERT INTO Hospital (id, nombre, direccion, telefono, activo) 
           VALUES (UUID(), 'Hospital de Prueba', 'Calle Test 123', '555-0001', TRUE)`
        );
        hospitalId = result.insertId;
        console.log('✅ Hospital de prueba creado');
      } else {
        hospitalId = hospitales[0].id;
      }

      // Crear médico
      const [medicoResult] = await pool.query(
        `INSERT INTO Medico (id, hospitalId, nombres, apellidos, email, activo) 
         VALUES (UUID(), ?, 'Dr. Juan', 'Pérez', ?, TRUE)`,
        [hospitalId, medicoEmail]
      );

      // Crear usuario médico
      await pool.query(
        `INSERT INTO Usuario (email, password, rol, medicoId, activo) 
         VALUES (?, ?, 'MEDICO', ?, TRUE)`,
        [medicoEmail, medicoHash, medicoResult.insertId]
      );

      console.log('✅ Médico creado:', medicoEmail, '| Password:', medicoPassword);
    } else {
      console.log('ℹ️  Médico ya existe:', medicoEmail);
    }

    console.log('\n🎉 Usuarios de prueba creados exitosamente!');
    console.log('\n📋 Credenciales para Postman:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ ADMIN:                                  │');
    console.log('│ Email: admin@test.com                   │');
    console.log('│ Password: admin123                      │');
    console.log('│ Tipo: admin                             │');
    console.log('└─────────────────────────────────────────┘');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ MÉDICO:                                 │');
    console.log('│ Email: medico@test.com                  │');
    console.log('│ Password: medico123                     │');
    console.log('│ Tipo: medico                            │');
    console.log('└─────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await pool.end();
  }
}

createTestUsers();
