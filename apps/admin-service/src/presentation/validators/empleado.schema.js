const Joi = require('joi');

const createEmpleadoSchema = Joi.object({
  hospitalId: Joi.number().integer().positive().required(),
  nombres: Joi.string().max(100).required(),
  apellidos: Joi.string().max(100).required(),
  tipo: Joi.string().valid('LIMPIEZA', 'SEGURIDAD', 'RECEPCION', 'ADMINISTRATIVO', 'OTRO').required(),
  email: Joi.string().email().max(150).required(),
  telefono: Joi.string().max(50).required(),
  activo: Joi.boolean().optional(),
});

const updateEmpleadoSchema = Joi.object({
  hospitalId: Joi.number().integer().positive().optional(),
  nombres: Joi.string().max(100).min(1).optional(),
  apellidos: Joi.string().max(100).min(1).optional(),
  tipo: Joi.string().valid('LIMPIEZA', 'SEGURIDAD', 'RECEPCION', 'ADMINISTRATIVO', 'OTRO').optional(),
  email: Joi.string().email().max(150).optional(),
  telefono: Joi.string().max(50).min(1).optional(),
  activo: Joi.boolean().optional(),
}).min(1).unknown(false).strict();

const listEmpleadosSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  size: Joi.number().integer().min(1).max(100).optional(),
  q: Joi.string().max(100).optional().allow(''),
  hospitalId: Joi.number().integer().positive().optional(),
  tipo: Joi.string().valid('LIMPIEZA', 'SEGURIDAD', 'RECEPCION', 'ADMINISTRATIVO', 'OTRO').optional(),
});

module.exports = { 
  createEmpleadoSchema, 
  updateEmpleadoSchema, 
  listEmpleadosSchema 
};
