#!/bin/bash
# Script para ejecutar los scripts SQL en MySQL desde Container App
# Este script se ejecuta dentro de un contenedor MySQL client con acceso a la VNet

set -e

# Variables de conexión (ajusta según tu configuración)
MYSQL_HOST="${MYSQL_HOST:-mysql-service.internal.lemonsand-4de94d70.eastus2.azurecontainerapps.io}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-hospital_user}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-HospitalP@ss2024!}"
MYSQL_DATABASE="${MYSQL_DATABASE:-hospital_service}"

echo "============================================"
echo "Ejecutando Scripts SQL en MySQL"
echo "============================================"
echo ""
echo "Host: $MYSQL_HOST"
echo "Puerto: $MYSQL_PORT"
echo "Usuario: $MYSQL_USER"
echo "Database: $MYSQL_DATABASE"
echo ""

# Verificar que mysql client está instalado
if ! command -v mysql &> /dev/null; then
    echo "ERROR: mysql client no está instalado"
    echo "Instalando mysql client..."
    apt-get update && apt-get install -y default-mysql-client
fi

# Función para ejecutar un script SQL
execute_sql_script() {
    local script_file=$1
    local script_name=$2
    
    if [ ! -f "$script_file" ]; then
        echo "ERROR: Script no encontrado: $script_file"
        return 1
    fi
    
    echo "--------------------------------------------"
    echo "Ejecutando: $script_name"
    echo "--------------------------------------------"
    
    mysql -h "$MYSQL_HOST" \
          -P "$MYSQL_PORT" \
          -u "$MYSQL_USER" \
          -p"$MYSQL_PASSWORD" \
          "$MYSQL_DATABASE" \
          --ssl-mode=REQUIRED \
          --connect-timeout=30 \
          < "$script_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ $script_name ejecutado exitosamente"
    else
        echo "❌ Error al ejecutar $script_name"
        return 1
    fi
    echo ""
}

# Verificar conectividad
echo "Verificando conectividad a MySQL..."
mysql -h "$MYSQL_HOST" \
      -P "$MYSQL_PORT" \
      -u "$MYSQL_USER" \
      -p"$MYSQL_PASSWORD" \
      --ssl-mode=REQUIRED \
      --connect-timeout=10 \
      -e "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Conectividad verificada"
else
    echo "❌ Error de conectividad. Verifica las credenciales y la red."
    exit 1
fi
echo ""

# Verificar que la base de datos existe
echo "Verificando que la base de datos existe..."
mysql -h "$MYSQL_HOST" \
      -P "$MYSQL_PORT" \
      -u "$MYSQL_USER" \
      -p"$MYSQL_PASSWORD" \
      --ssl-mode=REQUIRED \
      -e "USE $MYSQL_DATABASE;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Base de datos $MYSQL_DATABASE existe"
else
    echo "⚠️  Base de datos $MYSQL_DATABASE no existe. Creándola..."
    mysql -h "$MYSQL_HOST" \
          -P "$MYSQL_PORT" \
          -u "$MYSQL_USER" \
          -p"$MYSQL_PASSWORD" \
          --ssl-mode=REQUIRED \
          -e "CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE;"
    echo "✅ Base de datos creada"
fi
echo ""

# Ejecutar scripts SQL
SCRIPTS_DIR="/scripts"

if [ -d "$SCRIPTS_DIR" ]; then
    cd "$SCRIPTS_DIR"
    
    # Ejecutar init-mysql-schema.sql
    if [ -f "init-mysql-schema.sql" ]; then
        execute_sql_script "init-mysql-schema.sql" "init-mysql-schema.sql"
    else
        echo "⚠️  init-mysql-schema.sql no encontrado en $SCRIPTS_DIR"
    fi
    
    # Ejecutar seed-mysql-data.sql (opcional)
    if [ -f "seed-mysql-data.sql" ]; then
        read -p "¿Deseas ejecutar seed-mysql-data.sql (datos de ejemplo)? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            execute_sql_script "seed-mysql-data.sql" "seed-mysql-data.sql"
        else
            echo "⏭️  Saltando seed-mysql-data.sql"
        fi
    else
        echo "⚠️  seed-mysql-data.sql no encontrado en $SCRIPTS_DIR"
    fi
else
    echo "⚠️  Directorio de scripts no encontrado: $SCRIPTS_DIR"
    echo "Usando scripts en el directorio actual..."
    
    # Intentar ejecutar desde el directorio actual
    if [ -f "init-mysql-schema.sql" ]; then
        execute_sql_script "init-mysql-schema.sql" "init-mysql-schema.sql"
    fi
    
    if [ -f "seed-mysql-data.sql" ]; then
        read -p "¿Deseas ejecutar seed-mysql-data.sql (datos de ejemplo)? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            execute_sql_script "seed-mysql-data.sql" "seed-mysql-data.sql"
        fi
    fi
fi

# Verificar que las tablas se crearon
echo "--------------------------------------------"
echo "Verificando tablas creadas"
echo "--------------------------------------------"
mysql -h "$MYSQL_HOST" \
      -P "$MYSQL_PORT" \
      -u "$MYSQL_USER" \
      -p"$MYSQL_PASSWORD" \
      "$MYSQL_DATABASE" \
      --ssl-mode=REQUIRED \
      -e "SHOW TABLES;"

echo ""
echo "============================================"
echo "✅ Scripts SQL ejecutados exitosamente"
echo "============================================"

