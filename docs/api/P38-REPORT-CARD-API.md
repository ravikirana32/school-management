# P38 report-card API contract

All endpoints require bearer authentication and active school membership. All report-card mutations are tenant scoped through transaction-local PostgreSQL context.

| Method | Path suffix | Permission | Purpose |
|---|---|---|---|
| GET | `/report-card-schemas` | reports.read | List schema versions |
| POST | `/report-card-schemas` | reports.manage | Create draft schema |
| POST | `/report-card-schemas/:schemaId/activate` | reports.approve | Activate schema; retire prior active version |
| POST | `/report-cards/versioned` | reports.manage | Create schema-validated draft |
| POST | `/report-cards/:id/request-approval` | reports.manage | Submit draft |
| POST | `/report-cards/:id/approve` | reports.approve | Approve/reject; author self-approval denied |
| POST | `/report-cards/:id/publish-versioned` | reports.manage | Generate private PDF and publish approved report |
| GET | `/report-cards/:id/artifact` | reports.read | Issue 60-second signed URL |
| GET | `/portal/report-cards/:id/download` | parent.reports.read | Parent signed URL after consent/link checks |

Schema body contains `academicYearId`, `gradeLevelId`, `boardKey`, `code`, positive `version`, optional effective dates and `subjects[]`; each subject has a unique code and one or more components with unique keys and maximum/pass marks. Report body references the active schema and supplies subject/component scores. Scores above a configured maximum, unknown subjects/components, missing enrolled grade/year or duplicate student/year/term report are rejected.

Approval decision body is `{ "decision": "APPROVE" }` or `{ "decision": "REJECT", "reason": "..." }`. Rejection requires a reason. The author cannot approve their own report.
