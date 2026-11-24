# P511 Next Phase Task List

## C2-08-03 — Student Fee Assignment & Scope Validation
1. Audit fee-structure assignment preview and assignment APIs.
2. Validate academic-year and grade-level scope against structure scope.
3. Verify section filtering and currently-enrolled student selection.
4. Improve preview totals by mandatory/optional components and charge count.
5. Make duplicate-charge detection key-safe and report skipped/created counts accurately.
6. Validate assignment transaction and idempotency under repeated submissions.
7. Confirm charge records retain component category metadata where supported.
8. Improve assignment preview UI with explicit target scope and total amount.
9. Add focused P511 dependency-free verifier and regressions.
10. Update gap register mirrors, phase reports, manifest, cumulative ZIP and checksum.

Exit criteria: assignment preview and execution agree on selected school/year/grade/section, eligible students, charges, totals, and duplicate behavior; all modifications preserve existing fee/payment functionality.
