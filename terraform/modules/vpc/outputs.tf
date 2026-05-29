output "vpc_id" {
  description = "VPC ID used by EKS, RDS, Redis modules"
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs used by ALB"
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs used by EKS, RDS, Redis"
  value = aws_subnet.private[*].id
}

output "nat_gateway_ip" {
  description = "NAT gateway public ip for white listing"
  value       = aws_eip.nat.public_ip
}

output "vpc_cidr" {
  description = "VPC cidr block "
  value = var.vpc_cidr
}