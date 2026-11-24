# CHANGELOG P546

- Added CanteenStockLedger and composite tenant/school stock FK.
- Added optional ingredient linkage for stock items.
- Opening balances, receipts, adjustments and production consumption record ledger movements.
- Receipts and adjustments use atomic stock increments/conditional updates; negative balance adjustments are rejected.
- Recipe production consumption scales ingredient needs by yield; exact units must match; guarded decrements and ledger writes are transactional.
- Added ledger listing and current-stock reconciliation APIs.
- Admin UI added ingredient-linked stock creation, receipts, adjustments, production consumption, ledger and reconciliation displays.
- Added focused verifier and updated C2-10 progress/roadmap, reports and mirrored gap registers.
