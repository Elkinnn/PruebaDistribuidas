const Joi = require('joi')

const validators = {
  // Validaciones de usuario
  user: {
    create: Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().min(2).max(100).required(),
      role: Joi.string().valid('admin', 'medico', 'paciente').required(),
      password: Joi.string().min(6).optional()
    }),

    update: Joi.object({
      email: Joi.string().email().optional(),
      name: Joi.string().min(2).max(100).optional(),
      role: Joi.string().valid('admin', 'medico', 'paciente').optional()
    })
  },

  // Validaciones de paciente
  paciente: {
    create: Joi.object({
      nombre: Joi.string().min(2).max(50).required(),
      apellido: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      telefono: Joi.string().min(10).max(15).optional(),
      fechaNacimiento: Joi.date().max('now').required(),
      genero: Joi.string().valid('M', 'F', 'OTRO').required(),
      direccion: Joi.string().max(200).optional()
    }),

    update: Joi.object({
      nombre: Joi.string().min(2).max(50).optional(),
      apellido: Joi.string().min(2).max(50).optional(),
      email: Joi.string().email().optional(),
      telefono: Joi.string().min(10).max(15).optional(),
      direccion: Joi.string().max(200).optional()
    })
  },

  // Validaciones de consulta
  consulta: {
    create: Joi.object({
      pacienteId: Joi.string().uuid().required(),
      medicoId: Joi.string().uuid().required(),
      fecha: Joi.date().required(),
      motivo: Joi.string().min(5).max(200).required(),
      sintomas: Joi.string().max(500).optional(),
      diagnostico: Joi.string().max(500).optional(),
      tratamiento: Joi.string().max(500).optional(),
      observaciones: Joi.string().max(1000).optional()
    })
  },

  // Validaciones de cita
  cita: {
    create: Joi.object({
      pacienteId: Joi.string().uuid().required(),
      medicoId: Joi.string().uuid().required(),
      fecha: Joi.date().required(),
      hora: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      motivo: Joi.string().min(5).max(200).required(),
      observaciones: Joi.string().max(500).optional()
    })
  },

  // Validaciones de autenticación
  auth: {
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    })
  }
}

module.exports = validators
