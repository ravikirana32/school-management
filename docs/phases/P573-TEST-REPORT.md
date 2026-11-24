# P573 Test Report

| Check | Result | Evidence |
|---|---|---|
| P572 cumulative ZIP CRC | PASS | 4,823 entries extracted and tested |
| Node runtime | PASS | v22.16.0, within declared engine |
| Workspace manifest preflight | PASS | 14 package manifests; P501 reports no manifest issues |
| C2-01 workspace gate | BLOCKED | 72 PASS, 1 BLOCKER: missing pnpm-lock.yaml |
| Migration inventory | PASS (static only) | 158 directories, 158 non-empty SQL files |
| PostgreSQL provider marker | PASS (static only) | migration_lock.toml declares postgresql |
| Repeated migration timestamp prefixes | REVIEW REQUIRED | 20 duplicate prefixes |
| Registry reachability | BLOCKED | DNS resolution failure for registry.npmjs.org |
| pnpm frozen install | NOT RUN | pnpm 9.15.0 unavailable |
| Prisma format/validate/generate | NOT RUN | Prisma CLI unavailable |
| Clean/upgraded DB migration, seed, drift, rollback | NOT RUN | PostgreSQL/Docker unavailable |
| Semantic builds/typechecks and DB integration | NOT RUN | dependencies unavailable |

P573 exit criteria are not met. Do not mark database acceptance complete.
