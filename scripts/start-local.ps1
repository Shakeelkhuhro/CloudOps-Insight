# Start the full local stack (build images if needed)
Set-Location -Path "${PSScriptRoot}\.."
docker compose up --build -d
Write-Host "Started stack (docker compose up -d)." -ForegroundColor Green
Write-Host "UIs: frontend http://localhost:3000, prometheus http://localhost:9090, grafana http://localhost:3001, alertmanager http://localhost:9093" -ForegroundColor Cyan
