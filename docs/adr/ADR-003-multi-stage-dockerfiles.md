# ADR-008: Multi-stage Dockerfiles for all services

**Status:** Accepted  
**Date:** June 2026

## What we did

All 4 services use multi-stage builds:
- APIs: `node:20` (build) → `node:20-alpine` (runtime)
- Dashboard: `node:20` (build) → `nginx:alpine` (runtime)

## Why it matters

Single stage build for a Node.js app includes: the full node:20 image (~1.1GB), all devDependencies, npm cache, build tools. None of that is needed at runtime.

Multi-stage: copy only the built artifacts and production dependencies into a minimal alpine image. Dashboard went from ~1.4GB to ~28MB. That's an 80% reduction. 

In Kubernetes this matters because:
- Smaller images = faster pulls during HPA scale events
- Less attack surface (no build tools, no package managers in production)
- Less ECR storage cost

## Dashboard nginx issue

Original Dockerfile used `nginx:alpine` which runs as root on port 80. Kyverno's `disallow-root-containers` policy blocked it. Switched to `nginxinc/nginx-unprivileged` which runs as non-root on port 8080. Had to update the nginx.conf, containerPort, targetPort, and health probe ports. Worth it — the image is secure by default.

## .dockerignore

Every service has a .dockerignore excluding node_modules, .git, test files, local env files. Without it, Docker COPY sends everything to the build context including your entire node_modules directory which defeats the purpose of the multi-stage build.
