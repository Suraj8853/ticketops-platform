variable "project" {
  description = "project name"
  type = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "github_org" {
  description = "github organization or user name"
  type = string
}

variable "github_repo" {
   description = "GitHub repository name"
   type        = string
}

variable "aws_account_id" {
   description = "AWS account ID"
  type        = string
}

variable "eks_oidc_issuer_url" {
  description = "EKS OIDC issuer URL"
  type        = string
}
variable "eks_oidc_issuer" {
  description = "EKS OIDC issuer without https://"
  type        = string
}

variable "eks_oidc_arn" {
  description = "EKS OIDC provider ARN"
  type        = string
}
