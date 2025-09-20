# Makefile para el proyecto Prueba

.PHONY: help install dev build clean test lint

# Variables
NODE_VERSION := 18
DOCKER_COMPOSE := docker-compose

# Ayuda
help:
	@echo "Comandos disponibles:"
	@echo "  install     - Instalar todas las dependencias"
	@echo "  dev         - Ejecutar en modo desarrollo"
	@echo "  build       - Construir para producción"
	@echo "  test        - Ejecutar tests"
	@echo "  lint        - Ejecutar linter"
	@echo "  clean       - Limpiar archivos temporales"
	@echo "  docker-up   - Levantar servicios con Docker"
	@echo "  docker-down - Detener servicios de Docker"
	@echo "  db-setup    - Configurar base de datos"
	@echo "  db-seed     - Poblar base de datos con datos de ejemplo"

# Instalar dependencias
install:
	@echo "📦 Instalando dependencias..."
	npm install
	npm run install:all

# Modo desarrollo
dev:
	@echo "🚀 Iniciando en modo desarrollo..."
	npm run dev

# Construir para producción
build:
	@echo "🔨 Construyendo para producción..."
	npm run build

# Tests
test:
	@echo "🧪 Ejecutando tests..."
	npm run test --workspace=apps/admin-service
	npm run test --workspace=apps/medico-service

# Linter
lint:
	@echo "🔍 Ejecutando linter..."
	npm run lint --workspace=apps/frontend

# Limpiar
clean:
	@echo "🧹 Limpiando archivos temporales..."
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf gateway/node_modules
	rm -rf apps/*/dist
	rm -rf apps/*/build

# Docker
docker-up:
	@echo "🐳 Levantando servicios con Docker..."
	$(DOCKER_COMPOSE) up -d

docker-down:
	@echo "🐳 Deteniendo servicios de Docker..."
	$(DOCKER_COMPOSE) down

# Base de datos
db-setup:
	@echo "🗄️ Configurando base de datos..."
	cd packages/database && npm run migrate

db-seed:
	@echo "🌱 Poblando base de datos..."
	cd packages/database && npm run seed

# Setup completo
setup: install db-setup db-seed
	@echo "✅ Setup completo!"

# Desarrollo con Docker
dev-docker: docker-up
	@echo "🚀 Servicios iniciados. Accede a:"
	@echo "  Frontend: http://localhost:3003"
	@echo "  Gateway: http://localhost:3000"
	@echo "  Admin Service: http://localhost:3001"
	@echo "  Medico Service: http://localhost:3002"
