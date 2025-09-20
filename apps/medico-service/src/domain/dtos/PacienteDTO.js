class PacienteDTO {
  constructor(paciente) {
    this.id = paciente.id
    this.nombre = paciente.nombre
    this.apellido = paciente.apellido
    this.email = paciente.email
    this.telefono = paciente.telefono
    this.fechaNacimiento = paciente.fechaNacimiento
    this.genero = paciente.genero
    this.direccion = paciente.direccion
    this.isActive = paciente.isActive
    this.createdAt = paciente.createdAt
    this.updatedAt = paciente.updatedAt
  }

  // Método para crear DTO con información completa
  static toComplete(paciente) {
    return {
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      nombreCompleto: paciente.getNombreCompleto(),
      email: paciente.email,
      telefono: paciente.telefono,
      fechaNacimiento: paciente.fechaNacimiento,
      edad: paciente.getEdad(),
      genero: paciente.genero,
      direccion: paciente.direccion,
      isActive: paciente.isActive,
      createdAt: paciente.createdAt,
      updatedAt: paciente.updatedAt
    }
  }

  // Método para crear DTO de respuesta
  static toResponse(paciente) {
    return {
      success: true,
      data: PacienteDTO.toComplete(paciente)
    }
  }

  // Método para crear DTO de lista
  static toListResponse(pacientes) {
    return {
      success: true,
      data: pacientes.map(paciente => PacienteDTO.toComplete(paciente)),
      total: pacientes.length
    }
  }
}

module.exports = PacienteDTO
