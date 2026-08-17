variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "clientes-bdb"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "postgres"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "User1"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  default     = "Password1!"
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs22.x"
}

variable "sendgrid_api_key" {
  description = "SendGrid API key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "sendgrid_from_email" {
  description = "Verified SendGrid sender email"
  type        = string
  default     = "421edwar@gmail.com"
}

variable "sendgrid_from_name" {
  description = "SendGrid sender display name"
  type        = string
  default     = "Clientes BDB"
}

variable "sendgrid_reply_to" {
  description = "SendGrid reply-to address"
  type        = string
  default     = "clientesbdb@bdb.com"
}

variable "env" {
  description = "Project environment (qa or prod)"
  type        = string
  default     = "qa"

  validation {
    condition     = contains(["qa", "prod"], var.env)
    error_message = "env must be one of: qa, prod."
  }
}