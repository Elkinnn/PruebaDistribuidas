const express = require('express');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

// Ruta específica para login - usando axios para lógica extra si es necesaria
router.post('/login', async (req, res) => {
  try {
    console.log(`[AUTH] Login request to: ${config.services.admin}/auth/login`);
    
    const response = await axios.post(`${config.services.admin}/auth/login`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      timeout: config.timeout
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[AUTH ERROR]', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'CONNECTION_ERROR', 
        message: 'Error de conexión con el servicio de autenticación' 
      });
    }
  }
});

module.exports = router;
