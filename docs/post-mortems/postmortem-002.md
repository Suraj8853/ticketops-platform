# Post-Mortem: Kyverno Blocking All Pod Creation

**Date:** 12 June 2026  
**Duration:** ~1 hour  
**Severity:** High  
**Status:** Resolved

---

## What broke

After switching Kyverno policies from Audit to Enforce mode, no new pods could be created anywhere in the cluster. Not just non-compliant pods — fully compliant pods were getting rejected too. Every deployment, rollout, job was failing at admission.

---

## Timeline

**Phase 5** — Kyverno installed with a single admission controller replica. Policies deployed in Audit mode. All existing workloads fixed to be compliant — added securityContext, resource limits, version labels, explicit image tags. PolicyReport showed PASS:4 FAIL:0. Switched to Enforce.

**Shortly after** — Pod creation starts failing. Error from admission webhook. But the pods are compliant — they have everything the policies require.

**First theory** — Something wrong with the policies themselves. Checked policy definitions — looked fine. Tried deploying a simple pod with all requirements met — still rejected.

**Second theory** — Webhook issue. Checked Kyverno admission controller logs. Found timeouts. With a single replica, when the pod was busy or slow the webhook calls were timing out. Default `failurePolicy` is `Fail` — timeout = rejection, regardless of whether the pod is compliant.

**The reverted patches problem** — Tried to patch the webhook to set `failurePolicy: Ignore`. It worked for about 10 seconds. Then Kyverno reverted it. Tried again. Reverted again. `features.autoUpdateWebhooks.enabled=true` is the default — Kyverno continuously rewrites its own webhook configuration. Every manual fix was being undone silently.

**Image signature verification issue** — The `verify-image-signature` ClusterPolicy was also failing because Kyverno pods couldn't reach ECR. They're in private subnets. ECR is a public endpoint. Without VPC endpoints, Kyverno had to go through NAT Gateway to verify signatures, which was adding latency and sometimes failing entirely.

**Fix applied** — All of this needed to be fixed together:
- 3 replicas instead of 1
- `autoUpdateWebhooks: false`
- `failurePolicy: Ignore` on all webhooks
- `timeoutSeconds: 30`
- Kyverno IRSA role with ECR read permissions
- VPC endpoints for ECR (api + dkr + s3)
- Service account annotated with IRSA role ARN

After applying everything — pod creation works, signature verification works, policies enforcing correctly.

---

## What actually caused it

**Single replica + failurePolicy:Fail**

This is the core problem. One Kyverno pod handling all admission webhook calls. When it was slow — processing multiple requests, GC pause, whatever — the webhook timed out. `failurePolicy: Fail` means a timeout is treated as a denial. So compliant pods got rejected not because they violated a policy but because Kyverno was slow to respond.

**autoUpdateWebhooks silently reverting fixes**

This made it impossible to fix the webhook settings manually. Every patch was reverted within seconds. Spent time wondering why fixes weren't sticking before figuring out Kyverno was undoing them.

**No network path to ECR for signature verification**

`verify-image-signature` policy needs to fetch signature data from ECR. Kyverno pods are in private subnets. Without VPC endpoints the call goes NAT → internet → ECR. This was adding latency to every image-related admission decision and sometimes failing outright.

---

## How we fixed it

**3 admission controller replicas:**
```yaml
admissionController:
  replicas: 3
```
No single point of failure. Load distributed across 3 pods.

**Disabled auto webhook updates:**
```yaml
features:
  autoUpdateWebhooks:
    enabled: false
```
Stops Kyverno reverting our webhook patches.

**failurePolicy: Ignore + longer timeout:**
```yaml
failurePolicy: Ignore
timeoutSeconds: 30
```
Webhook slow or down → pods allowed through. Not ideal from a pure security standpoint but vastly more reliable. The alternative (blocking all pod creation when Kyverno hiccups) is worse.

**Kyverno IRSA role:**
Created `ticketops-dev-kyverno-ecr` IAM role with ECR read permissions (GetAuthorizationToken, BatchCheckLayerAvailability, GetDownloadUrlForLayer, BatchGetImage, DescribeImages). IRSA trust scoped to the kyverno-admission-controller service account in the kyverno namespace.

**VPC Endpoints for ECR:**
Three new endpoints: `ecr.api` (Interface), `ecr.dkr` (Interface), `s3` (Gateway). Kyverno now verifies signatures within the VPC. Also faster and cheaper ECR pulls for everything else in the cluster.

**Service account annotation:**
```yaml
annotations:
  eks.amazonaws.com/role-arn: arn:aws:iam::599476212737:role/ticketops-dev-kyverno-ecr
```

---

## What we should do differently

**Install Kyverno with 3 replicas from day one.** Single replica + failurePolicy:Fail should never be used in any environment where you care about availability. The Helm values should have replicas:3 before you install.

**Set autoUpdateWebhooks:false from day one.** This feature is useful in theory. In practice it makes debugging impossible because your changes keep disappearing. Manage webhook config yourself.

**Set failurePolicy:Ignore and a longer timeout from day one.** Start permissive, prove everything works, then decide if you want to tighten it. Don't start strict and find out the hard way during setup.

**Set up VPC endpoints before enabling image verification policy.** The network path needs to exist before the policy that needs it. Should have been: VPC endpoints → IRSA role → verify-image-signature policy. Did it in reverse.

---

## One thing that went well

Existing pods kept serving traffic the whole time. Admission webhooks only run on new pod creation — running pods are unaffected. So users weren't impacted even though the cluster was frozen from an operational standpoint.

