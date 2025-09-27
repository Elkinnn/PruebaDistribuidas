require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // URLs de servicios
  services: {
    admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3001',
    medico: process.env.MEDICO_SERVICE_URL || 'http://localhost:3002'
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
    skip: (req) => {
      return config.nodeEnv === 'development';
    }
  },
  
  // Timeout para requests a servicios
  timeout: 30000
};

module.exports = config;
