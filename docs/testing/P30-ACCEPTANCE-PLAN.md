# P30 Acceptance Plan — Not Yet Executed

## Static checks completed in this phase
- TypeScript syntax transpilation for changed API modules.
- JSON validation for artifact manifest and package metadata.
- Migration/source assertions and cumulative ZIP integrity.

## Required runtime tests
1. Run Prisma validate/generate and apply all migrations to a clean PostgreSQL database.
2. Restore a fixture with overlapping StaffEmploymentHistory periods and prove P30 migration aborts without partial schema changes; remediate and reapply successfully.
3. Under a non-owner, non-BYPASSRLS application role, prove tenant isolation and token/scanner SELECT policies only reveal the exact matching row.
4. Concurrently accept the same parent invitation from two connections; exactly one must succeed.
5. Test invitation expiry, revocation, consent-version mismatch, already verified account, unverified account and guardian-account conflict.
6. Test guardian merge preview and commit, duplicate student links, primary-guardian uniqueness, account conflict and transaction rollback.
7. Configure private S3-compatible storage; test signed PUT expiry, exact content length, metadata, content type, quarantine, scan callback signature, detected MIME mismatch, rejection deletion, CLEAN promotion and 60-second download expiry.
8. Test that PENDING_UPLOAD, QUARANTINED and REJECTED documents never receive a download URL.
9. Test audit cursor pagination with tied timestamps, invalid cursors and cross-tenant cursors.
10. Run Vitest, full TypeScript typecheck/build, API integration and Playwright E2E.

No live database, S3, malware scanner, email provider, browser or mobile runtime tests are claimed as completed by P30 source checks.
