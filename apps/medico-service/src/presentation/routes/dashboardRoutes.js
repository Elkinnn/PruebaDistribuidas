const express = require('express')
const router = express.Router()
const AuthService = require('../../infrastructure/auth/AuthService')

const authService = new AuthService()

// Middleware de autenticación para todas las rutas
router.use(authService.authenticateToken.bind(authService))
router.use(authService.requireMedicoRole.bind(authService))

// GET /dashboard/stats - Obtener estadísticas del dashboard médico
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalPacientes: 156,
      citasHoy: 8,
      consultasMes: 234,
      especialidad: 'Cardiología',
      proximasCitas: 5,
      pacientesUrgentes: 2,
      ultimaActualizacion: new Date().toISOString()
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch dashboard stats' 
    })
  }
})

module.exports = router
