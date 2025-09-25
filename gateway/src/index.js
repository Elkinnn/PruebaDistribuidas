require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

const app = express();

// middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


// targets
const ADMIN = process.env.ADMIN_SERVICE_URL || 'http://localhost:3001';

// Ruta específica para login - usando axios en lugar de proxy
app.post('/auth/login', async (req, res) => {
  try {
    console.log(`[LOGIN] Proxying to: ${ADMIN}/auth/login`);
    const response = await axios.post(`${ADMIN}/auth/login`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      timeout: 30000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[LOGIN ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'CONNECTION_ERROR', 
        message: 'Error de conexión con el servicio backend' 
      });
    }
  }
});

// Helper para pasar headers de autorización
function passAuthHeaders(proxyReq, req, res) {
  if (req.headers.authorization) {
    proxyReq.setHeader('authorization', req.headers.authorization);
    console.log('[AUTH] Passing authorization header');
  }
}

// Proxy para hospitales usando axios directo
app.use('/hospitales', async (req, res) => {
  try {
    console.log(`[HOSPITALES] ${req.method} ${req.url} -> ${ADMIN}/hospitales${req.url}`);
    
    const config = {
      method: req.method,
      url: `${ADMIN}/hospitales${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    // No es error si es 304 (Not Modified)
    if (error.response?.status === 304) {
      res.status(304).end();
      return;
    }
    
    console.error('[HOSPITALES ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de hospitales' 
      });
    }
  }
});

// Proxy para especialidades usando axios directo
app.use('/especialidades', async (req, res) => {
  try {
    console.log(`[ESPECIALIDADES] ${req.method} ${req.url} -> ${ADMIN}/especialidades${req.url}`);
    
    const config = {
      method: req.method,
      url: `${ADMIN}/especialidades${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[ESPECIALIDADES ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de especialidades' 
      });
    }
  }
});

// Proxy para médicos usando axios directo
app.use('/medicos', async (req, res) => {
  try {
    console.log(`[MEDICOS] ${req.method} ${req.url} -> ${ADMIN}/medicos${req.url}`);
    
    
    const config = {
      method: req.method,
      url: `${ADMIN}/medicos${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[MEDICOS ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de médicos' 
      });
    }
  }
});

// Proxy para empleados usando axios directo
app.use('/empleados', async (req, res) => {
  try {
    console.log(`[EMPLEADOS] ${req.method} ${req.url} -> ${ADMIN}/empleados${req.url}`);
    
    const config = {
      method: req.method,
      url: `${ADMIN}/empleados${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    // No es error si es 304 (Not Modified)
    if (error.response?.status === 304) {
      res.status(304).end();
      return;
    }
    
    console.error('[EMPLEADOS ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de empleados' 
      });
    }
  }
});

// Proxy para citas usando axios directo
app.use('/citas', async (req, res) => {
  try {
    const config = {
      method: req.method,
      url: `${ADMIN}/citas${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000,
      responseType: 'arraybuffer' // Importante para PDFs
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    
    // Verificar si es un PDF (rutas de reportes)
    if (req.url.includes('/reportes/')) {
      // Para PDFs, copiar headers y enviar como buffer
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, response.headers[key]);
        }
      });
      res.status(response.status).send(response.data);
    } else {
      // Para JSON, convertir a JSON
      const jsonData = JSON.parse(response.data.toString());
      res.status(response.status).json(jsonData);
    }
  } catch (error) {
    console.error('[CITAS ERROR]', error.message);
    if (error.response) {
      // Si es un PDF y hay error, intentar parsear como JSON
      if (req.url.includes('/reportes/')) {
        try {
          const jsonData = JSON.parse(error.response.data.toString());
          res.status(error.response.status).json(jsonData);
        } catch {
          res.status(error.response.status).send(error.response.data);
        }
      } else {
        res.status(error.response.status).json(error.response.data);
      }
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de citas' 
      });
    }
  }
});



// health del gateway
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    adminService: ADMIN,
    medicoService: null
  });
});

// 404 del gateway
app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND_GATEWAY' }));

// arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway escuchando en :${PORT}`);
  console.log(`→ ADMIN_SERVICE_URL: ${ADMIN}`);
});