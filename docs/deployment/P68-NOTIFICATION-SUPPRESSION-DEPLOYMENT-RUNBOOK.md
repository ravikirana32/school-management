# P68 Notification Suppression Deployment & Migration Runbook

## Scope and approval
This runbook covers the P47–P67 notification suppression, webhook, worker, rate-limit and key-alias changes. Source/static verification is not production acceptance. Do not enable live provider callbacks or retire HMAC keys until the provider, runtime tests and operational approvals are complete.

## Required configuration
Set secrets in the deployment secret manager; never commit them to `.env` or source control.

- `DATABASE_URL`: PostgreSQL connection string for the application runtime role. Use a non-owner role without `BYPASSRLS` for runtime acceptance.
- `REDIS_URL`: Redis URL for BullMQ and notification rate limiting.
- `NOTIFICATION_SUPPRESSION_HASH_CURRENT_SECRET`: random secret of at least 32 characters.
- `NOTIFICATION_SUPPRESSION_HASH_CURRENT_VERSION`: unique version label such as `v2`.
- `NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_SECRET` and `NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_VERSION`: configure during key rotation only; both must be set together and versions must differ.
- `NOTIFICATION_SUPPRESSION_HASH_SECRET`: legacy compatibility input; prefer the explicit current-secret variable and migrate deliberately.
- `NOTIFICATION_EMAIL_WEBHOOK_PROVIDER` and `NOTIFICATION_EMAIL_WEBHOOK_SECRET`: configure only after selecting and implementing the provider adapter; webhook secret must be at least 32 characters.

Do not copy example values into production. Ensure every API and worker replica has the same current/previous key versions during a rotation window.

## Deployment sequence
1. Back up PostgreSQL and record the current migration state.
2. Provision Redis and verify connectivity from API and worker networks.
3. Install the workspace with the pinned package manager: `pnpm install --frozen-lockfile`.
4. Generate the Prisma client: `pnpm db:generate`.
5. Apply additive migrations using the migration owner: `pnpm db:deploy`.
6. Validate the resulting schema and policies. Use a non-owner runtime role with `FORCE ROW LEVEL SECURITY` active; do not run API acceptance as table owner or `BYPASSRLS`.
7. Deploy API and School Admin; deploy/restart notification worker separately using `pnpm worker:notification-delivery`.
8. Verify all API/worker instances report the same current/previous HMAC version configuration.
9. Run static checks: `pnpm verify:p68` (which runs all P47–P67 static verifiers).
10. Run unit, integration, build and browser suites as specified below before enabling production notification delivery.

## Runtime acceptance required before production
- `pnpm --filter @school-saas/api test`
- `pnpm --filter @school-saas/school-admin test`
- `pnpm --filter @school-saas/api typecheck`
- `pnpm --filter @school-saas/school-admin typecheck`
- `pnpm build`
- `pnpm typecheck`
- PostgreSQL integration: migrations, RLS, tenant isolation, key alias backfill, concurrent create/release, event idempotency, event/suppression transaction rollback.
- Redis/BullMQ integration: atomic rate-limit counters, outage fail-closed, worker lease races, retry/dead-letter and crash recovery.
- Browser/mobile E2E: suppression create/release, pagination, key-health counts, permission denial, school switching and accessible UI.
- Provider sandbox: exact raw-body signature, idempotent events, bounce/complaint, retry/rate limits, delayed callbacks and provider payload consistency.

## Provider integration constraint
No provider is selected in the current baseline. The generic webhook contract and worker policy are not a substitute for an official provider adapter. Keep provider credentials unset and live callback routes unconfigured until the adapter is selected and sandbox acceptance is complete.

## HMAC key rotation and retirement
Use `docs/security/P66-SUPPRESSION-KEY-RETIREMENT-RUNBOOK.md`. Do not retire a previous key while active aliases or callback-eligible outbox references remain. Do not delete released aliases or outbox rows until retention/legal-hold and provider callback windows are approved.

## Rollback
- Take a fresh DB backup before migrations.
- Additive migrations should not be rolled back by dropping alias/hash columns or tables while workers may still depend on them.
- If API/worker deployment fails, roll application code back only to a version compatible with the migrated schema; keep additive columns/tables and RLS policies until a reviewed forward fix is deployed.
- Restore the previous HMAC secret/version to all API and worker instances if old-version suppressions must be recognized again.
- Pause notification workers if suppression checks, rate limiting or webhook transaction behavior is unhealthy; do not bypass suppression fail-closed behavior.

## Explicit non-approval
This runbook does not assert that migrations, runtime services, provider sandbox, browser tests or key retirement have been executed. Production approval requires evidence from the target environment.
