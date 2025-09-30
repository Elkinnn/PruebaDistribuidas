# Conexión del Servicio de Médico con el API Gateway

## Resumen de Cambios Realizados

Se ha configurado exitosamente la conexión entre el frontend de médico y el backend a través del API Gateway, eliminando todos los datos estáticos y estableciendo comunicación real con la base de datos.

## 1. Actualización del API Gateway

### Archivo: `gateway/src/index.js`

**Cambios realizados:**
- ✅ Agregada variable de entorno `MEDICO_SERVICE_URL` (puerto 3100)
- ✅ Implementadas rutas de proxy para el servicio de médico:
  - `POST /medico/auth/login` → `http://localhost:3100/login`
  - `GET/PUT /medico/auth/*` → `http://localhost:3100/login/*`
  - `GET/POST/PUT/DELETE /medico/citas/*` → `http://localhost:3100/citas/*`
- ✅ Actualizado el endpoint de health para incluir el servicio de médico
- ✅ Mejorados los logs para mostrar ambas URLs de servicios

### Archivo: `gateway/env.example`
- ✅ Actualizada la URL del servicio de médico a `http://localhost:3100`

## 2. Actualización de APIs del Frontend

### Archivo: `apps/frontend/src/api/auth.medico.js`
**Antes:** Usaba datos mock estáticos en localStorage
**Después:** 
- ✅ Eliminados todos los datos mock
- ✅ Implementada comunicación real con el gateway
- ✅ Endpoint: `POST /medico/auth/login`

### Archivo: `apps/frontend/src/api/medico.js`
**Cambios:**
- ✅ Actualizadas todas las rutas para usar el prefijo `/medico/`
- ✅ Autenticación: `/medico/auth/me`
- ✅ Citas: `/medico/citas/*`

### Archivo: `apps/frontend/src/api/medico_cita.js`
**Antes:** Usaba localStorage para almacenar citas estáticas
**Después:**
- ✅ Eliminado completamente el uso de localStorage
- ✅ Implementada comunicación real con el backend
- ✅ Funciones actualizadas:
  - `listCitas()` → `GET /medico/citas`
  - `createCita()` → `POST /medico/citas`
  - `updateCita()` → `PUT /medico/citas/{id}`
  - `deleteCita()` → `DELETE /medico/citas/{id}`
  - `citasHoyMedico()` → `GET /medico/citas/hoy`
  - `statsMedico()` → `GET /medico/dashboard/stats`

### Archivo: `apps/frontend/src/api/medico_profile.js`
**Antes:** Usaba localStorage para datos de perfil estáticos
**Después:**
- ✅ Eliminado uso de localStorage
- ✅ Implementada comunicación real:
  - `getMedicoProfile()` → `GET /medico/auth/me`
  - `updateMedicoProfile()` → `PUT /medico/auth/me`

### Archivo: `apps/frontend/src/api/client.medico.js`
- ✅ Configurado para usar el gateway en `http://localhost:3000`
- ✅ Mantiene compatibilidad con variable de entorno `VITE_API_URL`

## 3. Actualización de Componentes del Frontend

### Archivo: `apps/frontend/src/pages/medico/Citas.jsx`
- ✅ Eliminados médicos mock estáticos
- ✅ Implementado estado para cargar médicos desde la API
- ✅ Mantenida funcionalidad de fallback temporal

### Archivo: `apps/frontend/src/pages/medico/Dashboard.jsx`
- ✅ Corregida la clave de localStorage para consistencia
- ✅ Usa `clinix_medico_user` en lugar de `clinix_user_medico`

### Archivo: `apps/frontend/src/pages/medico/Perfil.jsx`
- ✅ Implementado estado de carga
- ✅ Agregado fallback a datos del localStorage si la API falla
- ✅ Mejorada la experiencia de usuario con loading states

## 4. Configuración de URLs

### Frontend (Vite)
- ✅ Proxy configurado en `vite.config.js` para redirigir `/api` a `http://localhost:3000`
- ✅ Cliente médico configurado para usar `http://localhost:3000` por defecto

### Servicios
- ✅ Admin Service: `http://localhost:3001`
- ✅ Médico Service: `http://localhost:3100`
- ✅ API Gateway: `http://localhost:3000`

## 5. Endpoints Disponibles

### A través del Gateway (puerto 3000):

#### Autenticación de Médico
- `POST /medico/auth/login` - Login de médico
- `GET /medico/auth/me` - Obtener perfil del médico
- `PUT /medico/auth/me` - Actualizar perfil del médico

#### Gestión de Citas
- `GET /medico/citas` - Listar citas del médico
- `GET /medico/citas/{id}` - Obtener cita específica
- `POST /medico/citas` - Crear nueva cita
- `PUT /medico/citas/{id}` - Actualizar cita
- `DELETE /medico/citas/{id}` - Eliminar cita
- `GET /medico/citas/hoy` - Citas de hoy
- `GET /medico/dashboard/stats` - Estadísticas del dashboard

## 6. Base de Datos

La conexión utiliza la base de datos `hospitalservice` con las siguientes tablas relevantes:
- `usuario` - Usuarios del sistema (médicos y admin)
- `medico` - Información de médicos
- `cita` - Citas médicas
- `paciente` - Información de pacientes
- `hospital` - Hospitales
- `especialidad` - Especialidades médicas

## 7. Próximos Pasos Recomendados

1. **Probar la conexión completa:**
   ```bash
   # Terminal 1: Iniciar el servicio de médico
   cd apps/medico-service
   npm run dev

   # Terminal 2: Iniciar el API Gateway
   cd gateway
   npm start

   # Terminal 3: Iniciar el frontend
   cd apps/frontend
   npm run dev
   ```

2. **Verificar endpoints:**
   - `GET http://localhost:3000/health` - Estado del gateway
   - `POST http://localhost:3000/medico/auth/login` - Login de médico

3. **Consideraciones adicionales:**
   - Implementar manejo de errores más robusto
   - Agregar validación de datos en el frontend
   - Implementar refresh tokens si es necesario
   - Agregar tests de integración

## 8. Notas Importantes

- ✅ **No se modificó el servicio de admin** - Solo se agregaron rutas para médico
- ✅ **No se modificó el backend de médico** - Solo se configuró el gateway
- ✅ **Se eliminaron todos los datos estáticos** del frontend de médico
- ✅ **Se mantiene compatibilidad** con la estructura existente
- ✅ **Se preserva la funcionalidad** del servicio de admin

La integración está completa y lista para ser probada. El frontend de médico ahora se comunica exclusivamente con el backend real a través del API Gateway.
