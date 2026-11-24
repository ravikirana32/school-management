# P130 Delivery Report

P130 adds a controlled historical transaction migration foundation on top of P129.

### APIs
- `POST /accounting/historical-imports` — create a DRAFT batch with source rows.
- `GET /accounting/historical-imports` — list batches and student evidence.
- `GET /accounting/historical-imports/reconciliation` — student/currency totals for approved or posted staging rows.
- `POST /accounting/historical-imports/:batchId/approve` — independent approval with reason.
- `POST /accounting/historical-imports/:batchId/post` — post each source row as an immutable journal.

### Journal mapping
- CHARGE: DR 1100 Accounts Receivable / CR 4000 School Fee Revenue.
- PAYMENT: DR 1110 Cash / Bank Clearing / CR 1100 Accounts Receivable.
- REFUND: DR 1100 Accounts Receivable / CR 1110 Cash / Bank Clearing.

Refund requires a source settlement reference. Source type/reference pairs are unique across all batches for a school; each row has its own journal source key, and the batch posting is a single transaction. The historical student/currency control formula is charges − payments + refunds.

### Verification boundaries
Static source verification and TypeScript syntax diagnostics are recorded in `P130-TEST-REPORT.md`. No PostgreSQL migration, Prisma client generation, runtime API, production build or deferred test suite was run.
