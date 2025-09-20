class PacienteUseCases {
  constructor(pacienteRepository) {
    this.pacienteRepository = pacienteRepository
  }

  async createPaciente(pacienteData) {
    try {
      const { nombre, apellido, email, telefono, fechaNacimiento, genero, direccion } = pacienteData
      
      if (!nombre || !apellido || !email || !fechaNacimiento) {
        throw new Error('Nombre, apellido, email y fecha de nacimiento son requeridos')
      }

      // Verificar si el paciente ya existe
      const existingPaciente = await this.pacienteRepository.findByEmail(email)
      if (existingPaciente) {
        throw new Error('Ya existe un paciente con este email')
      }

      // Crear paciente
      const Paciente = require('../../domain/entities/Paciente')
      const paciente = Paciente.create({
        nombre,
        apellido,
        email,
        telefono,
        fechaNacimiento,
        genero,
        direccion
      })

      // Guardar en repositorio
      const savedPaciente = await this.pacienteRepository.save(paciente)
      
      return {
        success: true,
        data: savedPaciente
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getPacienteById(id) {
    try {
      const paciente = await this.pacienteRepository.findById(id)
      if (!paciente) {
        throw new Error('Paciente no encontrado')
      }
      
      return {
        success: true,
        data: paciente
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getAllPacientes() {
    try {
      const pacientes = await this.pacienteRepository.findAll()
      
      return {
        success: true,
        data: pacientes
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async updatePaciente(id, pacienteData) {
    try {
      const paciente = await this.pacienteRepository.findById(id)
      if (!paciente) {
        throw new Error('Paciente no encontrado')
      }

      // Actualizar datos
      paciente.actualizarDatos(pacienteData)

      // Guardar cambios
      const updatedPaciente = await this.pacienteRepository.save(paciente)
      
      return {
        success: true,
        data: updatedPaciente
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async deletePaciente(id) {
    try {
      const paciente = await this.pacienteRepository.findById(id)
      if (!paciente) {
        throw new Error('Paciente no encontrado')
      }

      await this.pacienteRepository.delete(id)
      
      return {
        success: true,
        message: 'Paciente eliminado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async searchPacientes(query) {
    try {
      const pacientes = await this.pacienteRepository.search(query)
      
      return {
        success: true,
        data: pacientes
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

module.exports = PacienteUseCases
