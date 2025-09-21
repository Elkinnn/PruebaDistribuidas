// src/api/auth.medico.js
// Mock de usuarios médicos para testing
const MOCK_MEDICOS = [
  {
    id: "m-medico-1",
    email: "dr.garcia@clinix.ec",
    password: "Medico123",      // demo
    rol: "MEDICO",
    nombre: "Dr. Carlos García",
    especialidad: "Cardiología",
    cedula: "1234567890",
  },
  {
    id: "m-medico-2", 
    email: "dra.martinez@clinix.ec",
    password: "Medico123",      // demo
    rol: "MEDICO",
    nombre: "Dra. Ana Martínez",
    especialidad: "Pediatría",
    cedula: "0987654321",
  },
  {
    id: "m-medico-3",
    email: "dr.lopez@clinix.ec", 
    password: "Medico123",      // demo
    rol: "MEDICO",
    nombre: "Dr. Miguel López",
    especialidad: "Neurología",
    cedula: "1122334455",
  },
];

export async function loginMedicoRequest({ email, password }) {
  // pequeño delay para UX
  await new Promise((r) => setTimeout(r, 500));

  const medico = MOCK_MEDICOS.find(
    (m) => m.email.toLowerCase() === String(email).toLowerCase()
  );
  
  if (!medico || medico.password !== password) {
    const error = new Error("Credenciales inválidas");
    error.response = { data: { message: "Correo o contraseña incorrectos." } };
    throw error;
  }

  // token de mentira para simular sesión
  const token = btoa(`${medico.id}.${medico.rol}.${Date.now()}`);
  const { password: _omit, ...safeMedico } = medico;

  return { token, user: safeMedico };
}

export function logoutMedico() {
  localStorage.removeItem("clinix_medico_token");
  localStorage.removeItem("clinix_medico_user");
}
