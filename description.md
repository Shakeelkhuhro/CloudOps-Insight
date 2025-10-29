# Project overview — Multi-Tier Cloud Deployment Pipeline Demo

This repository is an educational, runnable demo of a multi-tier cloud deployment pipeline and observability stack. It's designed to be run locally with Docker Compose (Windows-friendly) and to be adaptable to a real cloud environment using Terraform + Ansible.

The demo shows:

- A React frontend (Vite) that displays service health, metrics and a realtime chart (Socket.IO).
- A Node.js + Express backend that exposes REST endpoints, emits realtime metrics via Socket.IO, and exposes Prometheus metrics at `/metrics` using prom-client.
- MongoDB (container) as the demo data store.
- Observability: Prometheus scrapes the backend; Grafana is provisioned with a dashboard and datasource; Prometheus alert rules and Alertmanager are configured to POST alerts to the backend webhook.
- Logging: Promtail is included and configured. On Windows the project uses a lightweight `logreceiver` demo service to accept Promtail pushes (Loki is provided via a compose override for WSL2/Linux where Loki can run reliably).
- CI: A GitHub Actions workflow builds images, runs tests, and contains placeholders for pushing images and running Terraform/Ansible to deploy to real infrastructure.

Goals of Option A (what we'll scaffold next):

- Provide a minimal, clearly-documented real-cloud pipeline that you can adapt and run against a single test VM.
- The pipeline uses Terraform to provision a single VM (example uses AWS EC2, but the code is written and commented so you can swap in another provider).
- An Ansible playbook connects to the new VM, installs Docker + Docker Compose, and deploys the repo's Docker Compose stack (or the built images) onto the VM.
- The CI pipeline will be scaffolded to run `terraform plan` on PRs and optionally `terraform apply` + `ansible-playbook` in a controlled deploy job (requires secrets / protected branch approvals).

What I added in this repo (concise mapping):

- Backend: `backend/src/index.js`, `/metrics` endpoint (prom-client), Socket.IO metric emitter.
- Frontend: `frontend` (Vite) with components for charts, sparklines, toasts, and lazy-loaded heavy charts.
- Docker Compose: `docker-compose.yml` and `docker-compose.loki.yml` (WSL2 override) to run the demo stack locally.
- Monitoring: `infra/prometheus/*.yml`, `infra/grafana/provisioning/*` (datasource + dashboard), `infra/alertmanager/config.yml`.
- Logging: `infra/promtail/*`, `infra/logreceiver/` (Windows demo) and `infra/loki/*` (for WSL2/Linux).
- CI: `.github/workflows/ci-cd.yml` — builds and tests, plus CI deploy scaffolding added below.

Quick local run (Windows-friendly demo):

1. Start the local stack (PowerShell):

   # from repository root
   docker compose up --build -d

2. Open services:

   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 or 3001 depending on the compose ports (check `docker-compose.yml`)

3. To reload Prometheus rules (example script included):

   .\scripts\reload-prometheus.ps1

Security and secrets:

- The demo uses unprivileged local containers. For a real cloud deploy do NOT commit credentials. Use environment variables, CI secrets, or a secrets manager (HashiCorp Vault, AWS Secrets Manager).
- The Terraform + Ansible scaffold (Option A) will be provided as templates. You must set provider credentials and an SSH private key as secrets in your CI provider before running `terraform apply` or the deploy job.

Files to look at for Option A:

- `infra/terraform/` — Terraform files to create a VM and open basic ports (SSH, app ports). The files are commented and use variables for credentials.
- `infra/ansible/` — Example inventory and `deploy_vm.yml` playbook that installs Docker/Docker Compose and deploys the repo using `docker compose`.
- `.github/workflows/ci-cd.yml` — CI job scaffold to run `terraform plan` (PRs) and a `deploy-infra` job that can run `terraform apply` + Ansible when secrets are present and approval is given.

Option A quick plan (what I'll scaffold next):

1. Terraform: create `infra/terraform/main.tf`, `variables.tf`, `outputs.tf` to provision a single VM.
   - The VM boots with a `user_data` script to install Docker and Docker Compose, and optionally pull/run images.
   - Security group opens SSH and the ports the demo uses (3000/5000/9090/3001, etc.).
2. Ansible: add `infra/ansible/deploy_vm.yml` and `infra/ansible/inventory.example`.
   - The playbook connects with an SSH key (you provide) and deploys the demo stack (via `git clone` + `docker compose up -d` or by pulling images from your registry).
3. CI: add a `deploy-infra` job to `.github/workflows/ci-cd.yml` that (optionally) performs `terraform init/plan` and `terraform apply` (protected by secrets and manual approvals) and runs the Ansible playbook.

What you'll need to run Option A safely:

- Provider credentials (for AWS example: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) in your local environment or CI secrets.
- An SSH keypair: public key passed to Terraform for the instance; private key stored as a CI secret or used locally for Ansible.
- A container registry for pushing built images (optional). CI workflow includes placeholders to push images to a registry using secrets.

Next step

I'll scaffold the Option A files now: Terraform + Ansible templates and a CI job placeholder. These are templates that you must configure with credentials and an SSH key before running in your cloud account.

If you'd rather target a provider other than AWS (DigitalOcean, GCP, Azure), tell me and I can adapt the Terraform code to that provider instead.