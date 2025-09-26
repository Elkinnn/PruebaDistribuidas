// src/api/medico_profile.js
import { apiMedico } from "./client.medico";

export async function getMedicoProfile() {
  try {
    const response = await apiMedico.get("/medico/auth/me");
    return response.data;
  } catch (error) {
    console.error('Error fetching medico profile:', error);
    throw error;
  }
}

export async function updateMedicoProfile(patch) {
  try {
    const response = await apiMedico.put("/medico/auth/me", patch);
    return response.data;
  } catch (error) {
    console.error('Error updating medico profile:', error);
    throw error;
  }
}
