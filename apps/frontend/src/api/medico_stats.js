// src/api/medico_stats.js
import { apiMedico } from "./client.medico";

export async function getMedicoStats() {
  try {
    const response = await apiMedico.get("/medico/stats");
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error fetching medico stats:', error);
    return { 
      success: false, 
      data: {
        totalPacientes: 0,
        citasHoy: 0,
        consultasMes: 0
      }
    };
  }
}
