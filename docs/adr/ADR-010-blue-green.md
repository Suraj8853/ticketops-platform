# ADR-002: Blue-Green over Canary for events-api

**Status:** Accepted  
**Date:** June 2026

## Background

Started with canary — ran 3 successful deployments with weight steps 20% → 40% → 60% → 100% with 2 minute pauses. Worked fine. Switched to blue-green on mentor requirement to demonstrate both strategies.

## Why blue-green makes sense for events-api

events-api is the public-facing service that handles seat availability and booking. It's the most critical service — if it's broken, users can't book. With canary you're sending a percentage of real users to potentially broken code. With blue-green, the new version gets zero production traffic until you manually promote it. You test against the preview service first, then flip the switch.

For a ticketing platform this matters. A broken booking flow during a flash sale would be a disaster. Better to hold traffic on the old version while you verify the new one works.

## How it works

Argo Rollouts creates a GREEN ReplicaSet pointing to a preview service. BLUE keeps serving 100% traffic. We test GREEN via port-forward to the preview service. When we're happy, we run `kubectl argo rollouts promote events-api -n ticketops`. Traffic switches instantly. BLUE scales down after 30 seconds.

`autoPromotionEnabled: false` — the pause is intentional. Manual gate before production traffic switches.

## ArgoCD gotcha

ArgoCD kept fighting with Argo Rollouts during the blue-green pause. The live state (paused, 4 pods running) didn't match the gitops spec (2 pods desired). Fixed with `argocd.argoproj.io/compare-options: IgnoreExtraneous` annotation on the Rollout.

## Trade-offs

Blue-green uses double the pods during the transition window (4 pods instead of 2). Costs more briefly. Worth it for zero-risk promotion.
