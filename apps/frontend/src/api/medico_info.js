// src/api/medico_info.js
import { apiMedico } from "./client.medico";

export async function getMedicoInfo() {
  try {
    const response = await apiMedico.get("/medico/info");
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error fetching medico info:', error);
    return { 
      success: false, 
      data: null 
    };
  }
}
