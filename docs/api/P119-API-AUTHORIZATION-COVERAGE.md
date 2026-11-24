# P119 — API Authentication and Authorization Coverage Inventory

## Scope and method

Inventory generated from the Express route declarations under `backend/api/src/modules/**/*.routes.ts` and router mounts in `backend/api/src/app.ts`. A route is counted as authenticated when its router mounts the shared `authenticate` middleware or the route explicitly includes it. This also means the central MFA policy in `authenticate` applies to these protected routes, subject to its explicit bootstrap allowlist.

- Route declaration count: **250**
- Routes protected by shared authentication: **236**
- Explicit public exceptions: **14**
- Route files inventoried: **22**
- Unclassified unauthenticated route declarations: **0** (source verifier enforces the reviewed allowlist)

## Explicit public exceptions

| Route module | Public purpose and required control |
|---|---|
| `auth/auth.routes.ts` | Public registration/login, opaque refresh-token rotation, refresh-token logout, one-time password-reset and password-forgot bootstrap; protected session/MFA/status/abuse routes use authenticate. |
| `billing/billing.routes.ts` | Public active-plan catalogue; payment webhook is public only at transport level and requires provider-specific HMAC signature over raw body. Subscription/checkout/entitlement routes use authenticate and organization-admin checks. |
| `parents/parent.routes.ts` | Invitation preview and acceptance are public one-time invitation-token flows; all parent portal, school management and guardian administration routes use authenticate. |
| `notifications/delivery-webhook.routes.ts` | Public provider callback requires configured provider identity, rate limit, raw-body signature, schema validation, idempotency and tenant resolution from stored outbox. |
| `report-cards/report-card-verification.routes.ts` | Public report-card verification endpoint is rate-limited and intentionally discloses no student identity or marks. |
| `platform/platform.routes.ts` | Tenant-context resolver is public and returns only host-resolved public tenant context; platform administration router uses authenticate plus requirePlatformAdmin. |
| `documents/document.routes.ts` | Document scanner callback is public at bearer-auth level but requires a timestamped HMAC signature over the raw body and validates the quarantined object/tenant binding before applying scan results. |

These endpoints are intentionally unauthenticated at the bearer-token layer; they are not all anonymous/no-proof operations. Invitation and password reset use opaque one-time capabilities; webhooks use provider signatures; report-card verification is rate-limited and privacy-minimized.

## Router-level inventory

| Route module | Route declarations | Authentication coverage |
|---|---:|---|
| `access/access.routes.ts` | 11 | 11 authenticated |
| `admissions/admission.routes.ts` | 11 | 11 authenticated |
| `attendance/attendance.routes.ts` | 13 | 13 authenticated |
| `auth/auth.routes.ts` | 15 | 9 authenticated; 6 explicit public |
| `billing/billing.routes.ts` | 7 | 5 authenticated; 2 explicit public |
| `curriculum/curriculum.routes.ts` | 10 | 10 authenticated |
| `documents/document.routes.ts` | 6 | 5 authenticated; 1 explicit public |
| `documents/governance.routes.ts` | 10 | 10 authenticated |
| `journeys/journey.routes.ts` | 1 | 1 authenticated |
| `notifications/delivery-webhook.routes.ts` | 1 | 0 authenticated; 1 explicit public |
| `notifications/suppression.routes.ts` | 4 | 4 authenticated |
| `organizations/organization.routes.ts` | 9 | 9 authenticated |
| `parents/parent.routes.ts` | 35 | 33 authenticated; 2 explicit public |
| `platform/platform.routes.ts` | 25 | 24 authenticated; 1 explicit public |
| `report-cards/report-card-verification.routes.ts` | 1 | 0 authenticated; 1 explicit public |
| `report-cards/report-card.routes.ts` | 22 | 22 authenticated |
| `schools/school-config.routes.ts` | 13 | 13 authenticated |
| `security-operations/security-operations.routes.ts` | 3 | 3 authenticated |
| `staff/staff.routes.ts` | 14 | 14 authenticated |
| `staff/teacher-membership.routes.ts` | 1 | 1 authenticated |
| `staff/teacher-timetable.routes.ts` | 27 | 27 authenticated |
| `students/student.routes.ts` | 11 | 11 authenticated |

## Authorization and trust-boundary findings

1. **Authentication coverage:** all 202 routes not designated as public exceptions are behind the shared `authenticate` middleware, either at router level or per route. The middleware also applies central MFA policy checks to authenticated routes, except its explicit identity/MFA bootstrap paths.
2. **School/organization authorization is not proven by authentication alone.** Route handlers still need membership, role/permission, resource ownership and tenant-context checks. This phase inventories middleware presence but does not claim a complete semantic authorization audit of every handler.
3. **Public/token flows:** invitation acceptance/preview, password recovery, refresh/logout and webhooks require separate capability/signature review and abuse controls. Their presence in the allowlist is deliberate, not an automatic security approval.
4. **Webhook boundary:** payment webhook verifies provider-specific HMAC against the captured raw request body using constant-time comparison. Notification delivery webhook validates configured provider, rate limits, verifies signed raw body, validates schema and resolves tenant from the persisted outbox record.
5. **Operational endpoints:** `/health/live`, `/health/ready` and `/api/v1` are intentionally public. `/internal/metrics` requires a configured bearer secret and returns 404 on invalid credentials.
6. **MFA exceptions:** shared middleware currently exempts only exact method/path pairs for `GET /me`, `GET /mfa/status`, `POST /mfa/totp/enroll` and `POST /mfa/verify`. Factor disable and session revocation are not exempt.

## Limitations / remaining work

- No API server, database or Redis was started for this phase.
- No live 401/403/429 behavior, webhook signature acceptance/rejection, token flow or cross-tenant denial was exercised.
- The source inventory does not prove that every handler has correct resource-level authorization or that every Prisma query is tenant-scoped.
- Alternate auth mechanisms outside Express route declarations (workers, scheduled jobs, direct service calls and deployment ingress) require separate review.
- Unit, API, browser and mobile test creation/execution remain deferred per project instruction.

## Reproducible source verification

Run `pnpm verify:p119` from the repository root. The script fails if route counts change unexpectedly, if a route without shared authentication is not on the explicit public allowlist, if expected router mounts disappear, or if the root/docs master gap registers diverge.
