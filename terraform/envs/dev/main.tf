module "vpc" {
  source = "../../modules/vpc"
  project = var.project
  env = var.env
  vpc_cidr = var.vpc_cidr
  availablity_zones = var.availablity_zones
  private_subnet_cidr = var.private_subnet_cidrs
  public_subnet_cidrs = var.public_subnets_cidrs
}

module "ecr" {
  source = "../../modules/ecr"
  project = var.project
  env = var.env
}

module "iam" {
  source = "../../modules/iam"
  project = var.project
  github_repo = var.github_repo
  env = var.env
  github_org = var.github_org
  aws_account_id = var.aws_account_id

}

module "eks" {
  source = "../../modules/eks"
  project = var.project
  eks_cluster_role_arn = module.iam.cluster_role_arn
  private_subnets_ids = module.vpc.private_subnet_ids
  public_subnets_ids = module.vpc.public_subnet_ids
 env = var.env
 eks_node_role_arn = module.iam.eks_node_role_arn
 node_desired_size = 2
 node_min_size = 1
 node_max_size = 4
 node_instance_type = "t3.medium"
}


module "rds" {
source = "../../modules/rds"
private_subnet_ids = module.vpc.private_subnet_ids
vpc_id = module.vpc.vpc_id
eks_node_security_group_id = module.eks.eks_node_security_group_id
project = var.project
env = var.env
db_username = var.db_username
db_password = var.db_password
db_name = var.db_name
db_allocated_storage = var.db_allocated_storage

}