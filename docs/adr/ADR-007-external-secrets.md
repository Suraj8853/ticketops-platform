# ADR-003: ExternalSecrets over Sealed Secrets

**Status:** Accepted  
**Date:** June 2026

## The problem

Secrets can't go in git. Need a way to get AWS Secrets Manager values into Kubernetes secrets without hardcoding anything.

## Options

**Sealed Secrets** — encrypts secrets and stores the encrypted blob in git. Controller decrypts at deploy time. Problem: you're still managing encryption keys. If you lose the private key, all your secrets are gone. Also requires re-encrypting if you rotate a secret.

**ExternalSecrets Operator** — syncs from an external source (AWS Secrets Manager in our case) into Kubernetes secrets. The source of truth stays in AWS. Rotation just works — Lambda rotates the secret in Secrets Manager, ExternalSecret picks it up on next sync (refreshInterval: 1h, or force with annotation).

**AWS Secrets Manager CSI Driver** — mounts secrets as files into pods. More complex setup, requires changes to pod specs.

## What we chose

ExternalSecrets Operator with IRSA. The operator has an IAM role that can read from Secrets Manager. No static credentials anywhere. ClusterSecretStore defines how to connect to AWS. ExternalSecrets define which secrets to sync and into which Kubernetes secret keys.

The `property` field in ExternalSecret lets you extract specific keys from a JSON secret — useful after secrets rotation switched the DB password format to a JSON blob (Lambda requires JSON format with engine, username, password, host, port, dbname fields).

## Trade-offs

One more operator to run. But it's a well-maintained CNCF project and the operational model (AWS is source of truth, Kubernetes syncs from it) is clean. Much better than dealing with key management for Sealed Secrets.
