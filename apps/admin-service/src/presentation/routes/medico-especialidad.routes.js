const { Router } = require('express');
const mre = require('../../infrastructure/persistence/medico-especialidad.repo');

const router = Router();

/* Listar especialidades de un médico
   GET /medicos/:medicoId/especialidades?page=&size= */
router.get('/medicos/:medicoId/especialidades', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 20);
    const result = await mre.listByMedico(req.params.medicoId, { page, size });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'ERROR_LIST_MEDICO_ESPEC', message: e.message });
  }
});

/* Asignar especialidad a médico
   POST /medicos/:medicoId/especialidades/:especialidadId */
router.post('/medicos/:medicoId/especialidades/:especialidadId', async (req, res) => {
  try {
    const item = await mre.addToMedico(req.params.medicoId, req.params.especialidadId);
    res.status(201).json({ data: item });
  } catch (e) {
    res.status(e.status || 500).json({ error: 'ERROR_ASSIGN', message: e.message });
  }
});

/* Quitar especialidad de médico
   DELETE /medicos/:medicoId/especialidades/:especialidadId */
router.delete('/medicos/:medicoId/especialidades/:especialidadId', async (req, res) => {
  try {
    const ok = await mre.removeFromMedico(req.params.medicoId, req.params.especialidadId);
    if (!ok) return res.status(404).json({ error: 'NOT_FOUND', message: 'No estaba asignada' });
    res.json({ data: true });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_UNASSIGN', message: e.message });
  }
});

/* Extra opcional: listar médicos por especialidad
   GET /especialidades/:especialidadId/medicos?page=&size= */
router.get('/especialidades/:especialidadId/medicos', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 20);
    const result = await mre.listMedicosByEspecialidad(req.params.especialidadId, { page, size });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'ERROR_LIST_MEDICOS_POR_ESPEC', message: e.message });
  }
});

module.exports = router;
