# P40 API and notification contract

All routes require authentication and active school membership. Tenant and school identifiers are checked server-side and queries execute through `withTenantContext`.

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/:org/:school/report-card-lookups` | `reports.read` | Academic years, active grades and configured board profile |
| GET | `/:org/:school/report-card-template` | `reports.read` | Current PDF branding settings or defaults |
| PUT | `/:org/:school/report-card-template` | `reports.manage` | Validate and save brand colour, footer and signature label |
| GET | `/:org/:school/portal/notification-preferences` | `parent.reports.read` | Current user's preferences in the selected school |
| PUT | `/:org/:school/portal/notification-preferences` | `parent.reports.read` | Upsert category/channel enabled state |

Preference categories: `REPORT_CARD`, `HOMEWORK`, `FEES`, `ATTENDANCE`, `GENERAL`. Channels: `IN_APP`, `EMAIL`, `PUSH`.

## Transactional publication fanout

When an approved report card is published, one database transaction persists the report state, PDF artifact metadata, approval event, notification batch, deduplicated parent inbox rows and `IN_APP` outbox records. Only active guardian links with communications enabled and accepted, non-withdrawn consent are eligible. Disabled `REPORT_CARD` / `IN_APP` preferences suppress the fanout. The payload contains a report-card ID and non-sensitive message; no signed PDF URL or storage key is included.

The P40 outbox is a durable audit of in-app delivery, not a general external-provider dispatcher. EMAIL/PUSH delivery, provider callbacks, retry scheduling and dead-letter processing remain open.
