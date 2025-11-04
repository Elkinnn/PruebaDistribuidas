#!/bin/bash
set -e

echo "🔐 MySQL Container con TLS - Iniciando..."

# Generar certificados si no existen
if [ ! -f /etc/mysql/ssl/ca.pem ]; then
    echo "📜 Generando certificados TLS auto-firmados..."
    /usr/local/bin/generate-certs.sh
else
    echo "✅ Certificados TLS ya existen"
fi

# Asegurar que los directorios existen
mkdir -p /var/lib/mysql /var/log/mysql
chown -R mysql:mysql /var/lib/mysql /var/log/mysql /etc/mysql/ssl

# Si es la primera ejecución, inicializar base de datos
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "🔧 Inicializando base de datos MySQL..."
    mysqld --initialize-insecure --datadir=/var/lib/mysql
fi

# Ejecutar el entrypoint original de MySQL
echo "🚀 Iniciando MySQL con TLS requerido..."
exec /usr/local/bin/docker-entrypoint.sh "$@"


