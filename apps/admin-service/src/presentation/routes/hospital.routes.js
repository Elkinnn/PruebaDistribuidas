const { Router } = require('express');
const repo = require('../../infrastructure/persistence/hospital.repo');
const { createHospitalSchema, updateHospitalSchema } = require('../validators/hospital.schema');

const router = Router();

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
