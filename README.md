# CloudOps-Insight

Multi-tier demo that demonstrates a full DevOps workflow: a React frontend dashboard, Node.js backend APIs, MongoDB storage, Infrastructure-as-Code (Terraform), configuration management (Ansible), CI/CD (GitHub Actions templates) and monitoring (Prometheus + Grafana). The project is intended as a learning playground — everything runs locally with Docker Compose and is easy to extend for real cloud deployments.

Highlights

- Realtime metrics via Socket.IO (backend emits metrics and deployment events)
- Prometheus metrics endpoint exposed from backend (/metrics) and scraping via local Prometheus
- Grafana provisioned with a sample datasource and dashboard (under infra/grafana)
- Simulated deployment history stored in MongoDB and viewable/triggerable from the frontend
- Dockerized services with a ready-to-run `docker-compose.yml`

Contents

```
CloudOps-Insight/
├── frontend/              # React (Vite) dashboard, Dockerfile
├── backend/               # Node.js + Express API with Socket.IO, Dockerfile
├── infra/                 # Terraform examples; prometheus + grafana provisioning
├── ansible/               # example Ansible playbooks
├── .github/workflows/     # GitHub Actions pipeline templates
├── docker-compose.yml     # Local composition (mongo, backend, frontend, prometheus, grafana)
└── README.md
```

Quick start (local - recommended)

Prerequisites

- Docker Desktop (with Compose) running on your machine
- Node.js + npm (for local dev and rebuilds)

Run everything with Docker Compose (PowerShell):

```powershell
cd 'D:\cloud project\project'
docker compose up --build
```

Open these UIs in your browser:

- Frontend dashboard: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

If you need to run pieces manually (no Docker)

- Start MongoDB (example using Docker):

```powershell
docker run -d --name cloudops_mongo -e MONGO_INITDB_DATABASE=cloudops_insight -p 27017:27017 mongo:6
```

- Run backend locally (points to the above Mongo):

```powershell
cd 'D:\cloud project\project\backend'
npm install
$env:MONGO_URL='mongodb://localhost:27017/cloudops_insight'
node src/index.js
```

- Run frontend dev server (fast iteration):

```powershell
cd 'D:\cloud project\project\frontend'
npm install
npm run dev
```

API endpoints (backend)

- GET /api/metrics — returns current mock system metrics (cpu, memory, disk, network, timestamp)
- GET /api/deployments — returns recent deployment records (stored in MongoDB)
- POST /api/deployments — simulate a new deployment. Body: { branch: 'main' }
- GET /api/health — simple service health summary
- GET /metrics — Prometheus-format metrics for scraping

UI behavior — Trigger Deployment button

- The frontend `Trigger Deployment` button sends a POST to `/api/deployments` which creates a deployment document with status `running`.
- The backend simulates the deployment asynchronously and updates the document to `success` or `failed` after a short delay, then emits a Socket.IO `deployment` event to connected clients.
- If the table appears empty, the frontend shows a friendly empty state with instructions.

Monitoring

- Backend exposes Prometheus metrics via the `/metrics` endpoint using `prom-client`.
- `docker-compose.yml` includes Prometheus and Grafana. Prometheus scrapes the backend, Grafana is provisioned with a sample dashboard (see `infra/grafana/provisioning`).

Development notes and architecture

- The frontend is a Vite + React app located in `frontend/`. The Realtime chart is code-split and lazy-loaded to reduce initial bundle size. A lightweight `Sparkline` component provides inline CPU sparklines without extra dependencies.
- The backend is an Express app located in `backend/`. It uses `mongoose` to store deployments in MongoDB, `socket.io` for real-time push, and `prom-client` to expose Prometheus metrics.
- Terraform files in `infra/` are templates and require you to configure providers/credentials before use.
- Ansible playbooks in `ansible/` are examples showing how you might provision and deploy a remote host.

CI/CD (GitHub Actions)

- The `.github/workflows/ci-cd.yml` file is a template pipeline that builds Docker images, can push to Docker Hub (if you wire secrets), run Terraform, and run Ansible — treat it as a starting point and add your provider credentials/secrets in the repository settings.

Common troubleshooting

- Docker errors: if `docker compose up` fails complaining about pipes or engine, ensure Docker Desktop is running and WSL2 (if used) is active. Restart Docker Desktop if needed.
- Port conflicts: frontend (3000), grafana (3001), backend (5000), prometheus (9090). Stop any processes using those ports before starting.
- Backend 404 on POST /api/deployments: ensure the frontend bundle is rebuilt and the container restarted. The project has been fixed so the frontend posts to `/api/deployments`.

Next steps and extensions (recommended)

- Add Loki/Promtail for centralized logs and wire into Grafana.
- Add Prometheus alerting rules and integrate with Alertmanager (Slack/PagerDuty).
- Harden secrets: use Docker secrets or HashiCorp Vault for credentials in CI/CD.
- Replace mock metrics with real exporters (node_exporter or application-specific metrics) for production.
- Add end-to-end tests (Playwright) and unit tests (Jest + supertest).

Contributing

Contributions and improvements are welcome. Suggested workflow:

1. Fork the repo and create a feature branch.
2. Run tests and linters locally (add them as you contribute).
3. Submit a PR with a clear description and testing steps.

License

This project is provided as-is for educational use. See LICENSE for details.

Contact / Credits

Created as a learning project combining React, Node.js, Docker, Terraform, Ansible, Prometheus and Grafana.

## Logging, Loki & Alerting (local demo notes)

What I implemented for this demo:

- Alertmanager is provisioned and running as a Docker service at http://localhost:9093. It's configured to POST alerts to the backend webhook at `/api/alerts` (see `infra/alertmanager/config.yml`). The backend receives and logs incoming alert payloads.
- Promtail is running and configured to scrape host `/var/log` files and Docker containers. It is set to push to Loki at `http://loki:3100` (see `infra/promtail/config.yml`).

Loki on Windows: status and recommended action

- Loki attempted to start but failed to initialize its WAL/indexer when using host-mounted storage in this Windows environment (error: creating WAL folder /wal: permission denied). I tried two approaches:
	1. Bind-mounting a local folder into the container (host permission issues on Windows).
	2. Using a named Docker volume (still hit init issues in this environment).

- Workaround implemented: for local demo runs Loki is configured to use ephemeral container-local `/tmp` paths in `infra/loki/local-config.yaml`. However, some Loki components still attempt to create WAL directories at locations that require container filesystem permissions that can be problematic on Windows/Docker Desktop.

Recommendations to run Loki successfully:

1. Preferred: run the stack on a Linux host or inside WSL2 with full permissions. Loki initializes reliably there with a named volume. Example (WSL2):

```powershell
# from project root (inside WSL2):
docker compose up -d
```

2. If you must run on Windows Docker Desktop, either:
	 - Ensure the mapped host folder has permissions allowing the container to create subfolders (give Docker Desktop file-sharing access to the project directory). Or
	 - Run Loki with an alternate, single-process demo config (non-persistent) and accept that logs won't be persisted across restarts.

How to test alerts locally

1. Trigger the Prometheus test rule (or temporarily lower rule thresholds in `infra/prometheus/rules.yml`) and reload Prometheus:

```powershell
# reload Prometheus (if curl not available in container, send HUP):
docker compose exec -T prometheus kill -HUP 1

# then check alerts API
Invoke-RestMethod -Uri 'http://localhost:9090/api/v1/alerts' | ConvertTo-Json -Depth 4
```

2. Alertmanager will POST the alert JSON to the backend at `POST http://backend:5000/api/alerts` (inside docker network) which logs the payload. You can also view Alertmanager UI at http://localhost:9093.

How to enable persistent Loki storage (recommended for production/demo on Linux)

1. Create a local directory (or named volume) on a Linux host and mount it in `docker-compose.yml` under the `loki` service as `/loki`.
2. Ensure the directory is writable by the container (chown/chmod) or use a Docker named volume.
3. Restart Loki and Promtail:

```powershell
docker compose up -d loki promtail
docker compose logs loki --tail 100
```

If you want, I can attempt a non-persistent in-container Loki that avoids the WAL (demo-only) or help you set up Loki inside WSL2 where it runs reliably. Tell me which you prefer and I'll continue.

### How to start the full Loki stack (WSL2 / Linux)

If you have WSL2 or a Linux host, use the provided docker-compose override to enable Loki and persistent storage. From the project root run:

```bash
# start full stack with Loki + Promtail pushing to Loki
docker compose -f docker-compose.yml -f docker-compose.loki.yml up -d --build
```

Notes:
- The override file `docker-compose.loki.yml` mounts `infra/loki/local-config.yaml` and creates a named volume `loki_data` for persistence.
- Promtail will use `infra/promtail/config.loki.yml` (override) which points to `http://loki:3100`.

### If you are on Windows and prefer the quick demo

I replaced Loki with a lightweight `logreceiver` service for Windows local demos. It accepts Promtail's push API and prints samples to its container logs. Use the default `docker-compose.yml` (no override) to run the demo logging stack:

```powershell
docker compose up -d
docker compose logs -f logreceiver
```

This keeps the demo simple and Windows-friendly while still showing how logs flow from Promtail into a receiver.