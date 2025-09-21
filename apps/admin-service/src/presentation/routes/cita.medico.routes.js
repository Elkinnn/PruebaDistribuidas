const { Router } = require('express');
const repo = require('../../infrastructure/persistence/cita.repo');
const { createCitaMedicoSchema, reprogramarSchema } = require('../validators/cita.schema');
const { loadMedico } = require('../middlewares/loadMedico');

const router = Router();

// MONTADO EN /mis-citas DESDE index.js
// Todas requieren auth (rol MEDICO) y cargamos su médico
router.use(loadMedico);

// GET /mis-citas?page=&size=&estado=&desde=&hasta=
router.get('/', async (req, res) => {
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

// POST /mis-citas
router.post('/', async (req, res) => {
  try {
    const { error, value } = createCitaMedicoSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });

    const item = await repo.createByMedico({ medico: req.medico, payload: value, userId: req.user.id });
    res.status(201).json({ data: item });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ error: status === 409 ? 'CONFLICT' : 'ERROR_CREATE_OWN', message: e.message });
  }
});

// PUT /mis-citas/:id/reprogramar
router.put('/:id/reprogramar', async (req, res) => {
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
    if (r.locked)   return res.status(409).json({ error: 'CONFLICT', message: 'La cita ya inició o pasó; no se puede reprogramar' });
    if (r.overlap)  return res.status(409).json({ error: 'CONFLICT', message: 'El horario se solapa con otra cita del mismo médico' });

    res.json({ data: r.data });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_REPROGRAM', message: e.message });
  }
});

module.exports = router;
