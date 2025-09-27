# 📚 Documentación Automática con Swagger/OpenAPI

## 🎯 Implementación Recomendada

### 1. Para Admin Service (Express.js)

```bash
# Instalar dependencias
cd apps/admin-service
npm install swagger-jsdoc swagger-ui-express
```

### 2. Para Gateway (Express.js)

```bash
# Instalar dependencias
cd gateway
npm install swagger-jsdoc swagger-ui-express
```

## 🔧 Configuración

### Admin Service - src/swagger.js
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin Service API',
      version: '1.0.0',
      description: 'API para gestión de administradores, hospitales, médicos, etc.',
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
        },
      },
    },
  },
  apis: ['./src/presentation/routes/*.js'], // Rutas a documentar
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
```

### Gateway - src/swagger.js
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gateway',
      version: '1.0.0',
      description: 'Gateway principal que enruta peticiones a microservicios',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Gateway de desarrollo',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
```

## 📝 Ejemplo de Documentación en Rutas

### Admin Service - src/presentation/routes/especialidad.routes.js
```javascript
/**
 * @swagger
 * /especialidades:
 *   get:
 *     summary: Obtener lista de especialidades
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Tamaño de página
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de especialidades obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Especialidad'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
```

## 🚀 Integración en index.js

### Admin Service
```javascript
const { swaggerUi, specs } = require('./swagger');

// Documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

### Gateway
```javascript
const { swaggerUi, specs } = require('./swagger');

// Documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

## 📊 URLs de Documentación

- **Admin Service**: http://localhost:3001/api-docs
- **Gateway**: http://localhost:3000/api-docs
