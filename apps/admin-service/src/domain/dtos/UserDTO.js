class UserDTO {
  constructor(user) {
    this.id = user.id
    this.email = user.email
    this.name = user.name
    this.role = user.role
    this.isActive = user.isActive
    this.createdAt = user.createdAt
    this.updatedAt = user.updatedAt
  }

  // Método para crear DTO sin datos sensibles
  static toPublic(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  // Método para crear DTO de respuesta
  static toResponse(user) {
    return {
      success: true,
      data: UserDTO.toPublic(user)
    }
  }

  // Método para crear DTO de lista
  static toListResponse(users) {
    return {
      success: true,
      data: users.map(user => UserDTO.toPublic(user)),
      total: users.length
    }
  }
}

module.exports = UserDTO
