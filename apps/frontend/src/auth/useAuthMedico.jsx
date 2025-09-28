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
      console.log('=== VALIDACIÓN DE TOKEN INICIADA ===')
      const token = localStorage.getItem('clinix_medico_token')
      const userStr = localStorage.getItem('clinix_medico_user')
      
      console.log('Token encontrado:', token ? 'SÍ' : 'NO')
      console.log('Usuario encontrado:', userStr ? 'SÍ' : 'NO')
      
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
          
          if (response && response.id) {
            setUser(response)
            console.log('Usuario autenticado:', response.nombre)
          } else {
            console.log('Token inválido, limpiando localStorage')
            // Token inválido, limpiar
            localStorage.removeItem('clinix_medico_token')
            localStorage.removeItem('clinix_medico_user')
          }
        } catch (error) {
          console.log('Error validando token:', error)
          // Si es error 401 (no autorizado), limpiar tokens
          if (error.message === 'Token inválido' || error.message === 'Token requerido') {
            localStorage.removeItem('clinix_medico_token')
            localStorage.removeItem('clinix_medico_user')
          }
        }
      } else {
        console.log('No hay token o usuario en localStorage')
      }
      console.log('Finalizando validación de token, setting loading = false')
      setLoading(false)
    }
    
    validateToken()
  }, [])

  const login = async (email, password) => {
    try {
      const { loginMedicoRequest } = await import('../api/auth.medico')
      const response = await loginMedicoRequest({ email, password })
      
      console.log('Login response:', response)
      
      // El backend devuelve directamente { token, user }
      if (response.token && response.user) {
        console.log('Guardando token y usuario en localStorage...')
        // Guardar token y usuario
        localStorage.setItem('clinix_medico_token', response.token)
        localStorage.setItem('clinix_medico_user', JSON.stringify(response.user))
        
        console.log('Token guardado:', localStorage.getItem('clinix_medico_token') ? 'SÍ' : 'NO')
        console.log('Usuario guardado:', localStorage.getItem('clinix_medico_user') ? 'SÍ' : 'NO')
        
        console.log('Actualizando estado del usuario...')
        setUser(response.user)
        
        console.log('Mostrando toast de éxito...')
        toast.success('Inicio de sesión exitoso')
        
        console.log('Navegando a /medico...')
        navigate('/medico')
        
        console.log('Login completado exitosamente')
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
    console.log('=== INICIANDO LOGOUT ===')
    try {
      // Limpiar localStorage
      localStorage.removeItem('clinix_medico_token')
      localStorage.removeItem('clinix_medico_user')
      console.log('localStorage limpiado')
      
      // Limpiar estado
      setUser(null)
      console.log('Estado de usuario limpiado')
      
      // Mostrar mensaje de éxito
      toast.success('Sesión cerrada')
      
      // Navegar al login
      navigate('/medico/login', { replace: true })
      console.log('Navegando a /medico/login')
      
      // Forzar recarga de la página para limpiar cualquier estado residual
      setTimeout(() => {
        window.location.href = '/medico/login'
      }, 100)
      
    } catch (error) {
      console.error('Error durante logout:', error)
      // En caso de error, forzar navegación
      window.location.href = '/medico/login'
    }
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
