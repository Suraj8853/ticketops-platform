output "github_actions_role_arn" {
  description = "GitHub Actions role ARN used in GitHub Actions workflow"
  value = aws_iam_role.github_actions.arn
}
output "cluster_role_arn" {
  description = "EKS Cluster role ARN"
  value = aws_iam_role.eks_cluster_role.arn
}
output "eks_node_role_arn" {
  description = "EKS node role ARN used when creating node group"
  value = aws_iam_role.eks_node.arn
}
output "oidc_provide_arn" {
  description = "OIDC provider ARN used by EKS for IRSA"
  value       = aws_iam_openid_connect_provider.github.arn
}
output "oidc_provider_url" {
  description = "OIDC provider URL used by EKS for IRSA"
  value       = aws_iam_openid_connect_provider.github.url
}
output "cluster_autoscaler_role_arn" {
  value = aws_iam_role.cluster_autoscaler.arn
}
output "kyverno_ecr_role_arn" {
  value = aws_iam_role.kyverno_ecr.arn
}

output "bookings_worker_role_arn" {
  value = aws_iam_role.bookings_worker.arn
}
