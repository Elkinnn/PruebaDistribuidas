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
    // Verificar si hay un token guardado
    const token = localStorage.getItem('authToken')
    if (token) {
      // Aquí podrías validar el token con el servidor
      setUser({ token })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Simular llamada a la API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.token)
        setUser(data.user)
        toast.success('Inicio de sesión exitoso')
        navigate('/')
        return true
      } else {
        throw new Error('Credenciales inválidas')
      }
    } catch (error) {
      toast.error('Error en el inicio de sesión')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    navigate('/login')
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
