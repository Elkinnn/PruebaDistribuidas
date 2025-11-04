#!/bin/bash
set -e

SSL_DIR="/etc/mysql/ssl"
CA_KEY="$SSL_DIR/ca-key.pem"
CA_CERT="$SSL_DIR/ca.pem"
SERVER_KEY="$SSL_DIR/server-key.pem"
SERVER_CERT="$SSL_DIR/server-cert.pem"
SERVER_REQ="$SSL_DIR/server-req.pem"

# Generar CA (Certificate Authority) privada
if [ ! -f "$CA_KEY" ]; then
    echo "Generando CA key..."
    openssl genrsa 2048 > "$CA_KEY"
    chmod 600 "$CA_KEY"
fi

# Generar certificado CA
if [ ! -f "$CA_CERT" ]; then
    echo "Generando CA certificate..."
    openssl req -new -x509 -nodes -days 3650 \
        -key "$CA_KEY" \
        -out "$CA_CERT" \
        -subj "/C=US/ST=State/L=City/O=Hospital/CN=MySQL-CA"
fi

# Generar clave privada del servidor
if [ ! -f "$SERVER_KEY" ]; then
    echo "Generating server key..."
    openssl genrsa 2048 > "$SERVER_KEY"
    chmod 600 "$SERVER_KEY"
fi

# Generar request del servidor
if [ ! -f "$SERVER_REQ" ]; then
    echo "Generating server certificate request..."
    openssl req -new \
        -key "$SERVER_KEY" \
        -out "$SERVER_REQ" \
        -subj "/C=US/ST=State/L=City/O=Hospital/CN=mysql-service"
fi

# Generar certificado del servidor (firmado por CA)
if [ ! -f "$SERVER_CERT" ]; then
    echo "Generating server certificate..."
    openssl x509 -req \
        -in "$SERVER_REQ" \
        -days 3650 \
        -CA "$CA_CERT" \
        -CAkey "$CA_KEY" \
        -set_serial 01 \
        -out "$SERVER_CERT"
fi

# Asegurar permisos correctos
chown -R mysql:mysql "$SSL_DIR"
chmod 600 "$CA_KEY" "$SERVER_KEY"
chmod 644 "$CA_CERT" "$SERVER_CERT"

echo "✅ Certificados TLS generados correctamente"


