output "cluster_version"{
   description = "EKS cluster version" 
   value = aws_eks_cluster.main.version
}

output "cluster_endpoint" {
  description = "EKS cluster API server endpoint"
  value = aws_eks_cluster.main.endpoint
}

output "cluster_ca_certificate" {
   description = "EKS cluster certificate authority data"
   value = aws_eks_cluster.main.certificate_authority[0].data
}

output "cluster_name" {
    description = "EKS cluster name" 
   value = aws_eks_cluster.main.name
}

output "node_group_name" {
  description = "eks node group name"
  value = aws_eks_node_group.main.node_group_name
}

output "eks_node_security_group_id" {
  description = "security group id for the eks"
  value = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}
output "cluster_oidc_issuer_url" {
  description = "EKS cluster OIDC issuer URL"
  value       = aws_eks_cluster.main.identity[0].oidc[0].issuer
}