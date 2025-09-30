#!/bin/bash

# Script para iniciar el sistema médico independiente

echo "🚀 Iniciando sistema médico independiente..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Crear archivos .env si no existen
echo "📝 Configurando variables de entorno..."

if [ ! -f "gateway/.env" ]; then
    cp gateway/env.example gateway/.env
    echo "✅ Creado gateway/.env"
fi

if [ ! -f "apps/medico-service/.env" ]; then
    cp apps/medico-service/env.example apps/medico-service/.env
    echo "✅ Creado apps/medico-service/.env"
fi

if [ ! -f "apps/frontend/.env" ]; then
    echo "VITE_API_URL=http://localhost:3000/api/medico" > apps/frontend/.env
    echo "✅ Creado apps/frontend/.env"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."

echo "Instalando dependencias del gateway..."
cd gateway && npm install && cd ..

echo "Instalando dependencias del servicio médico..."
cd apps/medico-service && npm install && cd ../..

echo "Instalando dependencias del frontend..."
cd apps/frontend && npm install && cd ../..

echo ""
echo "✅ Configuración completada!"
echo ""
echo "🔧 Para ejecutar el sistema:"
echo ""
echo "Terminal 1 - Gateway:"
echo "  cd gateway && npm run dev"
echo ""
echo "Terminal 2 - Servicio Médico:"
echo "  cd apps/medico-service && npm run dev"
echo ""
echo "Terminal 3 - Frontend:"
echo "  cd apps/frontend && npm run dev"
echo ""
echo "🌐 Acceder a: http://localhost:5173/medico/login"
echo ""
echo "👤 Credenciales de prueba:"
echo "  Email: dr.garcia@clinix.com"
echo "  Password: medico123"
echo ""
