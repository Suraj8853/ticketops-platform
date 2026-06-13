# ADR-001: PgBouncer in front of RDS

**Status:** Accepted  
**Date:** June 2026

## What and why

RDS PostgreSQL has a hard connection limit based on instance size. On a db.t3.micro it's around 85 connections. With 4 microservices each running 2+ pods, and each pod opening its own connection pool, you burn through that limit fast — especially during HPA scale events when you suddenly go from 2 to 7 events-api pods.

Each Node.js pod was creating its own pg connection pool. At 500 VU load test, events-api scaled to 7 pods. If each pod holds 5 connections that's 35 connections just from events-api. Add admin-api, bookings-worker, db-migrate jobs — you're near the limit before anything goes wrong.

PgBouncer sits between the apps and RDS. All pods connect to pgbouncer-service:5432. PgBouncer maintains a small pool to RDS. Transaction pooling mode means a connection is only held for the duration of a single transaction, then returned to the pool. So 1000 client connections from apps can share 20 actual RDS connections.

## What we chose

`edoburu/pgbouncer` deployed as a Kubernetes Deployment with 2 replicas. Transaction pool mode, max_client_conn=1000, default_pool_size=20.

Originally used `public.ecr.aws/bitnami/pgbouncer:1.21.0` but Bitnami removed old tags from their registry. Switched to edoburu which is actively maintained and available on Docker Hub.

## What we didn't choose

**Direct RDS connection from each pod** — works fine at small scale, hits connection limits under load.

**RDS Proxy** — AWS managed connection pooler, would have worked but costs extra and adds another managed dependency. PgBouncer gives us more control and is free.

## Trade-offs

PgBouncer is another component to maintain. If it goes down, everything goes down. That's why we run 2 replicas. The password rotation issue (SASL auth failure after Lambda rotated the RDS password) was a real operational pain — pods need to restart to pick up new credentials from ExternalSecrets. Something to automate properly in a future iteration.
