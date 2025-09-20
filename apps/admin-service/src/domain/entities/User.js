class User {
  constructor({
    id,
    email,
    name,
    role,
    isActive = true,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id
    this.email = email
    this.name = name
    this.role = role
    this.isActive = isActive
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  // Métodos de dominio
  activate() {
    this.isActive = true
    this.updatedAt = new Date()
  }

  deactivate() {
    this.isActive = false
    this.updatedAt = new Date()
  }

  updateProfile({ name, email }) {
    if (name) this.name = name
    if (email) this.email = email
    this.updatedAt = new Date()
  }

  // Validaciones de dominio
  isValid() {
    return this.email && this.name && this.role
  }

  canAccessAdmin() {
    return this.role === 'admin' && this.isActive
  }

  // Factory method
  static create({ email, name, role }) {
    const id = require('uuid').v4()
    return new User({ id, email, name, role })
  }
}

module.exports = User
