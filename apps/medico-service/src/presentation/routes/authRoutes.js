const express = require('express')
const router = express.Router()
const AuthService = require('../../infrastructure/auth/AuthService')

const authService = new AuthService()

// Datos de médicos de prueba (en producción esto vendría de una base de datos)
const medicosPrueba = [
  {
    id: 'med-001',
    email: 'dr.garcia@clinix.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4Jz8Kz8Kz8', // password: medico123
    nombre: 'Dr. García',
    apellido: 'Rodríguez',
    especialidad: 'Cardiología',
    rol: 'MEDICO',
    activo: true
  },
  {
    id: 'med-002',
    email: 'dr.martinez@clinix.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4Jz8Kz8Kz8', // password: medico123
    nombre: 'Dr. Martínez',
    apellido: 'López',
    especialidad: 'Neurología',
    rol: 'MEDICO',
    activo: true
  }
]

// POST /auth/login/medico - Login de médico
router.post('/login/medico', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar datos de entrada
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      })
    }

    // Buscar médico por email
    const medico = medicosPrueba.find(m => m.email === email && m.activo)
    
    if (!medico) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      })
    }

    // Verificar contraseña
    const passwordValid = await authService.verifyPassword(password, medico.password)
    
    if (!passwordValid) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      })
    }

    // Generar token JWT
    const tokenPayload = {
      id: medico.id,
      email: medico.email,
      nombre: medico.nombre,
      apellido: medico.apellido,
      especialidad: medico.especialidad,
      rol: medico.rol
    }

    const token = authService.generateToken(tokenPayload)

    // Respuesta exitosa
    res.json({
      success: true,
      token,
      user: {
        id: medico.id,
        email: medico.email,
        nombre: medico.nombre,
        apellido: medico.apellido,
        especialidad: medico.especialidad,
        rol: medico.rol
      }
    })

  } catch (error) {
    console.error('Error en login médico:', error)
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    })
  }
})

// POST /auth/register/medico - Registro de médico (solo para desarrollo)
router.post('/register/medico', async (req, res) => {
  try {
    const { email, password, nombre, apellido, especialidad } = req.body

    // Validar datos de entrada
    if (!email || !password || !nombre || !apellido || !especialidad) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      })
    }

    // Verificar si el médico ya existe
    const medicoExistente = medicosPrueba.find(m => m.email === email)
    
    if (medicoExistente) {
      return res.status(409).json({ 
        error: 'Ya existe un médico con este email' 
      })
    }

    // Hash de la contraseña
    const hashedPassword = await authService.hashPassword(password)

    // Crear nuevo médico
    const nuevoMedico = {
      id: `med-${Date.now()}`,
      email,
      password: hashedPassword,
      nombre,
      apellido,
      especialidad,
      rol: 'MEDICO',
      activo: true
    }

    medicosPrueba.push(nuevoMedico)

    // Generar token JWT
    const tokenPayload = {
      id: nuevoMedico.id,
      email: nuevoMedico.email,
      nombre: nuevoMedico.nombre,
      apellido: nuevoMedico.apellido,
      especialidad: nuevoMedico.especialidad,
      rol: nuevoMedico.rol
    }

    const token = authService.generateToken(tokenPayload)

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      token,
      user: {
        id: nuevoMedico.id,
        email: nuevoMedico.email,
        nombre: nuevoMedico.nombre,
        apellido: nuevoMedico.apellido,
        especialidad: nuevoMedico.especialidad,
        rol: nuevoMedico.rol
      }
    })

  } catch (error) {
    console.error('Error en registro médico:', error)
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    })
  }
})

// GET /auth/me - Obtener información del médico autenticado
router.get('/me', authService.authenticateToken.bind(authService), authService.requireMedicoRole.bind(authService), (req, res) => {
  res.json({
    success: true,
    user: req.user
  })
})

// POST /auth/refresh - Renovar token
router.post('/refresh', authService.authenticateToken.bind(authService), (req, res) => {
  try {
    const newToken = authService.generateToken(req.user)
    
    res.json({
      success: true,
      token: newToken
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al renovar token' 
    })
  }
})

module.exports = router
