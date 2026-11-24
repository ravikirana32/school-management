# P571 Risk Summary

## Critical release risks
1. **Build reproducibility:** no pnpm lockfile and no installed workspace dependencies; builds/typechecks cannot be independently reproduced.
2. **Database correctness:** 158 migration SQL files are present, but none was applied to clean or upgraded PostgreSQL in this run.
3. **Static verifier debt:** 29 of 356 repository verifiers fail. This includes workspace/package manifest and historical source-contract failures.
4. **Tenant isolation:** production PostgreSQL RLS and cross-school negative tests remain unexecuted.
5. **Financial integrity:** hostel/transport/library financial workflows need canonical accounting reconciliation, gateway callbacks and concurrent payment/refund tests.
6. **Operational delivery:** email/SMS/push/payment provider lifecycle and worker deployment/monitoring need observed production-like callbacks.
7. **Mobile and accessibility:** parent, staff, teacher, student, driver and admin device journeys/offline behavior and accessibility need actual browser/device evidence.
8. **Sensitive data:** GPS, guardian consent, health and safeguarding workflows need independent privacy/security/legal review and retention sign-off.

## Required release gates
- Restore reproducible pnpm workspace and committed lockfile.
- Resolve all 29 verifier failures or document approved, evidence-backed deprecations.
- Run Prisma format/validate/generate and clean/upgraded PostgreSQL migrations.
- Pass semantic builds/typechecks and API/database integration tests.
- Pass production-role RLS, cross-tenant, concurrency and load tests.
- Verify provider webhooks and delivery/settlement outcomes with test credentials.
- Complete browser/device/offline/accessibility and independent privacy/security review.
