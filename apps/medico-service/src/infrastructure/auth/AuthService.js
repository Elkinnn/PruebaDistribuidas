const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

class AuthService {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'medico-secret-key'
    this.tokenExpiry = process.env.JWT_EXPIRY || '24h'
  }

  // Generar hash de contraseña
  async hashPassword(password) {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  // Verificar contraseña
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
  }

  // Generar token JWT
  generateToken(payload) {
    return jwt.sign(payload, this.secretKey, { 
      expiresIn: this.tokenExpiry,
      issuer: 'medico-service'
    })
  }

  // Verificar token JWT
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secretKey)
    } catch (error) {
      throw new Error('Token inválido o expirado')
    }
  }

  // Middleware de autenticación
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' })
    }

    try {
      const decoded = this.verifyToken(token)
      req.user = decoded
      next()
    } catch (error) {
      return res.status(403).json({ error: error.message })
    }
  }

  // Middleware para verificar rol médico
  requireMedicoRole(req, res, next) {
    if (req.user && req.user.rol === 'MEDICO') {
      next()
    } else {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol MÉDICO' })
    }
  }
}

module.exports = AuthService
