import apiClient from './client'

export async function listEspecialidades({ page = 1, pageSize = 8, q = "" } = {}) {
    try {
        const response = await apiClient.get('/especialidades', {
            params: { page, size: pageSize, q }
        });
        
        // Transformar respuesta del backend: { data, meta: { total } } -> { items, total }
        return {
            items: response.data.data || [],
            total: response.data.meta?.total || 0
        };
    } catch (error) {
        console.error('Error fetching especialidades:', error);
        throw error;
    }
}

export async function createEspecialidad(data) {
    try {
        const response = await apiClient.post('/especialidades', data);
        return response.data.data;
    } catch (error) {
        console.error('Error creating especialidad:', error);
        
        // Extraer mensaje de error más específico
        if (error.response?.data?.message) {
            const customError = new Error(error.response.data.message);
            customError.status = error.response.status;
            throw customError;
        }
        
        throw error;
    }
}

export async function updateEspecialidad(id, data) {
    try {
        // Remover el id del data para evitar conflictos con la validación del backend
        const { id: _, ...updateData } = data;
        
        const response = await apiClient.put(`/especialidades/${id}`, updateData);
        return response.data.data;
    } catch (error) {
        console.error('Error updating especialidad:', error);
        
        // Extraer mensaje de error más específico
        if (error.response?.data?.message) {
            const customError = new Error(error.response.data.message);
            customError.status = error.response.status;
            throw customError;
        }
        
        throw error;
    }
}

export async function deleteEspecialidad(id) {
    try {
        const response = await apiClient.delete(`/especialidades/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Error deleting especialidad:', error);
        throw error;
    }
}
