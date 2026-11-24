# P432 Test Report

| Check | Result |
|---|---:|
| Audit model presence | PASS |
| Scope columns | PASS |
| Actor/action fields | PASS |
| JSON before/after | PASS |
| Timestamp default | PASS |
| Migration table/index/FK | PASS |
| Forced tenant RLS | PASS |
| Action constraint | PASS |
| Database immutability trigger | PASS |
| Captures old/new policy | PASS |
| Audit insert inside tenant transaction | PASS |
| Authenticated actor captured | PASS |
| History route permission | PASS |
| History scope/order/page limit | PASS |
| UI renders actor/time/action/values | PASS |
| Reset action explicit | PASS |
| Refresh after save/reset | PASS |

Focused verifier: **21/21 PASS**. TypeScript transpile syntax diagnostics: **0** for API route and Admin TSX.

Runtime migration, Prisma validation/client generation, full build, DB/RLS integration and E2E are not performed in this environment.
