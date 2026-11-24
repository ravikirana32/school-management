# P141 Status — Searchable Refund Payment-Slice Selection

**Status:** Source implementation delivered; PostgreSQL/runtime verification pending.

## Delivered
- Added a tenant-scoped API lookup for operational payment slices linked to a selected posted historical PAYMENT row.
- Added search across payment ID, reference and method, with a bounded result set.
- Returned paid amount, active refund amount, available refundable balance and AVAILABLE/PARTIALLY_REFUNDED/FULLY_REFUNDED state for each slice.
- Refund balance calculation includes REQUESTED, APPROVED_PENDING_SETTLEMENT and SETTLED refunds, matching the existing refund-cap policy.
- Replaced manual operational payment ID entry in School Admin Finance with searchable slice selection and balance visibility; a sole linked slice is auto-selected, while multi-slice targets require explicit selection.
- Updated root and docs master gap registers identically.

## Gap changes
- P140-G001 remains PARTIALLY_IMPLEMENTED; searchable selection and balance preview are now delivered, but database/runtime evidence remains outstanding.
- Added P141-G001 as PARTIALLY_IMPLEMENTED pending authorization, tenant-isolation, balance and runtime verification.
- No gaps closed.

## Test policy
Unit, API, browser and mobile test creation/execution remain deferred per project instruction. No runtime PostgreSQL acceptance is claimed.
