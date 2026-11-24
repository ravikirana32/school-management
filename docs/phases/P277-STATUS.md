# P277 Status — Fee Collection

Implemented source coverage:
- Finance workspace now offers manual payment recording for published, partially paid and overdue charges with a positive outstanding balance.
- Collect-payment form includes amount, method, transaction/receipt reference and paid date.
- Amount is capped at outstanding balance in the UI and validated by the existing backend payment endpoint.
- Uses existing payment API and accounting journal integration; no gateway transaction is initiated.
- Refreshes charge list and accounting summaries after success.
- Duplicate reference and overpayment protections remain enforced server-side.
- Static source assertions and TSX syntax transpilation completed.

Deferred:
- Full runtime API/database and browser/mobile E2E validation not run because dependencies are not installed in the supplied environment.
- Receipt PDF/print view, full payment-history UX and collection batch/shift reconciliation are future scope.

Baseline: P276 cumulative archive.
