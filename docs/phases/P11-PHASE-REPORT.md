# P11 Phase report — Roles, permissions and staff access hardening

## Implemented in source
Permission resolver, permission catalog and seeded least-privilege school roles, custom role API, member role assignment/revocation APIs, permission introspection, verified existing-account staff linking, teacher self-assignment endpoint, StaffInvitation model/RLS, Prisma RBAC relationships, admin preview, tests and documentation.

## Static checks
- Access router mounted before 404: PASS (source inspection).
- Prisma relation fields added for Role/Permission/RolePermission/UserRoleAssignment: PASS (source inspection).
- StaffInvitation model, migration table and forced RLS: PASS (source inspection).
- Five baseline roles and permission catalog in seed: PASS (source inspection).
- Teacher endpoint filters to caller's own active linked staff profile: PASS (source inspection).
- No open invitation redemption endpoint or email delivery falsely claimed: confirmed limitation.

## Not runtime verified
No dependency install, Prisma format/validate/generate, migration execution, TypeScript build, automated tests, API integration, database/RLS tests, security penetration tests or browser E2E tests were run.

## Deliberate exclusions
No public invitation acceptance/token redemption, account creation, password issuance, email delivery, cross-module migration to granular permissions, HR self-service, student PII field-level access, guardian/parent permissions or complete audit coverage.
