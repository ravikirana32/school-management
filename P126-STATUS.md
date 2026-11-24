# P126 — Refund, Reversal and Payment Adjustment Foundation

**Status:** Source implementation complete; runtime/database acceptance pending.

## Delivered
- Added `StudentFeeRefund` and `StudentFeeRefundEvent` models.
- Added request, approve, reject, list and externally evidenced settlement endpoints.
- Added distinct request, approval and settlement permissions.
- Added a requester/approver separation rule.
- Added school-scoped idempotency, payment-level advisory locks, amount reservation and settlement reference uniqueness.
- Added append-only refund events, audit records, composite tenant foreign keys and forced RLS.
- Adjusted payment and fee-charge status after recorded settlement.

## Not delivered
- Actual payout/refund processing through a payment provider.
- Provider refund webhooks and settlement reconciliation.
- Credit notes and balanced accounting journals.

## Validation
- Static source verifier and TypeScript syntax transpilation only.
- Prisma validation, migration execution, semantic typecheck, build and runtime/API validation remain pending.
- Unit/API/browser/mobile test creation and execution remain deferred per project instruction.
