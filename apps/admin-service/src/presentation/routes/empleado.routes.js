const { Router } = require('express');
const empleados = require('../../infrastructure/persistence/empleado.repo');
const { createEmpleadoSchema, updateEmpleadoSchema, listEmpleadosSchema } = require('../validators/empleado.schema');

const router = Router();

// Middleware de validación
const validate = (schema) => (req, res, next) => {
  console.log('🔍 [EMPLEADO VALIDATION] Raw request body:', JSON.stringify(req.body, null, 2));
  
  // Limpiar datos antes de validar
  const cleanedBody = {};
  Object.keys(req.body).forEach(key => {
    const value = req.body[key];
    // Solo incluir campos que no sean undefined, null o string vacío
    if (value !== undefined && value !== null && value !== '') {
      cleanedBody[key] = value;
    }
  });
  
  console.log('🔍 [EMPLEADO VALIDATION] Cleaned body:', JSON.stringify(cleanedBody, null, 2));
  
  const { error, value } = schema.validate(cleanedBody, { abortEarly: false, stripUnknown: true });
  if (error) {
    console.log('❌ [EMPLEADO VALIDATION] Validation error:', error.details);
    error.details.forEach((detail, index) => {
      console.log(`❌ [EMPLEADO VALIDATION] Error ${index + 1}:`, {
        field: detail.path?.join('.') || 'unknown',
        message: detail.message,
        value: detail.context?.value,
        type: detail.type
      });
    });
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Los datos proporcionados no son válidos. Por favor, revisa la información.',
      details: error.details
    });
  }
  // Reemplazar req.body con los datos validados
  req.body = value;
  console.log('✅ [EMPLEADO VALIDATION] Validation passed, cleaned body:', JSON.stringify(value, null, 2));
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: error.details[0].message
    });
  }
  next();
};

/* GET /empleados - Listar empleados con paginación y filtros */
router.get('/', validateQuery(listEmpleadosSchema), async (req, res) => {
  try {
    const { page, size, q, hospitalId, tipo } = req.query;
    console.log('🔍 [EMPLEADO LIST] Query params:', { page, size, q, hospitalId, tipo });
    
    const result = await empleados.list({ page, size, q, hospitalId, tipo });
    console.log('✅ [EMPLEADO LIST] Found:', result.data.length, 'empleados, total:', result.meta.total);
    
    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    console.error('❌ [EMPLEADO LIST] Error:', error.message);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
});

/* GET /empleados/:id - Obtener empleado por ID */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await empleados.findById(id);
    
    if (!empleado) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Empleado no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: empleado
    });
  } catch (error) {
    console.error('Error obteniendo empleado:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
});

/* POST /empleados - Crear empleado */
router.post('/', validate(createEmpleadoSchema), async (req, res) => {
  try {
    console.log('🔍 [EMPLEADO CREATE] Request body:', JSON.stringify(req.body, null, 2));
    const empleado = await empleados.create(req.body);
    console.log('✅ [EMPLEADO CREATE] Created successfully:', empleado.id);
    
    res.status(201).json({
      success: true,
      data: empleado,
      message: 'Empleado creado exitosamente'
    });
  } catch (error) {
    console.error('❌ [EMPLEADO CREATE] Error:', error.message);
    console.error('❌ [EMPLEADO CREATE] Stack:', error.stack);
    
    if (error.status) {
      return res.status(error.status).json({
        error: 'VALIDATION_ERROR',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
});

/* PUT /empleados/:id - Actualizar empleado */
router.put('/:id', validate(updateEmpleadoSchema), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 [EMPLEADO UPDATE] Request params:', { id });
    console.log('🔍 [EMPLEADO UPDATE] Request body:', JSON.stringify(req.body, null, 2));
    
    const empleado = await empleados.update(id, req.body);
    
    if (!empleado) {
      console.log('❌ [EMPLEADO UPDATE] Empleado no encontrado:', id);
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Empleado no encontrado'
      });
    }
    
    console.log('✅ [EMPLEADO UPDATE] Updated successfully:', empleado.id);
    res.json({
      success: true,
      data: empleado,
      message: 'Empleado actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ [EMPLEADO UPDATE] Error:', error.message);
    console.error('❌ [EMPLEADO UPDATE] Stack:', error.stack);
    
    if (error.status) {
      return res.status(error.status).json({
        error: 'VALIDATION_ERROR',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
});

/* DELETE /empleados/:id - Eliminar empleado */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await empleados.remove(id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Empleado no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Empleado eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando empleado:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
});

/* GET /empleados/stats/:hospitalId - Estadísticas de empleados por hospital */
router.get('/stats/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const stats = await empleados.getStatsByHospital(hospitalId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de empleados:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
