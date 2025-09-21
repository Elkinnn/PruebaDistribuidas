const express = require('express')
const router = express.Router()
const AuthService = require('../../infrastructure/auth/AuthService')

const authService = new AuthService()

// Middleware de autenticación para todas las rutas
router.use(authService.authenticateToken.bind(authService))
router.use(authService.requireMedicoRole.bind(authService))

// GET /consultas - Obtener todas las consultas
router.get('/', async (req, res) => {
  try {
    const { pacienteId, medicoId, fecha } = req.query
    
    // Simular datos de consultas
    const consultas = [
      {
        id: '1',
        pacienteId: '1',
        medicoId: '1',
        fecha: new Date().toISOString(),
        motivo: 'Control cardiológico',
        sintomas: 'Dolor en el pecho',
        diagnostico: 'Angina de pecho',
        tratamiento: 'Reposo y medicación',
        observaciones: 'Paciente estable',
        proximaCita: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    res.json({
      success: true,
      data: consultas
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /consultas - Crear nueva consulta
router.post('/', async (req, res) => {
  try {
    const consultaData = req.body
    
    // Simular creación de consulta
    const consulta = {
      id: Date.now().toString(),
      ...consultaData,
      createdAt: new Date().toISOString()
    }

    res.status(201).json({
      success: true,
      data: consulta
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
