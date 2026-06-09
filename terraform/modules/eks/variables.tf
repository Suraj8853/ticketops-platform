variable "project" {
  description = "name of the project"
  type = string
}

variable "env" {
  description = "environment of the project"
  type = string
}

variable "cluster_version" {
  description = "Kubernetes version"
  type        = string
  default = "1.31"
}

variable "eks_cluster_role_arn" {
  description = "IAM role arn for the EKS Ccontorl plane "
  type = string
}

variable "eks_node_role_arn" {
  description = "IAM role for the EKS worker node"
  type =  string
}

variable "public_subnets_ids" {
  description = "public subnet for the eks control nodes"
  type = list(string)
}

variable "private_subnets_ids" {
  description = "public subnet for the eks nodes"
  type = list(string)
}


variable "node_instance_type" {
  description = "EC2 instance type for the worker nodes"
  type = string
  default = "t3.large"
}

variable "node_desired_size" {
  description = "desired number of worker nodes"
  type = number
  default = 2
}

variable "node_min_size" {
   description = "minimum number of worker nodes"
  type = number
  default = 1
}
variable "node_max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 4
}

