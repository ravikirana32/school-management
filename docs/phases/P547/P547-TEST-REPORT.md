# P547 Test Report

- Focused static assertions: **24/24 PASS**.
- TypeScript transpile diagnostics (canteen routes): **0**.
- TypeScript/TSX transpile diagnostics (School Admin canteen workspace): **0**.
- P546 stock-ledger verifier: **23/23 PASS** (run from repository root).
- P545 recipes verifier: **16/16 PASS**.
- P352 canteen regression verifier: **31/31 PASS** (verified from phase report; command was run and tail output confirmed menu availability and allocations checks).

Not run: Prisma validation/generation, SQL migration against a live database, full API/Admin typecheck/build, authenticated runtime API checks, browser/mobile/device, accessibility and E2E.
