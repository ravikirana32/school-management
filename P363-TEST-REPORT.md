# P363 Test Report

| Check | Result |
|---|---:|
| CI workflow contract audit | 9/9 PASS |
| C2-01 dependency-free source gate | 6/6 PASS |
| TypeScript/TSX syntax scan | 246 files, 0 parse errors |
| Domain invariant tests | 20/20 PASS |
| Register/document mirrors | 6/6 PASS |
| Full static verifier suite | 147/148 PASS (1 lockfile blocker) |
| Dependency install/typecheck/lint/build | NOT RUN — registry/lockfile blocker |
| Prisma/DB/Redis/API runtime | NOT RUN — dependency/environment blocker |
| Expo/mobile/device/E2E | NOT RUN — dependencies/environment blocker |
