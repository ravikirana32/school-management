# P06 School Configuration Security

- All new records carry organizationId and schoolId.
- Composite foreign keys ensure school belongs to organization.
- RLS is enabled and forced on all P06 tables; policies require both transaction-local organization and school settings.
- API checks active school membership for reads and SCHOOL_ADMIN assignment for mutations.
- Academic-year creation checks the organization's `academicConfiguration` subscription entitlement.
- Audit logs are written for profile changes. Additional audit coverage for every calendar/policy mutation is still required.
- Production must use a non-owner, non-superuser database role and tenant queries must use only the transaction client.
