# Post-Mortem: DB Auth Failure After Secrets Rotation

**Date:** 13 June 2026  
**Duration:** ~2 hours  
**Severity:** High  
**Status:** Resolved

---

## What broke

Everything. Every API call to ticketops.apisuraj.click was returning this:

```json
{"error":"SASL authentication failed","request_id":"..."}
```

Triggered right after the first automated RDS password rotation ran.

---

## Timeline

**~15:00** — Lambda rotation fires. Secrets Manager gets the new password. Rotation itself worked fine.

**~15:05** — ExternalSecret syncs. But I hadn't added `property: password` to the ExternalSecret manifest. So instead of syncing just the password string, it synced the entire JSON blob that Lambda stores — `{"engine": "postgres", "username": "ticketops_admin", "password": "...", "host": "...", ...}`. That whole JSON string became the value of the `password` key in the Kubernetes secret.

**~15:10** — Events-api pods restart from a separate rollout. New pods pick up the JSON blob as DB_PASSWORD. PgBouncer is still running with the old plaintext password from before rotation. Neither side has a working password.

**~15:15** — SASL errors start. Platform down.

**~15:20** — Start debugging. First suspect is Redis because the error message said "SASL" and Redis also uses SASL. Checked Redis — fine. Then checked pod env vars:

```bash
kubectl exec -n ticketops events-api-966dc5bbf-fkpf8 -- env | grep DB
DB_PASSWORD={"engine": "postgres", "username": "ticketops_admin", ...}
```

That's when it clicked. The whole JSON was being used as the password.

**~15:35** — Fixed ExternalSecret — added `property: password`. Force synced. Secret now has just the password string. Restarted app pods. Still getting SASL errors.

**~15:50** — Realized PgBouncer pods hadn't restarted. PgBouncer builds its `userlist.txt` at startup from env vars. Old pods were still running with the old password cached. Tried to restart PgBouncer.

**~16:00** — `ImagePullBackOff`. `public.ecr.aws/bitnami/pgbouncer:1.21.0` doesn't exist anymore. Bitnami pulled their old tags from AWS public ECR. Old pods were running fine because the image was cached on the node — but any new pod trying to pull it fails.

**~16:10** — Tried `docker.io/bitnami/pgbouncer:1.21.0`. Also gone. Tried `bitnami/pgbouncer:latest`. Also gone. Bitnami moved everything behind a paid model.

**~16:20** — Tried switching to `pgbouncer/pgbouncer:1.23.1` (official image). Different env var format. Kyverno blocked `latest` tag. Wrong `runAsUser` — edoburu image uses UID 70, we had 1000. Wrong `AUTH_TYPE`. Multiple broken attempts.

**~16:40** — Found `edoburu/pgbouncer:v1.25.2-p0` on Docker Hub. Actively maintained, on Docker Hub, compatible env vars. Checked the UID the image runs as:

```bash
docker run --rm --entrypoint id edoburu/pgbouncer:v1.25.2-p0 postgres
uid=70(postgres) gid=70(postgres)
```

Updated deployment — image, runAsUser: 70, AUTH_TYPE: scram-sha-256. Synced via ArgoCD.

**~16:55** — New PgBouncer pods running. Password synced correctly. App pods reconnecting.

**~17:00** — Platform back up.

---

## What actually caused it

Two separate problems that hit at the same time.

**Problem 1 — ExternalSecret pulling full JSON instead of just the password**

Lambda rotation requires the secret to be in JSON format. I hadn't accounted for that when writing the ExternalSecret — it was pulling the whole JSON blob and dumping it as the password value. Fix was one line: `property: password`.

**Problem 2 — PgBouncer image no longer exists**

The image `public.ecr.aws/bitnami/pgbouncer:1.21.0` was fine when I set up the cluster a week ago. By the time rotation happened, Bitnami had removed old tags from all public registries. Old pods kept running because the image was cached on the node. The moment I tried to restart — new pod, cache miss, pull fails.

These two problems combined into a 2 hour incident. Problem 1 was the actual cause of the auth failure. Problem 2 turned a 2 minute fix (restart PgBouncer) into a 1.5 hour image hunt.

---

## How we fixed it

1. Added `property: password` to ExternalSecret — extracts just the password from the JSON secret
2. Force refreshed ExternalSecret to pick up change immediately
3. Switched PgBouncer to `edoburu/pgbouncer:v1.25.2-p0`
4. Fixed `runAsUser: 70` (edoburu's postgres UID — required by Kyverno disallow-root policy)
5. Set `AUTH_TYPE: scram-sha-256` (required for RDS)
6. Restarted all app pods to pick up new credentials from the synced secret

---

## What we should do differently

**Push PgBouncer image to our own ECR.** Never depend on a public registry image for something this critical. The image existed when I needed it. Then it didn't. Push it to ECR once and control it yourself.

**Test rotation before enabling it.** Do a manual rotation in a test environment, verify every component handles it — ExternalSecret extracts correctly, PgBouncer restarts cleanly, apps reconnect. Don't let the first rotation be a surprise in production.

**Document what needs to restart after rotation.** Order matters: ExternalSecret sync → PgBouncer restart → app pod restarts. Write it down before the incident, not after.

**Automate PgBouncer config reload.** Ideally PgBouncer should pick up the new password without a pod restart. A sidecar watching the K8s secret and sending HUP to PgBouncer when it changes would have made this a non-incident.

