# P38 report-card security controls

- Schema, report, approval event and PDF artifact records carry organization and school identifiers. SQL migration creates composite tenant FKs and enables plus forces RLS on all new tables.
- Report cards bind to schema versions through a composite tenant FK. The schema itself binds to the selected academic year and grade within the same tenant.
- Only active school members with the corresponding scoped permission can operate the workflow. Schema activation and approval/rejection require `reports.approve`; seeded only to SCHOOL_PRINCIPAL.
- The report author is prevented from approving/rejecting their own report.
- Parent artifact downloads additionally require accepted, non-withdrawn parent consent and a communications-enabled guardian/student link.
- PDF bytes are written to a private S3-compatible bucket with server-side encryption; object keys are tenant scoped and unguessable. API returns 60-second signed URLs, never public object URLs.
- SHA-256 and byte length are stored for integrity/audit. Report publication and approval events include actor attribution.
- Legacy direct publication has been disabled. Existing legacy published reports remain readable but do not automatically receive generated PDF artifacts.

Deployment must validate bucket public-access block, least-privilege IAM, encryption, retention and backups. Runtime RLS tests with a non-owner DB role and adversarial cross-tenant tests have not yet run.
