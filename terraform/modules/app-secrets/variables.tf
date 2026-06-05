variable "project" {
  description = "Project name"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}


variable "admin_password" {
  description = "Default admin password"
  type        = string
  sensitive   = true
}