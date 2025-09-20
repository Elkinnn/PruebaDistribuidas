// Implementación en memoria para desarrollo
// En producción, esto se conectaría a una base de datos real

class UserRepository {
  constructor() {
    this.users = new Map()
    this.initializeSampleData()
  }

  initializeSampleData() {
    // Datos de ejemplo para desarrollo
    const sampleUsers = [
      {
        id: '1',
        email: 'admin@example.com',
        name: 'Administrador',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: '2',
        email: 'medico1@example.com',
        name: 'Dr. Juan Pérez',
        role: 'medico',
        isActive: true,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15')
      },
      {
        id: '3',
        email: 'medico2@example.com',
        name: 'Dra. María García',
        role: 'medico',
        isActive: true,
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-02-01')
      }
    ]

    sampleUsers.forEach(user => {
      this.users.set(user.id, user)
    })
  }

  async save(user) {
    try {
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }

      this.users.set(user.id, userData)
      return userData
    } catch (error) {
      throw new Error(`Failed to save user: ${error.message}`)
    }
  }

  async findById(id) {
    try {
      const user = this.users.get(id)
      return user || null
    } catch (error) {
      throw new Error(`Failed to find user by id: ${error.message}`)
    }
  }

  async findByEmail(email) {
    try {
      for (const user of this.users.values()) {
        if (user.email === email) {
          return user
        }
      }
      return null
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`)
    }
  }

  async findAll() {
    try {
      return Array.from(this.users.values())
    } catch (error) {
      throw new Error(`Failed to find all users: ${error.message}`)
    }
  }

  async delete(id) {
    try {
      const deleted = this.users.delete(id)
      if (!deleted) {
        throw new Error('User not found')
      }
      return true
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  async count() {
    try {
      return this.users.size
    } catch (error) {
      throw new Error(`Failed to count users: ${error.message}`)
    }
  }

  async findByRole(role) {
    try {
      const users = Array.from(this.users.values())
      return users.filter(user => user.role === role)
    } catch (error) {
      throw new Error(`Failed to find users by role: ${error.message}`)
    }
  }
}

module.exports = new UserRepository()
