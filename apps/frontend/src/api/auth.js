const MOCK_ADMINS = [
  {
    id: "u-admin-1",
    email: "admin@clinix.ec",
    password: "Clinix123",  // demo
    rol: "ADMIN_GLOBAL",
  },
];

const MOCK_MEDICOS = [
  {
    id: "u-medico-1",
    email: "medico@clinix.ec",
    password: "Clinix123",  // demo
    rol: "MEDICO",
  },
];

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function loginAdminRequest({ email, password }) {
  await delay();
  const user = MOCK_ADMINS.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!user || user.password !== password) {
    const error = new Error("Credenciales inválidas");
    error.response = { data: { message: "Correo o contraseña incorrectos." } };
    throw error;
  }
  const token = btoa(`${user.id}.${user.rol}.${Date.now()}`);
  const { password: _omit, ...safeUser } = user;
  return { token, user: safeUser };
}

// Opcional: para un login de médicos en otra ruta/pantalla distinta
export async function loginMedicoRequest({ email, password }) {
  await delay();
  const user = MOCK_MEDICOS.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!user || user.password !== password) {
    const error = new Error("Credenciales inválidas");
    error.response = { data: { message: "Correo o contraseña incorrectos." } };
    throw error;
  }
  const token = btoa(`${user.id}.${user.rol}.${Date.now()}`);
  const { password: _omit, ...safeUser } = user;
  return { token, user: safeUser };
}

export function logout() {
  localStorage.removeItem("clinix_token");
  localStorage.removeItem("clinix_user");
}
