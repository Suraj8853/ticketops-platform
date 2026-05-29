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