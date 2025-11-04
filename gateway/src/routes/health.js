const express = require('express');
const axios = require('axios');
const { performance } = require('node:perf_hooks');
const config = require('../config');
const { reset: resetCircuitBreaker } = require('../resilience/circuitBreaker');
const router = express.Router();

const HEALTH_ENDPOINTS = ['/db/health', '/health'];

const tryRequest = async (method, url) => {
  return axios({
    method,
    url,
    timeout: 5000,
    headers: {
      'User-Agent': 'API-Gateway-Health-Check'
    },
    validateStatus: () => true
  });
};

// Función para verificar el estado de un servicio con medición de tiempo
const checkServiceHealth = async (serviceName, baseUrl) => {
  const startTime = performance.now();

  for (const endpoint of HEALTH_ENDPOINTS) {
    const fullUrl = `${baseUrl}${endpoint}`;
    try {
      let response = await tryRequest('head', fullUrl);
      if (response.status >= 400) {
        response = await tryRequest('get', fullUrl);
      }

      if (response.status < 400) {
        const responseTime = performance.now() - startTime;
        return {
          name: serviceName,
          url: fullUrl,
          status: 'healthy',
          statusCode: response.status,
          responseTimeMs: Math.round(responseTime),
          lastCheck: new Date().toISOString()
        };
      }
    } catch (error) {
      if (endpoint === HEALTH_ENDPOINTS[HEALTH_ENDPOINTS.length - 1]) {
        const responseTime = performance.now() - startTime;
        return {
          name: serviceName,
          url: fullUrl,
          status: error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' ? 'unreachable' : 'unhealthy',
          statusCode: error.response?.status || null,
          responseTimeMs: Math.round(responseTime),
          error: error.message,
          lastCheck: new Date().toISOString()
        };
      }
    }
  }

  const responseTime = performance.now() - startTime;
  return {
    name: serviceName,
    url: baseUrl,
    status: 'unhealthy',
    statusCode: null,
    responseTimeMs: Math.round(responseTime),
    error: 'No se pudo verificar la salud del servicio',
    lastCheck: new Date().toISOString()
  };
};

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del gateway y servicios
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Gateway y servicios funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *       503:
 *         description: Gateway degradado o servicios con problemas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *       500:
 *         description: Error interno del gateway
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

// Endpoint para resetear Circuit Breaker manualmente
// Permitido en producción para facilitar recuperación
router.post('/reset-circuit-breaker', async (req, res) => {
  const { serviceName } = req.body;
  const result = resetCircuitBreaker(serviceName);
  
  res.json({
    success: result,
    message: serviceName 
      ? `Circuit Breaker reseteado para ${serviceName}` 
      : 'Todos los Circuit Breakers reseteados',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;