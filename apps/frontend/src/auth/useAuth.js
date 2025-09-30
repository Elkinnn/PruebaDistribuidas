import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function validateToken() {
      const token = localStorage.getItem('authToken')
      const userStr = localStorage.getItem('clinix_user')
      
      if (token && userStr) {
        try {
          // Validar token con el servidor
          const { default: apiClient } = await import('../api/client')
          const response = await apiClient.post('/auth/validate-token', { token })
          
          if (response.data.success) {
            setUser(JSON.parse(userStr))
          } else {
            // Token inválido, limpiar
            localStorage.removeItem('authToken')
            localStorage.removeItem('clinix_user')
          }
        } catch (error) {
          // Token inválido, limpiar
          localStorage.removeItem('authToken')
          localStorage.removeItem('clinix_user')
        }
      }
      setLoading(false)
    }
    
    validateToken()
  }, [])

  const login = async (email, password) => {
    try {
      const { loginAdminRequest } = await import('../api/auth')
      const { token, user } = await loginAdminRequest({ email, password })
      
      setUser(user)
      toast.success('Inicio de sesión exitoso')
      navigate('/admin')
      return true
    } catch (error) {
      toast.error('Error en el inicio de sesión')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('clinix_user')
    setUser(null)
    navigate('/admin/login')
    toast.success('Sesión cerrada')
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
