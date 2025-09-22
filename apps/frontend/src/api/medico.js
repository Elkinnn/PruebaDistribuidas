import apiClient from './client'

export async function listMedicos({ page = 1, pageSize = 8, q = "", hospitalId } = {}) {
  try {
    const response = await apiClient.get('/medicos', {
      params: { page, size: pageSize, q, hospitalId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching medicos:', error);
    throw error;
  }
}

export async function createMedico(data) {
  try {
    const response = await apiClient.post('/medicos', data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating medico:', error);
    throw error;
  }
}

export async function updateMedico(id, data) {
  try {
    const response = await apiClient.put(`/medicos/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating medico:', error);
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
