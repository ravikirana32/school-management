# P342 — Admission Finance Configuration

## Baseline audit
Admission offers already support an optional fee and currency. Fee handoff, ledger-charge creation, recording payments, receipts, and admission-to-enrollment transfer exist. A school-level default fee/currency configuration was missing.

## Implemented
- Added school-scoped GET/PUT `/finance-config` under the admissions API.
- Stored configuration in existing `SchoolPolicy` using `admissions_finance_config`; no schema migration.
- Write requires `admissions.manage` and `fees.manage`.
- Validates enabled, nonnegative optional fee, 3-letter currency, and label.
- Offer creation falls back to configured defaults only when the request does not supply values.

## Remaining gaps
- Admin UI to manage this config.
- Runtime integration tests against PostgreSQL, permission setup and API route execution.
- Configuration change history / approval controls.
- Full browser/mobile/E2E validation.
