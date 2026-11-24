# P19 Timetable Conflict & Tenant Security

- Every route authenticates and verifies active membership.
- Slot writes, updates, bulk validation/import and export require School Admin access.
- All database operations run in tenant context and constrain organization and school IDs from the authenticated route scope.
- Batch row payloads cannot select another organization or school.
- Batch import is all-or-nothing after preflight validation; duplicate rows and persisted overlaps reject the batch.
- Teacher and room collision checks include effective-date intersection and same-weekday time intersection.

## Security verification still required
Run PostgreSQL integration tests using the production-like non-owner DB role, cross-tenant identifiers, revoked memberships, non-admin roles, simultaneous imports and large batch payloads. Preflight conflict checks are not concurrency-safe until a DB-level constraint or serialized locking mechanism is added.
