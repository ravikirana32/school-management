# P547 Delivery Report — Vendor Procurement, Receiving, Lots & Expiry

## Implemented
- School-scoped canteen supplier directory (create/list) with tenant-bound supplier-to-PO relation.
- Purchase orders with order number, expected date, notes, one or more stock lines, quantities, unit cost and status.
- Partial receiving against an order line with over-receipt protection and received/outstanding quantity tracking.
- Each receipt creates a traceable stock lot (lot/batch code, supplier name, received/remaining quantities, unit, optional expiry, notes) and updates stock balance plus ledger atomically within the tenant transaction.
- PO transitions to `PARTIALLY_RECEIVED` or `RECEIVED` as line quantities reach their ordered values.
- Stock-lot query supports all, expired, and expiring-within-30-days filters.
- School Admin UI panel for supplier creation, PO creation, partial receiving, and lot/expiry visibility.

## API
- `GET/POST /canteen/suppliers`
- `GET/POST /canteen/purchase-orders`
- `POST /canteen/purchase-orders/:orderId/receive`
- `GET /canteen/stock/lots?filter=all|expired|expiring`

## Known open gaps
- Lots are not consumed/relieved during recipe production; stock quantity and lot balances are not reconciled yet.
- FEFO (first-expiry-first-out), expiry warnings/notifications and quarantine/disposal workflows are not yet enforced.
- Purchase order edit, cancellation, approval, vendor pricing history, invoice matching and payment settlement are not included.
- Stock item relationship on PO lines is validated in scoped API logic but lacks a dedicated Prisma FK; DB migration and Prisma validation remain unexecuted.
- Existing stock has no lot backfill.
- Full runtime/database/browser/mobile/E2E acceptance remains pending.
