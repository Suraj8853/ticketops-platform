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

