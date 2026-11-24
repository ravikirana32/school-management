# P404 — Persisted Campus Inheritance Cycle Guard

## Status
**P404 COMPLETE (API source implementation and verifier coverage). F03 remains IN_PROGRESS; F04 has not started.**

## Delivered
- Added a cycle-guard helper for proposed campus-parent changes against persisted campus inheritance parent links.
- The API reads existing campus-parent links within the active organization and school tenant context.
- The proposed campus parent is substituted into the graph before traversing from the campus being updated.
- Repeated nodes are detected and the save is rejected with HTTP 409 before the upsert.
- Existing tenant-scoped persistence and upsert behavior remains intact.
- Added P404 verifier and `verify:p404` package command.

## Verification
- P404 verifier: 13/13 PASS (source assertions plus graph scenarios for a safe chain, two-node cycle and longer cycle).
- P403 verifier: 15/15 PASS.
- P402 verifier: 16/16 PASS.
- P401 verifier: 16/16 PASS.
- P400 verifier: 16/16 PASS.
- P370–P404 sweep: 34/34 available phase verifier scripts PASS.
- TypeScript/TSX syntax scan: 250 files, 0 parse errors.
- Package JSON parse: PASS.
- Full build/typecheck, live DB, Prisma runtime/migration, API integration, browser/mobile and E2E not run.

## Limitations / remaining work
- Cycle guard relies on persisted inheritance records; actual campus existence validation is not yet integrated.
- Concurrent updates could race because graph check and write are not enclosed in a serializable transaction/lock.
- Inheritance resolution is not yet wired into real configuration reads and writes.
- Campus hierarchy admin UI, broader onboarding configuration, atomic import/rollback and runtime acceptance remain open.
- F03 remains IN_PROGRESS; F04 remains blocked.
