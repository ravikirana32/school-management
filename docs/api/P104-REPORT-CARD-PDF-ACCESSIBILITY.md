# P104 — Report-card PDF Accessibility API

## Template settings
`PUT /api/v1/:organizationId/:schoolId/report-card-template`

Body fields include:
- `brandColor`: six-digit hex color; renderer checks contrast against white.
- `footerText`, `signatureLabel`.
- `layout`: `STANDARD`, `COMPACT` or `LARGE_PRINT`.
- `language`: BCP 47-style language tag such as `en-IN`, `kn-IN`, `hi-IN`, `ar` or `he`.

## Versioned templates
`POST /api/v1/:organizationId/:schoolId/report-card-templates` creates an immutable draft version with layout and language settings. Existing activation workflow makes a draft active.

## PDF downloads
`GET /api/v1/:organizationId/:schoolId/report-cards/:reportCardId/pdf` returns a short-lived signed URL and metadata:
- `accessibilityTagged`
- `accessibilityProfile`
- `documentLanguage`
- `generatedAt`

The parent portal PDF download endpoint returns the same accessibility metadata.

## Conformance note
`PDF/UA-1-TARGET` records the generator target only. It is not a validated compliance result. Formal validator and manual review remain mandatory before making a compliance claim.
