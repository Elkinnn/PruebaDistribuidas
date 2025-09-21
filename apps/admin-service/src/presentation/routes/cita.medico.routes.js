const { Router } = require('express');
const repo = require('../../infrastructure/persistence/cita.repo');
const { createCitaMedicoSchema, reprogramarSchema } = require('../validators/cita.schema');
const { loadMedico } = require('../middlewares/loadMedico');

const router = Router();

// Todas estas rutas requieren auth (rol MEDICO) en index.js y además cargamos su médico
router.use(loadMedico);

// GET /mis-citas?page=&size=&estado=&desde=&hasta=
router.get('/mis-citas', async (req, res) => {
  try {
    const result = await repo.listByMedico(req.medico.id, {
      page: +req.query.page || 1,
      size: +req.query.size || 20,
      estado: req.query.estado,
      desde: req.query.desde,
      hasta: req.query.hasta
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'ERROR_LIST_OWN', message: e.message });
  }
});

// POST /mis-citas  (crea cita propia del médico)
router.post('/mis-citas', async (req, res) => {
  try {
    const { error, value } = createCitaMedicoSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });

    const item = await repo.createByMedico({ medico: req.medico, payload: value, userId: req.user.id });
    res.status(201).json({ data: item });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_CREATE_OWN', message: e.message });
  }
});

// PUT /mis-citas/:id/reprogramar  (solo fechas y si aún no inició)
router.put('/mis-citas/:id/reprogramar', async (req, res) => {
  try {
    const { error, value } = reprogramarSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });

    const r = await repo.reprogramarByMedico({
      citaId: req.params.id,
      medicoId: req.medico.id,
      fechaInicio: value.fechaInicio,
      fechaFin: value.fechaFin,
      userId: req.user.id
    });
    if (r.notFound) return res.status(404).json({ error: 'NOT_FOUND', message: 'Cita no encontrada' });
    if (r.locked) return res.status(409).json({ error: 'CONFLICT', message: 'La cita ya inició o pasó; no se puede reprogramar' });

    res.json({ data: r.data });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_REPROGRAM', message: e.message });
  }
});

module.exports = router;
