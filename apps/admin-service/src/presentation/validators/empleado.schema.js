const Joi = require('joi');

const createEmpleadoSchema = Joi.object({
  hospitalId: Joi.number().integer().positive().required(),
  nombres: Joi.string().max(100).required(),
  apellidos: Joi.string().max(100).required(),
  tipo: Joi.string().valid('LIMPIEZA', 'SEGURIDAD', 'RECEPCION', 'ADMINISTRATIVO', 'OTRO').required(),
  email: Joi.string().email().max(150).optional().allow(null, ''),
  telefono: Joi.string().max(50).optional().allow(null, ''),
  activo: Joi.boolean().optional(),
});

const updateEmpleadoSchema = Joi.object({
  hospitalId: Joi.number().integer().positive(),
  nombres: Joi.string().max(100),
  apellidos: Joi.string().max(100),
  tipo: Joi.string().valid('LIMPIEZA', 'SEGURIDAD', 'RECEPCION', 'ADMINISTRATIVO', 'OTRO'),
  email: Joi.string().email().max(150).allow(null, ''),
  telefono: Joi.string().max(50).allow(null, ''),
  activo: Joi.boolean(),
}).min(1);

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
