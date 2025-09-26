// src/api/medico_cita.js
import { apiMedico } from "./client.medico";

const ESTADOS = ["PROGRAMADA", "CANCELADA", "ATENDIDA"];

export async function listCitas({ page = 1, pageSize = 8, q = "" } = {}) {
  try {
    const response = await apiMedico.get(`/medico/citas?page=${page}&pageSize=${pageSize}&q=${q}`);
    return {
      items: response.data || [],
      total: response.total || 0
    };
  } catch (error) {
    console.error('Error fetching citas:', error);
    throw error;
  }
}

export async function createCita(values) {
  try {
    const response = await apiMedico.post("/medico/citas", values);
    return response.data;
  } catch (error) {
    console.error('Error creating cita:', error);
    throw error;
  }
}

export async function updateCita(id, values) {
  try {
    const response = await apiMedico.put(`/medico/citas/${id}`, values);
    return response.data;
  } catch (error) {
    console.error('Error updating cita:', error);
    throw error;
  }
}

export async function deleteCita(id) {
  try {
    const response = await apiMedico.delete(`/medico/citas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting cita:', error);
    throw error;
  }
}

export const CITA_ESTADOS = ESTADOS;

/**
 * Devuelve las citas de HOY asignadas al médico.
 * @param {Object} params
 * @param {number|string} [params.medicoId]  // si tu sesión no lo aporta por token
 * @param {number} [params.limit=5]
 * @param {"PROGRAMADA"|"ATENDIDA"|"CANCELADA"} [params.estado] // opcional
 * @returns {Promise<{success:boolean,data:Array}>}
 */
export async function citasHoyMedico({ medicoId, limit = 5, estado } = {}) {
  try {
    const params = new URLSearchParams();
    if (medicoId) params.append('medicoId', medicoId);
    if (limit) params.append('limit', limit);
    if (estado) params.append('estado', estado);
    
    const response = await apiMedico.get(`/medico/citas/hoy?${params.toString()}`);
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error fetching citas de hoy:', error);
    return { success: false, data: [] };
  }
}

/**
 * KPIs del dashboard del médico
 * @param {Object} params
 * @param {number|string} [params.medicoId]
 * @returns {Promise<{success:boolean,data:{totalPacientes:number,citasHoy:number,consultasMes:number}}>}
 */
export async function statsMedico({ medicoId } = {}) {
  try {
    const params = new URLSearchParams();
    if (medicoId) params.append('medicoId', medicoId);
    
    const response = await apiMedico.get(`/medico/dashboard/stats?${params.toString()}`);
    return { success: true, data: response.data || { totalPacientes: 0, citasHoy: 0, consultasMes: 0 } };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, data: { totalPacientes: 0, citasHoy: 0, consultasMes: 0 } };
  }
}

/** Export agrupado opcional para consumir como objeto */
export const medicoCitaApi = {
  citasHoy: (args) => citasHoyMedico(args),
  stats:   (args) => statsMedico(args),
};