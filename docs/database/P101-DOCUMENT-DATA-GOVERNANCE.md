# P101 — Database and RLS

Migration: `20261117235900_p101_document_data_governance`.

## Models
- `DataGovernanceRequest`: data-subject request intake and controlled review status.
- `DocumentLegalHold`: tenant-scoped hold and release record for a document target.
- `DocumentRetentionPolicy`: school-scoped retention period and enabled state.
- `DataConsentEvent`: acceptance/withdrawal event with consent version and notice snapshot.

## Database protections
- All four tables enable and force PostgreSQL row-level security.
- Each table's policy requires both `app.current_organization_id` and `app.current_school_id` to match.
- Retention period is constrained to 1–36,500 days.
- The migration does not add cascading foreign keys for polymorphic document targets; API validation checks the selected target type within the current tenant/school.

## Acceptance pending
Prisma validation, client generation, clean/upgraded PostgreSQL migration, rollback/reapply and non-owner RLS isolation checks remain deferred.
