# P374 Status — Server-derived onboarding readiness (C2-04 / F03)

**Status:** Source implementation and contract verification completed; runtime/build acceptance pending.
**Cycle:** C2-04 Core School Workflows (F03–F11)

## Delivered
- Added school-scoped `GET /:organizationId/:schoolId/readiness` endpoint to the school configuration router.
- Readiness calculation is centralized in the API and queries are constrained by organization and school inside tenant context.
- Requires authenticated request and active school membership (existing router middleware and scope guard).
- Server calculates seven setup checks: school profile, active academic year, terms for current active year, default calendar, working days, attendance policy, grading policy.
- Returns checks, completed count, total count, percentage, and generated timestamp.
- Admin guided onboarding now consumes the consolidated readiness endpoint instead of making multiple reads and duplicating completion logic client-side.
- Navigation remains local-only; server readiness is authoritative and not altered by wizard navigation.

## Verification
- `node scripts/verify-p374-server-onboarding-readiness.mjs`: 14/14 PASS.
- Runtime/API integration, database migration/seed compatibility, typecheck/build, browser/mobile E2E remain pending; this endpoint has no new schema migration.

## Gap disposition
- **P374-G001 CLOSED:** API-derived checklist completion is centralized and consumed by admin UI.
- **P374-G002 OPEN:** Server-persisted user progress, checklist ownership, and multi-user resume are still outstanding.
- **P374-G003 OPEN:** Owner/admin invitations and backend-enforced full configuration sequencing remain outstanding.
- **P374-G004 OPEN:** Multi-campus inheritance/overrides and bulk configuration import/export preview/rollback remain outstanding.
- **P374-G005 OPEN/BLOCKED:** Runtime, typecheck, build, API integration, mobile, and E2E acceptance remain pending due inherited workspace bootstrap/lockfile blocker.

## Next
Continue C2-04/F03 remaining configuration setup and validation work, then progress F04–F11 in dependency order. C2-05 will not start until C2-04 is complete.
