# API Standards and Endpoint Inventory

Base path: `/api/v1`.

## Standards
- JSON REST APIs.
- OpenAPI specification is the source of truth.
- Consistent success/error envelopes and stable error codes.
- Pagination, filtering and sorting use documented allowlists.
- Request ID and structured server logs.
- Input validation at API boundary.
- Authenticated tenant context and resource authorization.
- Idempotency keys for payments and retry-sensitive mutations.
- Webhook signature verification, deduplication and replay protection.
- Private file access through short-lived authorized URLs.
- API versioning and deprecation policy.
- Rate limits by identity, tenant, route and risk.

## Domain endpoint prefixes
`/auth`, `/users`, `/organizations`, `/schools`, `/subscriptions`, `/access-control`, `/education`, `/academic-sessions`, `/students`, `/guardians`, `/teachers`, `/employees`, `/classes`, `/subjects`, `/timetables`, `/attendance`, `/homework`, `/examinations`, `/results`, `/fees`, `/payments`, `/hr`, `/transport`, `/library`, `/inventory`, `/notifications`, `/messages`, `/reports`, `/files`, `/integrations`, `/audit-logs`.

## Representative workflows
- Organization: create, verify, configure.
- School: create under organization, configure, activate.
- Student: admission, guardian link, enrollment, promotion/transfer.
- Attendance: create session, mark attendance, correct with approval.
- Fees: assign structure, invoice, payment, allocation, receipt, refund.
- Exams: schedule, enter marks, calculate grades, approve and publish.
- Parent: retrieve authorized child list, switch child context, access permitted records.
- Teacher: retrieve authorized school/class assignments and perform scoped actions.

## Required OpenAPI details
For every endpoint document operation ID, purpose, auth, permission, tenant scope, request schema, response schema, error cases, idempotency, pagination, rate limit and audit requirements.
