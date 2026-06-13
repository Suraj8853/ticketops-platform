# ADR-005: ArgoCD App of Apps pattern

**Status:** Accepted  
**Date:** June 2026

## The problem

The platform has multiple ArgoCD applications: the main ticketops app, argo-rollouts, cluster-autoscaler, aws-load-balancer-controller, external-secrets-operator, velero, prerequisites. Managing each one manually is tedious and error-prone. If you recreate the cluster you have to remember to recreate every app.

## App of Apps

One root-app manages everything. It watches the `apps/` directory in the gitops repo. Every file in that directory is an ArgoCD Application manifest. When root-app syncs, it creates/updates all child apps. When you add a new component, you add one file to `apps/` and it appears in ArgoCD automatically.

This means the entire cluster state — every app, every component — is defined in git. Recreating from scratch is: deploy ArgoCD, apply root-app, done. Everything else comes up automatically.

## Sync waves

Order matters. ExternalSecrets operator needs to be running before any ExternalSecret resources can sync. The main app namespace needs to exist before workloads deploy into it. Sync waves handle this:

- Wave 1-2: prerequisites (namespaces, CRDs, operators)
- Wave 3-4: workloads
- Wave 5: ingress

Without sync waves, ArgoCD tries to apply everything at once and half of it fails because dependencies aren't ready yet.

## Trade-offs

Slight complexity in the gitops repo structure — you need to understand that `apps/` manages ArgoCD apps and `manifests/` manages the actual workloads. Once you get it, it's clean. The alternative (managing each ArgoCD app manually) doesn't scale.
