resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.project}-${var.env}-jwt-secret"
  recovery_window_in_days = 0
  tags = {
    Name = "${var.project}-${var.env}-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

resource "aws_secretsmanager_secret" "admin_password" {
  name                    = "${var.project}-${var.env}-admin-password"
  recovery_window_in_days = 0
  tags = {
    Name = "${var.project}-${var.env}-admin-password"
  }
}

resource "aws_secretsmanager_secret_version" "admin_password" {
  secret_id     = aws_secretsmanager_secret.admin_password.id
  secret_string = var.admin_password
}


resource "aws_secretsmanager_secret" "alertmanager_slack" {
  name = "${var.project}-${var.env}-alertmanager-slack"
  recovery_window_in_days = 0
   tags = {
    Name = "${var.project}-${var.env}-alertmanager-slack"
  }
  
}

resource "aws_secretsmanager_secret_version" "alertmanager_slack" {
  secret_id = aws_secretsmanager_secret.alertmanager_slack.id
  secret_string = jsonencode({
    webhook_url = var.slack_webhook_url
  })
}
