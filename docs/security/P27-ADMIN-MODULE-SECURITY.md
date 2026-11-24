# P27 — Admin Module Security Notes

- Requests use the shared authenticated session and automatic access-token refresh.
- Tenant identifiers are derived from the active membership selection; no free-form tenant override is exposed.
- Server-side membership, School Admin, entitlement and module checks remain authoritative.
- Student tables render summary fields only. Full student detail and guardian data are not bulk-loaded into the list view.
- No access/refresh tokens or passwords are persisted by the new module workspace.
- No document binary is uploaded; document storage remains a private-object-storage workflow.
- Role assignment accepts user and role IDs, but the backend verifies active school membership and role scope before writing.
- Permission catalogue keys are validated by the backend when creating roles.

## Known authorization limitations
Student and staff route families currently use School Admin checks rather than fully granular `students.*` / `staff.*` permissions. Access administration is also School Admin-gated. Curriculum mutation requires School Admin access and an active curriculum entitlement. The frontend capability gate is not a substitute for these backend checks.

## Required acceptance
Test cross-tenant reads/writes, missing/expired tokens, role permission denial, subscription entitlement denial, student PII minimization, and assignment to inactive/non-member accounts using a non-owner database role.
