const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h'
  }

  async hashPassword(password) {
    try {
      const saltRounds = 12
      return await bcrypt.hash(password, saltRounds)
    } catch (error) {
      throw new Error(`Failed to hash password: ${error.message}`)
    }
  }

  async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
      throw new Error(`Failed to compare password: ${error.message}`)
    }
  }

  generateToken(payload) {
    try {
      return jwt.sign(payload, this.jwtSecret, { 
        expiresIn: this.jwtExpiresIn 
      })
    } catch (error) {
      throw new Error(`Failed to generate token: ${error.message}`)
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret)
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`)
    }
  }

  async authenticate(email, password) {
    try {
      // En un proyecto real, buscarías el usuario en la base de datos
      // Por ahora, simulamos la autenticación
      if (email === 'admin@example.com' && password === 'admin123') {
        return {
          id: '1',
          email: 'admin@example.com',
          name: 'Administrador',
          role: 'admin'
        }
      }
      
      throw new Error('Invalid credentials')
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`)
    }
  }

  async login(email, password) {
    try {
      const user = await this.authenticate(email, password)
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      })

      return {
        user,
        token,
        expiresIn: this.jwtExpiresIn
      }
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`)
    }
  }

  middleware() {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'No token provided' })
        }

        const token = authHeader.substring(7)
        const decoded = this.verifyToken(token)
        
        req.user = decoded
        next()
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' })
      }
    }
  }
}

module.exports = new AuthService()
