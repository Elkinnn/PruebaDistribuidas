#!/usr/bin/env node

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/infrastructure/persistence/db');

async function testMedicoCreation() {
  console.log('🧪 Probando creación de médico con usuario...');

  try {
    // 1. Crear un hospital de prueba si no existe
    const [hospitales] = await pool.query('SELECT id FROM hospital LIMIT 1');
    let hospitalId;

    if (hospitales.length === 0) {
      const [result] = await pool.query(
        `INSERT INTO hospital (nombre, direccion, telefono, activo) 
         VALUES (?, ?, ?, ?)`,
        ['Hospital de Prueba', 'Calle Test 123', '555-0001', true]
      );
      hospitalId = result.insertId;
      console.log('✅ Hospital de prueba creado');
    } else {
      hospitalId = hospitales[0].id;
      console.log('ℹ️  Usando hospital existente');
    }

    // 2. Crear médico con usuario
    const medicoData = {
      hospitalId: hospitalId,
      nombres: 'Dr. María',
      apellidos: 'González',
      email: 'maria.gonzalez@test.com',
      password: 'medico123',
      activo: true
    };

    console.log('📝 Creando médico:', medicoData.email);

    // Crear médico
    const [medicoResult] = await pool.query(
      `INSERT INTO medico (hospitalId, nombres, apellidos, email, activo)
       VALUES (?, ?, ?, ?, ?)`,
      [medicoData.hospitalId, medicoData.nombres, medicoData.apellidos, medicoData.email, medicoData.activo]
    );

    const medicoId = medicoResult.insertId;
    console.log('✅ Médico creado con ID:', medicoId);

    // Crear usuario
    const passwordHash = await bcrypt.hash(medicoData.password, 10);
    
    await pool.query(
      `INSERT INTO usuario (email, password, rol, medicoId, activo)
       VALUES (?, ?, 'MEDICO', ?, TRUE)`,
      [medicoData.email, passwordHash, medicoId]
    );

    console.log('✅ Usuario médico creado');

    // 3. Verificar que puede hacer login
    console.log('\n🔐 Probando login del médico...');
    
    const [usuario] = await pool.query(
      'SELECT * FROM usuario WHERE email = ?',
      [medicoData.email]
    );

    if (usuario.length > 0) {
      const user = usuario[0];
      const passwordMatch = await bcrypt.compare(medicoData.password, user.password);
      
      if (passwordMatch) {
        console.log('✅ Login exitoso!');
        console.log('📋 Credenciales del médico:');
        console.log(`   Email: ${medicoData.email}`);
        console.log(`   Password: ${medicoData.password}`);
        console.log(`   Rol: ${user.rol}`);
        console.log(`   Médico ID: ${user.medicoId}`);
      } else {
        console.log('❌ Error en la verificación de contraseña');
      }
    } else {
      console.log('❌ Usuario no encontrado');
    }

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('\n📋 Ahora puedes probar en Postman:');
    console.log('1. Login como admin');
    console.log('2. Crear médico con POST /medicos');
    console.log('3. Login como médico con las credenciales creadas');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await pool.end();
  }
}

testMedicoCreation();
