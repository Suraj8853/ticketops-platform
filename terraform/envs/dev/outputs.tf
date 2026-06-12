output "vpc_id" {
  description = "VPC Id"
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
description = "Public subnet ids"
value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "private subnet ids"
  value = module.vpc.private_subnet_ids
}

output "nat_gateway_ip" {
  description = "NAT Gateway public IP"
  value       = module.vpc.nat_gateway_ip
}

output "vpc_cidr" {
  description = "vpc cidr"
  value = module.vpc.vpc_cidr
}

output "repository_urls" {
  description = "url of aws ecr repositories"
  value = module.ecr.repository_url
}
output "registry_id" {
   description = "url of aws ecr repositories"
  value = module.ecr.registry_id
}

output "cluster_autoscaler_role_arn" {
  description = "Cluster Autoscaler IAM role ARN"
  value       = module.iam.cluster_autoscaler_role_arn
}
output "ticketops_url" {
  description = "TicketOps platform URL"
  value       = module.route53.fqdn
}