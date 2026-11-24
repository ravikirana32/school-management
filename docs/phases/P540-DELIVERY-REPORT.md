# P540 Delivery Report

P540 adds explicit, per-student/per-guardian health visibility consent independent from general parent portal consent.

## Implemented
- Prisma model `StudentHealthConsent` with org/school/student/guardian composite uniqueness, granted/revoked timestamps and consent version.
- Migration SQL for consent storage and indexes.
- Guardian-authenticated grant endpoint: `POST /:organizationId/:schoolId/portal/children/:studentId/health-consent`.
- Guardian-authenticated revoke endpoint: `DELETE` same path.
- Grant/revoke require parent portal health permission and verified guardian linkage to the student.
- Parent health summary only includes student profiles/events where the signed-in guardian has active granular consent.
- Audits for consent grant/revoke record only consent metadata and count; no health payloads.
- Focused verifier and cumulative gap-register reconciliation.

## Scope and limits
No parent mobile consent UI was added in this phase; planned P544. Migration/runtime behavior and API integration tests remain unverified.
