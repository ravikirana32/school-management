# P579 Deployment & Rollback Plan (Pre-release template)

## Preconditions (all mandatory)
- GO decision signed by release authority after all critical blockers are closed or explicitly accepted under policy.
- Frozen dependency install, SBOM/vulnerability/license review, all 14 package builds and CI checks pass.
- Prisma migration dry-run and backward-compatibility review pass; verified backup and restore point available.
- Production secrets are in approved secret storage and rotated; least-privilege access reviewed.
- RLS/cross-tenant, payment reconciliation, browser/mobile, accessibility, load and DR gates pass.
- Change owner, incident commander, database owner, security contact and support/on-call roster confirmed.

## Deployment sequence
1. Announce change window; freeze unrelated schema/config changes; verify dashboards and alert routing.
2. Capture encrypted pre-deployment backup and validate restore point.
3. Deploy backward-compatible database migrations first; verify migration ledger and health.
4. Deploy API/workers, then web applications; mobile release only after API compatibility confirmation.
5. Run smoke tests for auth, tenant boundary, student/parent/teacher, attendance, finance, notifications and health.
6. Monitor error rate, latency, queue lag, DB pool, webhook failures and security alerts through the approved observation window.

## Rollback triggers and procedure
Trigger rollback for tenant isolation/security incident, data integrity/ledger mismatch, migration failure, sustained error/SLO breach, severe queue backlog or unrecoverable dependency failure. Stop traffic/worker intake, preserve audit/incident evidence, roll back application artifacts only when schema compatibility is proven, otherwise execute the approved forward-fix/restore plan. Do not reverse destructive migrations blindly. Restore only from a tested backup/PITR procedure with incident commander and data owner approval. Reconcile payments/events and notify affected schools under approved incident policy.

## Current status
This plan is not rehearsed. No deployment target, change window, named owners or tested rollback evidence is available. P579-G007 and P579-G008 remain OPEN.
