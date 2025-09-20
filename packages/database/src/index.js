const { PrismaClient } = require('@prisma/client')

class DatabaseService {
  constructor() {
    this.prisma = new PrismaClient()
  }

  async connect() {
    try {
      await this.prisma.$connect()
      console.log('✅ Database connected successfully')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      throw error
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect()
      console.log('✅ Database disconnected successfully')
    } catch (error) {
      console.error('❌ Database disconnection failed:', error)
      throw error
    }
  }

  // Métodos de utilidad
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', timestamp: new Date().toISOString() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() }
    }
  }

  // Getters para acceso a modelos
  get users() {
    return this.prisma.user
  }

  get pacientes() {
    return this.prisma.paciente
  }

  get consultas() {
    return this.prisma.consulta
  }

  get citas() {
    return this.prisma.cita
  }
}

// Singleton instance
const databaseService = new DatabaseService()

module.exports = databaseService
