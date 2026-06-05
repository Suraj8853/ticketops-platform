resource "aws_db_subnet_group" "main" {
  subnet_ids = var.private_subnet_ids
  name       = "${var.project}-${var.env}-db-subnet-group"
  tags = {
    Name = "${var.project}-${var.env}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project}-${var.env}-rds-security-group"
  description = "security group for rds"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.eks_node_security_group_id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "${var.project}-${var.env}-rds-sg"
  }
}

resource "aws_db_instance" "rds" {
  identifier           = "${var.project}-${var.env}-postgres"
  engine               = "postgres"
  engine_version       = 15
  instance_class       = var.db_instance_class
  db_name              = var.db_name
  username             = var.db_username
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.main.name
  multi_az             = var.multiple_az
  publicly_accessible  = false
  skip_final_snapshot  = true
  vpc_security_group_ids = [aws_security_group.rds.id]
  allocated_storage = var.db_allocated_storage
  tags = {
    Name = "${var.project}-${var.env}-postgres"
  }
}

resource "aws_secretsmanager_secret" "db_username" {
  name = "${var.project}-${var.env}-db-username"
   recovery_window_in_days = 0
  tags = {
    Name = "${var.project}-${var.env}-db-username"
  }
}

resource "aws_secretsmanager_secret_version" "db_username" {
  secret_id = aws_secretsmanager_secret.db_username.id
  secret_string = var.db_username
}

resource "aws_secretsmanager_secret" "db_password" {
  name = "${var.project}-${var.env}-db-password"
   recovery_window_in_days = 0
  tags = {
    Name = "${var.project}-${var.env}-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

resource "aws_secretsmanager_secret" "db_host" {
  name = "${var.project}-${var.env}-secretmanager-db-host"
  recovery_window_in_days = 0
  tags = {
    Name = "${var.project}-${var.env}-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_host" {
  secret_id = aws_secretsmanager_secret.db_host.id
  secret_string = aws_db_instance.rds.address
}
