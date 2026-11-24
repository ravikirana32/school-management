# P41 phase report — Report-card verification, multilingual PDFs and notification delivery

**Status:** Source implementation delivered; runtime acceptance NOT VERIFIED.

## Implemented

- PDFKit-based PDF generation with bundled licensed Noto fonts for Latin and major Indian scripts plus Arabic glyph coverage.
- QR code generated from a public verification URL or the code when no public origin is configured.
- Cryptographically random 128-bit verification code persisted uniquely per PDF artifact.
- Public verification endpoint with strict format validation, process-local rate limiting, narrow read-only RLS context and privacy-minimal response.
- Transactional EMAIL outbox fanout alongside in-app notifications. EMAIL preferences are evaluated independently from IN_APP preferences.
- Dedicated BullMQ worker with durable reconciliation, delivery-time consent/preference recheck, HTTPS provider adapter, idempotency key, retries and dead-letter state.
- P41 Prisma migration, worker command, environment examples, API/security/testing docs and P42 entry criteria.

## Verification

- TypeScript syntax transpilation: PASS 11/11 changed API/worker/PDF/test files.
- Static source assertions: PASS 22/22.
- Pure verification-code helper smoke checks: PASS 6/6 (valid 128-bit code, short/lowercase/non-hex/path/empty rejection).
- Manifest JSON parse, package JSON parse, font asset/license presence and root/docs gap-register parity: PASS.
- Cumulative ZIP integrity: pending final archive generation.
- PDF rendering, QR decoding, PostgreSQL migration/RLS, provider delivery, worker crash/retry, full tests/build and browser/mobile acceptance are NOT run.
- Runtime acceptance NOT VERIFIED.

## Deferred

- Arabic RTL paragraph shaping and visual validation of complex-script conjuncts.
- School logo private upload and named template library.
- Provider-specific delivery receipts/bounces and PUSH device registration.
- Distributed rate limiting, tagged PDF/accessibility and complete runtime CI.
- Payment provider remains unselected.
