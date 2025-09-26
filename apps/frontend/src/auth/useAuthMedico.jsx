import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const AuthMedicoContext = createContext()

export const useAuthMedico = () => {
  const context = useContext(AuthMedicoContext)
  if (!context) {
    throw new Error('useAuthMedico debe ser usado dentro de AuthMedicoProvider')
  }
  return context
}

export const AuthMedicoProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function validateToken() {
      const token = localStorage.getItem('clinix_medico_token')
      const userStr = localStorage.getItem('clinix_medico_user')
      
      if (token && userStr) {
        try {
          // Primero verificar si el token está expirado localmente
          const tokenPayload = JSON.parse(atob(token.split('.')[1]))
          const currentTime = Math.floor(Date.now() / 1000)
          
          if (tokenPayload.exp && tokenPayload.exp < currentTime) {
            console.log('Token expirado localmente')
            localStorage.removeItem('clinix_medico_token')
            localStorage.removeItem('clinix_medico_user')
            setLoading(false)
            return
          }
          
          // Validar token con el servidor
          const { apiMedico } = await import('../api/client.medico')
          const response = await apiMedico.get('/medico/auth/me')
          
          console.log('Token validation response:', response)
          
          if (response && response.data) {
            setUser(response.data)
            console.log('Usuario autenticado:', response.data.nombre)
          } else {
            console.log('Token inválido, limpiando localStorage')
            // Token inválido, limpiar
            localStorage.removeItem('clinix_medico_token')
            localStorage.removeItem('clinix_medico_user')
          }
        } catch (error) {
          console.log('Error validando token:', error)
          // Si es error 401 (no autorizado), limpiar tokens
          if (error.response?.status === 401) {
            localStorage.removeItem('clinix_medico_token')
            localStorage.removeItem('clinix_medico_user')
          }
        }
      }
      setLoading(false)
    }
    
    validateToken()
  }, [])

  const login = async (email, password) => {
    try {
      const { loginMedicoRequest } = await import('../api/auth.medico')
      const response = await loginMedicoRequest({ email, password })
      
      console.log('Login response:', response)
      
      // Verificar si la respuesta tiene la estructura correcta
      if (response.data && response.data.token && response.data.user) {
        // Guardar token y usuario
        localStorage.setItem('clinix_medico_token', response.data.token)
        localStorage.setItem('clinix_medico_user', JSON.stringify(response.data.user))
        
        setUser(response.data.user)
        toast.success('Inicio de sesión exitoso')
        navigate('/medico')
        return true
      } else if (response.token && response.user) {
        // Fallback para estructura directa
        localStorage.setItem('clinix_medico_token', response.token)
        localStorage.setItem('clinix_medico_user', JSON.stringify(response.user))
        
        setUser(response.user)
        toast.success('Inicio de sesión exitoso')
        navigate('/medico')
        return true
      } else {
        console.error('Estructura de respuesta inesperada:', response)
        throw new Error('Respuesta inválida del servidor')
      }
    } catch (error) {
      console.error('Error en login:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error en el inicio de sesión'
      toast.error(errorMessage)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('clinix_medico_token')
    localStorage.removeItem('clinix_medico_user')
    setUser(null)
    navigate('/medico/login')
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
    <AuthMedicoContext.Provider value={value}>
      {children}
    </AuthMedicoContext.Provider>
  )
}
