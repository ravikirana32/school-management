# P515 Status — Fee Collection & Payment Processing

**Status:** Source implementation completed. Focused verifier and TS/TSX parser checks passed. Local runtime/database/build acceptance pending.
**Baseline:** P514 cumulative archive.

Implemented invoice-aware manual collection, configured-enabled payment method enforcement, idempotent matching-reference retry behavior, duplicate-reference conflict behavior, invoice outstanding payment cap, invoice linkage on payment, transactional invoice amountDue/status and charge paid/status updates, oldest-first installment allocation, concession-aware invoice installment net targets, legacy payment balance reconciliation into installments, immutable payment allocation rows, installment/schedule status updates, Finance payment-history allocation display, invoice-aware receipt print, audit metadata, tenant composite FK and forced RLS for allocation records.

No gateway transfer is initiated or simulated. Non-cash reference requirement currently remains stricter than the finance configuration flag (references required for all methods). Parent/student mobile payment/invoice views and real gateway integration remain planned.
