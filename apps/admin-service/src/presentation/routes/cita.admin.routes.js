const { Router } = require('express');
const repo = require('../../infrastructure/persistence/cita.repo');
const { createCitaAdminSchema, updateAdminSchema } = require('../validators/cita.schema');
const PDFGeneratorService = require('../../infrastructure/services/pdf-generator.service');

const router = Router();

// MONTADO EN /citas DESDE index.js

/**
 * @swagger
 * /citas:
 *   get:
 *     summary: Obtener lista de citas
 *     tags: [Citas]
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
 *         description: Lista de citas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cita'
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
// GET /citas?page=&size=&q=
router.get('/', async (req, res) => {
  try {
    const result = await repo.list({
      page: +req.query.page || 1,
      size: +req.query.size || 20,
      hospitalId: req.query.hospitalId,
      medicoId: req.query.medicoId,
      estado: req.query.estado,
      desde: req.query.desde,
      hasta: req.query.hasta,
      q: req.query.q
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'ERROR_LIST', message: e.message });
  }
});

/**
 * @swagger
 * /citas/{id}:
 *   get:
 *     summary: Obtener cita por ID
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cita
 *     responses:
 *       200:
 *         description: Cita obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cita'
 *       404:
 *         description: Cita no encontrado
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
// GET /citas/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await repo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Cita no encontrada' });
    res.json({ data: item });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_GET', message: e.message });
  }
});

/**
 * @swagger
 * /citas:
 *   post:
 *     summary: Crear nuevo cita
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cita'
 *     responses:
 *       201:
 *         description: Cita creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cita'
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
// POST /citas
router.post('/', async (req, res) => {
  try {
    console.log('🔍 [CITA ADMIN] Request body:', JSON.stringify(req.body, null, 2));
    const { error, value } = createCitaAdminSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.log('❌ [CITA ADMIN] Validation error:', error.details);
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });
    }
    console.log('✅ [CITA ADMIN] Validation passed, creating cita...');
    const item = await repo.createAdmin({ ...value, creadaPorId: req.user.id });
    console.log('✅ [CITA ADMIN] Cita created successfully:', item.id);
    res.status(201).json({ data: item });
  } catch (e) {
    console.log('❌ [CITA ADMIN] Error creating cita:', e.message);
    const status = e.status || 500;
    res.status(status).json({ error: status === 409 ? 'CONFLICT' : 'ERROR_CREATE', message: e.message });
  }
});

/**
 * @swagger
 * /citas/{id}:
 *   put:
 *     summary: Actualizar cita
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cita'
 *     responses:
 *       200:
 *         description: Cita actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrado
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
// PUT /citas/:id
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = updateAdminSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });
    const item = await repo.updateAdmin(req.params.id, value, req.user.id);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Cita no encontrada' });
    res.json({ data: item });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ error: status === 409 ? 'CONFLICT' : 'ERROR_UPDATE', message: e.message });
  }
});

/**
 * @swagger
 * /citas/{id}:
 *   delete:
 *     summary: Eliminar cita
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cita
 *     responses:
 *       200:
 *         description: Cita eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Cita no encontrado
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
// DELETE /citas/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await repo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'NOT_FOUND', message: 'Cita no encontrada' });
    res.json({ data: true });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_DELETE', message: e.message });
  }
});



// GET /citas/kpis?desde=&hasta=&hospitalId=
router.get('/kpis', async (req, res) => {
  try {
    const result = await repo.getKpisDashboard({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    
    res.json({ data: result });
  } catch (e) {
    console.error('Error obteniendo KPIs:', e.message);
    res.status(500).json({ error: 'ERROR_KPIS', message: e.message });
  }
});

// GET /citas/graficas?desde=&hasta=&hospitalId=
router.get('/graficas', async (req, res) => {
  try {
    const result = await repo.getGraficasData({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    
    res.json({ data: result });
  } catch (e) {
    console.error('Error obteniendo datos de gráficas:', e.message);
    res.status(500).json({ error: 'ERROR_GRAFICAS', message: e.message });
  }
});

// GET /citas/reportes/citas-detalladas?desde=&hasta=&hospitalId=
router.get('/reportes/citas-detalladas', async (req, res) => {
  try {
    const data = await repo.getReporteCitasDetalladas({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    
    // Usar el servicio PDFGeneratorService mejorado
    const pdfGenerator = new PDFGeneratorService();
    const doc = pdfGenerator.generateCitasDetalladasReport(data, req.query.desde, req.query.hasta);
    
    // Configurar respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-citas-detalladas-${req.query.desde || 'sin-fecha'}-${req.query.hasta || 'sin-fecha'}.pdf"`);
    
    // Enviar PDF
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));
    
  } catch (e) {
    console.error('Error generando reporte de citas detalladas:', e.message);
    res.status(500).json({ error: 'ERROR_REPORTE_CITAS', message: e.message });
  }
});

// GET /citas/reportes/resumen-especialidad?desde=&hasta=&hospitalId=
router.get('/reportes/resumen-especialidad', async (req, res) => {
  try {
    const data = await repo.getReporteResumenEspecialidad({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    
    // Usar el servicio PDFGeneratorService mejorado
    const pdfGenerator = new PDFGeneratorService();
    const doc = pdfGenerator.generateResumenEspecialidadReport(data, req.query.desde, req.query.hasta);
    
    // Configurar respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-especialidades-${req.query.desde || 'sin-fecha'}-${req.query.hasta || 'sin-fecha'}.pdf"`);
    
    // Enviar PDF
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));
    
  } catch (e) {
    console.error('Error generando reporte de especialidades:', e.message);
    res.status(500).json({ error: 'ERROR_REPORTE_ESPECIALIDADES', message: e.message });
  }
});

// GET /citas/reportes/productividad-medico?desde=&hasta=&hospitalId=
router.get('/reportes/productividad-medico', async (req, res) => {
  try {
    const data = await repo.getReporteProductividadMedico({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    
    // Usar el servicio PDFGeneratorService mejorado
    const pdfGenerator = new PDFGeneratorService();
    const doc = pdfGenerator.generateProductividadMedicoReport(data, req.query.desde, req.query.hasta);
    
    // Configurar respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-productividad-medico-${req.query.desde || 'sin-fecha'}-${req.query.hasta || 'sin-fecha'}.pdf"`);
    
    // Enviar PDF
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));
    
  } catch (e) {
    console.error('Error generando reporte de productividad:', e.message);
    res.status(500).json({ error: 'ERROR_REPORTE_PRODUCTIVIDAD', message: e.message });
  }
});

module.exports = router;
