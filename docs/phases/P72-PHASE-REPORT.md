# P72 — Payment Webhook Replay Integrity

## Delivered
- SHA-256 raw-payload replay classification for payment provider events.
- Same-payload retry and duplicate semantics.
- HTTP 409 for payload mismatch, including concurrent insert race recovery.
- Unit-test source and static verifier.

## Not delivered
- Provider adapter, payment status normalization, invoice settlement, refund/chargeback reconciliation, GST invoice generation or payment sandbox acceptance.

## Acceptance
Run Vitest and PostgreSQL concurrent duplicate tests, then implement the selected provider's signed event mapping and verify payment attempt/invoice transitions atomically in sandbox.
