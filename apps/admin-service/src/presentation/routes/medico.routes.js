const { Router } = require('express');
const repo = require('../../infrastructure/persistence/medico.repo');
const { createMedicoSchema, updateMedicoSchema } =
  require('../validators/medico.schema');

const router = Router();

// GET /medicos?page=&size=&q=&hospitalId=
/**
 * @swagger
 * /medicos:
 *   get:
 *     summary: Obtener lista de médicos
 *     tags: [Médicos]
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
 *         description: Lista de médicos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Medico'
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
 */
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 20);
    const q = (req.query.q || '').toString();
    const hospitalId = req.query.hospitalId ? Number(req.query.hospitalId) : undefined;

    const result = await repo.list({ page, size, q, hospitalId });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'ERROR_LIST', message: e.message });
  }
});

// GET /medicos/:id
/**
 * @swagger
 * /medicos/{id}:
 *   get:
 *     summary: Obtener médico por ID
 *     tags: [Médicos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del médico
 *     responses:
 *       200:
 *         description: Médico obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Medico'
 *       404:
 *         description: Médico no encontrado
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
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await repo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Médico no encontrado' });
    res.json({ data: item });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_GET', message: e.message });
  }
});

// POST /medicos
/**
 * @swagger
 * /medicos:
 *   post:
 *     summary: Crear nuevo médico
 *     tags: [Médicos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - email
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del médico
 *                 example: "Dr. Juan"
 *               apellido:
 *                 type: string
 *                 description: Apellido del médico
 *                 example: "García"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del médico
 *                 example: "juan.garcia@hospital.com"
 *               telefono:
 *                 type: string
 *                 description: Teléfono del médico
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: Médico creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Medico'
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
 */
router.post('/', async (req, res) => {
  try {
    const { error, value } = createMedicoSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });

    const item = await repo.create(value);
    res.status(201).json({ 
      data: item,
      message: 'Médico creado exitosamente. El usuario puede iniciar sesión con las credenciales proporcionadas.'
    });
  } catch (e) {
    res.status(e.status || 500).json({ error: 'ERROR_CREATE', message: e.message });
  }
});

// PUT /medicos/:id
/**
 * @swagger
 * /medicos/{id}:
 *   put:
 *     summary: Actualizar médico
 *     tags: [Médicos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del médico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del médico
 *                 example: "Dr. Juan"
 *               apellido:
 *                 type: string
 *                 description: Apellido del médico
 *                 example: "García"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del médico
 *                 example: "juan.garcia@hospital.com"
 *               telefono:
 *                 type: string
 *                 description: Teléfono del médico
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Médico actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Medico'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Médico no encontrado
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
 */
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = updateMedicoSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });

    // Si el password está vacío, removerlo para no actualizar la contraseña
    if (value.password === '') {
      delete value.password;
    }

    const item = await repo.update(req.params.id, value);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Médico no encontrado' });
    res.json({ data: item });
  } catch (e) {
    res.status(e.status || 500).json({ error: 'ERROR_UPDATE', message: e.message });
  }
});

// DELETE /medicos/:id (DELETE físico - elimina completamente)
/**
 * @swagger
 * /medicos/{id}:
 *   delete:
 *     summary: Eliminar médico
 *     tags: [Médicos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del médico
 *     responses:
 *       200:
 *         description: Médico eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Médico no encontrado
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
 */
router.delete('/:id', async (req, res) => {
  try {
    const ok = await repo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'NOT_FOUND', message: 'Médico no encontrado' });
    res.json({ 
      data: true, 
      message: 'Médico eliminado exitosamente. Se ha eliminado de la base de datos.' 
    });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_DELETE', message: e.message });
  }
});

// POST /medicos/:id/reactivate (Reactivar médico)
router.post('/:id/reactivate', async (req, res) => {
  try {
    const ok = await repo.reactivate(req.params.id);
    if (!ok) return res.status(404).json({ error: 'NOT_FOUND', message: 'Médico no encontrado' });
    res.json({ 
      data: true, 
      message: 'Médico reactivado exitosamente. El usuario puede volver a iniciar sesión.' 
    });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_REACTIVATE', message: e.message });
  }
});

module.exports = router;
