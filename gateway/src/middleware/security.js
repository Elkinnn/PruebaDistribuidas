const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');

// Configuración de Helmet para seguridad
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
});

// Configuración de CORS
const corsConfig = cors(config.cors);

// Configuración de Rate Limiting
const rateLimitConfig = rateLimit(config.rateLimit);

module.exports = {
  helmet: helmetConfig,
  cors: corsConfig,
  rateLimit: rateLimitConfig
};
