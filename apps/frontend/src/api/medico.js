import apiClient from './client'

export const medicoApi = {
  // Pacientes
  getPacientes: () => apiClient.get('/medico/pacientes'),
  getPacienteById: (id) => apiClient.get(`/medico/pacientes/${id}`),
  createPaciente: (pacienteData) => apiClient.post('/medico/pacientes', pacienteData),
  updatePaciente: (id, pacienteData) => apiClient.put(`/medico/pacientes/${id}`, pacienteData),

  // Consultas
  getConsultas: (params) => apiClient.get('/medico/consultas', { params }),
  getConsultaById: (id) => apiClient.get(`/medico/consultas/${id}`),
  createConsulta: (consultaData) => apiClient.post('/medico/consultas', consultaData),
  updateConsulta: (id, consultaData) => apiClient.put(`/medico/consultas/${id}`, consultaData),

  // Citas
  getCitas: (params) => apiClient.get('/medico/citas', { params }),
  getCitaById: (id) => apiClient.get(`/medico/citas/${id}`),
  createCita: (citaData) => apiClient.post('/medico/citas', citaData),
  updateCita: (id, citaData) => apiClient.put(`/medico/citas/${id}`, citaData),
  cancelCita: (id) => apiClient.delete(`/medico/citas/${id}`),

  // Dashboard
  getDashboardStats: () => apiClient.get('/medico/dashboard/stats'),
  getCitasHoy: () => apiClient.get('/medico/citas/hoy'),
}
