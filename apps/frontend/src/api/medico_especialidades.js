import { apiMedico } from "./client.medico";

export async function getMedicoEspecialidades() {
  try {
    console.log('🔥🔥🔥 LLAMANDO A /medico/especialidades 🔥🔥🔥');
    const response = await apiMedico.get("/medico/especialidades");
    console.log('🔥🔥🔥 RESPUESTA COMPLETA:', response);
    console.log('🔥🔥🔥 RESPUESTA DATA:', response.data);
    console.log('🔥🔥🔥 RESPUESTA DATA.DATA:', response.data?.data);
    
    const result = response.data.data || response.data || [];
    console.log('🔥🔥🔥 RESULTADO FINAL:', result);
    
    return result;
  } catch (error) {
    console.error('🔥🔥🔥 ERROR EN ESPECIALIDADES:', error);
    throw error;
  }
}
