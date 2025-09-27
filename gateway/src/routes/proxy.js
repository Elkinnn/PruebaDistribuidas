const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const { createProxyConfig, createFileProxyConfig } = require('../middleware/proxy');
const config = require('../config');

const router = express.Router();

// Namespacing: /admin/** → ADMIN_SERVICE_URL
router.use('/admin', createProxyMiddleware(createProxyConfig(config.services.admin, {
  '^/admin': '' // Remover /admin del path
})));

// Namespacing: /medico/** → MEDICO_SERVICE_URL
if (config.services.medico) {
  router.use('/medico', createProxyMiddleware(createProxyConfig(config.services.medico, {
    '^/medico': '' // Remover /medico del path
  })));
}

// Proxy especial para archivos binarios (PDFs) en /admin/citas/reportes/**
router.use('/admin/citas/reportes', createProxyMiddleware(createFileProxyConfig(config.services.admin, {
  '^/admin': '' // Remover /admin del path
})));

// Proxy de compatibilidad para rutas legacy (sin namespacing)
// Usando axios como fallback para garantizar compatibilidad
const createAxiosProxy = (servicePath) => {
  return async (req, res) => {
    try {
      console.log(`[PROXY] ${req.method} ${req.url} -> ${config.services.admin}${servicePath}${req.url}`);
      
      const axiosConfig = {
        method: req.method,
        url: `${config.services.admin}${servicePath}${req.url}`,
        headers: { ...req.headers },
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