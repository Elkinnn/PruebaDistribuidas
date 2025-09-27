# Arquitectura del API Gateway

## Flujo de Peticiones

```
Frontend (React) 
    ↓ HTTP Request
API Gateway (Node.js)
    ↓ Proxy/Forward
Backend Services (Admin/Medico)
    ↓ Response
API Gateway
    ↓ Stream/JSON
Frontend
```

## Estructura Modular

### 1. Configuración (`config/index.js`)
- Variables de entorno centralizadas
- URLs de servicios backend
- Configuración de CORS, rate limiting, timeouts

### 2. Middlewares de Seguridad (`middleware/security.js`)
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Restringido al dominio del frontend
- **Rate Limiting**: 100 requests/15min por IP

### 3. Middlewares de Proxy (`middleware/proxy.js`)
- Configuración común para proxies
- Propagación automática de headers de autorización
- Manejo de errores de proxy
- Soporte para streaming de archivos

### 4. Rutas

#### Autenticación (`routes/auth.js`)
- `POST /auth/login` - Usa axios para lógica extra si es necesaria
- Manejo de errores específico para autenticación

#### Proxies (`routes/proxy.js`)
- Proxies transparentes para todas las rutas del admin service:
  - `/hospitales/*`
  - `/especialidades/*`
  - `/medicos/*`
  - `/empleados/*`
  - `/citas/*` (con streaming de PDFs)

#### Health Checks (`routes/health.js`)
- `GET /health` - Verifica estado de todos los servicios
- Timeout de 5s para health checks
- Respuesta detallada del estado de servicios

## Características Principales

### ✅ Proxy Transparente
- Usa `http-proxy-middleware` en lugar de axios duplicado
- Propagación automática de headers
- Manejo de todos los métodos HTTP (GET, POST, PUT, DELETE)

### ✅ Streaming de Archivos
- Soporte nativo para PDFs y otros archivos binarios
- No intenta parsear archivos como JSON
- Copia headers relevantes del servicio backend

### ✅ Seguridad
- **Helmet**: Headers de seguridad
- **CORS**: Solo permite el dominio del frontend
- **Rate Limiting**: Protección contra abuso
- **Timeouts**: Evita requests colgados

### ✅ Monitoreo
- Logging con Morgan
- Health checks de servicios
- Manejo centralizado de errores

### ✅ Mantenibilidad
- Código modular y separado por responsabilidades
- Configuración centralizada
- Fácil agregar nuevos servicios
- Sin lógica de negocio en el gateway

## Ventajas de la Refactorización

1. **Código reducido**: De ~278 líneas a ~50 líneas en el archivo principal
2. **Sin duplicación**: Un solo proxy configurado para todas las rutas
3. **Más seguro**: Helmet, CORS restringido, rate limiting
4. **Mejor rendimiento**: Streaming nativo de archivos
5. **Más mantenible**: Código modular y bien organizado
6. **Escalable**: Fácil agregar nuevos servicios backend
