# P512 Next Phase Task List

## C2-08-04 — Installments & Payment Schedules
1. Audit current student-fee charge fields and existing due-date workflows.
2. Design installment/schedule persistence that supports one-time, annual, term and monthly component frequencies without rewriting existing charges.
3. Implement API for schedule creation, validation, listing and safe updates with school/tenant scope and RBAC.
4. Generate installment rows deterministically with amount rounding and remainder reconciliation.
5. Validate dates, due-date ordering, total schedule amount and duplicate schedule submissions.
6. Integrate assignment-generated draft charges with schedule creation workflow where appropriate.
7. Add UI to configure installment count, dates, amounts and preview before save.
8. Keep optional components explicitly out of mandatory schedule generation unless selected.
9. Preserve charge category, currency, student/year/grade/section linkage and audit history.
10. Add focused verifier, update gap-register mirrors, reports, roadmap, manifest, cumulative ZIP and checksum.

**Exit criteria:** schedule totals reconcile to charge amount; installment dates and amounts validate; tenant isolation and duplicate prevention are source implemented; runtime acceptance remains clearly tracked.
