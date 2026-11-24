# P517 Next Phase Tasks — Outstanding Balances & Late Fees

1. Review current operational charge, invoice, installment and ledger balance sources; define authoritative due balance per charge/student/currency.
2. Build tenant-scoped outstanding balances API with due-date aging buckets (current, 1–30, 31–60, 61–90, 90+ days).
3. Reconcile totals to P516 ledger balances without counting invoice snapshots twice.
4. Add configurable late-fee policy (fixed/percentage, grace days, cap, currency, applicability, approval policy) and safe defaults disabled.
5. Late-fee calculation preview must be deterministic and integer-minor-unit; enforce no double assessment per policy period.
6. Add late-fee assessment lifecycle with audit, approval, posting and reversal-safe linkage to source charge.
7. UI aging summary and student/grade/section filters; late fee policy management and preview.
8. Ensure tenant isolation, RBAC, concurrency, idempotency and negative tests.
9. Focused verifier, finance regressions, source parser, gap register mirror sync, reports, cumulative ZIP/SHA verification.
10. No late fees automatically applied until policy is configured, approved, and activation is explicitly performed.
