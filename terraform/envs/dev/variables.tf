variable "vpc_cidr" {
   description = "CIDR block for VPC"
  type        = string
}

variable "availablity_zones" {
  description = "availability zones"
  type = list(string)
}

variable "public_subnets_cidrs" {
  description = "Public subnet cidrs"
  type = list(string)
}

variable "private_subnet_cidrs" {
   description = "Private subnet cidrs"
  type = list(string)
}

variable "project" {
  description = "Project name"
  type        = string
}

variable "env" {
   description = "Environment name"
  type        = string
}
variable "github_repo" {
   description = "GitHub repository name"
   type        = string
}

variable "aws_account_id" {
   description = "AWS account ID"
  type        = string
}

variable "github_org" {
  description = "github organization or user name"
  type = string
}


variable "db_username" {
   description = "RDS master password"
  type = string
}

variable "db_password" {
   description = "RDS master password"
  type = string
}

variable "db_name" {
    description = "RDS DB"
  type = string
}
variable "db_allocated_storage" {
    description = "allocated db storage"
  type = number
  default = 20
}

variable "admin_password" {
  description = "Default admin password"
  type        = string
  sensitive   = true
}
variable "slack_webhook_url" {
  description = "Slack webhook URL for Alertmanager notifications"
  type        = string
  sensitive   = true
}