class UserUseCases {
  constructor(userRepository, authService) {
    this.userRepository = userRepository
    this.authService = authService
  }

  async createUser(userData) {
    try {
      // Validar datos de entrada
      const { email, name, role, password } = userData
      
      if (!email || !name || !role) {
        throw new Error('Email, name and role are required')
      }

      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findByEmail(email)
      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      // Crear usuario
      const user = require('../domain/entities/User').create({
        email,
        name,
        role
      })

      // Hash de contraseña si se proporciona
      if (password) {
        user.passwordHash = await this.authService.hashPassword(password)
      }

      // Guardar en repositorio
      const savedUser = await this.userRepository.save(user)
      
      return {
        success: true,
        data: savedUser
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getUserById(id) {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        throw new Error('User not found')
      }
      
      return {
        success: true,
        data: user
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getAllUsers() {
    try {
      const users = await this.userRepository.findAll()
      
      return {
        success: true,
        data: users
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async updateUser(id, userData) {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        throw new Error('User not found')
      }

      // Actualizar datos
      user.updateProfile(userData)

      // Guardar cambios
      const updatedUser = await this.userRepository.save(user)
      
      return {
        success: true,
        data: updatedUser
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async deleteUser(id) {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        throw new Error('User not found')
      }

      await this.userRepository.delete(id)
      
      return {
        success: true,
        message: 'User deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async toggleUserStatus(id) {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        throw new Error('User not found')
      }

      if (user.isActive) {
        user.deactivate()
      } else {
        user.activate()
      }

      const updatedUser = await this.userRepository.save(user)
      
      return {
        success: true,
        data: updatedUser
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

module.exports = UserUseCases
