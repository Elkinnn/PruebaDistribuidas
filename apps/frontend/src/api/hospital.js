import apiClient from './client'

export async function listHospitals({ page = 1, pageSize = 8, q = "" } = {}) {
    try {
        const response = await apiClient.get('/hospitales', {
            params: { page, size: pageSize, q }
        });
        
        // Transformar respuesta del backend: { data, meta: { total } } -> { items, total }
        return {
            items: response.data.data || [],
            total: response.data.meta?.total || 0
        };
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        throw error;
    }
}

export async function createHospital(data) {
    try {
        // Convertir activo de número a boolean si es necesario
        const hospitalData = { ...data };
        if (hospitalData.activo !== undefined) {
            hospitalData.activo = Boolean(hospitalData.activo);
        }
        
        const response = await apiClient.post('/hospitales', hospitalData);
        return response.data.data;
    } catch (error) {
        console.error('Error creating hospital:', error);
        throw error;
    }
}

export async function updateHospital(id, data) {
    try {
        // Remover el id del data para evitar conflictos con la validación del backend
        const { id: _, ...updateData } = data;
        
        // Convertir activo de número a boolean si es necesario
        if (updateData.activo !== undefined) {
            updateData.activo = Boolean(updateData.activo);
        }
        
        
        const response = await apiClient.put(`/hospitales/${id}`, updateData);
        return response.data.data;
    } catch (error) {
        console.error('❌ Error updating hospital:', error);
        console.error('❌ Error response:', error.response?.data);
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
