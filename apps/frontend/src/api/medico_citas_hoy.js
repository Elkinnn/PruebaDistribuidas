// src/api/medico_citas_hoy.js
import { apiMedico } from "./client.medico";

export async function getCitasHoy() {
  try {
    const response = await apiMedico.get("/medico/citas/hoy");
    return {
      success: true,
      data: response || []
    };
  } catch (error) {
    console.error('Error fetching citas de hoy:', error);
    return { 
      success: false, 
      data: []
    };
  }
}
