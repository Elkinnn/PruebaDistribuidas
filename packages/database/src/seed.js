const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Crear usuarios de ejemplo
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrador',
      role: 'ADMIN',
      isActive: true
    }
  })

  const medicoUser = await prisma.user.upsert({
    where: { email: 'medico@example.com' },
    update: {},
    create: {
      email: 'medico@example.com',
      name: 'Dr. Juan Pérez',
      role: 'MEDICO',
      isActive: true
    }
  })

  // Crear pacientes de ejemplo
  const paciente1 = await prisma.paciente.upsert({
    where: { email: 'juan.perez@email.com' },
    update: {},
    create: {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@email.com',
      telefono: '555-0101',
      fechaNacimiento: new Date('1985-03-15'),
      genero: 'M',
      direccion: 'Calle Principal 123'
    }
  })

  const paciente2 = await prisma.paciente.upsert({
    where: { email: 'maria.garcia@email.com' },
    update: {},
    create: {
      nombre: 'María',
      apellido: 'García',
      email: 'maria.garcia@email.com',
      telefono: '555-0102',
      fechaNacimiento: new Date('1990-07-22'),
      genero: 'F',
      direccion: 'Avenida Central 456'
    }
  })

  // Crear consultas de ejemplo
  await prisma.consulta.upsert({
    where: { id: 'consulta-1' },
    update: {},
    create: {
      id: 'consulta-1',
      pacienteId: paciente1.id,
      medicoId: medicoUser.id,
      fecha: new Date(),
      motivo: 'Control cardiológico',
      sintomas: 'Dolor en el pecho',
      diagnostico: 'Angina de pecho',
      tratamiento: 'Reposo y medicación',
      observaciones: 'Paciente estable'
    }
  })

  // Crear citas de ejemplo
  await prisma.cita.upsert({
    where: { id: 'cita-1' },
    update: {},
    create: {
      id: 'cita-1',
      pacienteId: paciente1.id,
      medicoId: medicoUser.id,
      fecha: new Date(),
      hora: '09:00',
      motivo: 'Control cardiológico',
      estado: 'PROGRAMADA',
      observaciones: 'Primera consulta'
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user:', adminUser.email)
  console.log('👨‍⚕️ Medico user:', medicoUser.email)
  console.log('👥 Pacientes created:', 2)
  console.log('📋 Consultas created:', 1)
  console.log('📅 Citas created:', 1)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
