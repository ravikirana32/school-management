# P246 Status — Student Records & Profiles

**Status:** Source implementation completed for primary-photo selection. Formal validation remains deferred.

- Added `isPrimaryPhoto` to student document model and migration.
- Student detail response returns photo primary flag.
- Admin UI allows selecting a clean JPEG/PNG PHOTO record as primary.
- API enforces active membership, students.update, students.pii.read, student access, school/tenant scoping, clean scan status, and audit logging.
- Transaction advisory lock serializes per-student primary-photo selection.
- No gap closure claimed.

**Deferred:** builds/typechecks, API/runtime, migration execution, mobile/E2E, and security validation.
