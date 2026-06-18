variable "project" {
  type        = string
  description = "Project name"
}

variable "env" {
  type        = string
  description = "Environment name"
}

variable "bucket_name" {
  type        = string
  description = "Suffix for the bucket name (e.g. qr-codes)"
}