# P30 Entry Criteria — Parent Identity, Private Documents & Runtime Acceptance

1. Design verified parent/guardian account invitation, consent, token lifecycle, expiry, revocation, account linking and recovery before enabling portal access.
2. Integrate private object storage with signed short-lived upload/download, malware scanning/quarantine, file signature validation, retention and deletion controls.
3. Add reviewed guardian merge workflow with complete StudentGuardian, account, consent and audit reconciliation; no automatic merge.
4. Add employment-history overlap detection and a safe legacy preflight before any database exclusion constraint.
5. Add curriculum activation two-connection concurrency tests and migration preflight/rollback tests.
6. Run Prisma validation/client generation and all migrations on a clean PostgreSQL database.
7. Verify RLS and permissions under a non-owner application role, including positive and negative PII access tests.
8. Run API integration, Vitest, full TypeScript checks, all web builds and Playwright workflows for guardians, staff history and curriculum activation.
9. Add pagination/retention controls for access audit and complete PII endpoint inventory.
10. Reconcile P00–P29 gaps; close only with implementation and reproducible verification evidence.
