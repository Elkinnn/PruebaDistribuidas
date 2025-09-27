require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');

const app = express();

// middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// targets
const ADMIN = process.env.ADMIN_SERVICE_URL || 'http://localhost:3001';
const MEDICO = process.env.MEDICO_SERVICE_URL || 'http://localhost:3100';

// Función para verificar si el servicio de médico está corriendo
async function checkMedicoService() {
  try {
    const response = await axios.get(`${MEDICO}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.log('[MEDICO SERVICE] No disponible:', error.message);
    return false;
  }
}

// ============ PROXY PARA ADMIN-SERVICE ============

// Ruta específica para login de admin - usando axios en lugar de proxy
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

// Proxy para médicos usando axios directo (CRUD de médicos - admin)
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

// ============ PROXY PARA MEDICO-SERVICE ============

// Función helper para proxy de médico
async function proxyToMedicoService(req, res, endpoint) {
  try {
    const isMedicoServiceRunning = await checkMedicoService();
    if (!isMedicoServiceRunning) {
      return res.status(503).json({ 
        error: 'SERVICE_UNAVAILABLE', 
        message: 'El servicio de médico no está disponible. Por favor, inicie el servicio de médico en el puerto 3100.' 
      });
    }
    
    const config = {
      method: req.method,
      url: `${MEDICO}${endpoint}`,
      headers: {
        ...req.headers
      },
      timeout: 30000
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    console.log(`[MEDICO] ${req.method} ${req.url} -> ${config.url}`);
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[MEDICO ERROR] ${req.method} ${req.url}:`, error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de médico' 
      });
    }
  }
}

// Proxy para login de médico hacia medico-service
app.post('/medico/auth/login', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/auth/login');
});

// Proxy para /me hacia medico-service
app.get('/medico/auth/me', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/auth/me');
});

// Proxy para PUT /me hacia medico-service
app.put('/medico/auth/me', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/auth/me');
});

// Proxy para gestión de citas del médico
app.get('/medico/citas', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/citas');
});

app.get('/medico/citas/hoy', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/citas/hoy');
});

app.post('/medico/citas', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/citas');
});

app.put('/medico/citas/:id', async (req, res) => {
  await proxyToMedicoService(req, res, `/medico/citas/${req.params.id}`);
});

app.delete('/medico/citas/:id', async (req, res) => {
  await proxyToMedicoService(req, res, `/medico/citas/${req.params.id}`);
});

// Proxy para información del médico
app.get('/medico/especialidades', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/especialidades');
});

app.get('/medico/perfil', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/perfil');
});

app.put('/medico/perfil', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/perfil');
});

app.get('/medico/info', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/info');
});

app.get('/medico/stats', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/stats');
});

app.get('/medico/dashboard/stats', async (req, res) => {
  await proxyToMedicoService(req, res, '/medico/dashboard/stats');
});

// health del gateway
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    adminService: ADMIN,
    medicoService: MEDICO
  });
});

// 404 del gateway
app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND_GATEWAY' }));

// arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway escuchando en :${PORT}`);
  console.log(`→ ADMIN_SERVICE_URL: ${ADMIN}`);
  console.log(`→ MEDICO_SERVICE_URL: ${MEDICO}`);
});
