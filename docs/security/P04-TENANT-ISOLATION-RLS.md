# P04 Tenant Isolation and PostgreSQL RLS

## Protected tables
- `School`
- `OrganizationMembership`
- `SchoolMembership`
- `UserRoleAssignment`

Each table has RLS enabled and forced. Policies compare `organizationId` against `current_setting('app.current_organization_id', true)`. School membership and role assignment policies also apply school context when supplied.

## Application contract
1. Authenticate the user.
2. Resolve and verify active organization membership before entering tenant work.
3. For school work, verify active school membership and that the school belongs to the selected organization.
4. Call `withTenantContext(prisma, { organizationId, schoolId, userId }, work)`.
5. Use only the transaction client passed to `work`.
6. Never set tenant variables with session-level `SET`; the helper uses transaction-local `set_config(..., true)`.
7. Production API DB credentials must be a dedicated non-superuser role and must not own RLS-protected tables.

## Not yet proven
- RLS behavior has not been executed against a live PostgreSQL instance in this artifact build.
- No role privilege audit has been run.
- No cross-tenant integration test has been executed.
- Tables outside the protected list still require explicit access policy and/or future RLS.
