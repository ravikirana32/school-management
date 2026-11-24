# P246 Delivery Report — Student Records & Profiles: Primary Photo Selection

## Implemented
- Added `StudentDocument.isPrimaryPhoto` with a Prisma migration.
- Student detail response exposes the primary-photo marker in document metadata.
- Added a permission-guarded endpoint to set a primary photo.
- Endpoint requires `students.update` plus `students.pii.read`, active school membership, tenant/school scoping, and teacher-to-student access validation.
- Only `PHOTO` records with `CLEAN` scan status and JPEG/PNG MIME types can be selected.
- Transaction advisory lock serializes concurrent primary-photo changes for the student; existing photo markers are cleared before setting the chosen record.
- Admin photo records UI now displays primary status and supports “Set as primary”; pending/rejected/quarantined photos cannot be selected.
- Primary-photo changes are audit logged.

## Static verification
- Source assertions: 11/11 passed.
- ZIP integrity: passed.
- Root/docs mirror identity: passed.
- Runtime/build/typecheck/API/mobile/E2E/security validation: deferred by project instruction.

## Gap status
No master gap was closed in P246. Counts remain unchanged; runtime validation is deferred.

## Remaining in Functionality 1
- Approved secure image preview/gallery.
- Replace photo workflow.
- Remove/deactivate photo lifecycle.
- Full profile edit/clear field audit and UX refinement.
- Runtime permission verification and final validation.

## Cumulative archive
`school-management-saas-P246-cumulative.zip`
