# ADR-004: Kyverno over OPA/Gatekeeper

**Status:** Accepted  
**Date:** June 2026

## Why we needed policy enforcement

Without admission policies, anyone with kubectl access can deploy a container running as root, with no resource limits, using the latest tag. That's three separate ways to cause production incidents. Kyverno blocks all of this at admission time — the pod never gets created.

## Kyverno vs OPA/Gatekeeper

OPA/Gatekeeper uses Rego — a custom policy language that takes time to learn. Kyverno uses YAML — same format as everything else in the cluster. For a platform engineer who's already writing Kubernetes manifests all day, Kyverno policies feel natural.

Kyverno also has better built-in support for image signature verification with Cosign. The `verifyImages` rule in Kyverno handles the full Cosign verification flow including checking the Rekor transparency log.

## Policies we enforced

- `require-labels` — every pod needs app and version labels (makes debugging easier, required for proper monitoring)
- `disallow-root-containers` — runAsNonRoot: true required
- `disallow-latest-tag` — forces explicit versioning, makes deployments reproducible
- `requires-resources-limits` — prevents noisy neighbours eating all node resources
- `verify-image-signature` — only Cosign-signed images in ticketops namespace

Started in Audit mode, fixed all violations, switched to Enforce. Proved it works: `kubectl run test --image=nginx:latest` gets rejected with all 4 violation messages.

## HA setup

3 admission controller replicas. `failurePolicy: Ignore` on webhooks — if Kyverno is slow or down, pods still get created. Better to let a pod through than block all deployments because Kyverno is slow to start. `autoUpdateWebhooks: false` — Kyverno kept reverting our webhook patches. Disabled it.

## Kyverno + ECR + VPC endpoints

Image signature verification requires Kyverno to reach ECR. Kyverno pods are in private subnets. Without VPC endpoints, every ECR call goes through NAT Gateway. Added VPC endpoints for ecr.api, ecr.dkr, and s3 — Kyverno now verifies signatures within the VPC. Also gave Kyverno its own IRSA role with ECR read permissions.
