# IAM role for Lambda rotation function
resource "aws_iam_role" "rotation_lambda" {
  name = "${var.project}-${var.env}-secrets-rotation-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "rotation_lambda" {
  name = "${var.project}-${var.env}-secrets-rotation-policy"
  role = aws_iam_role.rotation_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue",
          "secretsmanager:UpdateSecretVersionStage"
        ]
        Resource = var.secret_arn
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetRandomPassword"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeNetworkInterfaces"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda security group
resource "aws_security_group" "rotation_lambda" {
  name        = "${var.project}-${var.env}-rotation-lambda-sg"
  description = "Security group for secrets rotation Lambda"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-${var.env}-rotation-lambda-sg"
  }
}

# Allow Lambda to connect to RDS
resource "aws_security_group_rule" "rds_from_lambda" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.rotation_lambda.id
  security_group_id        = var.rds_security_group_id
}

# Rotation Lambda from AWS Serverless Application Repository
resource "aws_serverlessapplicationrepository_cloudformation_stack" "postgres_rotator" {
  name             = "${var.project}-${var.env}-postgres-rotation"
  application_id   = "arn:aws:serverlessrepo:us-east-1:297356227824:applications/SecretsManagerRDSPostgreSQLRotationSingleUser"
  semantic_version = "1.1.367"
  capabilities     = ["CAPABILITY_IAM", "CAPABILITY_RESOURCE_POLICY"]

  parameters = {
    functionName = "${var.project}-${var.env}-postgres-rotation"
    endpoint     = "https://secretsmanager.ap-south-1.amazonaws.com"
    vpcSubnetIds = join(",", var.private_subnet_ids)
    vpcSecurityGroupIds = aws_security_group.rotation_lambda.id
  }
}

# Enable rotation on the secret
resource "aws_secretsmanager_secret_rotation" "db_password" {
  secret_id           = var.secret_arn
  rotation_lambda_arn = aws_serverlessapplicationrepository_cloudformation_stack.postgres_rotator.outputs["RotationLambdaARN"]

  rotation_rules {
    automatically_after_days = 30
  }

  depends_on = [aws_serverlessapplicationrepository_cloudformation_stack.postgres_rotator]
}
