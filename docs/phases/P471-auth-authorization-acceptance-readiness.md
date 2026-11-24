# P471 — C2-04 F10: Consolidated Authentication & Authorization Acceptance Readiness


## Scope
Consolidate source-level coverage from P462 through P470 and define release gates for runtime acceptance. This phase does not claim live API/database security validation.

## Coverage matrix
| Domain | Phase source | Source artifacts exist | Runtime executed | Current state |
|---|---|---:|---:|
| Auth routes & classifications | P462 | Yes | Pending |
| Auth API integration foundation | P463 | Yes | Pending |
| Negative-path validation | P464 | Yes | Pending |
| Rate limit / abuse responses | P465 | Yes | Pending |
| Authorization boundaries | P466 | Yes | Pending |
| Role permission matrix | P467 | Yes | Pending |
| Tenant/school scope context | P468 | Yes | Pending |
| Protected route authorization | P469 | Yes | Pending |
| Authentication/authorization error contracts | P470 | Yes | Pending |

## Acceptance gates
1. Install workspace dependencies from the repository root and confirm lockfile consistency.
2. Execute all relevant auth and authorization Vitest suites and record command output.
3. Run API typecheck and build.
4. Run tests with a dedicated PostgreSQL and Redis environment.
5. Verify authenticated and unauthenticated responses against running API routes.
6. Verify role-specific allow/deny behavior using seeded memberships.
7. Verify cross-organization and cross-school access denial with at least two isolated tenants/schools.
8. Verify rate-limit thresholds, Retry-After behavior, and Redis outage response.
9. Run web/mobile smoke tests for sign-in, session expiry, MFA, and protected navigation.
10. Attach CI logs and test reports; close gaps only with evidence.

## Limitations
P471 is a readiness consolidation and source verifier phase. No runtime suite, live database, Redis, full build, device/simulator, or E2E execution is represented as completed here.
