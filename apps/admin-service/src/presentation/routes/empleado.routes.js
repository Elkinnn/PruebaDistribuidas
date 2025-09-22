const { Router } = require('express');
const empleados = require('../../infrastructure/persistence/empleado.repo');
const { createEmpleadoSchema, updateEmpleadoSchema, listEmpleadosSchema } = require('../validators/empleado.schema');

const router = Router();

// Middleware de validación
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: error.details[0].message
    });
  }
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
    const result = await empleados.list({ page, size, q, hospitalId, tipo });
    
    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    console.error('Error listando empleados:', error);
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
    const empleado = await empleados.create(req.body);
    
    res.status(201).json({
      success: true,
      data: empleado,
      message: 'Empleado creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando empleado:', error);
    
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
    const empleado = await empleados.update(id, req.body);
    
    if (!empleado) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Empleado no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: empleado,
      message: 'Empleado actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    
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
