# P28 — Operational Workflows & Authorization Hardening

## Scope

P28 extends the authenticated School Admin operational workspace across curriculum, students, staff and access administration. All calls continue through the shared session request helper and the active organization/school context.

## Delivered

### Curriculum
- Added subject creation against a selected curriculum version and school grade.
- Added version status transitions among DRAFT, ACTIVE and RETIRED.
- Activating a version retires other active versions for the same school and academic year within one transaction.
- The UI now exposes grade/version pickers and subject listing.

### Students
- Student admission can create up to the schema-supported guardian contacts in the same backend transaction; this UI captures one primary guardian.
- Added enrollment creation using selected student, grade and active academic year.
- Added authorized pickup-contact creation with validity dates.
- Student detail only includes guardian contacts, pickup contacts and document metadata when `students.pii.read` is granted.
- PII detail reads are audit logged.

### Staff
- Added department and designation creation.
- Added department/designation selectors to staff creation.
- Added staff status lifecycle actions and teacher assignment pickers based on loaded staff and grade records.
- `staff.pii.read` gates email, phone, address, emergency contact and other sensitive detail fields; PII list/detail reads are audit logged.

### Access administration
- Added active school member discovery for assignment selectors.
- Added role assignment listing and revocation UI.
- Added access audit listing.
- Role creation, assignment and revocation write actor-attributed `AuditLog` events in the same transaction as the mutation.

### Authorization hardening
- Student routes now enforce `students.read`, `students.create` or `students.update` by operation.
- Staff routes now enforce `staff.read`, `staff.create`, `staff.update` or `staff.assign` by operation.
- Access administration separates `access.roles.manage` from `access.assignments.manage`.
- Curriculum routes use `academics.read` for reads and `academics.manage` for mutations.
- Permission matching is centralized and tested for exact, module wildcard and global wildcard behavior.
- Seed adds `students.pii.read` and `staff.pii.read`; school administrators receive the full catalogue. Principal receives student PII read; HR receives staff PII read.

## Security boundaries and limitations

- PII read auditing is application-level and depends on API-mediated access. Database-level audit triggers prevent update/delete of AuditLog, but privileged database owners can alter triggers.
- The staff API still exposes employment lifecycle history only partially; document binary upload, verified account linking and full employment-history editing remain outside this phase.
- Guardian editing, guardian portal invitation and document binary upload are not implemented in this UI.
- Access audit is a bounded latest-100 view, not a long-term export/retention solution.
- Curriculum activation is transactional but concurrent activation races have not been tested or prevented with a database uniqueness constraint.
- Some existing route-level broad authorization and field-level policies elsewhere in the product remain open; see the master register.

## Acceptance status

Source-level implementation is complete for the listed workflows. Prisma validation, migrations, database RLS, API integration, full builds, Vitest and browser E2E have not been executed in this environment. Runtime acceptance is NOT VERIFIED.
