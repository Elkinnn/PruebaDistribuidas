import apiClient from './client'

export async function listCitas({ page = 1, pageSize = 8, q = "", hospitalId, medicoId, estado, desde, hasta } = {}) {
  try {
    const response = await apiClient.get('/citas', {
      params: { page, size: pageSize, q, hospitalId, medicoId, estado, desde, hasta }
    });
    
    // Transformar respuesta del backend: { data, pagination: { total } } -> { items, total }
    return {
      items: response.data.data || [],
      total: response.data.pagination?.total || 0
    };
  } catch (error) {
    console.error('Error fetching citas:', error);
    throw error;
  }
}

export async function createCita(data) {
  try {
    console.log('🔍 [DEBUG] createCita - Data being sent:', data);
    const response = await apiClient.post('/citas', data);
    console.log('✅ [DEBUG] createCita - Response received:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error creating cita:', error);
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

export async function updateCita(id, data) {
  try {
    // Remover el id del data para evitar conflictos con la validación del backend
    const { id: _, ...updateData } = data;
    
    const response = await apiClient.put(`/citas/${id}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating cita:', error);
    
    // Extraer mensaje de error más específico
    if (error.response?.data?.message) {
      const customError = new Error(error.response.data.message);
      customError.status = error.response.status;
      throw customError;
    }
    
    throw error;
  }
}

export async function deleteCita(id) {
  try {
    const response = await apiClient.delete(`/citas/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting cita:', error);
    throw error;
  }
}

export async function getCita(id) {
  try {
    const response = await apiClient.get(`/citas/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cita:', error);
    throw error;
  }
}

export async function cancelarCitasPasadas() {
  try {
    const response = await apiClient.post('/citas/cancelar-pasadas');
    return response.data.data;
  } catch (error) {
    console.error('Error cancelando citas pasadas:', error);
    throw error;
  }
}