output "jwt_secret_arn" {
  description = "JWT secret ARN"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "admin_password_arn" {
  description = "Admin password secret ARN"
  value       = aws_secretsmanager_secret.admin_password.arn
}