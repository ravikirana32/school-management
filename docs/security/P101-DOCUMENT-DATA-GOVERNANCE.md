# P101 — Document and Data Governance Security

- Governance APIs require active school membership and `school.settings.manage`.
- Data-subject record lookup is scoped by organization and school.
- Legal holds apply only to supported document target types and are audited on placement/release.
- Retention preview considers only CLEAN records and excludes records with an active matching legal hold.
- P101 does not perform automatic deletion, export, or erasure.
- Parent consent acceptance and withdrawal append versioned notice snapshots to `DataConsentEvent`.
- Consent history and governance records are protected by forced tenant RLS.
- Database-owner/superuser tamper resistance, cryptographic event chaining, formal identity proofing, legal retention schedules and jurisdiction-specific compliance remain open for later phases.
