# P331 — Applicant Account & Multi-Application Dashboard

## Cycle 1 implementation
- Added school-scoped applicant account email-code challenge and session persistence.
- Added email OTP request and verify API with 60-second resend cooldown, 10-minute challenge, five-attempt cap, hashed OTP/token storage, and one-hour session expiration.
- Added verified-email application dashboard endpoint listing up to 100 matching applications within the current school and tenant.
- Added public portal account dashboard UI, code entry, verification, listing and refresh.
- Added Prisma models and SQL migration.

## Scope / limitation
The dashboard provides verified-email discovery and multi-application listing. Secure direct draft editing/linking from dashboard cards remains open; applicants continue using their application tracking token for edit, document, and submit workflows.

## Verification evidence
- Source audit of P330 found tracking-token access, draft save, submission, documents, contact verification and notification UI already present; no email-based multi-application dashboard found.
- Static checks performed: route/model/migration/UI integration inspection and key contract-string checks.
- Prisma generate, full TypeScript typecheck, runtime database/API/email-provider validation, browser/device, and E2E tests were not run (dependencies/runtime services are not available in this environment).
- P331 should be treated as implementation-complete for the verified-email discovery dashboard, with the above linking limitation explicitly open.
