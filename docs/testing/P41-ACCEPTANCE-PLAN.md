# P41 acceptance plan

## Source checks performed

- TypeScript syntax transpilation for changed API, worker, PDF, verification and test files (11/11 PASS).
- Static assertions for PDF font assets, QR generation, verification code entropy/format, public route privacy projection, RLS GUC policies, notification consent recheck, independent channel preferences, HTTPS provider and retry/dead-letter states (22/22 PASS).
- Pure verification-code helper smoke checks (6/6 PASS).
- Font license file and migration/manifest JSON parse.
- Cumulative archive integrity.

## Required runtime acceptance (not run in this environment)

1. `pnpm install --frozen-lockfile` (first create and review the workspace lockfile), Prisma validate/generate.
2. Apply P41 migration to a disposable PostgreSQL database; test backfill, unique code collisions, policy behavior and rollback/reapply.
3. Connect as non-owner/non-BYPASSRLS app, notification-worker and public-verification roles; prove each GUC policy exposes only its intended data/actions.
4. Generate PDFs containing Latin, Kannada, Devanagari, Bengali, Tamil, Telugu, Malayalam, Gujarati, Gurmukhi and Arabic; inspect visual shaping, text extraction, QR decode, page boundaries and PDF accessibility.
5. Verify valid/invalid/unpublished codes and assert no student PII or storage URL leaks. Exercise distributed rate limiting at gateway.
6. Test notification opt-out changes, consent withdrawal after enqueue, guardian disablement, unverified/missing email, provider timeout/429/5xx, duplicate job delivery, process crash/reconciliation, dead-letter and idempotency.
7. Run Vitest, full typecheck/build, Playwright, Expo E2E, provider contract tests and k6.
