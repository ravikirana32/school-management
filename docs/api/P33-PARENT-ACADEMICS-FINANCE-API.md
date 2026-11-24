# P33 API inventory

Parent endpoints (authenticated, consent and relationship scoped):
- `GET /:organizationId/:schoolId/portal/children/:studentId/fees`
- `GET /:organizationId/:schoolId/portal/children/:studentId/homework`
- `GET /:organizationId/:schoolId/portal/children/:studentId/report-cards`
- `GET /:organizationId/:schoolId/portal/notifications`
- `POST /:organizationId/:schoolId/portal/notifications/:notificationId/read`

School operations (active school membership + permission):
- `POST /:organizationId/:schoolId/parents/children/:studentId/fees`
- `POST /:organizationId/:schoolId/parents/fees/:chargeId/payments` — manual reconciliation only
- `POST /:organizationId/:schoolId/parents/children/:studentId/homework`
- `POST /:organizationId/:schoolId/parents/children/:studentId/report-cards`
- `POST /:organizationId/:schoolId/parents/children/:studentId/notifications`

Parent response data is restricted to published records and the requesting guardian's exact student relationship.
