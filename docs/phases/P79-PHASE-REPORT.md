# P79 — Authenticated identity and access bootstrap

## Objective
Provide a reliable post-login identity endpoint so web/mobile clients can initialize the signed-in user, memberships and effective permission list without guessing tenant context.

## Implementation
- Authenticated `GET /api/v1/auth/me`.
- User profile excludes password/session secrets.
- Organization and school memberships are queried by authenticated user ID only.
- Role assignments and permission keys are resolved from assigned roles.
- Membership/role queries run in transaction-local identity context.

## Acceptance
- Source verifier: 9/9 PASS.
- Runtime API, RLS, semantic typecheck and UI bootstrap: pending.

## Gap disposition
P02-G017 and P79-G001/G002 move to READY_FOR_VERIFICATION, not CLOSED. P79-G003 remains OPEN.
