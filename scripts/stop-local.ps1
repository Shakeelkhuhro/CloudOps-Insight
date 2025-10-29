# Stop the local stack
Set-Location -Path "${PSScriptRoot}\.."
docker compose down
Write-Host "Stopped stack (docker compose down)." -ForegroundColor Yellow
