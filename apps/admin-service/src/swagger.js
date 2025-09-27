const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin Service API',
      version: '1.0.0',
      description: 'API para gestión de administradores, hospitales, médicos, especialidades y citas',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@hospital.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo',
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
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Página actual'
            },
            size: {
              type: 'integer',
              description: 'Tamaño de página'
            },
            total: {
              type: 'integer',
              description: 'Total de elementos'
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas'
            }
          }
        },
        Especialidad: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID de la especialidad'
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la especialidad'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción de la especialidad'
            },
            activa: {
              type: 'boolean',
              description: 'Estado de la especialidad'
            }
          }
        },
        Hospital: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del hospital'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del hospital'
            },
            direccion: {
              type: 'string',
              description: 'Dirección del hospital'
            },
            telefono: {
              type: 'string',
              description: 'Teléfono del hospital'
            }
          }
        },
        Medico: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del médico'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del médico'
            },
            apellido: {
              type: 'string',
              description: 'Apellido del médico'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del médico'
            },
            telefono: {
              type: 'string',
              description: 'Teléfono del médico'
            }
          }
        },
        Empleado: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del empleado'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del empleado'
            },
            apellido: {
              type: 'string',
              description: 'Apellido del empleado'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del empleado'
            },
            telefono: {
              type: 'string',
              description: 'Teléfono del empleado'
            },
            cargo: {
              type: 'string',
              description: 'Cargo del empleado'
            }
          }
        },
        Cita: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID de la cita'
            },
            paciente: {
              type: 'string',
              description: 'Nombre del paciente'
            },
            medico: {
              type: 'string',
              description: 'Nombre del médico'
            },
            hospital: {
              type: 'string',
              description: 'Nombre del hospital'
            },
            especialidad: {
              type: 'string',
              description: 'Especialidad médica'
            },
            fechaInicio: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de inicio de la cita'
            },
            fechaFin: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de fin de la cita'
            },
            estado: {
              type: 'string',
              enum: ['PROGRAMADA', 'ATENDIDA', 'CANCELADA'],
              description: 'Estado de la cita'
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones de la cita'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/presentation/routes/*.js',
    './src/presentation/db-health.controller.ts'
  ],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
