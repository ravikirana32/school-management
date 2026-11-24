# P310 — Rollover School Directory Lookup (Cycle 1)

## Implemented
- Academic-year rollover preview no longer depends exclusively on the currently loaded student list/page.
- Added optional exact admission-number lookup to the school-scoped student list API; matching is case-insensitive.
- Rollover preview resolves CSV admission numbers using the loaded page first, then exact school-directory API lookup, and loads enrollment history for matched records.
- Execution performs the same lookup for eligible rows before its existing fresh-state refresh/revalidation path.
- Missing students receive an explicit directory-not-found validation/result.
- Added P310 static verifier.

## Verification
- Static assertions: **5/5 PASS**.
- ZIP integrity: verified after packaging.
- Runtime/API/browser/mobile tests: **NOT RUN** (dependency/runtime setup not confirmed in this workspace).

## Cycle 1 status
The basic rollover CSV preview and sequential execution path can now resolve students outside the first loaded directory page. This remains a basic exact-match lookup, not a full transactional bulk-operation system.

## Cycle 2 / validation backlog
- Atomic seat reservation and multi-user concurrency safeguards.
- Transactional rollback/compensation and full reconciliation.
- Durable audit storage, approval controls, retention, and multi-run reporting.
- Runtime acceptance tests and comprehensive E2E coverage after Cycle 1 features are implemented.

## Next
P311 moves to Student Operations Cycle 1: school-wide export, CSV import preview/validation/duplicate feedback, and basic bulk selection/actions.
