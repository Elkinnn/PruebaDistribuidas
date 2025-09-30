# Prueba - Aplicación Distribuida

Este es un monorepo que contiene una aplicación distribuida con arquitectura hexagonal.

## Estructura del Proyecto

```
proyecto/
├─ gateway/                        # API Gateway
├─ apps/
│  ├─ frontend/                    # Aplicación React
│  │  └─ src/
│  │     ├─ api/                   # Servicios API
│  │     ├─ auth/                  # Autenticación
│  │     ├─ pages/                 # Páginas
│  │     │  ├─ admin/              # Páginas de administrador
│  │     │  └─ medico/             # Páginas de médico
│  │     └─ components/            # Componentes reutilizables
│  │
│  ├─ admin-service/               # Servicio de administración
│  │  └─ src/
│  │     ├─ presentation/          # Controladores y rutas
│  │     ├─ application/           # Casos de uso
│  │     ├─ domain/                # Lógica de dominio
│  │     │  ├─ dtos/               # Data Transfer Objects
│  │     │  └─ entities/           # Entidades de dominio
│  │     └─ infrastructure/        # Implementaciones técnicas
│  │        ├─ persistence/        # Repositorios y base de datos
│  │        ├─ auth/               # Autenticación
│  │        └─ config/             # Configuración
│  │
│  └─ medico-service/              # Servicio de médicos
│     └─ src/
│        ├─ presentation/
│        ├─ application/
│        ├─ domain/
│        │  ├─ dtos/
│        │  └─ entities/
│        └─ infrastructure/
│           ├─ persistence/
│           ├─ auth/
│           └─ config/
│
├─ packages/
│  ├─ database/                    # Configuración de base de datos
│  │  ├─ prisma/                   # Schema y migraciones
│  │  └─ src/
│  │
│  └─ shared/                      # Código compartido
│     └─ src/
│
├─ scripts/
│  └─ sql/                         # Scripts SQL
```

## Tecnologías

- **Frontend**: React
- **Backend**: Node.js
- **Base de datos**: Prisma
- **Arquitectura**: Hexagonal (Clean Architecture)

## Comandos

```bash
# Instalar todas las dependencias
npm run install:all

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## Servicios

- **Gateway**: Punto de entrada único para todas las peticiones
- **Frontend**: Interfaz de usuario en React
- **Admin Service**: Gestión de administradores
- **Medico Service**: Gestión de médicos

## Servicios
