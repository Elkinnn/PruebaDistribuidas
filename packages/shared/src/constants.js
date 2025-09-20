const constants = {
  // Roles de usuario
  USER_ROLES: {
    ADMIN: 'admin',
    MEDICO: 'medico',
    PACIENTE: 'paciente'
  },

  // Géneros
  GENDERS: {
    MALE: 'M',
    FEMALE: 'F',
    OTHER: 'OTRO'
  },

  // Estados de cita
  CITA_STATUS: {
    PROGRAMADA: 'programada',
    CONFIRMADA: 'confirmada',
    CANCELADA: 'cancelada',
    COMPLETADA: 'completada'
  },

  // Códigos de respuesta HTTP
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },

  // Mensajes de error comunes
  ERROR_MESSAGES: {
    VALIDATION_ERROR: 'Validation error',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden access',
    NOT_FOUND: 'Resource not found',
    INTERNAL_ERROR: 'Internal server error',
    DUPLICATE_EMAIL: 'Email already exists',
    INVALID_CREDENTIALS: 'Invalid credentials'
  },

  // Mensajes de éxito comunes
  SUCCESS_MESSAGES: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful'
  },

  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // Configuración de JWT
  JWT: {
    DEFAULT_EXPIRES_IN: '24h',
    REFRESH_EXPIRES_IN: '7d'
  },

  // Configuración de base de datos
  DATABASE: {
    DEFAULT_LIMIT: 1000,
    CONNECTION_TIMEOUT: 30000
  }
}

module.exports = constants
