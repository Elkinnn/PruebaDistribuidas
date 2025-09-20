import apiClient from './client'

export const adminApi = {
  // Usuarios
  getUsers: () => apiClient.get('/admin/users'),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (userData) => apiClient.post('/admin/users', userData),
  updateUser: (id, userData) => apiClient.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),

  // Configuración
  getConfig: () => apiClient.get('/admin/config'),
  updateConfig: (configData) => apiClient.put('/admin/config', configData),

  // Reportes
  getReports: (params) => apiClient.get('/admin/reports', { params }),
  exportData: (format) => apiClient.get(`/admin/export/${format}`),

  // Dashboard
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
}
