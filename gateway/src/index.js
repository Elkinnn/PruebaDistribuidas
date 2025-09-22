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

// Proxy simple para el resto de rutas
app.use('/hospitales', createProxyMiddleware({
  target: ADMIN,
  changeOrigin: true,
  timeout: 30000
}));

app.use('/especialidades', createProxyMiddleware({
  target: ADMIN,
  changeOrigin: true,
  timeout: 30000
}));

app.use('/medicos', createProxyMiddleware({
  target: ADMIN,
  changeOrigin: true,
  timeout: 30000
}));

app.use('/empleados', createProxyMiddleware({
  target: ADMIN,
  changeOrigin: true,
  timeout: 30000
}));

app.use('/citas', createProxyMiddleware({
  target: ADMIN,
  changeOrigin: true,
  timeout: 30000
}));

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