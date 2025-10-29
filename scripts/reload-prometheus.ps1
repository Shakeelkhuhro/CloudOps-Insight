# Reload Prometheus config by sending SIGHUP to PID 1 inside the prometheus container
Set-Location -Path "${PSScriptRoot}\.."
docker compose exec -T prometheus kill -HUP 1
Write-Host "Prometheus reload signal sent." -ForegroundColor Green
