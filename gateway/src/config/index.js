require('dotenv').config();

const parseBoolean = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  const valueString = String(value).toLowerCase();
  return valueString === 'true' || valueString === '1';
};

const httpTimeoutMs = Number(process.env.HTTP_TIMEOUT_MS ?? 5000);

const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV || 'development',

  // URLs de servicios
  services: {
    admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3001',
    medico: process.env.MEDICO_SERVICE_URL || 'http://localhost:3100'
  },

  // Configuración HTTP/resiliencia
  http: {
    timeoutMs: httpTimeoutMs
  },
  resilience: {
    enabled: parseBoolean(process.env.RESILIENCE_ENABLED, false),
    retry: {
      enabled: parseBoolean(process.env.RETRY_ENABLED, true),
      maxAttempts: Number(process.env.RETRY_MAX_ATTEMPTS ?? 2),
      baseDelayMs: Number(process.env.RETRY_BASE_DELAY_MS ?? 250)
    },
    circuitBreaker: {
      windowMs: Number(process.env.CB_WINDOW_MS ?? 30000),
      thresholdPercent: Number(process.env.CB_THRESHOLD_PERCENT ?? 50),
      halfOpenAfterMs: Number(process.env.CB_HALF_OPEN_AFTER_MS ?? 20000)
    }
  },

  // Configuración de CORS
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3003' // Puerto del frontend actual
    ],
    credentials: true,
    optionsSuccessStatus: 200
  },

  // Configuración de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP en la ventana (más permisivo para desarrollo)
    message: {
      error: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas peticiones, intenta de nuevo más tarde'
    },
    // Deshabilitar rate limiting en desarrollo
    skip: (req) => config.nodeEnv === 'development'
  },

  // Compatibilidad con lógica existente
  timeout: httpTimeoutMs
};

module.exports = config;