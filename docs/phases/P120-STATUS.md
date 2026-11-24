# P120 — Resource-Level Authorization and Tenant Isolation

**Status:** Source implementation complete; runtime/database acceptance pending.

## Implemented
- Admissions routes require active school membership and `admissions.read` for GET routes.
- Admissions mutation routes require active school membership and `admissions.manage`.
- Access member and assignment user lookups execute inside `withIdentityContext`.
- Organization listing executes its organization-table lookup inside `withIdentityContext`.
- Added `scripts/verify-p120-tenant-authorization.mjs` and `pnpm verify:p120`.
- Reconciled stale P118/P119 route-count statements to 250 declarations: 236 authenticated and 14 explicit public exceptions.

## Deferred / outstanding
- Prisma/RLS runtime validation and non-owner database-role verification.
- API authorization integration tests and cross-tenant negative tests.
- Complete object-level authorization review across all API handlers and worker/service paths.
- Unit, API, browser and mobile test creation/execution remain deferred by project instruction.

No gap is closed in P120.
