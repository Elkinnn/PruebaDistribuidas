const Joi = require('joi');

const pacienteInline = Joi.object({
  nombres:   Joi.string().max(100).required(),
  apellidos: Joi.string().max(100).required(),
  documento: Joi.string().max(30).allow('', null),
  telefono:  Joi.string().max(50).allow('', null),
  email:     Joi.string().email().max(150).allow('', null),
  fechaNacimiento: Joi.date().iso().allow(null), // acepta 'YYYY-MM-DD' o ISO
  sexo: Joi.string().valid('MASCULINO','FEMENINO','OTRO').allow(null),
});

const baseCamposCita = {
  motivo:       Joi.string().min(2).required(),
  fechaInicio:  Joi.date().iso().required(),
  fechaFin:     Joi.date().iso().greater(Joi.ref('fechaInicio')).required(),
};

const createCitaAdminSchema = Joi.object({
  hospitalId: Joi.number().integer().required(),
  medicoId:   Joi.number().integer().required(),

  pacienteId: Joi.number().integer(),
  paciente:   pacienteInline,        // “paciente en línea”

  ...baseCamposCita,
})
  .oxor('pacienteId', 'paciente')     // exactamente uno de los dos
  .prefs({ convert: true, abortEarly: false });

const updateAdminSchema = Joi.object({
  hospitalId: Joi.number().integer(),
  medicoId:   Joi.number().integer(),

  pacienteId: Joi.number().integer(),
  paciente:   pacienteInline,        // si actualizas y quieres cambiar paciente

  motivo:      Joi.string().min(2),
  fechaInicio: Joi.date().iso(),
  fechaFin:    Joi.date().iso().greater(Joi.ref('fechaInicio')),
  estado:      Joi.string().valid('PROGRAMADA','CANCELADA','ATENDIDA'),
}).min(1).prefs({ convert: true, abortEarly: false });

const createCitaMedicoSchema = Joi.object({
  pacienteId: Joi.number().integer(),
  paciente:   pacienteInline,        // médico también puede crear paciente al vuelo
  ...baseCamposCita,
})
  .oxor('pacienteId', 'paciente')
  .prefs({ convert: true, abortEarly: false });

const reprogramarSchema = Joi.object({
  fechaInicio: Joi.date().iso().required(),
  fechaFin:    Joi.date().iso().greater(Joi.ref('fechaInicio')).required(),
}).prefs({ convert: true, abortEarly: false });

module.exports = {
  createCitaAdminSchema,
  updateAdminSchema,
  createCitaMedicoSchema,
  reprogramarSchema,
};
