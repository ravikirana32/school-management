# P44 Entry Criteria

1. Complete Arabic RTL shaping, complex-script PDF visual regression and accessible/tagged PDF review.
2. Add safe cleanup for superseded logo assets with auditability, retention controls and legal holds; do not enable destructive retention without approved policy.
3. Add email provider delivery receipts, bounces and complaint webhook verification/reconciliation; decide PUSH provider/device-token lifecycle before implementing push.
4. Add distributed QR verification rate limiting and browser/device E2E.
5. Verify P43 migration apply/rollback/reapply, Prisma validation/generation, non-owner RLS, scanner callback, S3 and worker lease concurrency/crash recovery.
6. Run Vitest, full typecheck/build, Playwright, Expo iOS/Android E2E, provider contract tests and k6.
7. Carry every unresolved P00–P43 gap forward; close only with reproducible implementation and verification evidence.
