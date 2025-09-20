const { v4: uuidv4 } = require('uuid')

const utils = {
  // Generar UUID
  generateId() {
    return uuidv4()
  },

  // Formatear fecha
  formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return null
    
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      default:
        return d.toISOString()
    }
  },

  // Calcular edad
  calculateAge(birthDate) {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  },

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Sanitizar string
  sanitizeString(str) {
    if (typeof str !== 'string') return str
    return str.trim().replace(/\s+/g, ' ')
  },

  // Generar respuesta estándar
  createResponse(success, data = null, error = null, message = null) {
    const response = { success }
    
    if (data !== null) response.data = data
    if (error !== null) response.error = error
    if (message !== null) response.message = message
    
    return response
  },

  // Paginación
  paginate(array, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return {
      data: array.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: array.length,
        totalPages: Math.ceil(array.length / limit),
        hasNext: endIndex < array.length,
        hasPrev: page > 1
      }
    }
  },

  // Delay para testing
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = utils
