# Script rápido para probar Circuit Breaker
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "PRUEBA CIRCUIT BREAKER" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Verificando configuración..." -ForegroundColor Yellow
$resilience = docker exec api_gateway printenv RESILIENCE_ENABLED
Write-Host "  RESILIENCE_ENABLED = $resilience" -ForegroundColor Gray

if ($resilience -ne "true") {
    Write-Host "  ❌ Resiliencia deshabilitada!" -ForegroundColor Red
    Write-Host "  Ejecuta: docker compose up -d --force-recreate gateway" -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✅ Resiliencia activa" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Deteniendo admin-service..." -ForegroundColor Yellow
docker stop admin_service | Out-Null
Start-Sleep -Seconds 2
Write-Host "  ✅ Admin-service detenido" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] Generando fallos para activar Circuit Breaker..." -ForegroundColor Yellow
$failures = 0
1..6 | ForEach-Object {
    try {
        $null = Invoke-WebRequest -Uri 'http://localhost:3002/admin/citas' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    } catch {
        $failures++
    }
    Start-Sleep -Milliseconds 300
}
Write-Host "  ✅ $failures fallos generados" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Verificando que Circuit Breaker está ABIERTO..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3002/admin/citas' -UseBasicParsing -ErrorAction Stop
    Write-Host "  ❌ Servicio aún responde (no debería)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 503) {
        $body = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  ✅ Circuit Breaker ABIERTO!" -ForegroundColor Green
        Write-Host "  Error: $($body.error)" -ForegroundColor Yellow
        Write-Host "  Message: $($body.message)" -ForegroundColor Yellow
    } else {
        Write-Host "  ⚠️  Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    }
}
Write-Host ""

Write-Host "[5/5] Reiniciando admin-service y verificando recuperación..." -ForegroundColor Yellow
docker start admin_service | Out-Null
Start-Sleep -Seconds 10

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3002/admin/citas' -UseBasicParsing -ErrorAction Stop
    Write-Host "  ✅ Servicio recuperado! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 503) {
        Write-Host "  ⚠️  Aún en half-open, esperando más..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        try {
            $response = Invoke-WebRequest -Uri 'http://localhost:3002/admin/citas' -UseBasicParsing -ErrorAction Stop
            Write-Host "  ✅ Servicio finalmente recuperado!" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "PRUEBA COMPLETADA" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

