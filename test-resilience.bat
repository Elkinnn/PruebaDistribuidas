@echo off
REM Script de pruebas de resiliencia y seguridad
echo ==============================================
echo PRUEBAS DE RESILIENCIA Y SEGURIDAD
echo ==============================================
echo.

REM Esperar a que Docker esté listo
timeout /t 5 /nobreak >nul

echo [1/6] Probando health del Gateway...
curl.exe -s -i http://localhost:3002/health
echo.
echo.

echo [2/6] Probando ready de Admin Service...
curl.exe -s -i http://localhost:3001/db/ready
echo.
echo.

echo [3/6] Probando ready de Medico Service...
curl.exe -s -i http://localhost:3000/ready
echo.
echo.

echo [4/6] Probando login via Gateway...
powershell -NoLogo -NoProfile -Command "$token = (Invoke-RestMethod -Method Post -Uri 'http://localhost:3002/auth/login' -ContentType 'application/json' -Body (@{ email = 'admin@demo.com'; password = 'admin123' } | ConvertTo-Json)); Write-Output 'Token obtenido:' $token.token"
echo.
echo.

echo [5/6] Probando CORS con origen no permitido...
curl.exe -s -i -X OPTIONS http://localhost:3002/health -H "Origin: https://no-permitido.ejemplo" -H "Access-Control-Request-Method: GET"
echo.
echo.

echo [6/6] Probando Circuit Breaker...
echo     (Esto requiere simular una caida del servicio)
echo     Apagando admin-service temporalmente...
docker stop admin_service
timeout /t 2 /nobreak >nul

echo     Haciendo 6 requests GET para activar el Circuit Breaker...
for /L %%i in (1,1,6) do (
    curl.exe -s http://localhost:3002/admin/citas 2>nul
    timeout /t 1 /nobreak >nul
)

echo     Encendiendo admin-service de nuevo...
docker start admin_service
timeout /t 10 /nobreak >nul

echo     Probando de nuevo (deberia pasar después del timeout de half-open)...
curl.exe -s http://localhost:3002/admin/citas
echo.
echo.

echo ==============================================
echo PRUEBAS COMPLETADAS
echo ==============================================

