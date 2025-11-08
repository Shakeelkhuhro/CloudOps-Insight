Param(
    [switch]$Build
)

# Start the full compose stack including Loki (use WSL2/Linux for best Loki stability)
$composeFiles = @('docker-compose.yml','docker-compose.loki.yml')

if ($Build) {
    docker compose -f $composeFiles[0] -f $composeFiles[1] up -d --build
} else {
    docker compose -f $composeFiles[0] -f $composeFiles[1] up -d
}

Write-Host "Started compose stack with Loki. Check running services with: docker compose ps" -ForegroundColor Green
docker compose ps
