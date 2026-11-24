# P68 Final Acceptance Plan

1. Run `pnpm verify:p68` and retain the output.
2. Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm build` and `pnpm test`.
3. Follow `docs/deployment/P68-NOTIFICATION-SUPPRESSION-DEPLOYMENT-RUNBOOK.md` to provision PostgreSQL/Redis, generate Prisma client and apply migrations.
4. Execute P65/P67 PostgreSQL RLS, alias backfill, key rotation, event transaction and concurrency tests using non-owner runtime roles.
5. Execute Redis/BullMQ rate-limit, lease, retry/dead-letter and crash-recovery tests.
6. Select an email provider and run official sandbox send/receipt/bounce/complaint/signature/idempotency tests.
7. Run School Admin browser/mobile E2E and accessibility acceptance.
8. Approve retention/legal-hold/callback horizon and perform P66 key-retirement dry run.
9. Complete RTL shaping/tagged PDF acceptance.
10. Update gap register only with evidence; issue production approval only after all critical items are verified.
