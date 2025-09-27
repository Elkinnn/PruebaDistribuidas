const express = require('express');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

// Función para verificar el estado de un servicio
const checkServiceHealth = async (serviceName, url) => {
  try {
    const response = await axios.get(`${url}/health`, { 
      timeout: 5000,
      headers: { 'User-Agent': 'API-Gateway-Health-Check' }
    });
    
    return {
      name: serviceName,
      url,
      status: 'healthy',
      responseTime: response.headers['x-response-time'] || 'unknown',
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      name: serviceName,
      url,
      status: 'unhealthy',
      error: error.message,
      lastCheck: new Date().toISOString()
    };
  }
};

// Endpoint de salud del gateway
router.get('/', async (req, res) => {
  try {
    const services = [];
    
    // Verificar servicios disponibles
    if (config.services.admin) {
      services.push(await checkServiceHealth('admin-service', config.services.admin));
    }
    
    if (config.services.medico) {
      services.push(await checkServiceHealth('medico-service', config.services.medico));
    }
    
    const allHealthy = services.every(service => service.status === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json({
      gateway: 'healthy',
      timestamp: new Date().toISOString(),
      services,
      environment: config.nodeEnv
    });
  } catch (error) {
    console.error('[HEALTH CHECK ERROR]', error.message);
    res.status(500).json({
      gateway: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
