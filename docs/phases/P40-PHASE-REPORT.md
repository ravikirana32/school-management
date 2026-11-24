# P40 phase report — Report-card designer, branded PDF and notification outbox

**Status:** Source implementation delivered; runtime acceptance NOT VERIFIED.

## Scope and implementation

- Replaced manual academic-year/grade ID fields with authenticated tenant-scoped lookup selectors and the configured board profile.
- Replaced JSON text authoring with structured subject and assessment-component controls, including add/remove controls and total-mark preview. API validation remains authoritative.
- Added report-card template settings backed by school policy: brand colour, footer and signature label.
- Reworked the dependency-free PDF generator for multi-page A4 output, branding accent, page numbers, footer, signature label and deterministic verification code.
- Added `NotificationBatch`, `NotificationOutbox` and `NotificationPreference` models and forced-RLS migration.
- Report-card publication now creates a consent-aware, deduplicated parent in-app notification batch, parent inbox rows and matching outbox delivery records in the same transaction as report publication.
- Added parent preference read/update APIs. Preference writes are scoped to the authenticated parent account and active school.
- Added pure recipient-resolution helper and tests.

## Verification performed

| Check | Result |
|---|---|
| TypeScript/TSX syntax transpilation | PASS 6/6 |
| PDF multi-page/verification smoke test | PASS |
| PDF parser | PASS: 3 pages, A4 (595 × 842 pt) |
| Notification consent/deduplication smoke test | PASS |
| Targeted static source assertions | PASS 18/18 |
| Artifact manifest JSON and gap-register parity | PASS |
| Root/docs master-gap register parity | PASS |
| Cumulative ZIP integrity | PASS (503 project files; 591 archive entries) |
| Prisma validate/generate | NOT RUN |
| Migration apply/rollback/reapply | NOT RUN |
| PostgreSQL forced-RLS/API integration | NOT RUN |
| Vitest/full typecheck/build | NOT RUN |
| Playwright/Expo E2E | NOT RUN |
| External EMAIL/PUSH provider integration | NOT RUN; provider not selected |

## Known limitations

- PDF font is built-in Helvetica; unsupported Unicode is replaced with `?`. Multilingual font embedding/RTL is not complete.
- Verification code is text-only; no QR code or public verification service exists.
- Template has colour/footer/signature label only; logo upload, named template library and signature image are not implemented.
- The notification outbox records transactional in-app delivery only. EMAIL/PUSH preferences are persisted, but no provider worker, receipt, retry or dead-letter processing is implemented.
- Board-specific assessment packs are not included.
- No full runtime acceptance is claimed because dependencies and PostgreSQL/Docker/provider services were unavailable.

## Files

See `docs/modules/P40-REPORT-CARD-DESIGNER-NOTIFICATIONS.md`, `docs/api/P40-REPORT-CARD-NOTIFICATION-API.md`, `docs/security/P40-REPORT-CARD-NOTIFICATION-SECURITY.md`, `docs/testing/P40-ACCEPTANCE-PLAN.md`, migration notes in `backend/api/prisma/migrations/README-P40.md`, and `docs/phases/P40-ARTIFACT-MANIFEST.json`.
