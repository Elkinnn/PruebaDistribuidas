import apiClient from './client'

export async function loginAdminRequest({ email, password }) {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Guardar token en localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('clinix_user', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    // Re-lanzar error con formato consistente
    const errorMessage = error.response?.data?.message || 'Error de conexión';
    const newError = new Error(errorMessage);
    newError.response = { data: { message: errorMessage } };
    throw newError;
  }
}

// Función genérica para login (admin y médico)
export async function loginRequest({ email, password }) {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Guardar token en localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('clinix_user', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error de conexión';
    const newError = new Error(errorMessage);
    newError.response = { data: { message: errorMessage } };
    throw newError;
  }
}

export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("clinix_user");
}
