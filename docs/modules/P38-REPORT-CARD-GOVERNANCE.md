# P38 — Report-card schema governance, approval and private PDF

## Delivered source scope

- Versioned schema definitions scoped by organization, school, board, academic year and grade. A schema contains an explicit subject catalogue and assessment components with maximum/pass-mark bounds.
- One active schema per school/year/grade/board is enforced by a PostgreSQL partial unique index. Activating a new version retires the previous active version.
- New schema-backed report cards require an active schema, a student enrolled in the exact grade/year, allowed subject codes and component scores within configured bounds.
- Report cards move through DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → PUBLISHED. The author cannot approve their own report. Approval/rejection/publication events are append-only by API convention and tenant scoped.
- Publication generates a PDF in-process, stores it in private S3-compatible object storage with server-side encryption, and records its byte length and SHA-256 digest. The API returns short-lived signed download URLs only after permission checks.
- Parent download requires `parent.reports.read`, active school membership, accepted non-withdrawn consent and a communications-enabled student/guardian link.
- Legacy report-card creation can create drafts only; the legacy direct-publish route is disabled to prevent bypassing approval.

## API routes

- `GET /api/v1/:organizationId/:schoolId/report-card-schemas`
- `POST /api/v1/:organizationId/:schoolId/report-card-schemas`
- `POST /api/v1/:organizationId/:schoolId/report-card-schemas/:schemaId/activate`
- `POST /api/v1/:organizationId/:schoolId/report-cards/versioned`
- `POST /api/v1/:organizationId/:schoolId/report-cards/:reportCardId/request-approval`
- `POST /api/v1/:organizationId/:schoolId/report-cards/:reportCardId/approve`
- `POST /api/v1/:organizationId/:schoolId/report-cards/:reportCardId/publish-versioned`
- `GET /api/v1/:organizationId/:schoolId/report-cards/:reportCardId/artifact`
- `GET /api/v1/:organizationId/:schoolId/portal/report-cards/:reportCardId/download`

## Permissions

- `reports.manage`: schema authoring, report drafting, request approval and publication.
- `reports.approve`: schema activation and principal approval/rejection. Seeded for SCHOOL_PRINCIPAL.
- `reports.read`: operator listing/download of published artifact.
- `parent.reports.read`: parent download with separate consent and relationship checks.

## Limitations

- The initial PDF is a simple one-page Helvetica document with text-only marks; branded templates, multi-page pagination, localized fonts, signatures, QR verification and accessibility are not implemented.
- Schema `boardKey` is tied to the configured school board profile, but official board syllabus/assessment packs and regulatory validation are not bundled.
- The existing School Admin Parent Operations screen now disables the legacy JSON draft/publish controls and explains the governed workflow; dedicated schema authoring and principal approval UI are deferred to P39.
- Generated object upload is private and server-side encrypted, but S3 permissions, bucket policy, backup and lifecycle configuration must be verified in deployment.
- Runtime database, RLS, storage and browser/device acceptance remains pending.
