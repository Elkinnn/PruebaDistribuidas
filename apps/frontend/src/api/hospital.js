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
        // Separar especialidades del resto de datos del hospital
        const { especialidades, ...hospitalData } = data;
        
        // Convertir activo de número a boolean si es necesario
        if (hospitalData.activo !== undefined) {
            hospitalData.activo = Boolean(hospitalData.activo);
        }
        
        const response = await apiClient.post('/hospitales', hospitalData);
        
        // Si hay especialidades seleccionadas, asignarlas al hospital
        if (especialidades && especialidades.length > 0) {
            const hospitalId = response.data.data.id;
            await assignEspecialidadesToHospital(hospitalId, especialidades);
        }
        
        return response.data.data;
    } catch (error) {
        console.error('Error creating hospital:', error);
        throw error;
    }
}

async function assignEspecialidadesToHospital(hospitalId, especialidadIds) {
    try {
        // Asignar cada especialidad al hospital
        for (const especialidadId of especialidadIds) {
            await apiClient.post(`/hospitales/${hospitalId}/especialidades/${especialidadId}`);
        }
    } catch (error) {
        console.error('Error assigning especialidades to hospital:', error);
        throw error;
    }
}

async function updateEspecialidadesForHospital(hospitalId, especialidadIds) {
    try {
        // Primero obtener las especialidades actuales del hospital
        const currentResponse = await apiClient.get(`/hospitales/${hospitalId}/especialidades`);
        const currentEspecialidades = currentResponse.data.data || [];
        const currentIds = currentEspecialidades.map(esp => esp.id);
        
        // Calcular qué especialidades agregar y cuáles remover
        const toAdd = especialidadIds.filter(id => !currentIds.includes(id));
        const toRemove = currentIds.filter(id => !especialidadIds.includes(id));
        
        // Remover especialidades que ya no están seleccionadas
        for (const especialidadId of toRemove) {
            await apiClient.delete(`/hospitales/${hospitalId}/especialidades/${especialidadId}`);
        }
        
        // Agregar nuevas especialidades
        for (const especialidadId of toAdd) {
            await apiClient.post(`/hospitales/${hospitalId}/especialidades/${especialidadId}`);
        }
    } catch (error) {
        console.error('Error updating especialidades for hospital:', error);
        throw error;
    }
}

export async function updateHospital(id, data) {
    try {
        // Separar especialidades del resto de datos del hospital
        const { especialidades, ...updateData } = data;
        
        // Remover el id del data para evitar conflictos con la validación del backend
        const { id: _, ...finalUpdateData } = updateData;
        
        // Convertir activo de número a boolean si es necesario
        if (finalUpdateData.activo !== undefined) {
            finalUpdateData.activo = Boolean(finalUpdateData.activo);
        }
        
        const response = await apiClient.put(`/hospitales/${id}`, finalUpdateData);
        
        // Si hay especialidades seleccionadas, actualizar las asignaciones
        if (especialidades !== undefined) {
            await updateEspecialidadesForHospital(id, especialidades);
        }
        
        return response.data.data;
    } catch (error) {
        console.error('❌ Error updating hospital:', error);
        console.error('❌ Error response:', error.response?.data);
        throw error;
    }
}

export async function getHospitalEspecialidades(hospitalId) {
    try {
        const response = await apiClient.get(`/hospitales/${hospitalId}/especialidades`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching hospital especialidades:', error);
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
