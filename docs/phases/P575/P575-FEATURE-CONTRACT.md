# P575 Feature Contract — Tenant Isolation & Authorization

## Scope
P575 strengthens the source-level tenant context boundary and adds repeatable static/database acceptance artifacts. It does not claim production RLS acceptance without PostgreSQL execution using a restricted application role.

## Implemented
- Centralized transaction-local database context reset in `backend/api/src/modules/auth/tenant-context.ts`.
- Every context helper resets organization, school, user, platform-admin, parent-delivery, document-scan, notification and report-card-verification selectors before applying its own scope.
- Identity-only context rejects an empty user ID; tenant context continues to reject an empty organization ID.
- Expanded tenant context unit tests to assert all unrelated platform/service flags remain false.
- Added P575 static inventory verifier and P575 PostgreSQL catalog/no-context acceptance SQL.
- Added root `verify:p575:tenant-static` script.

## Evidence boundary
- Prisma models: 251 total; 235 carry organizationId and/or schoolId.
- Migration folders and non-empty migration SQL files: 158.
- Direct exact-table migration scan: 75 explicit ENABLE statements, 75 explicit FORCE statements, 80 explicit CREATE POLICY references. Dynamic migration loops are not included in these direct counts.
- P575 static verifier: PASS.
- P70 existing static contract verifier: 10/10 PASS.
- Executable mocked context-helper checks: 9/9 PASS.
- TypeScript source syntax: 315 files, 0 parse errors.

## Not accepted / blocked
- Actual PostgreSQL `pg_class` / `pg_policies` catalog coverage.
- Non-owner/non-superuser/NOBYPASSRLS application role execution.
- Cross-organization, cross-school, guardian/student/campus/resource negative API tests.
- Connection pool reuse, transaction rollback, background-worker and websocket/file/export isolation.
- Prisma validation/client generation, dependency-backed builds, database integration and browser/mobile E2E.

## Security rule
Never mark tenant isolation complete based on migration text or source assertions alone. Close P575 gaps only with reproducible PostgreSQL catalog evidence and behavioral negative tests executed under the actual restricted application role.
