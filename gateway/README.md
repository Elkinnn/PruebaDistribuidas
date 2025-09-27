# API Gateway

Gateway minimalista para enrutar peticiones hacia microservicios backend.

## Características

- ✅ **Proxy transparente** usando `http-proxy-middleware`
- ✅ **Seguridad básica** con Helmet, CORS restringido y rate limiting
- ✅ **Streaming de archivos** (PDFs) sin parsear
- ✅ **Propagación de headers** de autorización
- ✅ **Health checks** de servicios backend
- ✅ **Logging** con Morgan
- ✅ **Código modular** y mantenible

## Estructura

```
src/
├── config/
│   └── index.js          # Configuración centralizada
├── middleware/
│   ├── security.js     # Middlewares de seguridad
│   └── proxy.js         # Configuración de proxies
├── routes/
│   ├── auth.js          # Rutas de autenticación
│   ├── health.js        # Health checks
│   └── proxy.js         # Proxies a servicios
└── index.js             # Aplicación principal
```

## Configuración

Copia `.env.example` a `.env` y configura las variables:

```bash
# URLs de servicios
ADMIN_SERVICE_URL=http://localhost:3001
MEDICO_SERVICE_URL=http://localhost:3002

# Frontend para CORS
FRONTEND_URL=http://localhost:5173
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm start
```

## Endpoints

### Autenticación
- `POST /auth/login` - Login (usa axios para lógica extra)

### Proxies (transparentes)
- `GET|POST|PUT|DELETE /hospitales/*` → Admin Service
- `GET|POST|PUT|DELETE /especialidades/*` → Admin Service  
- `GET|POST|PUT|DELETE /medicos/*` → Admin Service
- `GET|POST|PUT|DELETE /empleados/*` → Admin Service
- `GET|POST|PUT|DELETE /citas/*` → Admin Service (con streaming de PDFs)

### Health
- `GET /health` - Estado del gateway y servicios

## Seguridad

- **Helmet**: Headers de seguridad
- **CORS**: Restringido al dominio del frontend
- **Rate Limiting**: 100 requests/15min por IP
- **Timeout**: 30s para requests a servicios

## Streaming de Archivos

El gateway maneja automáticamente el streaming de archivos (PDFs) sin intentar parsearlos, copiando todos los headers relevantes del servicio backend.
