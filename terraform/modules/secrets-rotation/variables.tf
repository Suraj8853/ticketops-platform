variable "project" {
  type = string
}

variable "env" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "secret_arn" {
  type = string
}

variable "rds_security_group_id" {
  type = string
}
