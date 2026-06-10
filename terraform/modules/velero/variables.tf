variable "project" { type = string }
variable "env" { type = string }
variable "eks_oidc_issuer" { type = string }

variable "velero_sa_name" {
  type    = string
  default = "velero-server"
}
