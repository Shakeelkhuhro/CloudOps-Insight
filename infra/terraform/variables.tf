// Variables for the minimal demo Terraform

variable "aws_region" {
  description = "AWS region to create resources in"
  type        = string
  default     = "us-east-1"
}

variable "ssh_public_key" {
  description = "SSH public key string to inject into the VM (read from file in CI)"
  type        = string
  default     = ""
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH to the instance (default: your IP). Use 0.0.0.0/0 only for testing!"
  type        = string
  default     = "0.0.0.0/0"
}

variable "ami_id" {
  description = "AMI ID to use for the instance. Provide a distro that supports Docker (default left empty)."
  type        = string
  default     = "ami-0c55b159cbfafe1f0" # example: Amazon Linux 2 (replace for your region)
}

variable "instance_type" {
  description = "Instance type for the VM"
  type        = string
  default     = "t3.micro"
}

// Optional: pass access keys if you can't rely on environment or role (not recommended)
variable "aws_access_key" {
  description = "(Optional) AWS access key (prefer ENV or profile)"
  type        = string
  default     = ""
}

variable "aws_secret_key" {
  description = "(Optional) AWS secret key (prefer ENV or profile)"
  type        = string
  default     = ""
}
