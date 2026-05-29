output "repository_url" {
  description = "ECR repositories URL for all the services"
  value = {
    for repo,ecr in aws_ecr_repository.main:
    repo => ecr.repository_url
  }
}

output "registry_id" {
  description = "ECR registry id thats the account id"
  value = values(aws_ecr_repository.main)[0].registry_id
}