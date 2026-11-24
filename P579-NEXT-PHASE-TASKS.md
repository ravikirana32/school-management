# P579 Next-Phase Tasks — Independent Review & C2-11 Closure

**Baseline:** P578 cumulative. P579 is the final planned C2-11 phase.

## Entry / dependency gates
1. Resolve the authentic pnpm 9.15.0 lockfile and frozen install.
2. Complete Prisma validate/generate and clean/upgraded PostgreSQL migration acceptance.
3. Complete semantic typechecks and production builds for all 14 packages/apps.
4. Complete P575 restricted-role RLS, cross-tenant and connection-pool runtime tests.
5. Complete P576 provider/payment/notification E2E.
6. Complete P577 browser/mobile/offline/WCAG and assistive-technology acceptance.
7. Complete P578 load/soak, outage/failover, backup/restore/PITR and measured RPO/RTO.
8. Obtain independent security, privacy, safeguarding, accessibility and operational reviews.

## P579 workstream
- Re-run full static verifier suite and all focused phase verifiers; publish complete machine-readable results.
- Reconcile every master register item by evidence: close only with reproducible implementation and verification, otherwise retain OPEN/DEFERRED with owner and next action.
- Validate identical root/docs/docs-phases master registers and C2-11 roadmap/progress mirrors.
- Produce release-blocker register, risk acceptance log, data-processing/privacy/legal review record, SBOM/dependency and secrets review evidence.
- Produce go/no-go decision with explicit scope, residual risks, deployment/rollback plan, support ownership and post-release monitoring.
- Generate final cumulative ZIP, phase ZIP, SHA-256 sidecars, manifests, CRC/deep verification and release report.

**Exit criteria:** all mandatory gates pass or are explicitly accepted by authorized stakeholders with documented residual risk. If any critical security, data integrity, backup/restore, tenant isolation or build gate remains unverified, P579 must record NO-GO and leave the gap open.
