# Instrucciones para ejecutar el sistema médico independiente

## 1. Configurar variables de entorno

### Gateway
```bash
cd gateway
cp env.example .env
```

### Servicio Médico
```bash
cd apps/medico-service
cp env.example .env
```

### Frontend
```bash
cd apps/frontend
# Crear archivo .env con:
echo "VITE_API_URL=http://localhost:3000/api/medico" > .env
```

## 2. Instalar dependencias

```bash
# En la raíz del proyecto
npm install

# Gateway
cd gateway
npm install

# Servicio médico
cd ../apps/medico-service
npm install

# Frontend
cd ../frontend
npm install
```

## 3. Ejecutar servicios

### Terminal 1 - Gateway (puerto 3000)
```bash
cd gateway
npm run dev
```

### Terminal 2 - Servicio Médico (puerto 3002)
```bash
cd apps/medico-service
npm run dev
```

### Terminal 3 - Frontend (puerto 5173)
```bash
cd apps/frontend
npm run dev
```

## 4. Probar el sistema

1. Abrir navegador en: http://localhost:5173/medico/login
2. Usar credenciales de prueba:
   - Email: dr.garcia@clinix.com
   - Password: medico123
   
   O:
   - Email: dr.martinez@clinix.com
   - Password: medico123

## 5. Endpoints disponibles

### Autenticación
- POST /api/medico/auth/login/medico
- POST /api/medico/auth/register/medico
- GET /api/medico/auth/me

### Citas
- GET /api/medico/citas
- GET /api/medico/citas/hoy
- POST /api/medico/citas

### Pacientes
- GET /api/medico/pacientes
- GET /api/medico/pacientes/:id
- POST /api/medico/pacientes
- PUT /api/medico/pacientes/:id

### Dashboard
- GET /api/medico/dashboard/stats

## 6. Solución de problemas

### Si la página aparece en blanco:
1. Verificar que el gateway esté corriendo en puerto 3000
2. Verificar que el servicio médico esté corriendo en puerto 3002
3. Verificar que el frontend esté corriendo en puerto 5173
4. Revisar la consola del navegador para errores
5. Verificar que VITE_API_URL esté configurado correctamente

### Si el login no funciona:
1. Verificar que el servicio médico tenga las rutas de autenticación
2. Revisar los logs del servicio médico
3. Verificar que el JWT_SECRET esté configurado

### Si hay errores de CORS:
1. Verificar que el gateway tenga CORS habilitado
2. Verificar que las URLs de los servicios sean correctas
