import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medico Service API',
      version: '1.0.0',
      description: 'API para el sistema de gestión médica - Servicio de Médicos',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@hospital.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3100',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'http://localhost:3000/medico',
        description: 'Servidor a través del Gateway'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Medico: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombres: { type: 'string', example: 'Dr. Juan' },
            apellidos: { type: 'string', example: 'Pérez García' },
            email: { type: 'string', format: 'email', example: 'juan.perez@hospital.com' },
            hospitalId: { type: 'integer', example: 1 },
            activo: { type: 'boolean', example: true },
            especialidades: {
              type: 'array',
              items: { $ref: '#/components/schemas/Especialidad' }
            }
          }
        },
        Especialidad: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Cardiología' },
            descripcion: { type: 'string', example: 'Especialidad en enfermedades del corazón' }
          }
        },
        Cita: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            pacienteId: { type: 'integer', example: 1 },
            medicoId: { type: 'integer', example: 1 },
            hospitalId: { type: 'integer', example: 1 },
            fechaInicio: { type: 'string', format: 'date-time', example: '2024-01-15T09:00:00Z' },
            fechaFin: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00Z' },
            estado: { type: 'string', enum: ['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'], example: 'PENDIENTE' },
            motivo: { type: 'string', example: 'Consulta de rutina' },
            notas: { type: 'string', example: 'Paciente refiere dolor de cabeza' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'juan.perez@hospital.com' },
            password: { type: 'string', format: 'password', example: 'password123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/Medico' }
          }
        },
        UpdateCitaRequest: {
          type: 'object',
          properties: {
            estado: { type: 'string', enum: ['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'] },
            fechaFin: { type: 'string', format: 'date-time' },
            notas: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: 'Los datos proporcionados no son válidos' }
          }
        },
        MedicoStats: {
          type: 'object',
          properties: {
            citasHoy: { type: 'integer', example: 8 },
            citasPendientes: { type: 'integer', example: 12 },
            citasAtendidas: { type: 'integer', example: 45 },
            citasCanceladas: { type: 'integer', example: 3 }
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
    './src/presentation/routes/**/*.ts',
    './src/presentation/routes/**/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Medico Service API Documentation'
  }));
  
  // Ruta para obtener el JSON de Swagger
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
