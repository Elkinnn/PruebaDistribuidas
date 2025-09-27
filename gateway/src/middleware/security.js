const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');

// Configuración de Helmet (por defecto, sin CSP estricta)
const helmetConfig = helmet();

// Configuración de CORS
const corsConfig = cors(config.cors);

// Configuración de Rate Limiting
const rateLimitConfig = rateLimit(config.rateLimit);

module.exports = {
  helmet: helmetConfig,
  cors: corsConfig,
  rateLimit: rateLimitConfig
};
