# TicketOps Platform

> A production-grade, multi-service event ticketing platform built on AWS EKS with full GitOps, observability, security, and progressive delivery.

**Live URL:** [ticketops.apisuraj.click](http://ticketops.apisuraj.click)  
**App Repo:** [github.com/Suraj8853/ticketops-platform](https://github.com/Suraj8853/ticketops-platform)  
**GitOps Repo:** [github.com/Suraj8853/ticketops-gitops](https://github.com/Suraj8853/ticketops-gitops)

[![CI/CD](https://github.com/Suraj8853/ticketops-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Suraj8853/ticketops-platform/actions)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Microservices](#microservices)
- [Infrastructure](#infrastructure)
- [CI/CD Pipeline](#cicd-pipeline)
- [GitOps](#gitops)
- [Observability](#observability)
- [Security](#security)
- [Progressive Delivery](#progressive-delivery)
- [Autoscaling](#autoscaling)
- [Disaster Recovery](#disaster-recovery)
- [Secrets Management](#secrets-management)
- [Load Testing](#load-testing)
- [Repository Structure](#repository-structure)
- [Deployment](#deployment)
- [Runbook](#runbook)

---

## Overview

TicketOps is a production-grade event ticketing platform that simulates a real SaaS product architecture. Built end-to-end across 8 phases:

| Phase | What was built |
|---|---|
| Phase 1 | Terraform infra (VPC, EKS, RDS, ElastiCache, ECR, IAM, remote state S3+DynamoDB) |
| Phase 2 | K8s workloads — HPA, NetworkPolicy, CronJob, PgBouncer, RBAC, ExternalSecrets, metrics-server |
| Phase 3 | ArgoCD App of Apps GitOps, Loki + Fluent Bit logging, structured request_id correlation |
| Phase 4 | Prometheus + Grafana SLO dashboards (8 panels), Alertmanager → Slack, PrometheusRules |
| Phase 5 | Kyverno 4 ClusterPolicies (Audit → Enforce), Cosign keyless image signing |
| Phase 6 | k6 load testing (100 VUs baseline, 500 VUs stress — HPA 2→7 pods proven) |
| Phase 7 | Argo Rollouts (Canary → Blue-Green), Velero DR (S3 backup, daily schedule), Cluster Autoscaler |
| Phase 8 | Secrets rotation (Lambda 30-day), Route53 domain, VPC Endpoints, Kyverno IRSA for ECR auth |

---

## Architecture

```
                         ┌────────────────────────────────────────────────────┐
                         │                    AWS Cloud (ap-south-1)          │
                         │                                                    │
  Users ───────────────► │  Route53 (ticketops.apisuraj.click)               │
                         │       │                                            │
                         │       ▼                                            │
                         │  ALB (internet-facing)                             │
                         │       │                                            │
                         │       ├──/api/events──► events-api (Rollout)      │
                         │       ├──/api/admin───► admin-api (Deployment)    │
                         │       └──/────────────► dashboard (Deployment)    │
                         │                                                    │
                         │  EKS Cluster (ticketops-dev, ap-south-1)          │
                         │  ┌─────────────────────────────────────┐           │
                         │  │ ticketops namespace                 │           │
                         │  │  events-api ──► pgbouncer ──► RDS   │           │
                         │  │  admin-api  ──► pgbouncer           │           │
                         │  │  bookings-worker ──► Redis          │           │
                         │  │  seat-lock-expiry (CronJob)         │           │
                         │  └─────────────────────────────────────┘           │
                         │                                                    │
                         │  RDS PostgreSQL 15   ElastiCache Redis             │
                         │  Secrets Manager     ECR (VPC Endpoint)           │
                         │  S3 Velero Backups   Lambda (rotation)            │
                         │                                                    │
                         │  GitHub Actions ──► ECR ──► ArgoCD ──► EKS        │
                         └────────────────────────────────────────────────────┘
```

**Key Design Decisions:**

- **PgBouncer** as connection pooler (transaction mode, max_client_conn=1000) — apps never connect directly to RDS
- **ExternalSecrets Operator** syncs AWS Secrets Manager → Kubernetes Secrets via IRSA (no static credentials)
- **Argo Rollouts Blue-Green** for events-api with manual promotion gate before switching production traffic
- **Cluster Autoscaler + HPA** — two-level autoscaling (nodes + pods), independently proven
- **VPC Endpoints** for ECR (api + dkr + s3) — Kyverno image verification stays within VPC without NAT
- **Redis SETNX + TTL seat locking** — prevents double-booking under concurrent load (proven at 500 VUs)
- **App of Apps** ArgoCD pattern — root-app manages all child applications from single sync
- **Sync waves** — ordered deployment: secrets (wave 1) → config (wave 2) → workloads (wave 3-4) → ingress (wave 5)

---

## Tech Stack

| Category | Technology |
|---|---|
| Cloud | AWS (EKS, RDS PostgreSQL 15, ElastiCache Redis, ECR, Secrets Manager, Route53, ALB, Lambda, S3) |
| Infrastructure as Code | Terraform (10 reusable modules, remote state S3 + DynamoDB locking) |
| Container Orchestration | Kubernetes (EKS v1.35, ap-south-1, t3.large nodes) |
| GitOps | ArgoCD (App of Apps, automated sync with prune) |
| Progressive Delivery | Argo Rollouts (Canary → Blue-Green, manual promotion gate) |
| CI/CD | GitHub Actions (OIDC auth, semantic versioning, matrix builds) |
| Image Registry | AWS ECR (lifecycle policies, VPC endpoint) |
| Image Signing | Cosign (keyless/OIDC, Rekor transparency log) |
| Image Scanning | Trivy (CRITICAL/HIGH block pipeline) |
| Policy Enforcement | Kyverno v3.8.1 (3 replicas HA, IRSA for ECR auth) |
| Metrics | Prometheus (kube-prometheus-stack) + prom-client v15 |
| Dashboards | Grafana (SLO dashboard, 8 panels, error budget panel) |
| Logging | Loki + Fluent Bit (structured JSON, request_id correlation) |
| Alerting | Alertmanager → Slack (webhook via ExternalSecret) |
| Secrets Management | AWS Secrets Manager + ExternalSecrets Operator (IRSA) |
| Secrets Rotation | AWS Lambda (SAR SecretsManagerRDSPostgreSQLRotationSingleUser, 30-day) |
| Connection Pooling | PgBouncer (transaction mode, scram-sha-256) |
| Autoscaling | HPA (CPU/memory) + Cluster Autoscaler (ASG min=1 max=6) |
| Load Testing | k6 |
| Backup/DR | Velero v7.2.1 (S3 backend, velero-plugin-for-aws) |
| DNS | Route53 CNAME + AWS Load Balancer Controller |

---

## Microservices

### events-api
- **Language:** Node.js (Express)
- **Port:** 3000
- **Deployment:** Argo Rollout (Blue-Green strategy)
- **HPA:** CPU 70%, min=2 max=10 — proven: 2→7 pods at 500 VUs
- **Features:** Event listing, seat availability, Redis caching (60s TTL), Prometheus metrics

### admin-api
- **Language:** Node.js (Express)
- **Port:** 3001
- **Deployment:** Kubernetes Deployment
- **HPA:** CPU 70%, min=2 max=5
- **Features:** Event management, booking administration, JWT authentication

### dashboard
- **Language:** React + Vite
- **Server:** `nginxinc/nginx-unprivileged` (port 8080, non-root, runAsUser: 101)
- **Deployment:** Kubernetes Deployment
- **Features:** Event browsing, seat selection, booking UI

### bookings-worker
- **Language:** Node.js
- **Deployment:** Kubernetes Deployment
- **Features:** Async booking processing, Redis-based job queue

### seat-lock-expiry (CronJob)
- **Schedule:** Every minute (`*/1 * * * *`)
- **Purpose:** Releases expired Redis seat holds to prevent permanently locked seats
- **Seat lock:** Redis SETNX + 10-minute TTL — concurrent-safe, no double booking

### db-migrate (Job, ArgoCD PreSync Hook)
- **Hook:** `argocd.argoproj.io/hook: PreSync`
- **Purpose:** Idempotent schema migrations before every deployment
- **Schema:** 150 events × 100 seats = 15,000 seats seeded using `WHERE NOT EXISTS` + `generate_series`

---

## Infrastructure

### Terraform Modules

```
terraform/
├── modules/
│   ├── vpc/              # VPC, subnets, NAT Gateway, VPC Endpoints (ECR api/dkr/s3)
│   ├── eks/              # EKS cluster, node groups, addons (vpc-cni, coredns, kube-proxy)
│   ├── rds/              # PostgreSQL 15, security groups, secrets, db_password_secret_arn output
│   ├── elasticache/      # Redis cluster, subnet group, host in Secrets Manager
│   ├── ecr/              # 4 repositories + lifecycle policies (keep last 10 images)
│   ├── iam/              # IRSA roles: ExternalSecrets, ALB Controller, Cluster Autoscaler,
│   │                     #             Kyverno ECR, Velero, GitHub Actions
│   ├── app-secrets/      # JWT secret, admin password, Slack webhook
│   ├── secrets-rotation/ # Lambda (SAR), IAM role/policy, Lambda SG, RDS SG rule, 30-day schedule
│   ├── cloudwatch/       # CloudWatch log groups
│   ├── route53/          # CNAME: ticketops.apisuraj.click → ALB
│   └── velero/           # S3 bucket (versioning + AES256 + public access block), IAM role
└── envs/
    └── dev/              # Dev environment wiring all modules
```

**Key Infrastructure Details:**
- AWS Account: `599476212737`
- Region: `ap-south-1`
- EKS Cluster: `ticketops-dev`
- ALB: `k8s-ticketop-ticketop-beac6174a2-1892759112.ap-south-1.elb.amazonaws.com`
- Velero S3: `ticketops-dev-velero-backups`

### VPC Design

- 3 public subnets (`10.0.1-3.0/24`) — ALB only
- 3 private subnets (`10.0.11-13.0/24`) — EKS nodes, RDS, ElastiCache
- NAT Gateway for outbound internet from private subnets
- VPC Endpoints: `ecr.api` (Interface, private DNS), `ecr.dkr` (Interface, private DNS), `s3` (Gateway)

---

## CI/CD Pipeline

```
Push to main (conventional commit: feat:/fix:/chore:)
         │
         ▼
Semantic Release
  ├── Analyzes commits → determines version bump
  └── Creates GitHub release + git tag (e.g. v1.21.0)
         │
         ▼
Build & Push (parallel matrix — all 4 services simultaneously)
  ├── docker build (multi-stage Dockerfile)
  ├── Trivy scan — CRITICAL/HIGH fails pipeline
  ├── Push to ECR with version tag + latest
  ├── Install Cosign (sigstore/cosign-installer@v3)
  └── Sign image keyless (COSIGN_EXPERIMENTAL=1, OIDC identity)
         │
         ▼
Update GitOps Repo
  ├── Checkout ticketops-gitops
  ├── Update image tags in all manifests (deployments, rollout, jobs)
  └── Create PR in ticketops-gitops with updated images
         │
         ▼
Manual PR Review & Merge
         │
         ▼
ArgoCD auto-detects gitops change → deploys
  ├── Regular services: rolling update
  └── events-api: Blue-Green → pauses for manual promotion
```

**Key CI/CD Features:**

- **OIDC auth** — GitHub Actions assumes AWS IAM role via OIDC — zero static credentials
- **Semantic versioning** — `feat:` → minor bump, `fix:` → patch bump, `BREAKING CHANGE:` → major
- **Trivy** — blocks on CRITICAL vulnerabilities, logs HIGH
- **Cosign keyless** — signed with GitHub OIDC identity, stored in ECR + Rekor transparency log
- **Matrix builds** — 4 services build in parallel, no sequential bottleneck
- **GitOps PR** — full audit trail, all deployments reviewable before merge

---

## GitOps

**Repository:** [ticketops-gitops](https://github.com/Suraj8853/ticketops-gitops)

```
ticketops-gitops/
├── apps/                           # ArgoCD Application manifests (App of Apps)
│   ├── root-app.yaml               # Manages all child apps
│   ├── ticketops.yaml              # All microservices
│   ├── argo-rollouts-app.yaml
│   ├── cluster-autoscaler-app.yaml
│   ├── aws-load-balancer-controller-app.yaml
│   ├── external-secret-operator.yaml
│   ├── prerequisites.yaml
│   └── velero.yaml
└── manifests/
    ├── events-api/          # Rollout, HPA, Service (active + preview), ExternalSecret, NetworkPolicy
    ├── admin-api/           # Deployment, HPA, Service, ExternalSecret, NetworkPolicy
    ├── dashboard/           # Deployment, Service, NetworkPolicy
    ├── bookings-worker/     # Deployment, ExternalSecret, NetworkPolicy
    ├── pgbouncer/           # Deployment, Service, NetworkPolicy
    ├── jobs/                # db-migrate (PreSync hook), seat-lock-expiry (CronJob)
    ├── policies/            # Kyverno ClusterPolicies
    ├── monitoring/          # ServiceMonitors, PrometheusRules
    ├── ingress/             # ALB Ingress (ticketops.apisuraj.click)
    ├── network-policies/    # Default deny-all
    └── rbac/                # ServiceAccounts, Roles, RoleBindings
```

---

## Observability

### Metrics (Prometheus + Grafana)

Custom prom-client v15 metrics in events-api and admin-api:

| Metric | Type | Description |
|---|---|---|
| `http_requests_total` | Counter | Request count by method, route, status |
| `http_request_duration_seconds` | Histogram | Latency — P50/P95/P99 |
| `booking_total` | Counter | Bookings by status (success/failure) |
| `seats_held_total` | Gauge | Active seat holds in Redis |

**Grafana SLO Dashboard (8 panels):**

| Panel | Query | SLO |
|---|---|---|
| Request Rate | `rate(http_requests_total[1m])` | — |
| Error Rate | `rate(http_requests_total{status=~"5.."}[1m]) / rate(http_requests_total[1m])` | < 0.1% |
| P99 Latency | `histogram_quantile(0.99, ...)` | < 500ms |
| Booking Rate | `rate(booking_total[1m])` | — |
| Seats Held | `seats_held_total` | — |
| Heap Memory | `nodejs_heap_size_used_bytes` | — |
| Event Loop Lag | `nodejs_eventloop_lag_seconds` | — |
| Error Budget | `(1 - (error_rate / 0.001)) * 100` | > 0% |

### Alerting (Alertmanager → Slack)

PrometheusRules in `ticketops` namespace (label: `release: prometheus`):

| Alert | Condition | Severity |
|---|---|---|
| `HighErrorRate` | Error rate > 1% for 5m | critical |
| `HighLatencyP99` | P99 > 500ms for 5m | warning |
| `PodCrashLoops` | Restarts > 3 in 15m | critical |
| `HighHeapMemory` | Heap > 80% limit | warning |
| `EventLoopLagHigh` | Loop lag > 100ms | warning |

Alertmanager configured via Helm values (not AlertmanagerConfig CRD — CRD adds namespace matchers that break cross-namespace routing).

### Logging (Loki + Fluent Bit)

- Fluent Bit DaemonSet collects all container logs
- Services emit structured JSON with `request_id` field
- End-to-end trace: correlate a single request across events-api logs using `request_id`
- LogQL queries in Grafana: `{namespace="ticketops", app="events-api"} | json | level="error"`

---

## Security

### Kyverno Policies (Enforce mode)

4 ClusterPolicies — initially deployed in Audit mode, violations fixed, then switched to Enforce:

| Policy | Rule | How workloads were fixed |
|---|---|---|
| `require-labels` | Pods need `app` + `version` labels | Added `version` label to all pod templates |
| `disallow-root-containers` | `runAsNonRoot: true` required | Added securityContext to all containers |
| `disallow-latest-tag` | Image tag `latest` blocked | All images use explicit version tags |
| `requires-resources-limits` | CPU + memory limits required | Added requests/limits to all containers |
| `verify-image-signature` | Only Cosign-signed images in ticketops namespace | Cosign signs every image in CI |

**Enforcement proven:** `kubectl run test-pod --image=nginx:latest` rejected with all 4 violation messages.  
**PolicyReport:** PASS:4 FAIL:0 after all workload fixes applied.

**Kyverno HA configuration:**
- 3 admission controller replicas (no SPOF)
- `features.autoUpdateWebhooks.enabled=false` — prevents Kyverno reverting webhook patches
- `failurePolicy: Ignore` on all webhooks — timeouts fail open (not closed)
- Webhook `timeoutSeconds: 30` — extended from default 10s
- Kyverno IRSA role with ECR read permissions — allows signature verification against ECR

### Image Signing (Cosign)

```
CI: Build image → Push to ECR → Cosign sign (keyless OIDC)
                                      │
                                      ▼ Stored in ECR (as separate artifact)
                                      ▼ Recorded in Rekor transparency log

K8s admission: Pod creation → Kyverno webhook → Fetch signature from ECR
                                                → Verify against Rekor → Allow/Deny
```

OIDC identity: `https://github.com/Suraj8853/ticketops-platform/.github/workflows/ci.yml@refs/heads/main`

### Network Security

- **Default deny-all** NetworkPolicy in ticketops namespace
- Per-service explicit allow rules — each service only accepts traffic from known sources
- Events-api and admin-api connect only to `pgbouncer-service:5432`
- No direct RDS access from any application pod

### RBAC

Each microservice has dedicated `ServiceAccount` + `Role` (get/list on specific named secrets) + `RoleBinding`. No wildcard permissions anywhere.

---

## Progressive Delivery

### Phase 7A — Canary Deployments (initial)

Canary strategy with traffic weights: 20% → 40% → 60% → 100% with 2-minute pauses.  
Observed 3 successful canary deployments: v1.8.0 → v1.9.0 → v1.10.0.

### Phase 7B — Blue-Green Deployments (current)

Switched from canary to blue-green per mentor requirement. Full traffic switch with manual promotion gate.

```
New image → ArgoCD syncs → GREEN ReplicaSet created (preview)
                                    │
                         BLUE (stable, active) serving 100% traffic
                         GREEN (preview) serving 0% traffic
                                    │
                    Engineer tests via preview service
                                    │
                    kubectl argo rollouts promote events-api -n ticketops
                                    │
                    Active service switches → GREEN becomes new BLUE
                    Old BLUE scales down after 30 seconds
```

```yaml
strategy:
  blueGreen:
    activeService: events-api-service    # 100% production traffic
    previewService: events-api-preview   # Testing only
    autoPromotionEnabled: false          # Manual gate
    scaleDownDelaySeconds: 30
```

**ArgoCD annotation on Rollout:**
```yaml
argocd.argoproj.io/compare-options: IgnoreExtraneous
```
Prevents ArgoCD from fighting Argo Rollouts during the blue-green pause state.

---

## Autoscaling

### HPA (Pod-level)

| Service | CPU Threshold | Min | Max | Proven Result |
|---|---|---|---|---|
| events-api | 70% | 2 | 10 | 2→7 pods at 500 VUs (CPU hit 122%) |
| admin-api | 70% | 2 | 5 | ✅ |

HPA targets the Argo Rollout resource (not Deployment):
```yaml
scaleTargetRef:
  apiVersion: argoproj.io/v1alpha1
  kind: Rollout
  name: events-api
```

metrics-server installed separately (required for HPA CPU metrics).

### Cluster Autoscaler (Node-level)

- IAM role: `ticketops-dev-cluster-autoscaler` (IRSA)
- ASG tags: `k8s.io/cluster-autoscaler/enabled=true`, `k8s.io/cluster-autoscaler/ticketops-dev=owned`
- **Scale-up proven:** 30 test pods → cluster scaled 2→4 nodes (new node NotReady→Ready observed)
- **Scale-down proven:** After pod deletion → 4→3→2 nodes over ~15 minute cooldown

---

## Disaster Recovery

### Velero Setup

- **Version:** v7.2.1 (Helm, managed by ArgoCD)
- **Plugin:** velero-plugin-for-aws
- **S3 Bucket:** `ticketops-dev-velero-backups` (versioning enabled, AES256 encryption, public access blocked)
- **IAM role:** `ticketops-dev-velero-role` (IRSA — S3 + EC2 snapshot permissions)

### Backup Schedule

- **Daily backup:** `ticketops-daily` — runs at 2:00 AM every day
- **Retention:** 7 days (168h TTL)
- **Manual backup:** `ticketops-backup` — 574 resources backed up to S3, completed in 3 seconds

### Recovery Procedure

```bash
# List available backups
velero backup get

# Restore from backup
velero restore create --from-backup ticketops-backup

# Monitor restore
velero restore describe <restore-name>
```

---

## Secrets Management

### Architecture

```
AWS Secrets Manager
  ticketops-dev-db-password     ← rotated every 30 days by Lambda
  ticketops-dev-db-username
  ticketops-dev-redis-host
  ticketops-dev-jwt-secret
  ticketops-dev-admin-password
  ticketops-dev-alertmanager-slack
         │
         │  ExternalSecrets Operator (IRSA, refreshInterval: 1h)
         │  property extraction for JSON secrets (e.g. db-password.password)
         ▼
Kubernetes Secrets
  db-credentials         (username, password, host)
  redis-credentials      (host)
  admin-api-secrets      (jwt_secret, admin_password, etc.)
  alertmanager-slack-secret
         │
         │  secretKeyRef in pod spec
         ▼
Application Pods
```

### Automatic Password Rotation (30-day)

Lambda function: `ticketops-dev-postgres-rotation` (AWS SAR)

Four-step rotation process:
1. **createSecret** — generate new password, store as `AWSPENDING`
2. **setSecret** — SSL connect to RDS, run `ALTER USER ticketops_admin PASSWORD '...'`
3. **testSecret** — verify new credentials authenticate successfully
4. **finishSecret** — promote `AWSPENDING` → `AWSCURRENT`, old becomes `AWSPREVIOUS`

ExternalSecret `property: password` field extracts only the password from the JSON secret format required by Lambda.

---

## Load Testing

**Tool:** k6  
**Results:** `docs/load-test-results/`  
**Seeded data:** 150 events × 100 seats = 15,000 seats

### Test Results

| Scenario | VUs | Duration | Total Requests | Bookings | Peak RPS | p95 Latency | Error Rate | HPA |
|---|---|---|---|---|---|---|---|---|
| Baseline | 100 | 5m | 25,632 | 598 | ~85 req/s | 1.47s | 0% | No scaling |
| Stress | 500 | 5m | 96,999 | 1,731 | 201 req/s | ~2.1s | <1% | 2→7 pods |

**Grafana observations during 500 VU test:**
- Request Rate: 250 req/s peak
- Booking Rate: 6/s
- Seats Held: 17 concurrent
- Heap Memory: climbing (memory pressure visible)
- Event Loop Lag: 300ms (approaching alert threshold)
- HPA: events-api CPU 122% → scaled 2→4→7 pods within ~3 minutes

**Key finding:** Redis SETNX seat locking prevented any double-booking across all 96,999 concurrent requests.

---

## Repository Structure

```
ticketops-platform/
├── apps/
│   ├── events-api/                  # Node.js — Express, prom-client v15, ioredis, pg
│   │   └── src/
│   │       ├── config/redis.js       # Redis connection (REDIS_HOST env)
│   │       ├── config/metrics.js     # Prometheus metrics setup
│   │       └── controllers/          # events.controller, bookings.controller
│   ├── admin-api/                   # Node.js — Express, JWT auth
│   ├── dashboard/                   # React + Vite (nginx-unprivileged)
│   └── bookings-worker/             # Node.js — async booking worker
├── terraform/
│   ├── modules/                     # 10 reusable Terraform modules
│   └── envs/dev/                    # Dev environment
├── docs/
│   ├── load-test-results/           # k6 HTML reports + HPA screenshots
│   └── runbook/                     # Incident response runbook
└── .github/
    └── workflows/
        └── ci.yml                   # Full CI/CD pipeline (semantic release + build + sign + gitops)
```

---

## Deployment

### Prerequisites

```bash
# Required tools
aws-cli, terraform, kubectl, argocd-cli, k6, cosign, velero

# Connect to cluster
aws eks update-kubeconfig --name ticketops-dev --region ap-south-1

# Port-forward ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Login ArgoCD
argocd login localhost:8080 --username admin --insecure
```

### Deploy Infrastructure

```bash
cd terraform/envs/dev
terraform init
export TF_VAR_slack_webhook_url="https://hooks.slack.com/..."
terraform apply
```

### Deploy Application

```bash
# Sync all apps from gitops
argocd app sync root-app

# Watch blue-green rollout
kubectl argo rollouts get rollout events-api -n ticketops -w

# Test preview service before promoting
kubectl port-forward svc/events-api-preview -n ticketops 8888:80
curl http://localhost:8888/api/events

# Promote after verification
kubectl argo rollouts promote events-api -n ticketops
```

### Trigger New Release

```bash
# Conventional commit → semantic release → CI builds → gitops PR → merge → ArgoCD deploys
git commit -m "feat: add event filtering by category"
git push origin main
```

---

## Runbook

See [docs/runbook/incident-response.md](docs/runbook/incident-response.md) for procedures covering:

- High error rate response
- Pod CrashLoopBackOff debugging
- Database connection failure (PgBouncer)
- HPA not scaling investigation
- ArgoCD sync failure resolution
- Blue-Green rollback procedure
- Secrets rotation failure recovery
- Cluster Autoscaler not triggering
- Velero backup/restore procedures

---

## Author

**Suraj Pai**
GitHub: [@Suraj8853](https://github.com/Suraj8853)
