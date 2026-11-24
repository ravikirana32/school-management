# P574 Test Report

| Check | Result | Evidence |
|---|---|---|
| Node runtime | PASS | v22.16.0, required major 22 |
| Registry access | BLOCKED | `npm view pnpm@9.15.0` returned EAI_AGAIN |
| Workspace manifests | PASS | 14 manifests, 14 unique names, 0 dependency/script-target errors |
| Source syntax | PASS | 315 TypeScript/TSX files, 0 parse errors |
| P501 lockfile readiness verifier | PASS | 24/24 after restoring historical register mirrors; actual lockfile readiness still false |
| P502 compilation verifier | PASS | 17/17 after restoring historical register mirrors; no semantic build performed |
| P573 migration artifact inventory | BLOCKED | 7 PASS / 1 FAIL; lockfile absent |
| P574 environment preflight | BLOCKED | See `P574-BUILD-INTEGRATION-PREFLIGHT.json` |
| Full static verifier suite | INCOMPLETE | Pre-fix run timed out after 298 PASS and 3 FAIL; P501/P502 mirror issues corrected afterward; complete rerun outstanding |
| Frozen install | NOT RUN | pnpm and lockfile unavailable |
| Prisma validation/client generation | NOT RUN | Prisma CLI/dependencies unavailable |
| Semantic typechecks/builds | NOT RUN | Dependencies unavailable |
| PostgreSQL migration/API integration | NOT RUN | Docker/PostgreSQL unavailable |

## Important distinction
A syntax parse is not a semantic typecheck. Static source assertions are not runtime integration tests. Migration-file inventory is not database migration execution. No production readiness claim is made.
