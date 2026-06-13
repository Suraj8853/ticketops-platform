# ADR-009: Redis SETNX for seat locking over database-level locking

**Status:** Accepted  
**Date:** June 2026

## The problem

Flash sale scenario: 500 concurrent users trying to book the same seats. Without locking, two users can see the same seat as available, both proceed to payment, both succeed — now you've sold the same seat twice.

## Options

**Pessimistic DB locking** — `SELECT FOR UPDATE` in PostgreSQL. Locks the row until the transaction commits. Works but creates a bottleneck — every booking request waits on the database. Under 500 VU load this becomes a queue at the DB level.

**Optimistic DB locking** — check-then-update with a version field. Two concurrent requests both read version=1, both try to update, one wins, one gets a conflict and retries. Better throughput but complex retry logic and still hits the DB.

**Redis SETNX** — atomic set-if-not-exists. First request to call `SETNX seat:event_id:seat_code userId` wins. Returns 1 if set, 0 if already locked. Happens in memory, sub-millisecond. Second request gets 0 immediately and can show "seat taken" to the user without touching the database at all.

## What we chose

Redis SETNX with a TTL. Lock is held for 10 minutes — enough time to complete payment. If the user abandons checkout, the lock expires automatically.

The seat-lock-expiry CronJob runs every minute and explicitly clears locks where the TTL has passed and no booking was completed. Belt and suspenders.

## Proven at load

500 VU k6 test, 96,999 requests, 1,731 bookings. Zero double bookings. Redis handled the concurrent locking without breaking a sweat — it's literally designed for this pattern.

## Trade-offs

Redis becomes a critical dependency. If ElastiCache goes down, seat locking breaks. Acceptable for this architecture — ElastiCache is a managed service with automatic failover. A more robust approach would be to fall back to DB-level locking if Redis is unavailable, but that's over-engineering for this project.
