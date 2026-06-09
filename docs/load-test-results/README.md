# TicketOps Load Test Results

## Test Environment
- Tool: k6
- Cluster: AWS EKS (t3.large nodes)
- Region: ap-south-1 (Mumbai)
- Services: events-api (2-10 pods), admin-api (2-5 pods)

---

## Test 1 — Load Test (100 Virtual Users)

### Configuration
- Peak VUs: 100
- Duration: 8 minutes
- Stages: 0 → 10 → 50 → 100 → 0

### Results
- Peak throughput: ~53 req/s
- Total requests: 25,632
- Successful bookings: 598
- HPA scaling: No scaling triggered (CPU stayed below 70%)
- P95 latency: 1.47s
- Error rate: High (seats exhausted for events 1-6)

### Key Observations
- System handled 100 users without scaling
- Seat locking via Redis worked correctly under concurrent load
- No double bookings observed

---

## Test 2 — Stress Test (500 Virtual Users)

### Configuration
- Peak VUs: 500
- Duration: 8 minutes
- Stages: 0 → 50 → 200 → 500 → 0

### Results
- Peak throughput: 201 req/s
- Total requests: 96,999
- Successful bookings: 1,731
- HPA scaling: **2 → 4 → 7 pods** (events-api)
- Peak CPU: 122% (above 70% threshold)
- P95 latency: 2.23s
- Booking Rate: peaked at 6 bookings/second
- Seats held in Redis: peaked at 17 concurrent locks
- Event loop lag: peaked at 300ms

### Key Observations
- HPA auto-scaled events-api from 2 to 7 pods within ~60 seconds
- CPU hit 122% before scaling kicked in causing initial error spike
- System self-healed after HPA scaling completed
- Error budget consumed during stress test (expected — beyond normal capacity)
- For production flash sales: pre-scale to 8 pods 5 minutes before event

---

## SLO Summary

| Metric | Target | 100 Users | 500 Users |
|--------|--------|-----------|-----------|
| Error Rate | < 1% | ~0% (5xx) | High (pre-scale) |
| P95 Latency | < 2s | 1.47s ✅ | 2.23s ❌ |
| HPA Scaling | Auto | Not needed | 2→7 pods ✅ |

---

## Recommendations
1. Pre-scale events-api to 8 pods 5 minutes before flash sales
2. Increase RDS connection pool via PgBouncer for high concurrency
3. Consider KEDA cron-based scaling for scheduled events
