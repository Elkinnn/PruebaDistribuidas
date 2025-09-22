import apiClient from './client'

export async function listEspecialidades({ page = 1, pageSize = 8, q = "" } = {}) {
    try {
        const response = await apiClient.get('/especialidades', {
            params: { page, size: pageSize, q }
        });
        return response.data;
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
        throw error;
    }
}

export async function updateEspecialidad(id, data) {
    try {
        const response = await apiClient.put(`/especialidades/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error updating especialidad:', error);
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
