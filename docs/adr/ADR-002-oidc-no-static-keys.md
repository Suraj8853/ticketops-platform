# ADR-007: OIDC authentication for GitHub Actions — no static AWS credentials

**Status:** Accepted  
**Date:** June 2026

## The problem with static credentials

The obvious approach is to create an IAM user, generate access keys, store them as GitHub secrets. Simple. Also a security risk — static long-lived credentials sitting in GitHub secrets. If the repo is compromised, so are your AWS credentials. Key rotation is manual and easy to forget.

## OIDC approach

GitHub Actions supports OIDC — it can generate a short-lived token that proves "this is a GitHub Actions run from this repo on this branch." AWS IAM trusts GitHub's OIDC provider. The GitHub Actions workflow assumes an IAM role using that token. The role has a trust policy that only allows assumptions from the specific repo and branch.

The credentials are short-lived (1 hour), automatically rotated, and scoped to exactly the permissions needed. Nothing stored in GitHub secrets except the role ARN.

## IRSA for in-cluster AWS access

Same principle for pods. Instead of putting AWS credentials in environment variables, each service account gets an IAM role via IRSA (IAM Roles for Service Accounts). The pod's service account token is exchanged for AWS credentials. ExternalSecrets, ALB Controller, Cluster Autoscaler, Kyverno, Velero — each has its own role with least-privilege permissions.

No AWS credentials anywhere in the codebase, in secrets, or in environment variables. Everything uses OIDC/IRSA.

## The OIDC provider mismatch issue

When the EKS cluster was destroyed and recreated, the OIDC provider URL changed. The IAM module had the old URL hardcoded. Fix: removed the hardcoded URL, used `replace_triggered_by` in Terraform to auto-recreate the OIDC provider whenever the cluster is recreated. Also had to `terraform state rm` the old provider to unstick the apply.
