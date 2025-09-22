import apiClient from './client'

export async function listHospitals({ page = 1, pageSize = 8, q = "" } = {}) {
    try {
        const response = await apiClient.get('/hospitales', {
            params: { page, size: pageSize, q }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        throw error;
    }
}

export async function createHospital(data) {
    try {
        const response = await apiClient.post('/hospitales', data);
        return response.data.data;
    } catch (error) {
        console.error('Error creating hospital:', error);
        throw error;
    }
}

export async function updateHospital(id, data) {
    try {
        const response = await apiClient.put(`/hospitales/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error updating hospital:', error);
        throw error;
    }
}

export async function deleteHospital(id) {
    try {
        const response = await apiClient.delete(`/hospitales/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Error deleting hospital:', error);
        throw error;
    }
}
