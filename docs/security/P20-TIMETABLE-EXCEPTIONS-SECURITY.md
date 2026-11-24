# P20 Timetable Exception & Room Security

- All new routes authenticate and verify active organization/school membership.
- Room and exception mutations require School Admin access.
- Every Prisma operation runs inside `withTenantContext`; SQL tables use forced RLS with organization and school session settings.
- Composite foreign keys bind rooms/exceptions to the same school and bind exceptions to timetable slots and substitute assignments in that school.
- Room code uniqueness is school-scoped; exception uniqueness is slot/date-scoped.
- Substitute assignments must be active in the same school and academic year. Substitute conflicts are preflight checked.
- Timetable mutations acquire transaction-scoped PostgreSQL advisory locks per organization/school/academic year. This protects API-mediated writes that follow the same lock protocol, not arbitrary direct SQL writes.
- Exception reason is mandatory and length-limited. Sensitive student data is not returned by these APIs.
- RLS policies, composite FK behavior, authorization and concurrency must still be verified against a non-owner PostgreSQL role before production acceptance.
