const express = require('express');
const morgan = require('morgan');
const { helmet, cors, rateLimit } = require('./middleware/security');
const config = require('./config');

// Importar rutas
const authRoutes = require('./routes/auth');
const proxyRoutes = require('./routes/proxy');
const healthRoutes = require('./routes/health');

const app = express();

// Middlewares de seguridad (orden importante)
app.use(helmet);
app.use(cors);
app.use(rateLimit);

// Middlewares básicos
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Aumentar límite para archivos grandes

// Rutas
app.use('/auth', authRoutes);
app.use('/health', healthRoutes);
app.use('/', proxyRoutes);

// 404 del gateway
app.use((_req, res) => res.status(404).json({ 
  error: 'NOT_FOUND_GATEWAY',
  message: 'Ruta no encontrada en el API Gateway'
}));

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('[GATEWAY ERROR]', error.message);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor'
  });
});

// Arranque del servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway escuchando en puerto ${PORT}`);
  console.log(`📊 Entorno: ${config.nodeEnv}`);
  console.log(`🔗 Admin Service: ${config.services.admin}`);
  console.log(`🔗 Medico Service: ${config.services.medico || 'No configurado'}`);
  console.log(`🌐 CORS Origin: ${config.cors.origin}`);
});