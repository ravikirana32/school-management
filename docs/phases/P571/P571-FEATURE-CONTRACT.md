# P571 Feature Contract — Integration & Evidence

## Inputs
- P570 cumulative baseline.
- C2-10 roadmap and progress history for P538–P570.
- Root `MASTER-OPEN-GAPS-REGISTER.md` and mirrored copies.
- Existing application packages, API modules, Prisma schema and migration history.

## P571 outputs
1. Cross-module inventory and verification matrix.
2. Integration source verifier covering representative Library, Transport and Hostel models, application packages, migrations, C2-10 history and gap-register preservation.
3. Full static-verifier execution log and explicit failure inventory.
4. Final C2-10 progress and risk summary.
5. Updated master gap register with P571 blockers; no unsupported closures.
6. Cumulative and phase-only release archives with checksum/manifest evidence.

## Acceptance boundaries
- Source-presence checks do not prove runtime behavior.
- Migration file presence does not prove migration execution or schema compatibility.
- Static verifier success does not replace semantic typechecking, DB integration, production RLS, concurrency, provider callbacks, device E2E or independent privacy review.
- A failing historical verifier remains a release blocker until its expected contract is reconciled and reproducibly passes.
