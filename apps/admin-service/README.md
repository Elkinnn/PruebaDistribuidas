# Admin Service - Hospital Management

Servicio de administración para el sistema de gestión hospitalaria con arquitectura hexagonal.

## 🏗️ Arquitectura

```
src/
├── domain/                 # Lógica de dominio
│   ├── entities/          # Entidades (Hospital, Medico, Usuario, Cita)
│   └── dtos/             # Data Transfer Objects
├── application/           # Casos de uso
│   └── useCases/         # Lógica de aplicación
├── infrastructure/        # Implementaciones técnicas
│   ├── persistence/      # Repositorios (MySQL + Prisma)
│   ├── auth/            # Autenticación
│   └── config/          # Configuración
└── presentation/         # Controladores y rutas
    └── routes/          # Endpoints REST
```

## 🗄️ Base de Datos

### Esquema MySQL
- **Hospital**: Gestión de hospitales
- **Medico**: Médicos por hospital
- **Usuario**: Usuarios del sistema (ADMIN_GLOBAL, MEDICO)
- **Cita**: Citas médicas
- **Empleado**: Empleados del hospital
- **Especialidad**: Especialidades médicas

### Conexión
```javascript
DATABASE_URL="mysql://root:@localhost:3306/hospitalservice"
```

## 🚀 Instalación

### 1. Configurar Base de Datos
```sql
-- Crear base de datos
CREATE DATABASE hospitalservice;

-- Ejecutar tu script SQL para crear las tablas
-- (usar el script que proporcionaste)
```

### 2. Instalar Dependencias
```bash
# Desde la raíz del proyecto
npm run install:all

# O específicamente para admin-service
cd apps/admin-service
npm install
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env con tus credenciales de MySQL
```

### 4. Generar Cliente Prisma
```bash
cd packages/database
npx prisma generate
```

## 🧪 Pruebas

### Probar Conexión
```bash
# Desde la raíz del proyecto
node apps/admin-service/test-connection.js
```

### Iniciar Servicio
```bash
cd apps/admin-service
npm run dev
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 📡 Endpoints

### Hospitales
- `GET /hospitales` - Listar hospitales
- `GET /hospitales/:id` - Obtener hospital por ID
- `POST /hospitales` - Crear hospital
- `PUT /hospitales/:id` - Actualizar hospital
- `DELETE /hospitales/:id` - Eliminar hospital (soft delete)
- `GET /hospitales/:id/stats` - Estadísticas del hospital

### Médicos
- `GET /medicos` - Listar médicos
- `GET /medicos/:id` - Obtener médico por ID
- `POST /medicos` - Crear médico
- `PUT /medicos/:id` - Actualizar médico
- `DELETE /medicos/:id` - Eliminar médico (soft delete)

### Empleados
- `GET /empleados` - Listar empleados
- `GET /empleados/:id` - Obtener empleado por ID
- `POST /empleados` - Crear empleado
- `PUT /empleados/:id` - Actualizar empleado
- `DELETE /empleados/:id` - Eliminar empleado
- `GET /empleados/stats/:hospitalId` - Estadísticas de empleados por hospital

### Usuarios
- `GET /usuarios` - Listar usuarios
- `GET /usuarios/:id` - Obtener usuario por ID
- `POST /usuarios` - Crear usuario
- `PUT /usuarios/:id` - Actualizar usuario
- `DELETE /usuarios/:id` - Eliminar usuario (soft delete)

### Citas
- `GET /citas` - Listar citas
- `GET /citas/:id` - Obtener cita por ID
- `POST /citas` - Crear cita
- `PUT /citas/:id` - Actualizar cita
- `DELETE /citas/:id` - Eliminar cita

## 🔧 Configuración

### Variables de Entorno
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="mysql://root:@localhost:3306/hospitalservice"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### Estructura de Respuesta
```json
{
  "success": true,
  "data": { ... },
  "error": "Error message",
  "message": "Success message"
}
```

## 🏥 Entidades del Dominio

### Hospital
```javascript
{
  id: "uuid",
  nombre: "string",
  direccion: "string",
  telefono: "string",
  activo: boolean
}
```

### Medico
```javascript
{
  id: "uuid",
  hospitalId: "uuid",
  nombres: "string",
  apellidos: "string",
  email: "string",
  activo: boolean
}
```

### Empleado
```javascript
{
  id: "uuid",
  hospitalId: "uuid",
  nombres: "string",
  apellidos: "string",
  tipo: "LIMPIEZA" | "SEGURIDAD" | "RECEPCION" | "ADMINISTRATIVO" | "OTRO",
  email: "string",
  telefono: "string",
  activo: boolean
}
```

### Usuario
```javascript
{
  id: "uuid",
  email: "string",
  password: "string",
  rol: "ADMIN_GLOBAL" | "MEDICO",
  medicoId: "uuid",
  activo: boolean
}
```

## 🚨 Troubleshooting

### Error de Conexión a MySQL
1. Verificar que MySQL esté ejecutándose
2. Verificar credenciales en `.env`
3. Verificar que la base de datos existe
4. Verificar que las tablas están creadas

### Error de Prisma
1. Ejecutar `npx prisma generate`
2. Verificar el schema en `packages/database/prisma/schema.prisma`
3. Verificar la URL de conexión

### Error de Dependencias
1. Ejecutar `npm install` en cada directorio
2. Verificar que Node.js >= 16 está instalado
3. Limpiar `node_modules` y reinstalar
