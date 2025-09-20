const express = require('express')
const router = express.Router()

// GET /dashboard/stats - Obtener estadísticas del dashboard
router.get('/stats', async (req, res) => {
  try {
    // Simular datos de estadísticas
    const stats = {
      totalUsers: 1234,
      activeUsers: 89,
      newUsersToday: 12,
      totalConfigurations: 12,
      systemHealth: 'healthy',
      lastUpdate: new Date().toISOString()
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
