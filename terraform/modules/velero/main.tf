resource "aws_s3_bucket" "velero" {
  bucket        = "${var.project}-${var.env}-velero-backups"
  force_destroy = true
  tags = {
    Name = "${var.project}-${var.env}-velero-backups"
    Env  = "${var.env}"
  }
}

resource "aws_s3_bucket_versioning" "velero" {
  bucket = aws_s3_bucket.velero.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "velero" {
  bucket = aws_s3_bucket.velero.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "velero" {
  bucket = aws_s3_bucket.velero.id
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls  = true
  restrict_public_buckets = true
  
}

resource "aws_iam_role" "velero" {
  name = "${var.project}-${var.env}-velero-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.eks.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${var.eks_oidc_issuer}:sub" = "system:serviceaccount:velero:${var.velero_sa_name}"
            "${var.eks_oidc_issuer}:aud" = "sts.amazonaws.com"
          }
        }

      }

    ]
  })
  tags = {
    Name = "${var.project}-${var.env}-velero"
  }
}

resource "aws_iam_role_policy" "velero" {
  name = "${var.project}-${var.env}-velero-policy"
  role = aws_iam_role.velero.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:AbortMultipartUpload",
          "s3:ListMultipartUploadParts"
        ]
        Resource = [
          aws_s3_bucket.velero.arn,
          "${aws_s3_bucket.velero.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeVolumes",
          "ec2:DescribeSnapshots",
          "ec2:CreateSnapshot",
          "ec2:DeleteSnapshot",
          "ec2:DescribeTags",
          "ec2:CreateTags"
        ]
      Resource = "*"
    

      }
    ]
  })
}



# Look up EKS OIDC provider
data "aws_iam_openid_connect_provider" "eks" {
  url = "https://${var.eks_oidc_issuer}"
}
