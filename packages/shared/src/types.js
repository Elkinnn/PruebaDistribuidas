// Tipos y interfaces compartidas
// En un proyecto real con TypeScript, estos serían interfaces

const types = {
  // Estructura base de respuesta API
  ApiResponse: {
    success: 'boolean',
    data: 'any',
    error: 'string',
    message: 'string',
    timestamp: 'string'
  },

  // Estructura de usuario
  User: {
    id: 'string',
    email: 'string',
    name: 'string',
    role: 'string',
    isActive: 'boolean',
    createdAt: 'Date',
    updatedAt: 'Date'
  },

  // Estructura de paciente
  Paciente: {
    id: 'string',
    nombre: 'string',
    apellido: 'string',
    email: 'string',
    telefono: 'string',
    fechaNacimiento: 'Date',
    genero: 'string',
    direccion: 'string',
    isActive: 'boolean',
    createdAt: 'Date',
    updatedAt: 'Date'
  },

  // Estructura de consulta
  Consulta: {
    id: 'string',
    pacienteId: 'string',
    medicoId: 'string',
    fecha: 'Date',
    motivo: 'string',
    sintomas: 'string',
    diagnostico: 'string',
    tratamiento: 'string',
    observaciones: 'string',
    proximaCita: 'Date',
    createdAt: 'Date',
    updatedAt: 'Date'
  },

  // Estructura de cita
  Cita: {
    id: 'string',
    pacienteId: 'string',
    medicoId: 'string',
    fecha: 'Date',
    hora: 'string',
    motivo: 'string',
    estado: 'string',
    observaciones: 'string',
    createdAt: 'Date',
    updatedAt: 'Date'
  },

  // Estructura de paginación
  Pagination: {
    page: 'number',
    limit: 'number',
    total: 'number',
    totalPages: 'number',
    hasNext: 'boolean',
    hasPrev: 'boolean'
  },

  // Estructura de estadísticas del dashboard
  DashboardStats: {
    totalUsers: 'number',
    activeUsers: 'number',
    totalPacientes: 'number',
    citasHoy: 'number',
    consultasMes: 'number',
    lastUpdate: 'Date'
  }
}

module.exports = types
