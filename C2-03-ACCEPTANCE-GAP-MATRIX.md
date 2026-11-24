# C2-03 Authentication, RBAC & Security Acceptance Gap Matrix — P368

## Source controls audited
- JWT signing configuration: minimum secret length, HS256 allow-list, issuer/audience and 10-minute expiry.
- Authenticated requests: active session and expiry, active user lookup.
- MFA: enrollment and fresh challenge enforcement for platform admins and configured privileged role keys.
- Password storage: Argon2id.
- Opaque tokens: SHA-256 storage helper.
- Authentication abuse controls: Redis-backed rate limiting, fail-closed response, progressive account/IP cooldown, fixed-label privacy-safe abuse counters.
- HTTP security headers: Helmet middleware present.
- Auth route, MFA and permission module presence.

## P368 source-only status
Static audit: 16/16 PASS. Audit contract: 6/6 PASS. Source-gate integration added.

## Runtime acceptance still OPEN
- Full authentication API tests (success, failure, expired, revoked sessions).
- RBAC matrix for all roles and all protected route groups.
- Privilege escalation and authorization-negative tests.
- MFA enrollment, challenge, recovery and factor-disable lifecycle tests.
- Refresh rotation/reuse and concurrent refresh race tests.
- Redis-backed rate-limit and cooldown integration tests.
- Password reset, invitation, account activation, deactivation and logout flows.
- Cross-tenant authorization checks across every API route, worker and file/storage operation.
- Security headers, CORS/proxy and production cookie/token configuration checks.
- Dependency scanning, penetration test and deployment acceptance.

Static evidence is not runtime proof. No runtime gaps are closed by P368 without test evidence.

## P369 — RBAC and authorization source inventory
- Added dependency-free RBAC/scope control audit and self-contract verifier.
- Audited the source permission helper's deny-by-default behavior, platform-admin bypass, explicit wildcard/module-wildcard semantics, organization/school scope rejection, active membership, school-scoped role assignments, and authenticate middleware gate.
- Inventoried all route-module files and counted auth, authorization/scope, and tenant-context markers. The inventory flags modules with no markers for manual classification (public admission endpoints, auth endpoints, notification webhook, report-card verification, and self-service teacher membership); marker presence is not proof of protection.
- Static scope: this is source-level heuristic analysis, not complete route AST parsing. Runtime route-by-route RBAC, privilege-escalation, IDOR, and cross-tenant negative tests remain required.

## P369 source-audit closure summary
- RBAC/scope audit: **14/14 PASS**.
- Route-module inventory: 31 modules; authentication markers in 29; authorization/scope markers in 23; tenant-context markers in 31. These are heuristic counts and must not be interpreted as route-level coverage percentages.
- Files without authentication markers flagged for review: `notifications/delivery-webhook.routes.ts` and `report-cards/report-card-verification.routes.ts` (signature/token/public-verification patterns are expected to be reviewed separately).
- Files without authorization/scope markers flagged for manual classification: `admissions/admission.public.routes.ts`, `auth/auth.routes.ts`, `billing/billing.routes.ts`, `notifications/delivery-webhook.routes.ts`, `organizations/organization.routes.ts`, `platform/platform.routes.ts`, `report-cards/report-card-verification.routes.ts`, and `staff/teacher-membership.routes.ts`. Marker absence is not proof of a vulnerability; these contain public, auth, billing/webhook, platform, or self-service flows and require route-level verification.
- **C2-03 source-audit scope complete:** P368 + P369 source checks and documentation are complete. **C2-03 runtime acceptance remains OPEN** until testable runtime evidence closes the remaining gaps.
