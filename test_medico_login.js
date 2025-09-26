// Script para probar el login de médico
const axios = require('axios');

const GATEWAY_URL = 'http://localhost:3000';
const MEDICO_EMAIL = 'elkin@gmail.com';
const MEDICO_PASSWORD = 'Medico123'; // Contraseña sin hashear para prueba

async function testMedicoLogin() {
  try {
    console.log('🔍 Probando login de médico...');
    console.log(`📧 Email: ${MEDICO_EMAIL}`);
    console.log(`🔑 Password: ${MEDICO_PASSWORD}`);
    console.log(`🌐 Gateway URL: ${GATEWAY_URL}`);
    
    // Probar el endpoint de login
    const response = await axios.post(`${GATEWAY_URL}/medico/auth/login`, {
      email: MEDICO_EMAIL,
      password: MEDICO_PASSWORD
    });
    
    console.log('✅ Login exitoso!');
    console.log('📄 Respuesta:', JSON.stringify(response.data, null, 2));
    
    // Probar el endpoint /me con el token
    if (response.data.token) {
      console.log('\n🔍 Probando endpoint /me...');
      const meResponse = await axios.get(`${GATEWAY_URL}/medico/auth/me`, {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Endpoint /me exitoso!');
      console.log('📄 Respuesta:', JSON.stringify(meResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:');
    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📄 Data:', error.response.data);
    } else {
      console.error('📄 Error:', error.message);
    }
  }
}

// Ejecutar la prueba
testMedicoLogin();
