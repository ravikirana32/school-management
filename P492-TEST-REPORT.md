# P492 Test Report

| Test/check | Result |
|---|---|
| P492 static API/database contract | 32/32 PASS |
| P491 workspace/dependency regression | 39/39 PASS |
| Docker availability | BLOCKED — `docker: command not found` |
| pnpm availability | BLOCKED — `pnpm: command not found` |
| PostgreSQL live health/migrations | NOT RUN (Docker unavailable) |
| Redis live health | NOT RUN (Docker unavailable) |
| API startup and health HTTP acceptance | NOT RUN (pnpm/services unavailable) |
| API build/typecheck | NOT RUN (pnpm unavailable) |
| Mobile/device E2E | NOT RUN |

Static checks do not substitute for runtime acceptance.
