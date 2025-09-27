const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gateway - Hospital Management System',
      version: '1.0.0',
      description: 'API Gateway para el sistema de gestión hospitalaria',
      contact: {
        name: 'Hospital Management Team',
        email: 'admin@hospital.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
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
              description: 'Descripción del error'
            }
          }
        },
        HealthStatus: {
          type: 'object',
          properties: {
            gateway: {
              type: 'string',
              enum: ['healthy', 'unhealthy', 'degraded', 'error'],
              description: 'Estado del gateway'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp de la verificación'
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
                    description: 'Tiempo de respuesta en milisegundos'
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
    },
    tags: [
      {
        name: 'Auth',
        description: 'Autenticación y autorización'
      },
      {
        name: 'Health',
        description: 'Monitoreo de salud del sistema'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Ruta a los archivos que contienen las anotaciones Swagger
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs
};
