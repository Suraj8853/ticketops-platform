output "velero_role_arn" {
  value =  aws_iam_role.velero.arn
}

output "velero_bucket_name" {
  value = aws_s3_bucket.velero.bucket
}