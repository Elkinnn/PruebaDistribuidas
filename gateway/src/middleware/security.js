const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');

// Configuración de Helmet (por defecto, sin CSP estricta)
const helmetConfig = helmet();

// Lista blanca de orígenes permitidos
const allowedOrigins = Array.isArray(config.cors.origin)
  ? config.cors.origin.filter(Boolean)
  : [config.cors.origin].filter(Boolean);

const corsInstance = cors({
  credentials: config.cors.credentials,
  optionsSuccessStatus: config.cors.optionsSuccessStatus,
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('OriginNotAllowed'), false);
  }
});

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  corsInstance(req, res, (err) => {
    if (err) {
      return res.status(403).json({
        error: 'CORS_NOT_ALLOWED',
        message: 'Origen no permitido'
      });
    }
    next();
  });
};

// Configuración de Rate Limiting
const rateLimitConfig = rateLimit(config.rateLimit);

module.exports = {
  helmet: helmetConfig,
  cors: corsMiddleware,
  rateLimit: rateLimitConfig
};