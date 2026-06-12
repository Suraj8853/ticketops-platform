variable "domain_name" {
  description = "Root Domain Name"
  type = string
}

variable "subdomain_name" {
  description = "Subdomain for ticketops"
  type = string
}

variable "alb_dns_name" {
   description = "ALB DNS name from EKS ingress"
   type = string
}