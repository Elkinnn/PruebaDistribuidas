const express = require('express')
const router = express.Router()

// GET /config - Obtener configuración del sistema
router.get('/', async (req, res) => {
  try {
    const config = {
      systemName: 'Prueba Sistema',
      version: '1.0.0',
      maintenanceMode: false,
      maxUsers: 1000,
      features: {
        userManagement: true,
        reporting: true,
        notifications: true
      },
      lastUpdate: new Date().toISOString()
    }

    res.json({
      success: true,
      data: config
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch configuration' 
    })
  }
})

// PUT /config - Actualizar configuración del sistema
router.put('/', async (req, res) => {
  try {
    const { systemName, maxUsers, features } = req.body
    
    // En un proyecto real, guardarías esto en la base de datos
    const updatedConfig = {
      systemName: systemName || 'Prueba Sistema',
      version: '1.0.0',
      maintenanceMode: false,
      maxUsers: maxUsers || 1000,
      features: features || {
        userManagement: true,
        reporting: true,
        notifications: true
      },
      lastUpdate: new Date().toISOString()
    }

    res.json({
      success: true,
      data: updatedConfig,
      message: 'Configuration updated successfully'
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to update configuration' 
    })
  }
})

module.exports = router
