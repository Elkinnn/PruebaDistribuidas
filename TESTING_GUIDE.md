# Guía de Pruebas - Resiliencia y Seguridad

Esta guía contiene todos los comandos de prueba para verificar los cambios implementados en el sistema.

## 📋 Prerrequisitos

1. Docker Desktop en ejecución
2. Todos los servicios corriendo: `docker compose up -d`
3. PowerShell o CMD disponibles

## 🚀 Ejecutar Todas las Pruebas

### Opción 1: Script PowerShell (Recomendado)
```powershell
.\test-resilience-powershell.ps1
```

### Opción 2: Script CMD/Batch
```cmd
test-resilience.bat
```

---

## 🔍 Pruebas Manuales Individuales

### 1. Health Checks

#### Gateway Health
```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing | Select-Object -ExpandProperty Content

# O con curl
curl.exe -i http://localhost:3002/health
```

**Resultado esperado:**
- Status: 200
- JSON con estado de gateway, admin-service y medico-service

#### Admin Service Ready
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/db/ready" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Resultado esperado:**
- Status: 200
- `{ "ok": true, "db": "ready" }`

#### Medico Service Ready
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/ready" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Resultado esperado:**
- Status: 200
- `{ "ok": true, "db": "ready" }`

---

### 2. Autenticación

#### Login via Gateway
```powershell
$body = @{ email = 'admin@demo.com'; password = 'admin123' } | ConvertTo-Json
$response = Invoke-RestMethod -Method Post -Uri "http://localhost:3002/auth/login" -ContentType "application/json" -Body $body
$token = $response.token
Write-Output "Token: $token"
```

**Resultado esperado:**
- Status: 200
- Token JWT en la respuesta

#### Usar token para acceder a ruta protegida
```powershell
$headers = @{ 'Authorization' = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3002/admin/citas" -Headers $headers
```

**Resultado esperado:**
- Status: 200
- Lista de citas (puede estar vacía si no hay datos)

---

### 3. CORS (Cross-Origin Resource Sharing)

#### Origen Permitido
```powershell
$headers = @{
    'Origin' = 'http://localhost:3003'
    'Access-Control-Request-Method' = 'GET'
}
Invoke-WebRequest -Uri "http://localhost:3002/health" -Method Options -Headers $headers -UseBasicParsing
```

**Resultado esperado:**
- Status: 200
- Headers `Access-Control-Allow-Origin` presente

#### Origen NO Permitido
```powershell
$headers = @{
    'Origin' = 'https://no-permitido.ejemplo'
    'Access-Control-Request-Method' = 'GET'
}
try {
    Invoke-WebRequest -Uri "http://localhost:3002/health" -Method Options -Headers $headers -UseBasicParsing -ErrorAction Stop
} catch {
    Write-Output "Status: $($_.Exception.Response.StatusCode)"
    $_.Exception.Response.GetResponseStream()
}
```

**Resultado esperado:**
- Status: 403
- `{ "error": "CORS_NOT_ALLOWED", "message": "Origen no permitido" }`

---

### 4. Circuit Breaker

⚠️ **ADVERTENCIA:** Esta prueba detiene temporalmente un servicio.

#### Preparación
```powershell
# Asegúrate de tener el servicio corriendo
docker ps | Select-String "admin_service"
```

#### Activar Circuit Breaker
```powershell
# 1. Detener admin-service
docker stop admin_service

# 2. Hacer múltiples requests que fallen
1..6 | ForEach-Object {
    try {
        Invoke-WebRequest -Uri "http://localhost:3002/admin/citas" -UseBasicParsing -ErrorAction SilentlyContinue
    } catch {
        # Ignorar
    }
    Start-Sleep -Milliseconds 500
}

# 3. Intentar hacer un request (debería devolver CIRCUIT_OPEN)
try {
    Invoke-RestMethod -Uri "http://localhost:3002/admin/citas"
} catch {
    $_.Exception.Response.StatusCode
    # Debería ser 503 con error CIRCUIT_OPEN
}
```

**Resultado esperado después de varios intentos:**
- Status: 503
- `{ "error": "CIRCUIT_OPEN", "message": "Temporalmente no disponible" }`

#### Recuperación del Circuit Breaker
```powershell
# 1. Reiniciar admin-service
docker start admin_service

# 2. Esperar ~20 segundos (CB_HALF_OPEN_AFTER_MS)
Start-Sleep -Seconds 22

# 3. Intentar un request
Invoke-RestMethod -Uri "http://localhost:3002/admin/citas"
```

**Resultado esperado:**
- Status: 200
- El servicio debería funcionar normalmente

---

### 5. Verificar SSL/TLS (Opcional)

Los servicios ahora tienen soporte para SSL, pero está **deshabilitado por defecto** (`DB_SSL=false`).

Para activarlo:

1. Editar `.env` del servicio:
```bash
# Gateway
DB_SSL=true
DB_SSL_CA_PATH=/certs/mysql-ca.pem

# Admin Service
DB_SSL=true

# Medico Service
MYSQL_SSL=true
```

2. Reiniciar servicios:
```powershell
docker compose restart gateway admin-service medico-service
```

**⚠️ NOTA:** Esto requiere tener certificados SSL configurados en MySQL. En desarrollo, mantener `DB_SSL=false`.

---

### 6. Verificar x-request-id (Trazabilidad)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing
$response.Headers['x-request-id']
```

**Resultado esperado:**
- Un UUID único en cada request
- Si envías un `x-request-id` en el header, debería reutilizarlo

---

### 7. Rate Limiting (solo en /auth)

```powershell
# En desarrollo está deshabilitado, pero puedes probar en producción
# Hacer muchos requests rápidos
1..1500 | ForEach-Object {
    try {
        $null = Invoke-RestMethod -Method Post -Uri "http://localhost:3002/auth/login" -ContentType "application/json" -Body '{"email":"test@test.com","password":"test"}' -ErrorAction SilentlyContinue
    } catch {
        # Ignorar errores de login
    }
}
```

**Resultado esperado (solo producción):**
- Después de 1000 requests en 15 minutos: Status 429

---

## 🐛 Debugging

### Ver logs en tiempo real
```powershell
# Todos los servicios
docker compose logs -f

# Solo gateway
docker compose logs -f gateway

# Solo admin-service
docker compose logs -f admin-service

# Solo medico-service
docker compose logs -f medico-service
```

### Verificar variables de entorno
```powershell
# Gateway
docker exec api_gateway env | Select-String "HTTP_TIMEOUT\|RESILIENCE\|CB_\|RETRY_"

# Admin Service
docker exec admin_service env | Select-String "DB_SSL\|PORT"

# Medico Service
docker exec medico_service env | Select-String "MYSQL_SSL\|PORT"
```

### Verificar redirección HTTPS
```powershell
# En desarrollo, esto NO debería redirigir
Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing

# En producción, debería redirigir a HTTPS (code 307)
```

---

## ✅ Checklist de Pruebas Exitosas

- [ ] Gateway /health responde 200
- [ ] Admin /db/ready responde 200
- [ ] Medico /ready responde 200
- [ ] Login via gateway genera token JWT
- [ ] Token JWT permite acceder a rutas protegidas
- [ ] CORS bloquea orígenes no permitidos (403)
- [ ] CORS permite orígenes en whitelist
- [ ] Circuit Breaker activa después de fallos (503)
- [ ] Circuit Breaker recupera después de timeout (200)
- [ ] x-request-id se genera/transmite correctamente
- [ ] PDFs (si existen) se sirven correctamente
- [ ] Swagger funciona en todos los servicios

---

## 📊 Métricas Esperadas

### Tiempos de Respuesta
- Health checks: < 100ms
- Login: < 200ms
- Requests normales: < 500ms
- Circuit Breaker timeout: 5 segundos

### Tolerancia a Fallos
- Retries: 2 intentos por defecto (GET/HEAD)
- Backoff exponencial: 250ms, 500ms
- Circuit Breaker: abre a 50% de fallos
- Half-Open después: 20 segundos

---

## 🔗 Referencias

- **Circuit Breaker:** `gateway/src/resilience/circuitBreaker.js`
- **Configuración:** `gateway/src/config/index.js`
- **Health Checks:** 
  - Gateway: `gateway/src/routes/health.js`
  - Admin: `apps/admin-service/src/presentation/db-health.controller.ts`
  - Medico: `apps/medico-service/src/presentation/server.ts`

