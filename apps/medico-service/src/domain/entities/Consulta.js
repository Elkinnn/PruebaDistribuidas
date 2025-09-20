class Consulta {
  constructor({
    id,
    pacienteId,
    medicoId,
    fecha,
    motivo,
    sintomas,
    diagnostico,
    tratamiento,
    observaciones,
    proximaCita,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id
    this.pacienteId = pacienteId
    this.medicoId = medicoId
    this.fecha = fecha
    this.motivo = motivo
    this.sintomas = sintomas
    this.diagnostico = diagnostico
    this.tratamiento = tratamiento
    this.observaciones = observaciones
    this.proximaCita = proximaCita
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  // Métodos de dominio
  completarConsulta(diagnostico, tratamiento, observaciones) {
    this.diagnostico = diagnostico
    this.tratamiento = tratamiento
    this.observaciones = observaciones
    this.updatedAt = new Date()
  }

  programarProximaCita(fecha) {
    this.proximaCita = fecha
    this.updatedAt = new Date()
  }

  esUrgente() {
    const sintomasUrgentes = ['dolor pecho', 'dificultad respirar', 'fiebre alta', 'sangrado']
    return sintomasUrgentes.some(sintoma => 
      this.sintomas.toLowerCase().includes(sintoma)
    )
  }

  // Validaciones de dominio
  isValid() {
    return this.pacienteId && this.medicoId && this.fecha && this.motivo
  }

  estaCompleta() {
    return this.diagnostico && this.tratamiento
  }

  // Factory method
  static create({ pacienteId, medicoId, fecha, motivo, sintomas }) {
    const id = require('uuid').v4()
    return new Consulta({ 
      id, 
      pacienteId, 
      medicoId, 
      fecha, 
      motivo, 
      sintomas 
    })
  }
}

module.exports = Consulta
