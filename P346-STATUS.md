# P346 — Admissions Consent & Preference Integration

Status: Cycle 1 source implementation and audit completed (partial).

- Audited existing Parent Mobile ADMISSIONS notification preferences: IN_APP/EMAIL/PUSH toggles are category-based, school-scoped through API, offline writes are queued, and conflict/reconnect reconciliation is present.
- Added clear admissions-specific explanatory consent copy to Parent Mobile preference UI, distinguishing optional admission updates from application tracking/essential account-security messages and noting channel availability.
- Confirmed the existing guardian consent lifecycle (accepted consent timestamp and withdrawal timestamp) gates guardian communication recipients in relevant report-card communication/download flows.
- No schema or migration was added; existing APIs and consent fields are reused.

Open: dedicated admissions consent record/version history, explicit admissions-specific consent withdrawal UI/API, and verification that every admissions notification producer respects per-channel preferences. Runtime API/database, build, and device acceptance remain deferred.

Verifier: `scripts/verify-p346-admissions-consent-preference-integration.mjs` — 9/9 static checks PASS.
