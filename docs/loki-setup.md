# Loki setup (quick)

This repo already includes an optional compose override and promtail/Loki configs. These files let you run a full stack with Loki for log storage and querying. On Windows the repo defaults to a lightweight `logreceiver` demo; Loki is recommended on WSL2 or Linux.

Quick steps (Windows / PowerShell):

1. From the project root run the included script to start the stack with Loki:

```powershell
./scripts/start-with-loki.ps1 -Build
```

2. Verify services:

```powershell
docker compose ps
docker compose logs -f loki
```

3. Grafana will be at http://localhost:3001 and is now provisioned with both Prometheus and Loki datasources.

4. To stop the stack:

```powershell
./scripts/stop-with-loki.ps1
```

Notes and recommendations
- Use WSL2 or a Linux host for reliable Loki performance and persistent volumes. Loki's WAL and storage behave poorly on Windows filesystems in many setups.
- If you prefer not to add files, you can run the compose command directly:

```powershell
docker compose -f docker-compose.yml -f docker-compose.loki.yml up -d --build
```

Where the supplied files are:
- `docker-compose.loki.yml` — adds the `loki` service and mounts `infra/loki/local-config.yaml`.
- `infra/promtail/config.loki.yml` — promtail config that pushes logs to `http://loki:3100`.
- `infra/grafana/provisioning/datasources/loki-datasource.yaml` — (added) auto-provisions Loki datasource in Grafana.

If you want, I can run a quick local check (docker compose ps, curl to Loki health) and paste the outputs here — say "run checks" and I'll run them now.
