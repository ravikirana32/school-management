# P353 — Payroll implementation report

## Feature delivery
- Monthly salary structures with base salary and JSON earning/deduction components, fixed or percentage calculations.
- Effective-dated salary assignment to active staff.
- Monthly payroll generation snapshots staff, employee number, salary components, earnings, deductions and net pay.
- Guard against duplicate payroll period generation.
- Payroll lifecycle: draft → approved → paid; guarded transitions.
- Admin UI for structure setup, assignment, generating runs, reviewing totals, approval and marking paid.
- Staff Mobile self-service payslip history limited to the authenticated linked staff member and approved/paid runs.
- API is tenant scoped, checks active membership, admin or permission, validates staff/structure belongs to same school.
- Permissions seeded and HR/Principal/Finance role grants wired.

## API endpoints
- `GET/POST /:organizationId/:schoolId/payroll/structures`
- `GET/POST /:organizationId/:schoolId/payroll/assignments`
- `GET/POST /:organizationId/:schoolId/payroll/runs`
- `POST /:organizationId/:schoolId/payroll/runs/:runId/approve`
- `POST /:organizationId/:schoolId/payroll/runs/:runId/pay`
- `GET /staff/me/:organizationId/:schoolId/payroll/payslips`

## Calculation logic
- Base monthly salary + earning components = gross.
- Deduction components are subtracted from gross.
- Fixed components use a currency amount; percent components use base salary as the calculation base.
- Net is clamped at zero (no negative payable).
- Calculated component amounts are stored in run items as a snapshot.

## Source verification
- P353 static verifier: **23/23 PASS**.
- Touched TS/TSX syntax diagnostics: **0 syntax errors across 7 files**.
- Full TypeScript typecheck/build not executed due missing project dependencies.
- Prisma schema CLI validation/generation and migration not executed due unavailable Prisma CLI/database services.
- Runtime API, permission/tenant isolation, mobile/browser, end-to-end, regression, security and device tests not executed.

## Remaining gaps (Cycle 2 / future completion)
- India statutory payroll rules (PF, ESI, professional tax, TDS, gratuity, bonus and state-specific requirements) need implementation and qualified validation.
- Attendance and leave proration, overtime, unpaid leave, advances, arrears, adjustments.
- Accounting journal integration, payment provider/bank transfer export, reconciliation, idempotency and failures.
- Segregation of duties, immutable approval controls, corrections/reversals, payslip PDFs and notifications.
- Runtime database/API/build/typecheck/E2E/device/security acceptance.
