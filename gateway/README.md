# API Gateway - Hospital Management System

API Gateway para el sistema de gestión hospitalaria que actúa como punto de entrada único para todos los servicios backend.

## 🏗️ Arquitectura

```
API Gateway (Puerto 3000)
├── Admin Service (Puerto 3001)
└── Medico Service (Puerto 3100)
```

## 📁 Estructura del Proyecto

```
gateway/
├── src/
│   ├── config/
│   │   └── index.js          # Configuración centralizada
│   ├── middleware/
│   │   ├── proxy.js          # Configuración de proxies
│   │   └── security.js       # Middlewares de seguridad
│   ├── routes/
│   │   ├── auth.js           # Rutas de autenticación
│   │   ├── health.js         # Endpoint de salud
│   │   └── proxy.js          # Rutas de proxy
│   └── index.js              # Punto de entrada
├── swagger.js                # Documentación Swagger
├── package.json
└── README.md
```

## 🚀 Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

4. **Ejecutar en producción:**
   ```bash
   npm start
   ```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del gateway | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `ADMIN_SERVICE_URL` | URL del servicio admin | `http://localhost:3001` |
| `MEDICO_SERVICE_URL` | URL del servicio médico | `http://localhost:3100` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:5173` |

## 📚 Endpoints

### Autenticación
- `POST /auth/login` - Login de usuarios

### Salud del Sistema
- `GET /health` - Estado del gateway y servicios

### Proxy de Servicios
- `/admin/**` - Proxy al Admin Service
- `/medico/**` - Proxy al Medico Service
- `/especialidades` - Proxy legacy a Admin Service
- `/hospitales` - Proxy legacy a Admin Service
- `/medicos` - Proxy legacy a Admin Service
- `/empleados` - Proxy legacy a Admin Service
- `/citas` - Proxy legacy a Admin Service

### Documentación
- `GET /api-docs` - Documentación Swagger UI

## 🛡️ Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de Cross-Origin Resource Sharing
- **Rate Limiting**: Limitación de requests por IP
- **Request ID**: Trazabilidad de requests

## 📊 Monitoreo

El endpoint `/health` proporciona información detallada sobre:
- Estado del gateway
- Estado de los servicios backend
- Tiempos de respuesta
- Última verificación

## 🔄 Proxy Inteligente

El gateway incluye:
- **Proxy automático** con `http-proxy-middleware`
- **Fallback con axios** para compatibilidad
- **Manejo de archivos binarios** (PDFs)
- **Propagación de headers** de autenticación
- **Trazabilidad** con Request IDs

## 🐛 Troubleshooting

### Error: "Servicio backend no disponible"
- Verificar que los servicios backend estén corriendo
- Revisar las URLs en la configuración
- Comprobar conectividad de red

### Error: "TOO_MANY_REQUESTS"
- Rate limiting activo
- En desarrollo, se puede deshabilitar configurando `NODE_ENV=development`

### Error de CORS
- Verificar que `FRONTEND_URL` esté configurado correctamente
- Revisar la configuración de CORS en `src/config/index.js`