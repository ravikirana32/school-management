# P128 — Accounting Reports, Reconciliation and Financial Workflows

Status: Source implementation complete; runtime/database acceptance pending.

## Implemented
- Account-wise general ledger endpoint with date filtering, optional account filtering and bounded result size.
- Student-level fee outstanding aggregation by currency.
- Daily collections and settled-refund summaries, bounded to 366 days and 10,000 records per source query.
- Internal cash/bank clearing comparison between posted clearing journals and recorded payments less settled refunds.
- Append-only journal reversal endpoint that posts opposite-sided lines into the current open period, requires a dedicated permission, records a reason and audit event, and is idempotent by original journal ID.
- New `accounting.reconcile` and `accounting.reverse` permissions. Finance Officer receives reconciliation access but not reversal access; School Admin receives the full permission catalogue.
- School Admin Accounting & Finance workspace for reports and authorized reversal action.

## Explicit limitations
- Clearing comparison is an internal source-to-ledger check, not bank-statement reconciliation.
- No bank/provider statement import, payout matching, external money movement, tax/credit-note handling or statutory accounting certification.
- General-ledger report uses bounded result retrieval; it does not yet implement cursor pagination.

## Current gap register snapshot (audited from P128 cumulative archive)

- Unique status-tagged IDs: 587
- OPEN: 286
- PARTIALLY_IMPLEMENTED: 112
- READY_FOR_VERIFICATION: 175
- BLOCKED_EXTERNAL: 14
- IN_PROGRESS: 0
- CLOSED: 0

A later archive audit found the earlier 784-ID figure and 197 legacy-ID assertion were not supported by the actual master register table. The P128 cumulative archive contains 587 unique gap rows with explicit statuses.

## Gap handling
- Updated P127-G001 and P127-G003 descriptions.
- Added P128-G001 through P128-G003.
- No gaps closed because database/runtime evidence is not available.
- Root and docs master gap registers and resolved-gap histories are mirrored.

## Deferred validation
Per project instruction, unit/API/browser/mobile test creation and execution remain deferred. Prisma validation, migration execution, semantic typechecking, production build and runtime acceptance are not claimed.
