// src/api/especialidad.medico.js
import { apiMedico } from "./client.medico";

export async function listEspecialidadesMedico({ page = 1, pageSize = 6 } = {}) {
  try {
    const response = await apiMedico.get(`/medico/especialidades?page=${page}&pageSize=${pageSize}`);
    return {
      items: response.data || [],
      total: response.total || 0,
      estadisticas: response.estadisticas || {}
    };
  } catch (error) {
    console.error('Error fetching especialidades:', error);
    throw error;
  }
}

export async function getEspecialidadesMedico() {
  try {
    const response = await apiMedico.get('/medico/especialidades');
    return {
      success: true,
      data: response.data || [],
      estadisticas: response.estadisticas || {}
    };
  } catch (error) {
    console.error('Error fetching especialidades:', error);
    return {
      success: false,
      data: [],
      estadisticas: {
        totalEspecialidades: 0,
        totalMedicos: 0,
        masPopular: '',
        medicosMasPopular: 0
      }
    };
  }
}
