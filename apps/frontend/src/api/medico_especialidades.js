import { apiMedico } from "./client.medico";

export async function getMedicoEspecialidades() {
  try {
    const response = await apiMedico.get("/medico/especialidades");
    // El backend devuelve directamente el array en response.data
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching medico especialidades:', error);
    throw error;
  }
}
