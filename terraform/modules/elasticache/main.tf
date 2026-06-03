resource "aws_elasticache_subnet_group" "main" {
  name = "${var.project}-${var.env}-redis-subnet-group"
  subnet_ids = var.private_subnets_ids
  tags = {
    Name = "${var.project}-${var.env}-redis-subnet-group"
  }
}

resource "aws_security_group" "redis" {
  name = "${var.project}-${var.env}-redis-sg"
  vpc_id = var.vpc_id
  ingress {
   from_port = 6379
   to_port = 6379
   protocol = "tcp"
   security_groups = [var.eks_node_security_group_id]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-${var.env}-redis-sg"
  }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id = "${var.project}-${var.env}-redis-cluster"
  engine = "redis"
  node_type = var.node_type
  num_cache_nodes = var.num_cache_nodes
  port = "6379"
  security_group_ids = [aws_security_group.redis.id]
  subnet_group_name = aws_elasticache_subnet_group.main.name
   tags = {
    Name = "${var.project}-${var.env}-redis-cluster"
  }
}

resource "aws_secretsmanager_secret" "redis_host" {
  name = "${var.project}-${var.env}-redis-host"
  recovery_window_in_days = 0
  tags = {
    Name = "${var.project}-${var.env}-redis-host"
  }
}

resource "aws_secretsmanager_secret_version" "redis_host" {
  secret_id = aws_secretsmanager_secret.redis_host.id
  secret_string = aws_elasticache_cluster.main.cache_nodes[0].address
}



