const express = require('express')
const router = express.Router()
const PacienteUseCases = require('../../application/useCases/PacienteUseCases')
const PacienteDTO = require('../../domain/dtos/PacienteDTO')

// Inyección de dependencias
const pacienteRepository = require('../../infrastructure/persistence/PacienteRepository')
const pacienteUseCases = new PacienteUseCases(pacienteRepository)

// GET /pacientes - Obtener todos los pacientes
router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    let result

    if (search) {
      result = await pacienteUseCases.searchPacientes(search)
    } else {
      result = await pacienteUseCases.getAllPacientes()
    }
    
    if (result.success) {
      res.json(PacienteDTO.toListResponse(result.data))
    } else {
      res.status(400).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /pacientes/:id - Obtener paciente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pacienteUseCases.getPacienteById(id)
    
    if (result.success) {
      res.json(PacienteDTO.toResponse(result.data))
    } else {
      res.status(404).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /pacientes - Crear nuevo paciente
router.post('/', async (req, res) => {
  try {
    const pacienteData = req.body
    const result = await pacienteUseCases.createPaciente(pacienteData)
    
    if (result.success) {
      res.status(201).json(PacienteDTO.toResponse(result.data))
    } else {
      res.status(400).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /pacientes/:id - Actualizar paciente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const pacienteData = req.body
    const result = await pacienteUseCases.updatePaciente(id, pacienteData)
    
    if (result.success) {
      res.json(PacienteDTO.toResponse(result.data))
    } else {
      res.status(400).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /pacientes/:id - Eliminar paciente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pacienteUseCases.deletePaciente(id)
    
    if (result.success) {
      res.json({ success: true, message: result.message })
    } else {
      res.status(400).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
