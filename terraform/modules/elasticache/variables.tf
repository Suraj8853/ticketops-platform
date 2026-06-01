variable "project" {
  description = "Project name"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC id for security group"
  type = string
}

variable "private_subnets_ids" {
  description = "Private subnet IDs for ElastiCache subnet group"
  type        = list(string)
}

variable "eks_node_security_group_id" {
  description = "EKS node security group ID — allowed to connect to Redis"
  type = string
}

variable "node_type" {
  description = "Elasticcache node type"
  type = string
  default = "cache.t3.micro"
}

variable "num_cache_nodes" {
  description = "number of cache nodes"
  type = number
  default = 1
}

variable "engine_version" {
  description = "Redis engine version"
  type = string
  default = "7.0"
}