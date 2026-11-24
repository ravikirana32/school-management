# P137 Status — Historical Allocation Coverage Preview

**Status:** School Admin source implementation complete; live tenant-data and runtime verification pending.

## Completed work
- Added a Finance workspace allocation-coverage summary grouped by immutable historical source row.
- Totals allocation amounts using integer minor units to avoid floating-point currency aggregation.
- Displays allocated amount, source amount, remaining amount, allocation count, and one of FULLY_ALLOCATED, PARTIALLY_ALLOCATED or OVER_ALLOCATED.
- Updated the UI explanation to distinguish the P136 persistence foundation from actual operational materialization.
- Updated root and docs master gap registers identically; carried forward all prior unresolved gaps.

## Limitations
- This is a review preview, not an operationalizer. Split payment/refund materialization remains open.
- Allocation endpoint currently returns at most 1,000 rows; pagination is not added in P137.
- Multi-batch execution remains advisory.
- No unit/API/browser/mobile test creation or execution; runtime database verification remains pending.

## Gap changes
- P134-G003 remains PARTIALLY_IMPLEMENTED, consistent with P136.
- P137-G001 PARTIALLY_IMPLEMENTED.
- P137-G002 OPEN.
- P137-G003 OPEN.
- No gaps closed.
