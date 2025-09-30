const { Router } = require('express');
const repo = require('../../infrastructure/persistence/hospital.repo');
const { createHospitalSchema, updateHospitalSchema } = require('../validators/hospital.schema');

const router = Router();

/**
 * @swagger
 * /hospitales:
 *   get:
 *     summary: Obtener lista de hospitales
 *     tags: [Hospitales]
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
 *         description: Lista de hospitales obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hospital'
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
// GET /hospitales?page=&size=&q=
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 20);
    const q = (req.query.q || '').toString();

    const result = await repo.list({ page, size, q });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'ERROR_LIST', message: e.message });
  }
});

/**
 * @swagger
 * /hospitales/{id}:
 *   get:
 *     summary: Obtener hospital por ID
 *     tags: [Hospitales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hospital
 *     responses:
 *       200:
 *         description: Hospital obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Hospital'
 *       404:
 *         description: Hospital no encontrado
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
// GET /hospitales/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await repo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Hospital no encontrado' });
    res.json({ data: item });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_GET', message: e.message });
  }
});

/**
 * @swagger
 * /hospitales:
 *   post:
 *     summary: Crear nuevo hospital
 *     tags: [Hospitales]
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
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del hospital
 *                 example: "Hospital General"
 *               direccion:
 *                 type: string
 *                 description: Dirección del hospital
 *                 example: "Av. Principal 123"
 *               telefono:
 *                 type: string
 *                 description: Teléfono del hospital
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: Hospital creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Hospital'
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
// POST /hospitales
router.post('/', async (req, res) => {
  try {
    const { error, value } = createHospitalSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });

    const item = await repo.create(value);
    res.status(201).json({ data: item });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_CREATE', message: e.message });
  }
});

/**
 * @swagger
 * /hospitales/{id}:
 *   put:
 *     summary: Actualizar hospital
 *     tags: [Hospitales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hospital
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del hospital
 *                 example: "Hospital General"
 *               direccion:
 *                 type: string
 *                 description: Dirección del hospital
 *                 example: "Av. Principal 123"
 *               telefono:
 *                 type: string
 *                 description: Teléfono del hospital
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Hospital actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Hospital'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Hospital no encontrado
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
// PUT /hospitales/:id
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = updateHospitalSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });

    const item = await repo.update(req.params.id, value);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Hospital no encontrado' });
    res.json({ data: item });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_UPDATE', message: e.message });
  }
});

/**
 * @swagger
 * /hospitales/{id}:
 *   delete:
 *     summary: Eliminar hospital
 *     tags: [Hospitales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hospital
 *     responses:
 *       200:
 *         description: Hospital eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Hospital no encontrado
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
// DELETE /hospitales/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await repo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'NOT_FOUND', message: 'Hospital no encontrado' });
    res.json({ data: true });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_DELETE', message: e.message });
  }
});

module.exports = router;
