# P364 — C2-01 Bootstrap Diagnostics

**Status:** Delivered source-level readiness diagnostics; C2-01 remains blocked.

- Added `scripts/diagnose-c2-01-bootstrap.mjs` and root command `diagnose:c2-01:bootstrap`.
- The diagnostic reports Node 22, declared pnpm 9.15.0, lockfile presence, pnpm availability/version, `.npmrc` presence, and safe registry configuration. It does not print credential values or attempt dependency installation.
- Added `scripts/verify-p364-bootstrap-diagnostics.mjs`, `verify:p364`, and integrated it into the dependency-free CI source gate.
- Bootstrap diagnostics: 4/7 PASS; 3 warnings (lockfile absent, pnpm command unavailable, pnpm version cannot be checked).
- Source-only C2-01 gate: 7/7 PASS. TS/TSX syntax: 246 files, 0 parse errors. Domain invariants: 20/20 PASS. Mirror parity: 6/6 PASS.
- Full static verifier suite: 148/149 PASS; sole failure remains the known lockfile/dependency bootstrap gate.
- Dependency install/typecheck/lint/build, Prisma/DB/Redis/API runtime, mobile export/device, E2E, security runtime and deployment acceptance were not run.
