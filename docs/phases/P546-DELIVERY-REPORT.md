# P546 Delivery Report — Canteen Stock Ledger & Consumption

## Phase outcome
P546 source implementation complete. P545 cumulative baseline is preserved and extended with stock movement accounting, ingredient-stock links, receipts, reasoned adjustments, recipe-production consumption and stock reconciliation.

## Implementation details
- Added `CanteenStockLedger` with movement type, signed quantity delta, balance-after, unit, optional reference, reason, actor and timestamp; tenant/school scoped composite stock relation.
- Added optional ingredient link to canteen stock items.
- New stock opening balance creates an `OPENING` ledger entry.
- Receipts increment stock and write a `RECEIPT` entry transactionally.
- Adjustments require a nonzero delta and reason, reject negative balances, use conditional quantity updates for concurrent changes, and record `ADJUSTMENT` entries.
- Recipe production consumption scales ingredient quantities by recipe yield and requested production, requires linked ingredient stock and exact unit matching, checks availability, performs conditional atomic decrements, and writes `CONSUMPTION` entries in a transaction.
- Added ledger listing and current-stock-versus-ledger reconciliation APIs.
- Admin UI supports ingredient-linked stock creation, receipts, reasoned adjustments, recipe production consumption, recent ledger display and reconciliation discrepancy visibility.

## APIs
- `GET /canteen/stock/ledger`
- `GET /canteen/stock/reconciliation`
- `POST /canteen/stock/:stockId/receipts`
- `POST /canteen/stock/:stockId/adjustments`
- `POST /canteen/recipes/:recipeId/consume`

## Remaining gaps
- Legacy stock balances are not automatically backfilled into historical ledger movements; reconciliation exposes these discrepancies.
- Unit conversion is not implemented; exact unit equality is required.
- Production consumption is manually triggered, not automatically connected to meal serving/order production or wastage.
- Runtime migration/database, full build and device/E2E acceptance remain pending.

## Files
- Migration: `20261123190000_p546_canteen_stock_ledger`
- Verifier: `scripts/verify-p546-canteen-stock-ledger.mjs`
- Updated C2-10 roadmap/progress and synchronized gap registers.
