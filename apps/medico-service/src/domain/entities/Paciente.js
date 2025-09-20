class Paciente {
  constructor({
    id,
    nombre,
    apellido,
    email,
    telefono,
    fechaNacimiento,
    genero,
    direccion,
    historialMedico = [],
    isActive = true,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id
    this.nombre = nombre
    this.apellido = apellido
    this.email = email
    this.telefono = telefono
    this.fechaNacimiento = fechaNacimiento
    this.genero = genero
    this.direccion = direccion
    this.historialMedico = historialMedico
    this.isActive = isActive
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  // Métodos de dominio
  getNombreCompleto() {
    return `${this.nombre} ${this.apellido}`
  }

  getEdad() {
    const hoy = new Date()
    const nacimiento = new Date(this.fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    
    return edad
  }

  agregarAlHistorial(consulta) {
    this.historialMedico.push({
      ...consulta,
      fecha: new Date()
    })
    this.updatedAt = new Date()
  }

  actualizarDatos({ nombre, apellido, email, telefono, direccion }) {
    if (nombre) this.nombre = nombre
    if (apellido) this.apellido = apellido
    if (email) this.email = email
    if (telefono) this.telefono = telefono
    if (direccion) this.direccion = direccion
    this.updatedAt = new Date()
  }

  // Validaciones de dominio
  isValid() {
    return this.nombre && this.apellido && this.email && this.fechaNacimiento
  }

  esMayorDeEdad() {
    return this.getEdad() >= 18
  }

  // Factory method
  static create({ nombre, apellido, email, telefono, fechaNacimiento, genero, direccion }) {
    const id = require('uuid').v4()
    return new Paciente({ 
      id, 
      nombre, 
      apellido, 
      email, 
      telefono, 
      fechaNacimiento, 
      genero, 
      direccion 
    })
  }
}

module.exports = Paciente
