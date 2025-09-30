#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📚 Completando documentación Swagger para todas las rutas...');

// Función para agregar documentación Swagger a un archivo de rutas
function addSwaggerDocumentation(routeFile, entityName, entitySchema) {
  const filePath = path.join(__dirname, '..', 'apps', 'admin-service', 'src', 'presentation', 'routes', routeFile);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${routeFile}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Verificar si ya tiene documentación Swagger
  if (content.includes('@swagger')) {
    console.log(`✅ ${routeFile} ya tiene documentación Swagger`);
    return;
  }

  // Documentación para GET (lista)
  const getListDoc = `/**
 * @swagger
 * /${entityName.toLowerCase()}s:
 *   get:
 *     summary: Obtener lista de ${entityName.toLowerCase()}s
 *     tags: [${entityName}s]
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
 *           default: 20
 *         description: Tamaño de página
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de ${entityName.toLowerCase()}s obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/${entitySchema}'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */`;

  // Documentación para GET por ID
  const getByIdDoc = `/**
 * @swagger
 * /${entityName.toLowerCase()}s/{id}:
 *   get:
 *     summary: Obtener ${entityName.toLowerCase()} por ID
 *     tags: [${entityName}s]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ${entityName.toLowerCase()}
 *     responses:
 *       200:
 *         description: ${entityName} obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/${entitySchema}'
 *       404:
 *         description: ${entityName} no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */`;

  // Documentación para POST
  const postDoc = `/**
 * @swagger
 * /${entityName.toLowerCase()}s:
 *   post:
 *     summary: Crear nuevo ${entityName.toLowerCase()}
 *     tags: [${entityName}s]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${entitySchema}'
 *     responses:
 *       201:
 *         description: ${entityName} creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/${entitySchema}'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */`;

  // Documentación para PUT
  const putDoc = `/**
 * @swagger
 * /${entityName.toLowerCase()}s/{id}:
 *   put:
 *     summary: Actualizar ${entityName.toLowerCase()}
 *     tags: [${entityName}s]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ${entityName.toLowerCase()}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${entitySchema}'
 *     responses:
 *       200:
 *         description: ${entityName} actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/${entitySchema}'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ${entityName} no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */`;

  // Documentación para DELETE
  const deleteDoc = `/**
 * @swagger
 * /${entityName.toLowerCase()}s/{id}:
 *   delete:
 *     summary: Eliminar ${entityName.toLowerCase()}
 *     tags: [${entityName}s]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ${entityName.toLowerCase()}
 *     responses:
 *       200:
 *         description: ${entityName} eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: ${entityName} no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */`;

  // Insertar documentación antes de cada método
  content = content.replace(
    /\/\/ GET \/.*\nrouter\.get\('\/',/,
    `${getListDoc}\n// GET /${entityName.toLowerCase()}s?page=&size=&q=\nrouter.get('/',`
  );

  content = content.replace(
    /\/\/ GET \/.*\nrouter\.get\('\/:id',/,
    `${getByIdDoc}\n// GET /${entityName.toLowerCase()}s/:id\nrouter.get('/:id',`
  );

  content = content.replace(
    /\/\/ POST \/.*\nrouter\.post\('\/',/,
    `${postDoc}\n// POST /${entityName.toLowerCase()}s\nrouter.post('/',`
  );

  content = content.replace(
    /\/\/ PUT \/.*\nrouter\.put\('\/:id',/,
    `${putDoc}\n// PUT /${entityName.toLowerCase()}s/:id\nrouter.put('/:id',`
  );

  content = content.replace(
    /\/\/ DELETE \/.*\nrouter\.delete\('\/:id',/,
    `${deleteDoc}\n// DELETE /${entityName.toLowerCase()}s/:id\nrouter.delete('/:id',`
  );

  fs.writeFileSync(filePath, content);
  console.log(`✅ Documentación agregada a ${routeFile}`);
}

// Lista de rutas a documentar
const routesToDocument = [
  { file: 'hospital.routes.js', entity: 'Hospital', schema: 'Hospital' },
  { file: 'medico.routes.js', entity: 'Medico', schema: 'Medico' },
  { file: 'empleado.routes.js', entity: 'Empleado', schema: 'Empleado' },
  { file: 'cita.admin.routes.js', entity: 'Cita', schema: 'Cita' }
];

console.log('📋 Documentando rutas...');

routesToDocument.forEach(route => {
  addSwaggerDocumentation(route.file, route.entity, route.schema);
});

console.log('\n🎉 Documentación Swagger completada!');
console.log('\n📝 Próximos pasos:');
console.log('1. Reinicia el Admin Service para ver los cambios');
console.log('2. Ve a http://localhost:3001/api-docs');
console.log('3. Deberías ver todas las secciones: Especialidades, Hospitales, Médicos, Empleados, Citas');
