# P575 Verification Matrix

| Requirement | Source/static evidence | Runtime evidence | Status |
|---|---|---|---|
| All tenant context selectors reset | centralized reset helper + 9/9 executable mock checks | PostgreSQL pool reuse not run | PARTIAL |
| Tenant model inventory | 251 Prisma models; 235 with organizationId/schoolId | schema/client validation not run | STATIC PASS |
| RLS enabled/forced/policy coverage | 75 direct ENABLE, 75 direct FORCE, 80 direct policy references | P575 catalog SQL not run | BLOCKED |
| Application DB role least privilege | acceptance SQL checks rolsuper/rolbypassrls | actual deployed role not available | BLOCKED |
| Missing-context fail closed | SQL acceptance iterates tenant tables | PostgreSQL execution not run | BLOCKED |
| Cross-org/school/student/guardian denial | acceptance requirements documented | seeded API negative tests not run | BLOCKED |
| Authorization across apps/routes/resources | existing route-level source retained | full API/web/mobile runtime audit not run | BLOCKED |
| Prisma/client/build/typecheck | source syntax only | dependency-backed commands not run | BLOCKED |
| C2-11 prerequisite chain | P573/P574 blockers explicitly carried | registry/DB environment unavailable | BLOCKED |

## Evidence files
- `P575-TENANT-STATIC-AUDIT.json`
- `P575-STATIC-VERIFICATION.log`
- `P575-P70-REGRESSION.log`
- `P575-EXECUTABLE-CHECKS.log`
- `P575-SOURCE-SYNTAX.log`
- `P575-TS-TRANSPILE.log`
- `backend/api/prisma/tests/p575-tenant-rls-catalog-acceptance.sql`

No production tenant-isolation approval is issued by this phase.
