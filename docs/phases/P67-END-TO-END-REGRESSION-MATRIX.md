# P67 Cross-Layer Suppression Regression Matrix

This matrix defines the acceptance path from school admin API through database aliases, worker no-send guard, provider feedback and key-health UI. Pure helper tests are present; the end-to-end rows below remain pending runtime services.

| Scenario | API/DB expectation | Worker/webhook expectation | UI expectation | Current evidence |
|---|---|---|---|---|
| Create manual suppression with current=v2, previous=v1 | One suppression, two active aliases | Both v1/v2 recipient hashes match active alias | Record visible; no email/hash shown | Source + pure helper tests; DB not run |
| Release suppression | Suppression and all aliases become RELEASED atomically | Worker no longer blocks solely on released aliases | Released record and audit visible | Source only; PostgreSQL not run |
| Worker receives v1 or v2 recipient hash | Active alias query is tenant scoped | No provider send if either alias active | Key-health counts reflect alias versions | Source + pure helper test; worker/Redis not run |
| Provider BOUNCED/COMPLAINED | Event, suppression, alias and audit commit in tenant transaction | Duplicate event does not duplicate suppression | Reason and audit visible | Mock route tests; PostgreSQL not run |
| Delayed provider event after manual release | No new active suppression if release postdates event | Event remains in ledger; no new alias | Released state remains visible | Policy + mocked route test; DB race not run |
| HMAC key rotation v1→v2 | Existing aliases backfilled; new manual suppressions create both aliases | Worker checks both versions | Key-health reports counts only | Static checks; migration not run |
| Key retirement | No active previous aliases and no callback-eligible outbox references | Previous secret removed only after approved callback horizon | Key-health counts clear; operator follows runbook | Runbook only; dry run not run |

## Commands
- API unit suite: `pnpm --filter @school-saas/api test`
- School Admin unit suite: `pnpm --filter @school-saas/school-admin test`
- Static cross-layer check: `node scripts/verify-p67-cross-layer-suppression.mjs`
- Apply migrations on disposable DB: `pnpm --filter @school-saas/api prisma:deploy`

Do not mark P67-G002/P67-G003 closed until database-backed API/worker/webhook tests, browser tests and evidence artifacts are retained.
