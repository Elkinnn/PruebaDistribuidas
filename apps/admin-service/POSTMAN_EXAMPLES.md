# Ejemplos de Postman para Admin Service

## 🔐 Autenticación

### 1. Login Admin
**POST** `http://localhost:3001/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-del-admin",
    "email": "admin@test.com",
    "rol": "ADMIN_GLOBAL"
  },
  "message": "Login exitoso como administrador"
}
```

### 2. Validar Token
**POST** `http://localhost:3001/auth/validate-token`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🏥 Endpoints de Admin (requieren token de admin)

### 4. Listar Hospitales
**GET** `http://localhost:3001/hospitales`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 5. Crear Hospital
**POST** `http://localhost:3001/hospitales`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nombre": "Hospital San Juan",
  "direccion": "Calle Principal 123",
  "telefono": "555-0123"
}
```

### 6. Listar Médicos
**GET** `http://localhost:3001/medicos`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 7. Crear Médico
**POST** `http://localhost:3001/medicos`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "hospitalId": "uuid-del-hospital",
  "nombres": "Dr. María",
  "apellidos": "García",
  "email": "maria.garcia@hospital.com"
}
```

## 👨‍⚕️ Endpoints de Médico (requieren token de médico)

### 8. Mis Citas
**GET** `http://localhost:3001/mis-citas`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 9. Crear Cita (como médico)
**POST** `http://localhost:3001/mis-citas`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "pacienteNombre": "Juan Pérez",
  "motivo": "Consulta general",
  "fechaInicio": "2024-01-15T09:00:00Z",
  "fechaFin": "2024-01-15T10:00:00Z"
}
```

## 🚨 Casos de Error

### Error de Validación
**POST** `http://localhost:3001/auth/login`
```json
{
  "email": "admin@test.com"
  // Falta "password"
}
```

**Respuesta:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "email y password son requeridos"
}
```

### Error de Credenciales
**POST** `http://localhost:3001/auth/login`
```json
{
  "email": "admin@test.com",
  "password": "password-incorrecta"
}
```

**Respuesta:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Credenciales inválidas"
}
```

### Error de Acceso No Autorizado
**POST** `http://localhost:3001/auth/login`
```json
{
  "email": "usuario@test.com",
  "password": "password123"  // Usuario que no es administrador
}
```

**Respuesta:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Acceso denegado. Solo administradores pueden acceder"
}
```

### Error de Token Inválido
**GET** `http://localhost:3001/hospitales`

**Headers:**
```
Authorization: Bearer token-invalido
```

**Respuesta:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Token inválido"
}
```


## 📋 Colección de Postman

Puedes importar esta colección en Postman:

```json
{
  "info": {
    "name": "Admin Service API",
    "description": "API para gestión hospitalaria"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login Admin",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@test.com\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "http://localhost:3001/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3001",
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

## 🚀 Pasos para Probar

1. **Iniciar el servidor:**
   ```bash
   cd apps/admin-service
   npm run dev
   ```

2. **Crear usuarios de prueba:**
   ```bash
   node scripts/create-test-users.js
   ```

3. **Probar en Postman:**
   - Usar los ejemplos de arriba
   - Guardar el token de la respuesta del login
   - Usar el token en el header Authorization para las rutas protegidas

4. **Verificar health check:**
   ```bash
   curl http://localhost:3001/db/health
   ```
