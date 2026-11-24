# P38 phase report — Report Card Governance

Date: 2026-11-17

## Outcome

P38 adds source implementation for versioned report-card assessment schemas, grade/year/board-scoped activation, schema-validated report drafts, principal approval/rejection, approval event history and private PDF publication/download. Existing direct publication paths are disabled so a report cannot bypass the approval workflow.

## Key implementation

- Prisma models: `ReportCardSchemaVersion`, `ReportCardApprovalEvent`, `ReportCardPdfArtifact`; `StudentReportCard` adds `schemaVersionId`, `gradeLevelId` and `approvalStatus`.
- Migration: `20261117170000_p38_report_card_governance`, including composite tenant FKs, forced RLS, indexes and one-active-schema partial unique index.
- API: schema authoring/activation, schema-backed report creation, approval request, principal approve/reject, PDF publication and operator/parent signed-download endpoints.
- Permission seed: `reports.approve`, granted to SCHOOL_PRINCIPAL.
- PDF generation is a dependency-free minimal PDF writer; private S3-compatible upload uses server-side encryption and records SHA-256/size metadata.
- Legacy report creation is draft-only; legacy direct publish endpoint returns 409.

## Verification actually performed

- TypeScript syntax transpilation: PASS 10/10 changed TS/TSX files; this checks syntax only, not types or imports at runtime.
- PDF helper smoke test: PASS for header, content, EOF and escaping; `pdfinfo` independently parsed the generated file as a one-page A4 PDF. Report-card validation helper smoke checks PASS 5/5.
- Static source assertions: PASS 14/14 for route mount, composite FKs, correct tenant-context RLS settings, forced RLS, active schema unique index, immutable event trigger, artifact uniqueness, approval permission, self-approval block, parent consent/link checks, private storage/checksum, legacy publish block, manifest and gap-register parity.
- Artifact manifest JSON parse and root/docs gap-register parity.
- Cumulative ZIP integrity.

Not run: pnpm install, Prisma validate/generate, PostgreSQL migration/RLS/API integration, Vitest, full typecheck/build, PDF parser validation, S3 integration, Playwright, Expo device tests, k6. Runtime acceptance is NOT VERIFIED.

## Known limitations

- The existing Parent Operations screen blocks the obsolete generic JSON draft/publish controls and points to the governed workflow; the dedicated schema editor and principal approval queue remain for P39.
- PDF template is one-page, text-only and English/ASCII-safe; no branding, multi-page pagination, localized font support, QR/signature verification or accessibility layout.
- Official board-specific assessment packs are not included; school board profile must match `boardKey`.
- No provider integration test for S3; deployment bucket/IAM/encryption/lifecycle policy must be reviewed.
- No notification delivery when report cards are approved/published.

## Next phase

P39 should add school-admin schema authoring and principal approval UI, parent mobile PDF download/status, PDF template customization and integration tests. Carry forward all P00–P38 unresolved gaps, including notification outbox and delivery, homework rubric versions, payment provider decision, pagination snapshot semantics, query plans/k6 and runtime acceptance.
