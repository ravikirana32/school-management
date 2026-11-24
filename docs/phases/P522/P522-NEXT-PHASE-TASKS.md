# P523 Next Phase Tasks
1. Add runtime lifecycle fixture matrix for partial refund, full refund, reversed payment, settlement and reversal journal flows.
2. Validate payment/refund journal debit-credit conventions and reconciliation outputs against PostgreSQL fixtures.
3. Add reconciliation date-window support with consistent posting/source date rules.
4. Add explicit exception drill-down to source and journal references, without mutation.
5. Review tenant isolation and query performance.
6. Update all gap-register mirrors, regressions and cumulative archive.
