import { api } from "./client";

// Ajusta los paths a tu API Gateway
export const medicoApi = {
  me: () => api.get("/me"),
  citas: () => api.get("/api/citas"),
  crearCita: (dto) => api.post("/api/citas", dto), // back pone hospital/medico desde JWT
  terminarCita: (id) => api.patch(`/api/citas/${id}/terminar`),
  cancelarCita: (id) => api.patch(`/api/citas/${id}/cancelar`),

  espHospital: () => api.get("/api/especialidades/hospital"),
  misEsp: () => api.get("/api/especialidades/mias"),
};
