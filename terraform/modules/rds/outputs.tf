output "db_endpoint" {
  description = "RDS instance endpoint"
  value = aws_db_instance.rds.endpoint
}

output "db_name" {
  description = "Database name"
  value = aws_db_instance.rds.db_name
}

output "db_port" {
  description = "port on which database listens"
  value = aws_db_instance.rds.port
}

output "db_username" {
    description = "name of the db user"
    value = aws_db_instance.rds.username
  
}

output "rds_security_group_id" {
  description = "security group id of the rds"
  value = aws_db_instance.rds.vpc_security_group_ids
}

output "db_password_secret_arn" {
  description = "DB password secret ARN"
  value       = aws_secretsmanager_secret.db_password.arn
}