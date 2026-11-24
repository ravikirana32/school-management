# P573 Verification Matrix

| Gate | Required evidence | Current state | Closure condition |
|---|---|---|---|
| Toolchain | Node 22 + pnpm 9.15.0 | Node PASS; pnpm BLOCKED | Provision exact pnpm from registry or approved mirror |
| Lockfile | Real `pnpm-lock.yaml` | BLOCKED / absent | Generate using pnpm; commit and verify frozen install |
| Prisma schema | format, validate, generate | NOT RUN | Execute pinned Prisma CLI and resolve output |
| Migration artifacts | migration folders and SQL | Static PASS: 158/158 | Still requires Prisma engine/database execution |
| Clean database | apply all migrations + seed | NOT RUN | Run isolated PostgreSQL clean install |
| Upgrade database | previous snapshot upgrade | NOT RUN | Run supported upgrade snapshot and data checks |
| Drift/recovery | schema diff and failure recovery | NOT RUN | Capture schema diff and documented recovery test |
| CI | automated migration smoke | OPEN | Add and execute CI job in dependency/database environment |

P573 status: BLOCKED. No production acceptance claim.
