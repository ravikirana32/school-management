# P07 Curriculum Security

- School endpoints require authenticated identity and active school membership.
- Mutations require a school-scoped SCHOOL_ADMIN role assignment.
- Tenant queries run in `withTenantContext` transactions.
- All P07 tables have forced RLS policies matching organization and school context.
- Curriculum entitlement is checked before board profile, grade and version mutations.
- Subject creation checks that both the curriculum version and grade belong to the current school; composite database foreign keys enforce the same boundary.
- The board catalogue is read-only product metadata; it does not confer accreditation or affiliation.
- Runtime RLS verification with a non-owner database role remains mandatory.
