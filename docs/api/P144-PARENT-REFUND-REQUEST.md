# P144 — Parent-initiated refund request

POST `/api/v1/parents/:organizationId/:schoolId/portal/children/:studentId/fees/payments/:paymentId/refunds`

Requires bearer authentication, parent fee permission with active consent, a verified guardian link to the student, payment belonging to that student/school, `Idempotency-Key` header (8–120 chars), amount and reason. Transaction locks idempotency and payment refund reservation keys, checks existing requests/approved/settled refunds against the payment amount, persists REQUESTED status, lifecycle event and audit log. Repeated key returns the prior request; key reuse for another payment conflicts. The app action is unavailable offline. No gateway transfer is initiated.

Runtime acceptance is pending.
