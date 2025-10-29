// Minimal example Terraform config to create a single VM in AWS and open ports used by the demo.
// IMPORTANT: This is template code. Do NOT commit secrets. Provide credentials via environment variables
// (AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY) or configure an IAM role for CI.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region
  # It's recommended to supply credentials via environment variables or an AWS profile
  # access_key = var.aws_access_key
  # secret_key = var.aws_secret_key
}

resource "aws_key_pair" "deploy_key" {
  key_name   = "demo-deploy-key"
  public_key = var.ssh_public_key
}

resource "aws_security_group" "demo_sg" {
  name        = "demo-sg"
  description = "Allow SSH and demo ports"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  // Allow ports the demo uses (adjust as needed)
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "demo" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = aws_key_pair.deploy_key.key_name
  vpc_security_group_ids = [aws_security_group.demo_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              set -e
              # Simple userdata that installs Docker and Docker Compose, clones the repo, and starts the compose stack
              # Note: For production, use more robust config management (cloud-init modules, systemd units, etc.)

              apt-get update -y || (yum update -y || true)

              # Install Docker (works across Debian/Ubuntu and Amazon Linux)
              if command -v apt-get >/dev/null 2>&1; then
                apt-get install -y ca-certificates curl gnupg lsb-release
                mkdir -p /etc/apt/keyrings
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmour -o /etc/apt/keyrings/docker.gpg || true
                echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" > /etc/apt/sources.list.d/docker.list
                apt-get update -y
                apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin git
              else
                # Amazon Linux / yum
                yum install -y docker git
                systemctl enable --now docker || true
              fi

              # Add ubuntu user to docker (if present) and start docker
              if id -u ubuntu >/dev/null 2>&1; then
                usermod -aG docker ubuntu || true
              fi

              systemctl enable --now docker || true

              # Clone repository (assumes this repo is public or accessible)
              cd /opt || exit 0
              if [ ! -d project ]; then
                git clone https://github.com/your-org/your-repo.git project || true
              fi
              cd project || exit 0

              # Pull images or bring up compose (use local compose file)
              docker compose pull || true
              docker compose up -d || true

              EOF

  tags = {
    Name = "demo-deploy"
  }
}

output "public_ip" {
  value = aws_instance.demo.public_ip
}
