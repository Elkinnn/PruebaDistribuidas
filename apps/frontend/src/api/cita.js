import apiClient from './client'

export async function listCitas({ page = 1, pageSize = 8, q = "" }) {
    try {
        const response = await apiClient.get('/citas', {
            params: { page, size: pageSize, q }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching citas:', error);
        throw error;
    }
}

export async function createCita(data) {
    try {
        const response = await apiClient.post('/citas', data);
        return response.data.data;
    } catch (error) {
        console.error('Error creating cita:', error);
        throw error;
    }
}

export async function updateCita(id, data) {
    try {
        const response = await apiClient.put(`/citas/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error updating cita:', error);
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