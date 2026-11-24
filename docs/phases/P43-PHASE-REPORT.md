# P43 Phase Report — School Branding, Named Templates & Outbox Leases

## Delivered

- Added `SchoolBrandAsset` with tenant/school ownership, MIME/size constraints, quarantine status, scanner timestamp and forced RLS.
- Added private PNG/JPEG school-logo presigned upload, completion verification, scanner dispatch, CLEAN promotion, signed retrieval and PDF embedding.
- Extended scanner dispatch and signed callback handling to support `school-logo` without bypassing the existing scan gate.
- Added versioned `ReportCardTemplateVersion` model, APIs, active-version uniqueness and activated-content immutability trigger.
- Integrated active named template settings and CLEAN logo into report-card PDF generation; legacy school policy remains fallback.
- Added atomic notification outbox claim leases with random owner token, 90-second expiry, conditional success/failure settlement and expired-lease reconciliation.
- Added migration, API/security documentation, acceptance plan and P44 entry criteria.

## Verification performed

- TypeScript syntax transpilation for seven changed TS modules: PASS 7/7.
- Targeted static source assertions: PASS 12/12.
- Root/docs master gap-register parity: PASS.
- Cumulative ZIP integrity: PASS (641 archive entries).
- Prisma schema parsing, migration execution, PostgreSQL RLS, S3, scanner, Redis/BullMQ, email provider, browser/mobile E2E and k6: NOT RUN.
- ZIP integrity: PASS.

## Runtime status

Runtime acceptance is NOT VERIFIED. No claim is made that Prisma client generation, database migrations, storage, scanner or worker concurrency has run successfully in this environment.

## Known limitations

- Arabic shaping/RTL and accessible tagged PDFs remain open.
- Historical/replaced logo cleanup and retention/legal hold remain open.
- Notification provider receipts, bounces/complaints and PUSH remain open.
- Outbox lease behavior needs real PostgreSQL concurrency and provider idempotency tests.
- Payment gateway remains unselected.
