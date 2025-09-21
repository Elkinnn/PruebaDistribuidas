const Joi = require('joi');

const createMedicoSchema = Joi.object({
  hospitalId: Joi.number().integer().positive().required(),
  nombres: Joi.string().max(100).required(),
  apellidos: Joi.string().max(100).required(),
  email: Joi.string().email().max(150).required(),
  password: Joi.string().min(6).max(100).required(),
  activo: Joi.boolean().optional(),
});

const updateMedicoSchema = Joi.object({
  hospitalId: Joi.number().integer().positive(), // si permites mover de hospital
  nombres: Joi.string().max(100),
  apellidos: Joi.string().max(100),
  email: Joi.string().email().max(150),
  activo: Joi.boolean(),
}).min(1);

module.exports = { createMedicoSchema, updateMedicoSchema };
