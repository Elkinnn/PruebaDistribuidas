#!/bin/bash
# Script para probar la migración
echo "🧪 Probando migración del Gateway..."

# Probar Gateway Híbrido
echo "1️⃣ Probando Gateway Híbrido..."
node gateway/src/index-hybrid.js &
HYBRID_PID=$!
sleep 3

# Test básico
curl -s http://localhost:3000/health | jq .
curl -s http://localhost:3000/medico/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' | jq .

# Matar proceso
kill $HYBRID_PID

echo "✅ Testing completado"
