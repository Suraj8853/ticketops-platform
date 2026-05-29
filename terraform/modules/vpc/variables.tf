variable "vpc_cidr" {
  description = "cidr block for vpc"
  type = string
  default = "10.0.0.0/16"
}

variable "availablity_zones" {
  description = "Availability zones"
  type = list(string)
  default = [ "ap-south-1a","ap-south-1b","ap-south-1c" ]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for Public Subnet"
  type = list(string)
  default = [ "10.0.1.0/24","10.0.2.0/24","10.0.3.0/24" ]
}

variable "private_subnet_cidr" {
  description = "cidr blocks for private subnet"
  type = list(string)
  default = [ "10.0.11.0/24","10.0.12.0/24","10.0.13.0/24" ]
}

variable "project" {
   description = "Project name used in resource naming"
  type        = string
  default     = "ticketops"
}

variable "env" {
  description = "Environment name"
  type        = string
  default     = "dev"
}