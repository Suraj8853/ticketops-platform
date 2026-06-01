output "redis_endpoint" {
  description = "Redis primary endpoint "
  value = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_cluster.main.port
}

output "redis_security_group" {
  description = "Redis security group id"
  value = aws_security_group.redis.id
}