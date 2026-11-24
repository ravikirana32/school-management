# Next Phase Tasks — P504 Backend/API Build Stabilization

## Scope
- Audit backend/API source and build scripts after P503 frontend stabilization.
- Dependency-free syntax/parser audit for server TypeScript and JavaScript files.
- Validate backend package scripts, Prisma schema/migration source integrity, and relative imports.
- Diagnose compiler/build script configuration and Node/TypeScript compatibility.
- Fix confirmed source-level parser/import/build-script blockers without altering feature behavior.
- Add a P504 verifier and phase report; retain evidence and append new gaps.
- Run cumulative P491–P503 focused verifiers.

## Completion gates
- Backend source syntax diagnostics: 0 for audited files.
- Unresolved local imports: 0 or individually documented/blocked with evidence.
- Backend build/typecheck script and config consistency audited.
- P504 focused assertions pass.
- No dependency install, database runtime, API runtime, or full build may be claimed unless actually executed.

## Still-open prerequisites
- Registry connectivity for pinned pnpm provisioning and lockfile creation.
- Frozen dependency installation.
- Full API typecheck/build and PostgreSQL/Redis runtime acceptance.
