# P34 — Acceptance Plan

## API authorization
- [ ] No token: all operator endpoints return 401.
- [ ] Inactive school membership: all operator endpoints return 403.
- [ ] Missing `fees.read`/`fees.manage`, `academics.manage`, `reports.manage` or `parent.notifications.manage`: corresponding operation returns 403.
- [ ] Tenant A operator cannot list, publish or reconcile records in tenant B.
- [ ] IDs from another school return 404 and do not leak existence.

## Fees
- [ ] Create draft and published charge.
- [ ] Publish draft once; second publish returns 409.
- [ ] Record valid payment, reject duplicate reference and overpayment.
- [ ] Concurrent payments serialize and cannot exceed outstanding balance.
- [ ] Parent sees only published charges and recorded payments.

## Homework and report cards
- [ ] Create draft and published homework/report card.
- [ ] Publish only DRAFT records; verify audit event.
- [ ] Parent sees only published records linked to their active consented guardian account.
- [ ] Validate report-summary schema and academic year/term relationship in future board-aware validation work.

## Notifications
- [ ] Notification fans out only to verified, active, consented guardians with communications enabled.
- [ ] No eligible recipients returns a zero count and no notification rows.
- [ ] Parent from an unrelated guardian/student cannot read the notification.
- [ ] Revoked consent or removed guardian link prevents subsequent parent visibility.

## Build and runtime
- [ ] `pnpm --filter @school/api prisma:validate` / Prisma validate and generate.
- [ ] Apply P33/P34 migrations on disposable PostgreSQL, rollback and reapply.
- [ ] Run RLS and API integration tests using a non-owner DB role.
- [ ] Run Vitest, full typecheck, web builds and Playwright E2E.
- [ ] Run Parent and School Admin Expo/browser acceptance where relevant.
