# Project overview — CloudOps Insight (short)

CloudOps Insight is a small, runnable demo to learn end-to-end deployment and observability practices. It's designed for students and engineers who want a hands-on example that runs locally with Docker Compose and can be adapted to a cloud VM using Terraform + Ansible.

What you will see
- Frontend: React (Vite) dashboard with realtime charts and controls
- Backend: Node + Express API that exposes `/metrics` for Prometheus and broadcasts events over Socket.IO
- Storage: MongoDB for demo data (deployments history)
- Monitoring: Prometheus scrapes the backend; Grafana is auto-provisioned with a sample dashboard
- Logging: Promtail configuration included; Loki is optional (recommended on Linux/WSL2). `logreceiver` provides a Windows-friendly demo path
- Infra & automation: example Terraform templates and an Ansible playbook for deploying the demo to a single VM
- CI: GitHub Actions workflow (build + test) with a gated `deploy-infra` scaffold

Quick local run
1. From the repository root:

```powershell
docker compose up --build -d
```

2. Open services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Prometheus: http://localhost:9090
- Grafana: check `docker-compose.yml` for the mapped port

3. Stop the demo:

```powershell
docker compose down
```

Security & notes
- Do not commit secrets. Use GitHub Actions secrets or environment variables for cloud credentials.
- Terraform and Ansible files are examples — review and provide credentials before running them in your account.
- Use small instance types and run `terraform destroy` when done to avoid charges.

Files to inspect
- `backend/`, `frontend/` — application code
- `infra/prometheus/`, `infra/grafana/` — monitoring
- `infra/promtail/`, `infra/loki/` — logging (Loki optional)
- `infra/logreceiver/` — Windows log receiver
- `infra/terraform/`, `infra/ansible/` — deployment examples
- `.github/workflows/ci-cd.yml` — CI pipeline scaffold

Next steps
- I can update the Terraform AMI lookup to be region-safe, add an auto-shutdown option, or adapt the templates to DigitalOcean. Tell me which you prefer and I'll implement it.
