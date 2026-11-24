# P236 Delivery Report — Capacity-aware direct enrollment

## Implemented
- Direct enrollment now looks up a matching configured `GradeSectionCapacity` row for the school/year/grade/section.
- A guarded atomic update increments `enrolledSeats` only if capacity remains after accounting for reserved seats.
- Optimistic counter conditions detect concurrent seat claims and fail closed with a 409 conflict.
- If no section-capacity row is configured, existing enrollment behavior is preserved.
- When student status activation races, the transaction path explicitly removes the new enrollment and releases the claimed capacity counter.
- Updated current Student Lifecycle checklist and mirrored root/docs gap registers and resolved-gap history.

## Current module checklist — Student lifecycle
- [x] Core student profile APIs and permissions
- [x] Guardian link/create and management APIs
- [x] Status lifecycle and history
- [x] Enrollment duplicate and roll-number conflict safeguards
- [x] Configured section seat claim during direct enrollment
- [x] Concurrent capacity conflict handling
- [ ] Enrollment approval and allocation workflows
- [ ] Promotion, transfer, re-admission, withdrawal, completion and alumni flows
- [ ] Student management UI coverage
- [ ] Bulk import/update/export
- [ ] ID cards, guardian UX, pickup-contact UX, document/photo lifecycle
- [ ] Staff mobile parity, notifications and reporting
- [ ] Final validation (deferred)

## Validation policy
- Source assertions performed only.
- Builds, typechecks, tests, migrations, runtime API checks and E2E remain deferred until final validation.
