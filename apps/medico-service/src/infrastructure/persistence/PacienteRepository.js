// Implementación en memoria para desarrollo
// En producción, esto se conectaría a una base de datos real

class PacienteRepository {
  constructor() {
    this.pacientes = new Map()
    this.initializeSampleData()
  }

  initializeSampleData() {
    // Datos de ejemplo para desarrollo
    const samplePacientes = [
      {
        id: '1',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '555-0101',
        fechaNacimiento: '1985-03-15',
        genero: 'M',
        direccion: 'Calle Principal 123',
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: '2',
        nombre: 'María',
        apellido: 'García',
        email: 'maria.garcia@email.com',
        telefono: '555-0102',
        fechaNacimiento: '1990-07-22',
        genero: 'F',
        direccion: 'Avenida Central 456',
        isActive: true,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15')
      },
      {
        id: '3',
        nombre: 'Carlos',
        apellido: 'López',
        email: 'carlos.lopez@email.com',
        telefono: '555-0103',
        fechaNacimiento: '1978-11-08',
        genero: 'M',
        direccion: 'Plaza Mayor 789',
        isActive: true,
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-02-01')
      }
    ]

    samplePacientes.forEach(paciente => {
      this.pacientes.set(paciente.id, paciente)
    })
  }

  async save(paciente) {
    try {
      const pacienteData = {
        id: paciente.id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        email: paciente.email,
        telefono: paciente.telefono,
        fechaNacimiento: paciente.fechaNacimiento,
        genero: paciente.genero,
        direccion: paciente.direccion,
        isActive: paciente.isActive,
        createdAt: paciente.createdAt,
        updatedAt: paciente.updatedAt
      }

      this.pacientes.set(paciente.id, pacienteData)
      return pacienteData
    } catch (error) {
      throw new Error(`Failed to save paciente: ${error.message}`)
    }
  }

  async findById(id) {
    try {
      const paciente = this.pacientes.get(id)
      return paciente || null
    } catch (error) {
      throw new Error(`Failed to find paciente by id: ${error.message}`)
    }
  }

  async findByEmail(email) {
    try {
      for (const paciente of this.pacientes.values()) {
        if (paciente.email === email) {
          return paciente
        }
      }
      return null
    } catch (error) {
      throw new Error(`Failed to find paciente by email: ${error.message}`)
    }
  }

  async findAll() {
    try {
      return Array.from(this.pacientes.values())
    } catch (error) {
      throw new Error(`Failed to find all pacientes: ${error.message}`)
    }
  }

  async search(query) {
    try {
      const pacientes = Array.from(this.pacientes.values())
      const searchTerm = query.toLowerCase()
      
      return pacientes.filter(paciente => 
        paciente.nombre.toLowerCase().includes(searchTerm) ||
        paciente.apellido.toLowerCase().includes(searchTerm) ||
        paciente.email.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      throw new Error(`Failed to search pacientes: ${error.message}`)
    }
  }

  async delete(id) {
    try {
      const deleted = this.pacientes.delete(id)
      if (!deleted) {
        throw new Error('Paciente not found')
      }
      return true
    } catch (error) {
      throw new Error(`Failed to delete paciente: ${error.message}`)
    }
  }

  async count() {
    try {
      return this.pacientes.size
    } catch (error) {
      throw new Error(`Failed to count pacientes: ${error.message}`)
    }
  }
}

module.exports = new PacienteRepository()
