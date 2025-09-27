const express = require('express');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

// Función para verificar el estado de un servicio con medición de tiempo
const checkServiceHealth = async (serviceName, url) => {
  const startTime = performance.now();
  
  try {
    // Intentar HEAD /health primero
    let response;
    try {
      response = await axios.head(`${url}/health`, { 
        timeout: 5000,
        headers: { 'User-Agent': 'API-Gateway-Health-Check' }
      });
    } catch (headError) {
      // Si HEAD falla, intentar GET /health
      response = await axios.get(`${url}/health`, { 
        timeout: 5000,
        headers: { 'User-Agent': 'API-Gateway-Health-Check' }
      });
    }
    
    const responseTime = performance.now() - startTime;
    
    return {
      name: serviceName,
      url,
      status: 'healthy',
      statusCode: response.status,
      responseTimeMs: Math.round(responseTime),
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      name: serviceName,
      url,
      status: error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' ? 'unreachable' : 'unhealthy',
      statusCode: error.response?.status || null,
      responseTimeMs: Math.round(responseTime),
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
    const hasUnreachable = services.some(service => service.status === 'unreachable');
    
    // Determinar estado del gateway
    let gatewayStatus = 'healthy';
    let statusCode = 200;
    
    if (hasUnreachable) {
      gatewayStatus = 'degraded';
      statusCode = 503;
    } else if (!allHealthy) {
      gatewayStatus = 'unhealthy';
      statusCode = 503;
    }
    
    res.status(statusCode).json({
      gateway: gatewayStatus,
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
