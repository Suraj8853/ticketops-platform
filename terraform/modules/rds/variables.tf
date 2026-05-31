variable "project" {
  description = "Project name"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
   description = "VPC id for the security group"
  type        = string
}


variable "private_subnet_ids" {
  description = "private subnet ids for the rds"
  type = list(string)
}

variable "eks_node_security_group_id" {
  description = "EKS security group id - allowed to connect to RDS"
  type = string
}

variable "db_name" {
  description = "name of the database"
  type = string
}

variable "db_username" {
  description = "Database master username"
  type = string
  default = "ticketops_admin"
}

variable "db_password" {
  description = "Database password"
  type = string
}


variable "db_instance_class" {
  description = "RDS instance class"
  type = string
  default = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB"
  type = number
  default = 20
}

variable "multiple_az" {
  description = "Enable multi az for the rds for high availability"
  type = bool
  default = false
}