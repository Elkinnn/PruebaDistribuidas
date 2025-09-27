const express = require('express');
const morgan = require('morgan');
const { randomUUID } = require('crypto');
const { helmet, cors, rateLimit } = require('./middleware/security');
const config = require('./config');

// Swagger documentation
const { swaggerUi, specs } = require('./swagger');

// Importar rutas
const authRoutes = require('./routes/auth');
const proxyRoutes = require('./routes/proxy');
const healthRoutes = require('./routes/health');

const app = express();

// Trust proxy para headers de forwarding
app.set('trust proxy', 1);

// Middleware de trazabilidad
app.use((req, res, next) => {
  // Generar ID único para la request
  req.id = req.headers['x-request-id'] || randomUUID();
  
  // Añadir Vary: Origin para CORS
  res.setHeader('Vary', 'Origin');
  
  next();
});

// Middlewares de seguridad (orden importante)
app.use(helmet);
app.use(cors);

// Middlewares básicos
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Aumentar límite para archivos grandes

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Gateway Documentation'
}));

// Rutas
app.use('/auth', rateLimit, authRoutes); // Rate limit solo en /auth
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