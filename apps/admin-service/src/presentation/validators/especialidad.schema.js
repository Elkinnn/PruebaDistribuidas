const Joi = require('joi');

const createEspecialidadSchema = Joi.object({
  nombre: Joi.string().max(100).required(),
  descripcion: Joi.string().allow('', null),
});

const updateEspecialidadSchema = Joi.object({
  nombre: Joi.string().max(100),
  descripcion: Joi.string().allow('', null),
}).min(1);

module.exports = { createEspecialidadSchema, updateEspecialidadSchema };
