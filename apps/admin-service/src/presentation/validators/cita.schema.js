const Joi = require('joi');

const base = {
  hospitalId: Joi.number().integer().positive(),
  medicoId: Joi.number().integer().positive(),
  pacienteId: Joi.number().integer().positive().required(),
  motivo: Joi.string().required(),
  fechaInicio: Joi.date().iso().required(),
  fechaFin: Joi.date().iso().required()
    .greater(Joi.ref('fechaInicio')).messages({
      'date.greater': 'fechaFin debe ser mayor que fechaInicio'
    }),
  estado: Joi.string().valid('PROGRAMADA','CANCELADA','ATENDIDA')
};

const createCitaAdminSchema = Joi.object({
  ...base,
  hospitalId: base.hospitalId.required(),
  medicoId: base.medicoId.required(),
});

const createCitaMedicoSchema = Joi.object({
  pacienteId: base.pacienteId,
  motivo: base.motivo,
  fechaInicio: base.fechaInicio,
  fechaFin: base.fechaFin,
});

const reprogramarSchema = Joi.object({
  fechaInicio: base.fechaInicio,
  fechaFin: base.fechaFin
}).min(1);

const updateAdminSchema = Joi.object({
  hospitalId: base.hospitalId,
  medicoId: base.medicoId,
  pacienteId: base.pacienteId,
  motivo: base.motivo,
  fechaInicio: base.fechaInicio,
  fechaFin: base.fechaFin,
  estado: base.estado
}).min(1);

module.exports = {
  createCitaAdminSchema,
  createCitaMedicoSchema,
  reprogramarSchema,
  updateAdminSchema
};
