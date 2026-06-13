# ADR-010: Loki + Fluent Bit over CloudWatch Logs

**Status:** Accepted  
**Date:** June 2026

## The options

**CloudWatch Logs** — AWS native, zero setup if you enable EKS logging. But querying is painful, the UI is clunky, and it's expensive at scale (ingestion costs per GB). To correlate logs with metrics you're jumping between CloudWatch and Grafana.

**Loki + Fluent Bit** — Loki stores logs, Fluent Bit collects them from pods. Loki integrates directly into Grafana — same tool you're already using for metrics. LogQL is similar enough to PromQL that if you know one you can figure out the other quickly.

## What we chose

Loki via loki-stack Helm chart, Fluent Bit as DaemonSet. All services emit structured JSON logs with a `request_id` field. This means you can take a `request_id` from an error in events-api and trace the exact same request through pgbouncer logs, bookings-worker logs, everything — in a single Grafana query.

Single pane of glass: metrics in Prometheus, logs in Loki, both in Grafana. No jumping between tools.

## Structured logging

All services log JSON with consistent fields: level, message, service, timestamp, request_id. The request_id is generated at the ALB edge and passed through as a header. Every log line for a given user request has the same request_id. Makes debugging production issues significantly faster.

## Trade-offs

Loki is eventually consistent — there's a short delay between a log being emitted and appearing in Grafana. Not a problem for debugging after the fact. If you need real-time streaming logs, `kubectl logs -f` is still the answer.
