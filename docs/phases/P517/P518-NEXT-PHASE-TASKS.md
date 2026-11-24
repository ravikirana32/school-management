# P518 Next Phase Tasks — Refunds & Reconciliation

1. Audit current refund request, approval, settlement, reconciliation and operational-accounting linking behavior.
2. Resolve pending P516/P517 balance semantics: refund effect on charge outstanding and student ledger.
3. Build finance refund dashboard with student/payment lookup, remaining refundable balance and settlement state.
4. Enforce approval separation, rejection reasons, settlement evidence and idempotency keys.
5. Verify partial/multiple refunds, over-refund protection, duplicate requests, tenant isolation and permissions.
6. Reconcile refund operational records to accounting journal/clearing and student ledger.
7. Add focused verifier, preserve cumulative source, append gap-register findings and archive with SHA/manifest/CRC.
8. Carry installment-level aging and late-fee assessment lifecycle gaps forward; do not auto-assess fees.
