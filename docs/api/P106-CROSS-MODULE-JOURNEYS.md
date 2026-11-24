# P106 Cross-module Journey Overview API

`GET /api/v1/:organizationId/:schoolId/journeys/overview`

Requires authenticated user, active membership in the requested organization/school and `reports.read`. All reads execute inside tenant context.

## Journeys returned
- `admissionToEnrollment`: applications, converted applications and enrolled students.
- `attendanceToReportCard`: attendance sessions/marks and report-card publication counts.
- `feeToLedger`: fee charges/payments and operational outstanding amount. Explicitly blocked because no accounting ledger/posting module exists in the P105 schema.
- `staffToPayroll`: active staff, employment history and teacher assignments. Explicitly blocked because no payroll run/payslip module exists in the P105 schema.
- `parentToMobile`: active/linked guardians, accepted/pending invitations and parent notification counts; lists existing parent mobile capability areas.

## Important semantics
- Read-only summary; no mutations.
- Fee amountPaid is a school-fee operational field, not a reconciled accounting balance.
- Payment totals are shown separately from charge amountPaid to avoid implying ledger reconciliation.
- Mobile capability labels describe existing client screens, not verified device delivery.
- The response includes explicit limitations and next actions.
