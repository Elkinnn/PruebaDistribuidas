const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gateway',
      version: '1.0.0',
      description: 'Gateway principal que enruta peticiones a microservicios',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@hospital.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Gateway de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación'
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Código de error'
            },
            message: {
              type: 'string',
              description: 'Mensaje de error'
            }
          }
        },
        HealthStatus: {
          type: 'object',
          properties: {
            gateway: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              description: 'Estado del gateway'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp del check'
            },
            services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Nombre del servicio'
                  },
                  url: {
                    type: 'string',
                    description: 'URL del servicio'
                  },
                  status: {
                    type: 'string',
                    enum: ['healthy', 'unhealthy', 'unreachable'],
                    description: 'Estado del servicio'
                  },
                  statusCode: {
                    type: 'integer',
                    description: 'Código de estado HTTP'
                  },
                  responseTimeMs: {
                    type: 'integer',
                    description: 'Tiempo de respuesta en ms'
                  },
                  error: {
                    type: 'string',
                    description: 'Mensaje de error si aplica'
                  },
                  lastCheck: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Última verificación'
                  }
                }
              }
            },
            environment: {
              type: 'string',
              description: 'Entorno de ejecución'
            }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.js'
  ],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
