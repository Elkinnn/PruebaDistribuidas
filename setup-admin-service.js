#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up Admin Service for MySQL...')

// Función para ejecutar comandos
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📦 Running: ${command}`)
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    })
    console.log('✅ Command completed successfully')
  } catch (error) {
    console.error(`❌ Command failed: ${command}`)
    console.error(error.message)
    process.exit(1)
  }
}

// Función para crear archivo .env
function createEnvFile() {
  const envContent = `# Configuración del Admin Service
NODE_ENV=development
PORT=3001

# Configuración de base de datos MySQL
DATABASE_URL="mysql://root:@localhost:3306/hospitalservice"

# Configuración JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
`

  const envPath = path.join(__dirname, 'apps', 'admin-service', '.env')
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Created .env file for admin-service')
  } else {
    console.log('ℹ️  .env file already exists')
  }
}

async function main() {
  try {
    console.log('📋 Step 1: Installing dependencies...')
    
    // Instalar dependencias del monorepo
    runCommand('npm install')
    
    // Instalar dependencias del package database
    runCommand('npm install', path.join(__dirname, 'packages', 'database'))
    
    // Instalar dependencias del admin-service
    runCommand('npm install', path.join(__dirname, 'apps', 'admin-service'))
    
    console.log('📋 Step 2: Creating environment files...')
    createEnvFile()
    
    console.log('📋 Step 3: Generating Prisma client...')
    runCommand('npx prisma generate', path.join(__dirname, 'packages', 'database'))
    
    console.log('📋 Step 4: Testing database connection...')
    console.log('⚠️  Make sure MySQL is running and the database "hospitalservice" exists')
    console.log('⚠️  Make sure the tables are created with your SQL script')
    
    console.log('\n🎉 Setup completed!')
    console.log('\n📝 Next steps:')
    console.log('1. Make sure MySQL is running on localhost:3306')
    console.log('2. Create database "hospitalservice" if not exists')
    console.log('3. Run your SQL script to create tables')
    console.log('4. Test connection: node apps/admin-service/test-connection.js')
    console.log('5. Start admin service: cd apps/admin-service && npm run dev')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

main()
