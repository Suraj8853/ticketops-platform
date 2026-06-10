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

output "external_secret_role_arn" {
  description = "IAM role ARN for External Secrets Operator"
  value = aws_iam_role.external_secret.arn
}
