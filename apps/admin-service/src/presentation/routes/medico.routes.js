const { Router } = require('express');
const repo = require('../../infrastructure/persistence/medico.repo');
const { createMedicoSchema, updateMedicoSchema } =
  require('../validators/medico.schema');

const router = Router();

// GET /medicos?page=&size=&q=&hospitalId=
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

// DELETE /medicos/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await repo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'NOT_FOUND', message: 'Médico no encontrado' });
    res.json({ data: true });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_DELETE', message: e.message });
  }
});

module.exports = router;
