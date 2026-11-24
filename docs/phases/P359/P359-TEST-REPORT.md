# P359 Test Report — C2-01

| Check | Result | Notes |
|---|---|---|
| TypeScript/TSX parser | PASS | 246 files, 0 parse errors |
| Node script syntax | PASS | All scripts in `scripts/` checked with `node --check` |
| Domain rules unit tests | PASS | 20/20 passed |
| Workspace manifests/configs | PARTIAL | 64 pass, 1 blocker (lockfile) |
| Lockfile | BLOCKED | `pnpm-lock.yaml` absent; pnpm registry bootstrap failed due network/DNS |
| API typecheck | BLOCKED | Missing installed dependencies/types (`@types/node`) |
| Web/mobile typechecks | BLOCKED | Dependencies unavailable; cascaded type/module errors |
| Comprehensive static verifier suite | PARTIAL | 144 verifiers: 143 pass, 1 fail (the C2-01 lockfile blocker) |
| Prisma validate/generate | NOT RUN | Prisma dependency absent |
| Database migration | NOT RUN | Docker/database runtime unavailable |
| API startup | NOT RUN | Runtime dependencies unavailable |
| Web builds | NOT RUN | Dependencies unavailable |
| Expo bundle/device builds | NOT RUN | Expo dependencies/CLI unavailable |
| P78 consolidated gate | PASS | 31/31 static phase verifiers pass |
| API route authorization inventory (P119) | PASS | 503 declarations: 468 authenticated, 35 reviewed public exceptions |
| Admissions scope checks (P120) | PASS | Read/write permission counts updated and verifier passes |
| API/E2E/security tests | NOT RUN | Runtime environment unavailable |

Failure details are in `P359-VERIFIER-FAILURES.txt`; workspace audit output is in `P359-WORKSPACE-AUDIT.txt`. No static check is represented as a runtime test.
