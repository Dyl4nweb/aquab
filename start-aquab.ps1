# Aqua B PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       AQUA B - WATER STATION SYSTEM LAUNCHER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Sinisimulan ang PostgreSQL Database sa port 5434..." -ForegroundColor Yellow
Start-Process -FilePath "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -ArgumentList "-D `"$PSScriptRoot\pgdata`"" -WindowStyle Hidden
Start-Sleep -Seconds 3

Write-Host "[2/2] Sinisimulan ang Aqua B Next.js Server..." -ForegroundColor Yellow
Write-Host "Buksan ang browser sa: http://localhost:3000" -ForegroundColor Green
npm run dev

