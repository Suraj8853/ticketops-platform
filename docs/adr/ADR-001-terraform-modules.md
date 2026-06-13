# ADR-006: Terraform modular structure over single flat config

**Status:** Accepted  
**Date:** June 2026

## What we built

10 separate Terraform modules: vpc, eks, rds, elasticache, ecr, iam, app-secrets, secrets-rotation, route53, velero. Each module has its own variables.tf, outputs.tf, main.tf. The dev environment in `envs/dev/` just wires them together.

## Why modules

Started writing everything in one big main.tf. By the time we had VPC + EKS + RDS it was already 400+ lines and impossible to read. If you want to change something about RDS you're searching through a file that also has EKS node groups and IAM roles in it.

Modules give you a clean boundary. The VPC module doesn't know about RDS. The EKS module takes the VPC outputs as inputs. Each module can be understood on its own.

Also practical — when the cluster needed to be destroyed and recreated (OIDC provider mismatch issue), we could target just the affected resources without touching everything else.

## Remote state

S3 bucket `ticketops-terraform-state-599476212737` with DynamoDB table `ticketops-terraform-locks` for state locking. State locking matters — without it two people running terraform apply at the same time can corrupt state. Even solo, running it from two terminals is enough to cause issues.

## Trade-offs

More files to manage. For a single-environment project it's arguably overkill. But the habit of writing modular Terraform is worth building — in a real company you're sharing modules across teams and environments. Writing it flat from the start just means rewriting it later.
