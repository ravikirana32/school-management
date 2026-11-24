# P571 Next Phase Tasks — C2-10 Integration, Verification & Gap Reconciliation

Baseline: P570 cumulative. Final phase of C2-10 (P538–P571).

## Execution scope
1. Inventory every feature added across P538–P570 and map API, database, role/permission, admin, teacher/staff/parent/student/driver mobile, worker and operational documentation.
2. Reconcile the root `MASTER-OPEN-GAPS-REGISTER.md` against every phase delivery report, verifier and test report. Preserve all unresolved records; close only when implementation and reproducible evidence exist.
3. Prisma format/validate/generate across the full schema; resolve generated client/type mismatches and run all migrations on clean and upgraded PostgreSQL databases.
4. Run dependency-backed semantic typechecks and builds for all applications; run unit/integration tests and the complete static verifier suite.
5. Add production-role RLS/cross-tenant negative tests for all newly added C2-10 modules, including Library, Transport and Hostel.
6. Run transaction/concurrency tests for reservation queues, seat/bed allocation, waitlist offers, hostel transfers, invoice payments, deposit refunds, duty shifts and worker idempotency.
7. Validate canonical accounting integration, payment/provider webhook security, notification provider lifecycle and scheduled workers; do not claim provider success without observed callbacks.
8. Run browser/mobile accessibility and device E2E for parent, staff, teacher, driver and school admin journeys; verify offline behavior where applicable.
9. Conduct independent privacy/security review for GPS, parent consent, health, safeguarding, visitor identity and retention; resolve or explicitly defer findings with owners and rationale.
10. Produce final C2-10 release notes, verification matrix, remaining-gap register, risk summary and cumulative archive with SHA-256/CRC/deep manifest verification.

## Acceptance rules
- P571 is an integration and evidence phase, not permission to silently relabel gaps as complete.
- Any test blocked by missing credentials, providers, database infrastructure or devices stays OPEN with exact reason and required evidence.
- Preserve all existing product behavior and cumulative files.
- C2-10 may be called complete only when phase scope is delivered and remaining operational/production gates are explicitly disclosed, even if not all long-tail gaps can be closed.
