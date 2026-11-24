# P40 — Report-card designer, PDF templates and notification outbox

## Delivered

- School Admin report-card designer now uses tenant-scoped academic-year and active-grade lookup data, and the configured school board profile. The subject/component editor is structured rather than requiring JSON authoring.
- Draft schema preview displays subject and total component marks before submission. API-side Zod validation remains authoritative.
- Added school-scoped report-card PDF template settings in `SchoolPolicy`: brand colour, footer text and signature label. Settings are permission-gated by `reports.manage`.
- Replaced the single-page PDF writer with a dependency-free A4 multi-page renderer, page numbering, configurable accent colour/footer/signature label, and a deterministic verification code.
- Added notification batches, notification outbox and per-user/category/channel preferences. Report-card publication creates consent-aware in-app parent inbox rows and matching outbox audit rows in the same tenant transaction.
- Recipients are deduplicated by linked parent account, require an active guardian, `canReceiveCommunications`, accepted non-withdrawn consent, and are filtered by the parent's `REPORT_CARD` / `IN_APP` preference.

## Explicit limitations

- The PDF renderer uses built-in Helvetica fonts and replaces unsupported non-ASCII characters with `?`. Licensed multilingual font embedding is not implemented.
- The verification code is printed as text. QR generation, public verification endpoint and anti-tamper registry are not implemented.
- Template settings currently support a brand colour, footer and signature label; uploaded logos, multiple named templates, principal signature images and accessibility tagging are not implemented.
- EMAIL and PUSH preferences can be stored, but P40 does not dispatch external messages. In-app notifications are written atomically with publication and corresponding outbox rows are marked `DELIVERED` because the inbox record is persisted in the same transaction.
- Official CBSE/ICSE/IB/IGCSE/state-board assessment packs and regulatory endorsement are not supplied.

## API

- `GET /api/v1/:organizationId/:schoolId/report-card-lookups`
- `GET /api/v1/:organizationId/:schoolId/report-card-template`
- `PUT /api/v1/:organizationId/:schoolId/report-card-template`
- `GET /api/v1/:organizationId/:schoolId/portal/notification-preferences`
- `PUT /api/v1/:organizationId/:schoolId/portal/notification-preferences`

Existing report-card schema, approval, publication and parent download routes remain in place.
