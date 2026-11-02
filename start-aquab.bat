@echo off
title Aqua B - Water Station System Launcher
echo ========================================================
echo       AQUA B - WATER STATION SYSTEM LAUNCHER
echo ========================================================
echo.

echo [1/2] Sinisimulan ang PostgreSQL Database sa port 5434...
start /B "" "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "%~dp0pgdata"
timeout /t 3 /nobreak > nul

echo [2/2] Sinisimulan ang Aqua B Next.js Web Server...
echo Buksan ang browser sa: http://localhost:3000
echo.
npm run dev
pause

