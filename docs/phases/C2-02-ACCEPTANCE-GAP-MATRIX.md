# C2-02 Acceptance Gap Matrix — P367

| Acceptance area | Source-level evidence | Runtime status | Required evidence to close |
|---|---|---|---|
| Prisma schema inventory | 165 models inspected | Static PASS | `prisma validate` with dependencies |
| Tenant scope field inventory | 150 tenant-scoped models found | Static PASS | Review exceptions/non-tenant models against business access matrix |
| Tenant index/unique coverage | 150/150 static coverage PASS | Static PASS | Query-plan and production workload review |
| Tenant context helper inventory | Required 6 helpers present | Static PASS | Integration tests with DB request contexts |
| TransportTripEvent scope index | Composite index added | Migration not executed | Fresh DB + upgrade path + explain/query test |
| Migration ordering | 104 migration folders inventoried | Not executed | Prisma migrate status, fresh install and upgrade from baseline |
| Rollback/recovery | Not proven | OPEN | Document/execute restore and forward-fix procedure |
| RLS enabled/forced policy catalog | Existing SQL acceptance files inventoried | Not executed | PostgreSQL catalog assertion per table and policy |
| Non-owner database role | Existing contract evidence only | OPEN | Run tests as non-owner/non-bypass role |
| Cross-tenant negative reads/writes | Static source contracts only | OPEN | Two-tenant API tests for list/detail/create/update/delete and IDOR |
| Worker isolation | Tenant context helper inventory | OPEN | Jobs/worker tests proving tenant context propagation and safe missing context |
| Cache/storage isolation | Not runtime-proven | OPEN | Key/path namespace tests and cross-tenant access tests |
| Concurrency-sensitive workflows | Source only | OPEN | Race tests for admission capacity, allocation, payment, and related mutations |
| API integration | Source-only | OPEN | API/db integration suite against PostgreSQL and Redis |

C2-02 source audit is delivered in P367, but this matrix is intentionally not a runtime acceptance sign-off. Environment-dependent acceptance remains open.
