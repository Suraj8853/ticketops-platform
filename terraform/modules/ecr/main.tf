locals {
  repos = [
    "events-api",
    "bookings-worker",
    "admin-api",
    "dashboard"
  ]
}

resource "aws_ecr_repository" "main" {
  for_each = toset(local.repos)
  name = "${var.project}-${var.env}-${each.value}"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  tags = {
    Name = "${var.project}-${each.value}"
  }
}

resource "aws_ecr_lifecycle_policy" "main" {
  for_each = aws_ecr_repository.main
  repository = each.value.name 
  policy = jsonencode({
    rules = [
        {
            rulePriority = 1
            description = "Keep Last 10 images"
            selection = {
                tagStatus = "any"
                countType= "imageCountMoreThan"
                countNumber = 10
            }
            action = {
                type = "expire"
            }
        }
    ]
  })
}