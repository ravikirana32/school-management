# P43 Acceptance Plan

1. `prisma validate` and `prisma generate` against the committed schema.
2. Apply P43 migration after P42, roll it back in a disposable database, and reapply it.
3. As a non-owner role, prove SchoolBrandAsset and ReportCardTemplateVersion tenant isolation and scanner-only access.
4. Upload a valid PNG/JPEG; verify size/MIME/metadata mismatch is rejected and the object is deleted.
5. Verify quarantined logo cannot be read or embedded; CLEAN callback promotes to private key and updates SchoolProfile; REJECTED/MIME mismatch never activates it.
6. Verify cross-tenant asset IDs and object keys cannot be completed or downloaded.
7. Create template v1, activate, create v2, activate; verify v1 retires, v2 activates, duplicate active versions fail and activated content cannot be changed.
8. Generate a report card with an approved logo and active template; inspect the PDF visually and verify no quarantined logo is embedded.
9. Run concurrent notification workers against one outbox row; only one lease owner may claim/settle it. Simulate crash/expired lease and confirm idempotent recovery.
10. Run Vitest, full typecheck/build, Playwright, Expo E2E, provider contract tests and k6.
