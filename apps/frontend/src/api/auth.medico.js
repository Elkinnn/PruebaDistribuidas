// src/api/auth.medico.js
import { apiMedico } from "./client.medico";

export async function loginMedicoRequest({ email, password }) {
  try {
    const response = await apiMedico.post("/medico/auth/login", {
      email,
      password
    });
    
    return response;
  } catch (error) {
    console.error('Error en login de médico:', error);
    throw error;
  }
}

export function logoutMedico() {
  localStorage.removeItem("clinix_medico_token");
  localStorage.removeItem("clinix_medico_user");
}
