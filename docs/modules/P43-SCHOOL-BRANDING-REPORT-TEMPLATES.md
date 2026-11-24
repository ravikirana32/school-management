# P43 — School Branding & Versioned Report-card Templates

## Delivered source capabilities

- School logo uploads use a short-lived S3-compatible presigned POST into a tenant-scoped `quarantine/` key.
- Uploads accept PNG/JPEG only, max 5 MiB. Completion verifies object metadata, exact declared byte size, MIME type and upload ID before moving the asset to `QUARANTINED`.
- The existing malware scanner queue dispatches the `school-logo` kind. Only a scanner callback with the configured HMAC signature and matching object key/MIME can promote it to `private/` and mark it `CLEAN`.
- The active `SchoolProfile.logoObjectKey` changes only after a clean scan. Logo retrieval uses a 60-second private signed URL. Report-card PDF generation embeds the active clean logo.
- `ReportCardTemplateVersion` supports named keys and incrementing versions, DRAFT/ACTIVE/RETIRED states, school-scoped list/create/activate APIs and activation permission checks.
- Activated template content is immutable by SQL trigger; a partial unique index permits one ACTIVE version per template key and school.
- New active named templates take precedence over the legacy single `SchoolPolicy` template when generating report-card PDFs.

## API routes

- `POST /api/v1/:organizationId/:schoolId/school-brand/logo/upload`
- `POST /api/v1/:organizationId/:schoolId/school-brand/logo/:assetId/complete`
- `GET /api/v1/:organizationId/:schoolId/school-brand/logo`
- `GET /api/v1/:organizationId/:schoolId/report-card-templates`
- `POST /api/v1/:organizationId/:schoolId/report-card-templates`
- `POST /api/v1/:organizationId/:schoolId/report-card-templates/:templateId/activate`

Logo endpoints require `school.settings.manage`; template creation requires `reports.manage`; activation requires `reports.approve`.

## Important boundaries

- Uploads remain quarantined and cannot be used in PDFs before scanner approval.
- Only the current clean logo is selected. Replaced historical assets are retained; lifecycle cleanup/retention is not enabled.
- This phase does not implement Arabic shaping/RTL, tagged accessible PDFs, font embedding review or PDF visual regression.
- Email provider receipts/bounces/complaints and PUSH device registration remain unimplemented.

## UI status

P43 delivers authenticated APIs and backend lifecycle only. A dedicated School Admin visual logo/template management UI is deferred to P44.
