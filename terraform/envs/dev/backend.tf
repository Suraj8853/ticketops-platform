terraform {
  backend "s3" {
    bucket = "ticketops-terraform-state-59947621273"
    region = "ap-south-1"
    encrypt = true
    key = "dev/terraform.tfstate"
    dynamodb_table = "ticketops-terraform-locks"
  }

  required_providers {
    aws = {
        source = "hashicorp/aws"
        version = "~> 5.0"
    }
    
  }
  required_version = ">= 1.6.0"

 


}

 provider "aws"{
    region = "ap-south-1"
    default_tags {
      tags = {
         Project     = "ticketops"
      Environment = "dev"
      ManagedBy   = "terraform"
      }
    }
  }

