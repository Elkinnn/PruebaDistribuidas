const Joi = require('joi');

const createHospitalSchema = Joi.object({
  nombre: Joi.string().max(150).required(),
  direccion: Joi.string().allow('', null),
  telefono: Joi.string().max(50).allow('', null),
  activo: Joi.boolean().optional(),
});

const updateHospitalSchema = Joi.object({
  nombre: Joi.string().max(150),
  direccion: Joi.string().allow('', null),
  telefono: Joi.string().max(50).allow('', null),
  activo: Joi.boolean(),
}).min(1); // al menos un campo

module.exports = { createHospitalSchema, updateHospitalSchema };
