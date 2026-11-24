# P248 Delivery Report — Student Photo Deactivation Lifecycle

## Delivered
- Added `StudentDocument.isActive` defaulting true and a migration/index.
- Added permission-scoped PATCH deactivation endpoint for a student photo; validates tenant/school/student scope and teacher access, then marks the record inactive and clears primary status.
- Deactivation audit event includes prior primary status.
- Primary designation and secure preview queries require active photos.
- Student detail photo metadata exposes active status.
- School Admin UI adds confirmation and deactivation action; inactive photos cannot be previewed or designated primary.
- Replacement flow is safely supported as upload a new PHOTO, approve scan, optionally set new primary, then deactivate the old record. No hard storage deletion is performed.

## Static source assertions
- Schema field and migration present.
- Deactivation route present and permission gated.
- Organization/school/student scoping present.
- Teacher access guard present.
- Deactivation clears primary marker.
- Audit action present.
- Preview query active + CLEAN + JPEG/PNG gated.
- Primary-photo query active + CLEAN + JPEG/PNG gated.
- Admin confirmation/deactivation UI present.
- Inactive state prevents preview and primary actions.

**Runtime/build/typecheck/API/E2E/mobile/security validation remains deferred. No master gap is closed in P248.**
