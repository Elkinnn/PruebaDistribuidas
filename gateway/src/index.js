const express = require('express');
const morgan = require('morgan');
const { randomUUID } = require('crypto');

const { helmet, cors, rateLimit } = require('./middleware/security');
const config = require('./config');

// Swagger documentation
const { swaggerUi, specs } = require('../swagger');

// Importar rutas
const authRoutes = require('./routes/auth');
const proxyRoutes = require('./routes/proxy');
const healthRoutes = require('./routes/health');

const app = express();

// Trust proxy para headers de forwarding
app.set('trust proxy', 1);

// Middleware personalizado para manejar OPTIONS (preflight) ANTES de CORS
// También maneja todas las peticiones para agregar headers CORS
app.use((req, res, next) => {
  // Log todas las peticiones para debug
  console.log(`[REQUEST] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  
  if (req.method === 'OPTIONS') {
    console.log(`[PREFLIGHT] OPTIONS request from origin: ${req.headers.origin || 'none'}`);
    console.log(`[PREFLIGHT] Request-Method: ${req.headers['access-control-request-method'] || 'none'}`);
    console.log(`[PREFLIGHT] Request-Headers: ${req.headers['access-control-request-headers'] || 'none'}`);
    console.log(`[PREFLIGHT] All headers:`, JSON.stringify(req.headers));
    
    // Headers CORS básicos para preflight
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://web-frontend.lemonsand-4de94d70.eastus2.azurecontainerapps.io',
      'http://localhost:5173',
      'http://localhost:3003'
    ];
    const regexPattern = /\.azurecontainerapps\.io$/;
    
    // Si hay origen, verificar. Si no hay origen, permitir (para desarrollo)
    const isAllowed = !origin || allowedOrigins.includes(origin) || regexPattern.test(origin);
    
    if (isAllowed) {
      console.log(`[PREFLIGHT] Origin allowed: ${origin || 'none (permitido)'}`);
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Correlation-Id');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
      res.status(200).end();
      return;
    } else {
      console.log(`[PREFLIGHT] Origin NOT allowed: ${origin}`);
    }
  }
  
  // Para todas las peticiones, agregar headers CORS si hay origin
  if (req.headers.origin) {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://web-frontend.lemonsand-4de94d70.eastus2.azurecontainerapps.io',
      'http://localhost:5173',
      'http://localhost:3003'
    ];
    const regexPattern = /\.azurecontainerapps\.io$/;
    const isAllowed = allowedOrigins.includes(origin) || regexPattern.test(origin);
    
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  next();
});

// CORS DEBE estar ANTES de todo para que funcione correctamente
// Especialmente importante para peticiones OPTIONS (preflight)
app.use(cors);

// Middleware de trazabilidad y encabezados
app.use((req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  const requestId = typeof incomingId === 'string' && incomingId.trim().length > 0 ? incomingId : randomUUID();

  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  res.setHeader('Vary', 'Origin');

  next();
});

// Forzar HTTPS cuando aplique
app.use((req, res, next) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

  if (!isSecure && config.nodeEnv !== 'development') {
    const host = req.headers.host;
    if (host) {
      const target = `https://${host}${req.originalUrl}`;
      return res.redirect(307, target);
    }
  }

  next();
});

// Middlewares de seguridad (orden importante)
// Helmet después de CORS
app.use(helmet);

// Middlewares básicos
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Aumentar límite para archivos grandes

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Gateway Documentation'
}));

// Ruta raíz - Información del gateway
app.get('/', (_req, res) => {
  res.json({
    service: 'API Gateway',
    version: '1.0.0',
    environment: config.nodeEnv,
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/auth/login',
      docs: '/api-docs',
      admin: '/admin/*',
      medico: '/medico/*',
      legacy: ['/especialidades', '/hospitales', '/medicos', '/empleados', '/citas']
    },
    timestamp: new Date().toISOString()
  });
});

// Rutas
// IMPORTANTE: Rate limiting debe excluir OPTIONS (preflight)
// El rate limiting se aplica solo a métodos que no sean OPTIONS
app.use('/auth', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Saltar rate limiting para peticiones OPTIONS (preflight)
    return next();
  }
  return rateLimit(req, res, next);
}, authRoutes);
app.use('/health', healthRoutes);
app.use('/', proxyRoutes);

// 404 del gateway
app.use((_req, res) => 
  res.status(404).json({ 
    error: 'NOT_FOUND_GATEWAY', 
    message: 'Ruta no encontrada en el API Gateway' 
  })
);

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