#!/bin/bash
# Script de rollback para volver al Gateway original
echo "🔄 Ejecutando rollback al Gateway original..."

# Restaurar el Gateway original
cp gateway/src/index-backup.js gateway/src/index.js

echo "✅ Rollback completado"
echo "📡 Gateway original restaurado"
echo "🔄 Reinicia el Gateway para aplicar cambios"
