# Example Terraform template (provider configuration not included)

terraform {
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.region
}

resource "aws_instance" "app" {
  ami           = var.ami
  instance_type = var.instance_type

  tags = {
    Name = "cloudops-insight-app"
  }
}
