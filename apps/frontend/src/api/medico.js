// src/api/medico.js
import { apiMedico as api } from "./client.medico";

export const medicoApi = {
  // Autenticación
  me: () => api.get("/auth/me"),
  
  // Citas
  citas: () => api.get("/citas"),
  citasHoy: () => api.get("/citas/hoy"),
  crearCita: (dto) => api.post("/citas", dto),
  terminarCita: (id) => api.patch(`/citas/${id}/terminar`),
  cancelarCita: (id) => api.patch(`/citas/${id}/cancelar`),

  // Pacientes
  pacientes: () => api.get("/pacientes"),
  paciente: (id) => api.get(`/pacientes/${id}`),
  crearPaciente: (dto) => api.post("/pacientes", dto),
  actualizarPaciente: (id, dto) => api.put(`/pacientes/${id}`, dto),

  // Consultas
  consultas: () => api.get("/consultas"),
  crearConsulta: (dto) => api.post("/consultas", dto),

  // Dashboard
  stats: () => api.get("/dashboard/stats"),
};
