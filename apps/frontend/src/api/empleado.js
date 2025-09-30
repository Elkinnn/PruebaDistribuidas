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
        console.log('🔍 [API EMPLEADO] Updating empleado with ID:', id);
        console.log('🔍 [API EMPLEADO] Data being sent:', JSON.stringify(data, null, 2));
        
        const response = await apiClient.put(`/empleados/${id}`, data);
        console.log('✅ [API EMPLEADO] Update successful:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('❌ [API EMPLEADO] Error updating empleado:', error);
        console.error('❌ [API EMPLEADO] Error response:', error.response?.data);
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

