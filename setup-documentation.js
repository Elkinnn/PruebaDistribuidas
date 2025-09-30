#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('📚 Setting up Documentation for the project...')

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

// Función para crear archivos de configuración
function createConfigFiles() {
  console.log('📋 Creating configuration files...')
  
  // JSDoc config
  const jsdocConfig = {
    "source": {
      "include": ["./src/"],
      "includePattern": "\\.(js|jsx)$",
      "excludePattern": "(node_modules/|dist/)"
    },
    "opts": {
      "destination": "./docs/jsdoc/",
      "recurse": true
    },
    "plugins": [
      "plugins/markdown"
    ],
    "templates": {
      "cleverLinks": false,
      "monospaceLinks": false
    }
  }
  
  fs.writeFileSync('jsdoc.json', JSON.stringify(jsdocConfig, null, 2))
  console.log('✅ Created jsdoc.json')
  
  // Storybook config
  const storybookConfig = `module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-viewport'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};`
  
  fs.writeFileSync('apps/frontend/.storybook/main.js', storybookConfig)
  console.log('✅ Created Storybook config')
}

// Función para instalar dependencias
function installDependencies() {
  console.log('📋 Installing documentation dependencies...')
  
  // Dependencias globales
  runCommand('npm install --save-dev jsdoc @mermaid-js/mermaid-cli')
  
  // Dependencias para Admin Service
  runCommand('npm install --save-dev swagger-jsdoc swagger-ui-express', 
    path.join(__dirname, 'apps', 'admin-service'))
  
  // Dependencias para Gateway
  runCommand('npm install --save-dev swagger-jsdoc swagger-ui-express', 
    path.join(__dirname, 'gateway'))
  
  // Dependencias para Frontend
  runCommand('npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-docs @storybook/addon-controls @storybook/addon-actions @storybook/addon-viewport', 
    path.join(__dirname, 'apps', 'frontend'))
}

// Función para crear scripts de documentación
function createDocumentationScripts() {
  console.log('📋 Creating documentation scripts...')
  
  // Scripts para el monorepo
  const packageJsonPath = path.join(__dirname, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  
  packageJson.scripts = {
    ...packageJson.scripts,
    "docs:generate": "jsdoc -c jsdoc.json",
    "docs:diagrams": "mmdc -i docs/diagrams/ -o docs/images/ -e png",
    "docs:serve": "http-server docs -p 8080",
    "docs:storybook": "cd apps/frontend && npm run storybook",
    "docs:swagger:admin": "cd apps/admin-service && npm run docs:swagger",
    "docs:swagger:gateway": "cd gateway && npm run docs:swagger"
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log('✅ Updated package.json with documentation scripts')
}

// Función para crear estructura de directorios
function createDirectoryStructure() {
  console.log('📋 Creating directory structure...')
  
  const directories = [
    'docs',
    'docs/diagrams',
    'docs/images',
    'docs/jsdoc',
    'apps/frontend/.storybook'
  ]
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ Created directory: ${dir}`)
    }
  })
}

async function main() {
  try {
    console.log('📋 Step 1: Creating directory structure...')
    createDirectoryStructure()
    
    console.log('📋 Step 2: Installing dependencies...')
    installDependencies()
    
    console.log('📋 Step 3: Creating configuration files...')
    createConfigFiles()
    
    console.log('📋 Step 4: Creating documentation scripts...')
    createDocumentationScripts()
    
    console.log('\n🎉 Documentation setup completed!')
    console.log('\n📝 Available commands:')
    console.log('  npm run docs:generate     - Generate JSDoc documentation')
    console.log('  npm run docs:diagrams     - Generate architecture diagrams')
    console.log('  npm run docs:serve       - Serve documentation locally')
    console.log('  npm run docs:storybook   - Start Storybook for components')
    console.log('  npm run docs:swagger:admin   - Start Admin Service with Swagger')
    console.log('  npm run docs:swagger:gateway - Start Gateway with Swagger')
    
    console.log('\n📚 Documentation URLs:')
    console.log('  JSDoc: http://localhost:8080')
    console.log('  Storybook: http://localhost:6006')
    console.log('  Admin Swagger: http://localhost:3001/api-docs')
    console.log('  Gateway Swagger: http://localhost:3000/api-docs')
    
  } catch (error) {
    console.error('❌ Documentation setup failed:', error.message)
    process.exit(1)
  }
}

main()
