// src/api/auth.medico.js
import { apiMedico } from "./client.medico";

// Ajusta la ruta según tu API Gateway.
// Ejemplos posibles:
// - "/auth/login/medico"
// - "/api/auth/login?rol=MEDICO"
// - "/auth/medico/login"
export function loginMedicoRequest({ email, password }) {
  return apiMedico.post("/auth/login/medico", { email, password });
}
