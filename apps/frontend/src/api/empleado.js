import apiClient from './client'

export async function listEmpleados({ page = 1, pageSize = 10, q = "" }) {
    try {
        const response = await apiClient.get('/empleados', {
            params: { page, size: pageSize, q }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching empleados:', error);
        throw error;
    }
}

export async function createEmpleado(data) {
    try {
        const response = await apiClient.post('/empleados', data);
        return response.data.data;
    } catch (error) {
        console.error('Error creating empleado:', error);
        throw error;
    }
}

export async function updateEmpleado(id, data) {
    try {
        const response = await apiClient.put(`/empleados/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error updating empleado:', error);
        throw error;
    }
}

export async function deleteEmpleado(id) {
    try {
        const response = await apiClient.delete(`/empleados/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Error deleting empleado:', error);
        throw error;
    }
}

