const { Router } = require('express');
const repo = require('../../infrastructure/persistence/cita.repo');
const { createCitaAdminSchema, updateAdminSchema } = require('../validators/cita.schema');

const router = Router();

// MONTADO EN /citas DESDE index.js

// GET /citas?page=&size=&hospitalId=&medicoId=&estado=&desde=&hasta=&q=
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

// POST /citas
router.post('/', async (req, res) => {
  try {
    const { error, value } = createCitaAdminSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });
    const item = await repo.createAdmin({ ...value, creadaPorId: req.user.id });
    res.status(201).json({ data: item });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ error: status === 409 ? 'CONFLICT' : 'ERROR_CREATE', message: e.message });
  }
});

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

module.exports = router;
