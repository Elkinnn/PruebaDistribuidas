const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const { createProxyConfig, createFileProxyConfig } = require('../middleware/proxy');
const config = require('../config');
const router = express.Router();

// Proxy especial para archivos binarios (PDFs) en /admin/citas/reportes/**
// IMPORTANTE: Esta ruta debe ir ANTES que /admin para que se ejecute
router.use('/admin/citas/reportes', createProxyMiddleware(
  createFileProxyConfig(config.services.admin, {
    '^/admin': '' // Remover /admin del path
  })
));

// Namespacing: /admin/** → ADMIN_SERVICE_URL
router.use('/admin', createProxyMiddleware(
  createProxyConfig(config.services.admin, {
    '^/admin': '' // Remover /admin del path
  })
));

// Proxy personalizado para médico-service usando axios
if (config.services.medico) {
  console.log(`[GATEWAY] Configurando proxy para médico-service: ${config.services.medico}`);
  
  router.use('/medico', async (req, res) => {
    try {
      // Reconstruir la ruta completa con /medico
      const fullPath = `/medico${req.url}`;
      console.log(`[MEDICO PROXY] ${req.method} ${req.url} -> ${config.services.medico}${fullPath}`);
      
      const axiosConfig = {
        method: req.method,
        url: `${config.services.medico}${fullPath}`,
        headers: {
          ...req.headers
        },
        timeout: config.timeout || 30000
      };
      
      // Agregar body si existe
      if (req.body && Object.keys(req.body).length > 0) {
        axiosConfig.data = req.body;
      }
      
      console.log(`[MEDICO PROXY] Enviando request:`, axiosConfig.method, axiosConfig.url);
      
      const response = await axios(axiosConfig);
      res.status(response.status).json(response.data);
      
      console.log(`[MEDICO PROXY RESPONSE] ${req.method} ${req.url} -> ${response.status}`);
    } catch (error) {
      console.error(`[MEDICO PROXY ERROR] ${req.method} ${req.url}:`, error.message);
      if (error.response) {
        console.error(`[MEDICO PROXY ERROR] Response status: ${error.response.status}`);
        console.error(`[MEDICO PROXY ERROR] Response data:`, error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error(`[MEDICO PROXY ERROR] No response from medico-service`);
        res.status(502).json({
          error: 'PROXY_ERROR',
          message: 'Error de conexión con el servicio de médico'
        });
      }
    }
  });
} else {
  console.log(`[GATEWAY] No se configuró proxy para médico-service`);
}

// Proxy de compatibilidad para rutas legacy (sin namespacing)
// Usando axios como fallback para garantizar compatibilidad
const createAxiosProxy = (servicePath) => {
  return async (req, res) => {
    try {
      console.log(`[PROXY] ${req.method} ${req.url} -> ${config.services.admin}${servicePath}${req.url}`);
      
      const axiosConfig = {
        method: req.method,
        url: `${config.services.admin}${servicePath}${req.url}`,
        headers: {
          ...req.headers
        },
        timeout: config.timeout || 30000
      };
      
      // Agregar body si existe
      if (req.body && Object.keys(req.body).length > 0) {
        axiosConfig.data = req.body;
      }
      
      // Para rutas de reportes (PDFs), usar responseType arraybuffer
      if (req.url.includes('/reportes/')) {
        axiosConfig.responseType = 'arraybuffer';
      }
      
      const response = await axios(axiosConfig);
      
      // Manejar PDFs
      if (req.url.includes('/reportes/')) {
        Object.keys(response.headers).forEach(key => {
          if (key.toLowerCase() !== 'content-encoding') {
            res.setHeader(key, response.headers[key]);
          }
        });
        res.status(response.status).send(response.data);
      } else {
        // Para JSON normal
        res.status(response.status).json(response.data);
      }
      
      console.log(`[PROXY RESPONSE] ${req.method} ${req.url} -> ${response.status}`);
    } catch (error) {
      console.error(`[PROXY ERROR] ${req.method} ${req.url}:`, error.message);
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(502).json({
          error: 'UPSTREAM_UNAVAILABLE',
          message: 'Servicio backend no disponible'
        });
      }
    }
  };
};

// Proxies de compatibilidad usando axios
router.use('/especialidades', createAxiosProxy('/especialidades'));
router.use('/hospitales', createAxiosProxy('/hospitales'));
router.use('/medicos', createAxiosProxy('/medicos'));
router.use('/empleados', createAxiosProxy('/empleados'));
router.use('/medico-especialidades', createAxiosProxy('/medico-especialidades'));
router.use('/citas', createAxiosProxy('/citas'));

module.exports = router;