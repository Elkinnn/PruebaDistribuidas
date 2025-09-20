const express = require('express')
const router = express.Router()

// GET /citas - Obtener todas las citas
router.get('/', async (req, res) => {
  try {
    const { fecha, medicoId } = req.query
    
    // Simular datos de citas
    const citas = [
      {
        id: '1',
        pacienteId: '1',
        medicoId: '1',
        fecha: new Date().toISOString(),
        hora: '09:00',
        motivo: 'Control cardiológico',
        estado: 'programada',
        observaciones: 'Primera consulta'
      },
      {
        id: '2',
        pacienteId: '2',
        medicoId: '1',
        fecha: new Date().toISOString(),
        hora: '10:30',
        motivo: 'Consulta general',
        estado: 'programada',
        observaciones: 'Seguimiento'
      }
    ]

    res.json({
      success: true,
      data: citas
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /citas/hoy - Obtener citas de hoy
router.get('/hoy', async (req, res) => {
  try {
    const citasHoy = [
      {
        id: '1',
        pacienteId: '1',
        medicoId: '1',
        fecha: new Date().toISOString(),
        hora: '09:00',
        motivo: 'Control cardiológico',
        estado: 'programada',
        paciente: {
          nombre: 'Juan',
          apellido: 'Pérez'
        }
      },
      {
        id: '2',
        pacienteId: '2',
        medicoId: '1',
        fecha: new Date().toISOString(),
        hora: '10:30',
        motivo: 'Consulta general',
        estado: 'programada',
        paciente: {
          nombre: 'María',
          apellido: 'García'
        }
      }
    ]

    res.json({
      success: true,
      data: citasHoy
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /citas - Crear nueva cita
router.post('/', async (req, res) => {
  try {
    const citaData = req.body
    
    // Simular creación de cita
    const cita = {
      id: Date.now().toString(),
      ...citaData,
      estado: 'programada',
      createdAt: new Date().toISOString()
    }

    res.status(201).json({
      success: true,
      data: cita
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
