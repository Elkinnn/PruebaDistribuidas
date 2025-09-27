const express = require('express');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

// Helper para hacer proxy con axios (solución real y definitiva)
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
      // 304 (Not Modified) no es un error, es una respuesta válida
      if (error.response && error.response.status === 304) {
        console.log(`[PROXY RESPONSE] ${req.method} ${req.url} -> 304 (Not Modified)`);
        res.status(304).end();
        return;
      }
      
      console.error(`[PROXY ERROR] ${req.method} ${req.url}:`, error.message);
      
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({
          error: 'PROXY_ERROR',
          message: 'Error de conexión con el servicio backend'
        });
      }
    }
  };
};

// Proxies para el servicio admin (solución real y definitiva)
router.use('/especialidades', createAxiosProxy('/especialidades'));
router.use('/hospitales', createAxiosProxy('/hospitales'));
router.use('/medicos', createAxiosProxy('/medicos'));
router.use('/empleados', createAxiosProxy('/empleados'));
router.use('/medico-especialidades', createAxiosProxy('/medico-especialidades'));
router.use('/citas', createAxiosProxy('/citas'));

module.exports = router;