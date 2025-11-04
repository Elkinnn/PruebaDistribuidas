const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');

// Configuración de Helmet (ajustado para no interferir con CORS)
const helmetConfig = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Lista blanca de orígenes permitidos
const allowedOrigins = Array.isArray(config.cors.origin)
  ? config.cors.origin.filter(Boolean)
  : [config.cors.origin].filter(Boolean);

// Función para verificar si un origen está permitido
function isOriginAllowed(origin) {
  if (!origin) return false;
  
  // Verificar si el origen está en la lista de strings permitidos
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Verificar si coincide con algún patrón regex
  for (const allowedOrigin of allowedOrigins) {
    if (allowedOrigin instanceof RegExp) {
      if (allowedOrigin.test(origin)) {
        return true;
      }
    } else if (typeof allowedOrigin === 'string') {
      // Comparación directa de strings (case-insensitive)
      if (allowedOrigin.toLowerCase() === origin.toLowerCase()) {
        return true;
      }
    }
  }

  return false;
}

const corsInstance = cors({
  credentials: config.cors.credentials,
  optionsSuccessStatus: config.cors.optionsSuccessStatus,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-Id'],
  exposedHeaders: ['X-Correlation-Id', 'X-CB-State', 'Retry-After'],
  preflightContinue: false, // No pasar OPTIONS al siguiente middleware
  origin(origin, callback) {
    // Log para debug
    console.log(`[CORS] Verificando origen: ${origin}`);
    console.log(`[CORS] Allowed origins:`, allowedOrigins.map(o => o instanceof RegExp ? o.toString() : o));
    
    // Permitir peticiones sin origen (como Postman, curl, etc.)
    if (!origin) {
      console.log('[CORS] Petición sin origen, permitiendo');
      return callback(null, true);
    }

    const allowed = isOriginAllowed(origin);
    console.log(`[CORS] Origen: ${origin}, Permitido: ${allowed}`);

    if (allowed) {
      console.log(`[CORS] Origen permitido: ${origin}`);
      return callback(null, true);
    }

    console.log(`[CORS] Origen rechazado: ${origin}`);
    return callback(new Error('OriginNotAllowed'), false);
  }
});

const corsMiddleware = corsInstance;

// Configuración de Rate Limiting
const rateLimitConfig = rateLimit(config.rateLimit);

module.exports = {
  helmet: helmetConfig,
  cors: corsMiddleware,
  rateLimit: rateLimitConfig
};