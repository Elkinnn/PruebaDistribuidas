const express = require('express')
const router = express.Router()
const UserUseCases = require('../../application/useCases/UserUseCases')
const UserDTO = require('../../domain/dtos/UserDTO')

// Inyección de dependencias (en un proyecto real usarías un contenedor DI)
const userRepository = require('../../infrastructure/persistence/UserRepository')
const authService = require('../../infrastructure/auth/AuthService')
const userUseCases = new UserUseCases(userRepository, authService)

// GET /users - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await userUseCases.getAllUsers()
    
    if (result.success) {
      res.json(UserDTO.toListResponse(result.data))
    } else {
      res.status(400).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /users/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await userUseCases.getUserById(id)
    
    if (result.success) {
      res.json(UserDTO.toResponse(result.data))
    } else {
      res.status(404).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /users - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const userData = req.body
    const result = await userUseCases.createUser(userData)
    
    if (result.success) {
      res.status(201).json(UserDTO.toResponse(result.data))
    } else {
      res.status(400).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /users/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userData = req.body
    const result = await userUseCases.updateUser(id, userData)
    
    if (result.success) {
      res.json(UserDTO.toResponse(result.data))
    } else {
      res.status(400).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /users/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await userUseCases.deleteUser(id)
    
    if (result.success) {
      res.json({ success: true, message: result.message })
    } else {
      res.status(400).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /users/:id/toggle - Activar/desactivar usuario
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params
    const result = await userUseCases.toggleUserStatus(id)
    
    if (result.success) {
      res.json(UserDTO.toResponse(result.data))
    } else {
      res.status(400).json({ error: result.error })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
