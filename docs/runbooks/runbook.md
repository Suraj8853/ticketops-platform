# Incident Response Runbook — TicketOps Platform

This is the on-call runbook for the TicketOps platform. When something breaks at 2am, this is what you open.

---

## Quick reference

```bash
# Connect to cluster
aws eks update-kubeconfig --name ticketops-dev --region ap-south-1

# Check everything at once
kubectl get pods -n ticketops
kubectl get pods -n monitoring
kubectl get pods -n argocd

# Check events (usually tells you what's wrong)
kubectl get events -n ticketops --sort-by='.lastTimestamp' | tail -20

# Check HPA
kubectl get hpa -n ticketops

# Check rollout
kubectl argo rollouts get rollout events-api -n ticketops
```

---

## 1. High error rate (HighErrorRate alert firing)

**Symptom:** Slack alert — error rate > 1% for 5 minutes. Users getting 5xx errors.

**Step 1 — Check which pods are healthy:**
```bash
kubectl get pods -n ticketops
```
Look for CrashLoopBackOff, Error, OOMKilled, Pending.

**Step 2 — Check recent logs:**
```bash
kubectl logs -n ticketops deploy/events-api --tail=50
kubectl logs -n ticketops deploy/admin-api --tail=50
```

**Step 3 — Check if it's a DB issue:**
```bash
kubectl logs -n ticketops $(kubectl get pod -n ticketops -l app=pgbouncer -o jsonpath='{.items[0].metadata.name}') --tail=30
```
If you see `SASL authentication failed` or `password authentication failed` — the DB password rotated and PgBouncer hasn't picked it up. See section 6.

**Step 4 — Check if it's Redis:**
```bash
kubectl exec -n ticketops deploy/events-api -- node -e "const r = require('ioredis'); const c = new r(process.env.REDIS_HOST); c.ping().then(console.log).catch(console.error)"
```

**Step 5 — Quick rollback if recent deployment caused it:**
```bash
kubectl argo rollouts undo events-api -n ticketops
```

---

## 2. Pod CrashLoopBackOff

**Symptom:** Pod keeps restarting. `kubectl get pods` shows restarts > 3.

**Step 1 — Get the logs from the crashed container:**
```bash
kubectl logs -n ticketops <pod-name> --previous
```
`--previous` gets logs from before the crash. Without it you get the current (restarting) container logs which may be empty.

**Step 2 — Describe the pod:**
```bash
kubectl describe pod -n ticketops <pod-name>
```
Look at Events section at the bottom. OOMKilled means memory limit too low. Exit code 1 usually means app crash — check logs. Exit code 137 = OOMKilled.

**Step 3 — Common causes:**

*OOMKilled:*
```bash
# Check current limits
kubectl get pod <pod-name> -n ticketops -o jsonpath='{.spec.containers[0].resources}'
# Temporarily increase if urgent (won't survive pod restart, fix in gitops)
kubectl set resources deployment/events-api -n ticketops --limits=memory=512Mi
```

*Bad environment variable / missing secret:*
```bash
kubectl exec -n ticketops <pod-name> -- env | grep DB
kubectl get secret db-credentials -n ticketops -o jsonpath='{.data.password}' | base64 -d
```

*Image pull issue:*
```bash
kubectl describe pod <pod-name> -n ticketops | grep -A5 "Failed"
# If ImagePullBackOff — check ECR, check IRSA on node role
```

---

## 3. Database connection failures

**Symptom:** `SASL authentication failed`, `connection refused`, `too many connections`.

**Check PgBouncer is running:**
```bash
kubectl get pods -n ticketops | grep pgbouncer
kubectl logs -n ticketops deploy/pgbouncer --tail=30
```

**Check the password in the secret matches what PgBouncer has:**
```bash
# What's in the K8s secret
kubectl get secret db-credentials -n ticketops -o jsonpath='{.data.password}' | base64 -d

# What PgBouncer is using
kubectl exec -n ticketops $(kubectl get pod -n ticketops -l app=pgbouncer -o jsonpath='{.items[0].metadata.name}') -- cat /opt/bitnami/pgbouncer/conf/userlist.txt
```

If they don't match — password rotated but PgBouncer hasn't restarted:
```bash
kubectl rollout restart deployment/pgbouncer -n ticketops
```

**Check ExternalSecret is syncing:**
```bash
kubectl get externalsecret db-credentials -n ticketops
kubectl describe externalsecret db-credentials -n ticketops | grep -A5 "Status"
# Force sync
kubectl annotate externalsecret db-credentials -n ticketops force-sync=$(date +%s) --overwrite
```

**Check RDS is reachable from the cluster:**
```bash
kubectl run pg-test --image=postgres:15 -n default --rm -it --restart=Never \
  --env="PGPASSWORD=<password>" -- \
  psql -h ticketops-dev-postgres.cpy6ycuuk00m.ap-south-1.rds.amazonaws.com \
  -U ticketops_admin -d ticketops -c "SELECT 1"
```

**Too many connections:**
```bash
# Check connection count via psql
kubectl run pg-test --image=postgres:15 -n default --rm -it --restart=Never \
  --env="PGPASSWORD=<password>" -- \
  psql -h ticketops-dev-postgres.cpy6ycuuk00m.ap-south-1.rds.amazonaws.com \
  -U ticketops_admin -d ticketops \
  -c "SELECT count(*) FROM pg_stat_activity;"
```
If near the limit (~85 for t3.micro) — PgBouncer might be leaking connections. Restart it.

---

## 4. HPA not scaling

**Symptom:** High CPU/load but pod count isn't increasing.

**Check HPA status:**
```bash
kubectl get hpa -n ticketops
kubectl describe hpa events-api-hpa -n ticketops
```
Look at `Conditions` — often says why it's not scaling.

**Check metrics-server is running:**
```bash
kubectl get pods -n kube-system | grep metrics-server
kubectl top pods -n ticketops
```
If `kubectl top` fails — metrics-server is down. Reinstall it.

**Check HPA is targeting the right resource:**
The events-api HPA targets the Rollout, not a Deployment:
```bash
kubectl get hpa events-api-hpa -n ticketops -o yaml | grep scaleTargetRef -A4
```
Should show `kind: Rollout`. If it shows `kind: Deployment` — it won't work.

**Check if node has capacity:**
```bash
kubectl describe nodes | grep -A5 "Allocated resources"
```
If node is full, Cluster Autoscaler should add a node. Check CA logs:
```bash
kubectl logs -n kube-system -l app=cluster-autoscaler --tail=30
```

---

## 5. ArgoCD sync failure

**Symptom:** ArgoCD app shows OutOfSync or SyncFailed.

**Check what's out of sync:**
```bash
argocd app diff ticketops
```

**Check sync operation status:**
```bash
argocd app get ticketops
```

**If stuck in operation:**
```bash
kubectl patch application ticketops -n argocd --type merge -p '{"operation": null}'
```

**Force sync:**
```bash
argocd app sync ticketops --force
```

**Kyverno blocking:**
If sync fails with `admission webhook denied` — a manifest violates a Kyverno policy. Check which policy:
```bash
argocd app sync ticketops 2>&1 | grep "denied"
```
Fix the manifest in gitops repo, push, sync again.

**Image signature verification failing:**
If Kyverno blocks because image isn't signed — check Kyverno IRSA role has ECR permissions and VPC endpoints are up:
```bash
kubectl logs -n kyverno -l app=kyverno --tail=30 | grep -i "ecr\|signature\|verify"
```

---

## 6. Secrets rotation failure

**Symptom:** After rotation, apps get DB auth errors. Password mismatch between app and RDS.

**Check rotation status:**
```bash
aws secretsmanager describe-secret \
  --secret-id ticketops-dev-db-password \
  --region ap-south-1 \
  --query 'RotationLastRotatedDate'
```

**Check Lambda logs:**
```bash
aws logs tail /aws/lambda/ticketops-dev-postgres-rotation --region ap-south-1 --since 1h
```

**If rotation succeeded but pods haven't picked it up:**
```bash
# Force ExternalSecret to resync
kubectl annotate externalsecret db-credentials -n ticketops force-sync=$(date +%s) --overwrite

# Restart pods to pick up new secret
kubectl rollout restart deployment/pgbouncer -n ticketops
kubectl rollout restart deployment/admin-api -n ticketops
kubectl rollout restart deployment/bookings-worker -n ticketops
kubectl argo rollouts restart events-api -n ticketops
```

**If rotation failed mid-way (AWSPENDING but not AWSCURRENT):**
```bash
# Check secret versions
aws secretsmanager list-secret-version-ids \
  --secret-id ticketops-dev-db-password \
  --region ap-south-1

# Get current password
aws secretsmanager get-secret-value \
  --secret-id ticketops-dev-db-password \
  --region ap-south-1 \
  --query 'SecretString' \
  --output text | python3 -c "import sys,json; print(json.load(sys.stdin)['password'])"
```

---

## 7. Blue-Green rollback

**Symptom:** New version deployed, something is broken, need to roll back immediately.

**If still in preview (not yet promoted):**
Just abort — don't promote. The active service is still the old version:
```bash
kubectl argo rollouts abort events-api -n ticketops
```

**If already promoted and production is broken:**
```bash
# Roll back to previous revision
kubectl argo rollouts undo events-api -n ticketops

# Watch it switch back
kubectl argo rollouts get rollout events-api -n ticketops -w
```

**Check current revision:**
```bash
kubectl argo rollouts history rollout events-api -n ticketops
```

---

## 8. Cluster Autoscaler not adding nodes

**Symptom:** Pods stuck in Pending, cluster not scaling up.

**Check CA is running:**
```bash
kubectl get pods -n kube-system | grep cluster-autoscaler
```

**Check CA logs:**
```bash
kubectl logs -n kube-system -l app=cluster-autoscaler --tail=50 | grep -i "scale\|error\|node"
```

**Check ASG limits:**
```bash
aws autoscaling describe-auto-scaling-groups \
  --region ap-south-1 \
  --query 'AutoScalingGroups[?contains(Tags[?Key==`k8s.io/cluster-autoscaler/enabled`].Value, `true`)].{Min:MinSize,Max:MaxSize,Desired:DesiredCapacity}'
```
If Desired = Max (6) — hit the ceiling. Either increase max or wait for pods to free up.

**Check why pods are Pending:**
```bash
kubectl describe pod <pending-pod> -n ticketops | grep -A10 "Events"
```
Should say `0/2 nodes are available` — CA picks this up and adds a node.

---

## 9. Velero restore

**When to use:** Namespace accidentally deleted, database corruption, need to roll back to a known good state.

**List available backups:**
```bash
velero backup get
```

**Restore from backup:**
```bash
velero restore create --from-backup ticketops-backup --wait
```

**Check restore status:**
```bash
velero restore describe <restore-name>
velero restore logs <restore-name>
```

**Restore specific namespace only:**
```bash
velero restore create --from-backup ticketops-backup \
  --include-namespaces ticketops \
  --wait
```

---

## 10. General debugging commands

```bash
# All pods across all namespaces — quick health check
kubectl get pods -A | grep -v Running | grep -v Completed

# Recent events — often the first place to look
kubectl get events -n ticketops --sort-by='.lastTimestamp' | tail -30

# Resource usage
kubectl top pods -n ticketops
kubectl top nodes

# Check ingress
kubectl get ingress -n ticketops
kubectl describe ingress ticketops-ingress -n ticketops

# Check ExternalSecrets
kubectl get externalsecret -n ticketops
kubectl get externalsecret -n monitoring

# Check Kyverno policy reports
kubectl get policyreport -n ticketops

# Port-forward Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Port-forward ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Port-forward preview service (blue-green testing)
kubectl port-forward svc/events-api-preview -n ticketops 8888:80
```
