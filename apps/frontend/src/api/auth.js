const MOCK_USERS = [
  {
    id: "u-admin-1",
    email: "admin@clinix.ec",
    password: "Clinix123",      // demo
    rol: "ADMIN_GLOBAL",
  },
  {
    id: "u-medico-1",
    email: "medico@clinix.ec",
    password: "Clinix123",      // demo
    rol: "MEDICO",
  },
];

export async function loginRequest({ email, password }) {
  // pequeño delay para UX
  await new Promise((r) => setTimeout(r, 500));

  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!user || user.password !== password) {
    const error = new Error("Credenciales inválidas");
    error.response = { data: { message: "Correo o contraseña incorrectos." } };
    throw error;
  }

  // token de mentira para simular sesión
  const token = btoa(`${user.id}.${user.rol}.${Date.now()}`);
  const { password: _omit, ...safeUser } = user;

  return { token, user: safeUser };
}

export function logout() {
  localStorage.removeItem("clinix_token");
  localStorage.removeItem("clinix_user");
}
