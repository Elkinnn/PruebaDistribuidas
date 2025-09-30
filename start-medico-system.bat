@echo off
echo Iniciando sistema completo de medico...
echo.

echo Iniciando servicios...
echo.

REM Iniciar servicio de medico en una nueva ventana
echo Iniciando Servicio de Medico...
start "Medico Service" cmd /k "cd apps/medico-service && npm run dev"

REM Esperar un poco
timeout /t 3 /nobreak >nul

REM Iniciar gateway en una nueva ventana
echo Iniciando Gateway...
start "Gateway" cmd /k "cd gateway && npm start"

REM Esperar un poco
timeout /t 3 /nobreak >nul

REM Iniciar frontend en una nueva ventana  
echo Iniciando Frontend...
start "Frontend" cmd /k "cd apps/frontend && npm run dev"

echo.
echo ✅ Sistema iniciado!
echo - Servicio de Medico: http://localhost:3100
echo - Gateway: http://localhost:3000
echo - Frontend: http://localhost:3003
echo.
echo Credenciales de medico:
echo Email: elkin@gmail.com
echo Password: Medico123
echo.
echo Nota: Ahora el servicio de medico funciona igual que el admin
echo.
pause
