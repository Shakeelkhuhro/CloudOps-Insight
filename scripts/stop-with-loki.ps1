# Stop the compose stack started with Loki
docker compose -f docker-compose.yml -f docker-compose.loki.yml down
Write-Host "Stopped compose stack with Loki" -ForegroundColor Yellow
