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
const LS_KEY = "clinix_medicos";
import apiClient from './client'

export async function listMedicos({ page = 1, pageSize = 8, q = "", hospitalId } = {}) {
  try {
    const response = await apiClient.get('/medicos', {
      params: { page, size: pageSize, q, hospitalId }
    });
    
    // Transformar respuesta del backend: { data, meta: { total } } -> { items, total }
    return {
      items: response.data.data || [],
      total: response.data.meta?.total || 0
    };
  } catch (error) {
    console.error('Error fetching medicos:', error);
    throw error;
  }
}

export async function createMedico(data) {
  try {
    // Convertir activo de número a boolean si es necesario
    const medicoData = { ...data };
    if (medicoData.activo !== undefined) {
      medicoData.activo = Boolean(medicoData.activo);
    }
    
    const response = await apiClient.post('/medicos', medicoData);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error creating medico:', error);
    console.error('❌ Error response:', error.response?.data);
    
    // Extraer mensaje de error más específico
    if (error.response?.data?.message) {
      const customError = new Error(error.response.data.message);
      customError.status = error.response.status;
      throw customError;
    }
    
    throw error;
  }
}

export async function updateMedico(id, data) {
  try {
    // Remover el id del data para evitar conflictos con la validación del backend
    const { id: _, ...updateData } = data;
    
    // Remover password vacío en edición (por seguridad)
    if (updateData.password === "") {
      delete updateData.password;
    }
    
    // Convertir activo de número a boolean si es necesario
    if (updateData.activo !== undefined) {
      updateData.activo = Boolean(updateData.activo);
    }
    
    const response = await apiClient.put(`/medicos/${id}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error updating medico:', error);
    console.error('❌ Error response:', error.response?.data);
    
    // Extraer mensaje de error más específico
    if (error.response?.data?.message) {
      const customError = new Error(error.response.data.message);
      customError.status = error.response.status;
      throw customError;
    }
    
    throw error;
  }
}

export async function deleteMedico(id) {
  try {
    const response = await apiClient.delete(`/medicos/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting medico:', error);
    throw error;
  }
}
