locals {
  eks_oidc_issuer = trimprefix(module.eks.cluster_oidc_issuer_url, "https://")
  eks_oidc_arn    = "arn:aws:iam::${var.aws_account_id}:oidc-provider/${local.eks_oidc_issuer}"
}

module "vpc" {
  source              = "../../modules/vpc"
  project             = var.project
  env                 = var.env
  vpc_cidr            = var.vpc_cidr
  availablity_zones   = var.availablity_zones
  private_subnet_cidr = var.private_subnet_cidrs
  public_subnet_cidrs = var.public_subnets_cidrs
   aws_region          = "ap-south-1"
}

module "ecr" {
  source  = "../../modules/ecr"
  project = var.project
  env     = var.env
}

module "iam" {
  source              = "../../modules/iam"
  project             = var.project
  github_repo         = var.github_repo
  env                 = var.env
  github_org          = var.github_org
  aws_account_id      = var.aws_account_id
  eks_oidc_issuer_url = module.eks.cluster_oidc_issuer_url
  eks_oidc_issuer     = local.eks_oidc_issuer
  eks_oidc_arn        = local.eks_oidc_arn
}

module "eks" {
  source               = "../../modules/eks"
  project              = var.project
  eks_cluster_role_arn = module.iam.cluster_role_arn
  private_subnets_ids  = module.vpc.private_subnet_ids
  public_subnets_ids   = module.vpc.public_subnet_ids
  env                  = var.env
  eks_node_role_arn    = module.iam.eks_node_role_arn
  node_desired_size    = 2
  node_min_size        = 1
  node_max_size        = 6
  node_instance_type   = "t3.large"
}

module "rds" {
  source                     = "../../modules/rds"
  private_subnet_ids         = module.vpc.private_subnet_ids
  vpc_id                     = module.vpc.vpc_id
  eks_node_security_group_id = module.eks.eks_node_security_group_id
  project                    = var.project
  env                        = var.env
  db_username                = var.db_username
  db_password                = var.db_password
  db_name                    = var.db_name
  db_allocated_storage       = var.db_allocated_storage
}

module "elasticache" {
  source                     = "../../modules/elasticache"
  env                        = var.env
  project                    = var.project
  vpc_id                     = module.vpc.vpc_id
  eks_node_security_group_id = module.eks.eks_node_security_group_id
  private_subnets_ids        = module.vpc.private_subnet_ids
}

module "app_secrets" {
  source            = "../../modules/app-secrets"
  admin_password    = var.admin_password
  project           = var.project
  env               = var.env
  slack_webhook_url = var.slack_webhook_url
}

module "velero" {
  source          = "../../modules/velero"
  env             = var.env
  project         = var.project
  eks_oidc_issuer = local.eks_oidc_issuer
}

module "secrets_rotation" {
  source                = "../../modules/secrets-rotation"
  project               = var.project
  env                   = var.env
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  secret_arn            = module.rds.db_password_secret_arn
 rds_security_group_id = tolist(module.rds.rds_security_group_id)[0]
}

module "route53" {
  source = "../../modules/route53"
  domain_name = "apisuraj.click"
  subdomain_name = "ticketops"
  alb_dns_name = "k8s-ticketop-ticketop-beac6174a2-1892759112.ap-south-1.elb.amazonaws.com"
}
