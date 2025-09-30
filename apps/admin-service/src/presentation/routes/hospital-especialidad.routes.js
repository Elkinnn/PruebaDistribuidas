const { Router } = require('express');
const hre = require('../../infrastructure/persistence/hospital-especialidad.repo');

const router = Router();

// GET /:hospitalId/especialidades?page=&size=
router.get('/:hospitalId/especialidades', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 20);
    const result = await hre.listByHospital(req.params.hospitalId, { page, size });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'ERROR_LIST_HOSPITAL_ESPEC', message: e.message });
  }
});

// POST /:hospitalId/especialidades/:especialidadId
router.post('/:hospitalId/especialidades/:especialidadId', async (req, res) => {
  try {
    const item = await hre.addToHospital(req.params.hospitalId, req.params.especialidadId);
    res.status(201).json({ data: item });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ error: 'ERROR_ASSIGN', message: e.message });
  }
});

// DELETE /:hospitalId/especialidades/:especialidadId
router.delete('/:hospitalId/especialidades/:especialidadId', async (req, res) => {
  try {
    const ok = await hre.removeFromHospital(req.params.hospitalId, req.params.especialidadId);
    if (!ok) return res.status(404).json({ error: 'NOT_FOUND', message: 'No estaba asignada' });
    res.json({ data: true });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_UNASSIGN', message: e.message });
  }
});

// POST /cleanup-especialidades-huérfanas - Limpiar especialidades huérfanas
router.post('/cleanup-especialidades-huérfanas', async (req, res) => {
  try {
    const cleanedCount = await hre.cleanupOrphanedEspecialidades();
    res.json({ 
      success: true, 
      message: `Se limpiaron ${cleanedCount} especialidades huérfanas`,
      cleanedCount 
    });
  } catch (e) {
    console.error('Error limpiando especialidades huérfanas:', e);
    res.status(500).json({ 
      error: 'CLEANUP_ERROR', 
      message: 'Error limpiando especialidades huérfanas: ' + e.message 
    });
  }
});

module.exports = router;
