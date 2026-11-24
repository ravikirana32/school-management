# P531 Next Phase Tasks

## P532 — Admission-to-Enrollment Conversion
1. Harden accepted-offer/application conversion preconditions and idempotency.
2. Preserve tenant/school scope and applicant identity continuity.
3. Prevent duplicate student/enrollment conversion under retries/concurrency.
4. Ensure conversion audit trail and seat reservation/offer lifecycle consistency.
5. Admin feedback for blockers, success, and duplicate/conflict paths.
6. Focused API/UI verifiers and P526+ regression.
7. Synchronize master gap register, cumulative archive, hash and verification report.
