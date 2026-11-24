# P575 Next-Phase Tasks — Tenant Isolation & Authorization (C2-11)

**Baseline:** P574 cumulative. **P575 status:** source hardening delivered; runtime acceptance blocked. **Next phase:** P576 — Financial and Notification Provider E2E.

## Entry gates (must not be bypassed)
1. Restore registry-enabled or approved mirrored pnpm 9.15.0 and generate the authentic `pnpm-lock.yaml`.
2. Pass `pnpm install --frozen-lockfile` across all 14 packages.
3. Run Prisma format/validate/client generation and resolve schema/client drift.
4. Run clean and upgraded PostgreSQL migrations and inspect schema drift; use restricted API role separate from migration owner.
5. Pass all workspace semantic typechecks/builds and complete static verifier suite.
6. Run P575 PostgreSQL catalog SQL and cross-tenant negative API tests under non-owner, non-superuser, NOBYPASSRLS role.

## P576 workstream
1. Integrate payment gateway sandbox for fee invoice payments and hostel deposits/refunds; verify signed webhook signatures, timestamps, replay windows and idempotency.
2. Reconcile payment intents, provider events, internal payment ledger, refund ledger and accounting journal; test duplicate/out-of-order callbacks, partial refunds, chargebacks and failed settlement.
3. Execute email provider E2E for delivery, bounce, complaint, suppression, retry and dead-letter flows using verified webhook callbacks.
4. Add SMS/push provider integration only with approved provider credentials, verified recipient/device state, explicit consent and channel preference enforcement.
5. Verify notification outbox idempotency, tenant context and provider worker least privilege; prevent cross-school recipient leakage.
6. Add finance/parent/admin UI end-to-end journeys and audit logs for payment/refund/notification state transitions.
7. Run PostgreSQL-backed integration tests, restricted-role RLS tests, provider sandbox E2E, webhook replay/forgery negatives and concurrency/load tests.
8. Keep all payment/provider gaps OPEN until observed provider callbacks and balanced reconciliation evidence are archived.
9. Update root/docs/docs/phases gap-register mirrors and cycle progress; deliver phase-only and cumulative ZIPs with manifests, SHA-256 and CRC verification.

**Exit criteria:** P573/P574/P575 runtime gates pass first; sandbox payments/refunds and notification providers have reproducible signed-callback evidence; internal ledgers reconcile; all cross-tenant negative tests pass. If prerequisites remain unavailable, P576 may deliver static adapters/contracts but must remain BLOCKED for provider acceptance.
