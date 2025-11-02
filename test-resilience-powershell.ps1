# Script de pruebas de resiliencia y seguridad - PowerShell
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "PRUEBAS DE RESILIENCIA Y SEGURIDAD" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Esperar a que Docker esté listo
Start-Sleep -Seconds 5

Write-Host "[1/6] Probando health del Gateway..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "[2/6] Probando ready de Admin Service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/db/ready" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "[3/6] Probando ready de Medico Service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/ready" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "[4/6] Probando login via Gateway..." -ForegroundColor Yellow
try {
    $body = @{ email = 'admin@demo.com'; password = 'admin123' } | ConvertTo-Json
    $response = Invoke-RestMethod -Method Post -Uri "http://localhost:3002/auth/login" -ContentType "application/json" -Body $body
    Write-Host "Login exitoso!" -ForegroundColor Green
    Write-Host "Token obtenido: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
    $token = $response.token
} catch {
    Write-Host "Error en login: $_" -ForegroundColor Red
    $token = $null
}
Write-Host ""

Write-Host "[5/6] Probando CORS con origen no permitido..." -ForegroundColor Yellow
try {
    $headers = @{
        'Origin' = 'https://no-permitido.ejemplo'
        'Access-Control-Request-Method' = 'GET'
    }
    $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -Method Options -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "CORS correctamente bloqueado (403)" -ForegroundColor Green
    } else {
        Write-Host "Error inesperado: $_" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "[6/6] Probando Circuit Breaker..." -ForegroundColor Yellow
Write-Host "    (Esto requiere simular una caida del servicio)" -ForegroundColor Gray
Write-Host "    Apagando admin-service temporalmente..." -ForegroundColor Gray
docker stop admin_service 2>$null
Start-Sleep -Seconds 2

Write-Host "    Haciendo 6 requests GET para activar el Circuit Breaker..." -ForegroundColor Gray
for ($i = 1; $i -le 6; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3002/admin/citas" -UseBasicParsing -ErrorAction SilentlyContinue
    } catch {
        # Ignorar errores
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "    Encendiendo admin-service de nuevo..." -ForegroundColor Gray
docker start admin_service 2>$null
Start-Sleep -Seconds 10

Write-Host "    Probando de nuevo (debería pasar después del timeout de half-open)..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/admin/citas" -UseBasicParsing
    Write-Host "Service recuperado! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

