# School Management SaaS — End-to-End Gap Remediation Programme (P79–P108)

## Mission and completion rule

This programme remediates the P78 inventory of 254 OPEN, 97 PARTIALLY_IMPLEMENTED, 108 READY_FOR_VERIFICATION and 12 BLOCKED_EXTERNAL items. It is not a feature-expansion roadmap. Every phase must complete the existing workflows end to end across data model/migration, API/service, authorization/RLS, web/mobile UI, background jobs/integrations, observability and automated tests wherever that layer applies.

A gap may move to CLOSED only when the implementation exists and reproducible evidence is retained. Source assertions alone are not acceptance. READY_FOR_VERIFICATION means source is present but its runtime proof is outstanding. BLOCKED_EXTERNAL remains blocked until the named external decision, contract, credential, legal opinion or official evidence is available; mocks do not close it.

## Phase sequence

| Phase | End-to-end remediation scope | Mandatory exit evidence |
|---|---|---|
| P79 | Authenticated identity bootstrap, memberships, roles and effective permissions | API tests; identity-context RLS tests; session bootstrap in web/mobile |
| P80 | Authentication completion: password reset, verification, MFA, refresh-family reuse detection, secure cookie/native token storage, lockout and audit | Email/OTP test adapter; API security tests; browser/mobile auth E2E; token replay tests |
| P81 | Tenant onboarding/lifecycle: organization/school creation, owner/admin provisioning, suspension, reactivation, offboarding and idempotency | DB constraints/migrations; transactional lifecycle tests; onboarding UI; worker/API enforcement |
| P82 | RBAC and membership administration: invitation, accept/resend/revoke, role CRUD, scoped permissions, delegation and audit | Positive/negative authorization matrix; IDOR tests; admin UI E2E; cache invalidation tests |
| P83 | SaaS subscription and entitlement lifecycle: plan catalog, checkout, renewal, proration, dunning, grace, cancellation and usage limits | Provider sandbox where selected; webhook replay/order tests; invoice/entitlement reconciliation |
| P84 | School setup and academic configuration: profile, campuses, academic years, terms, calendars, board packs and policy versioning | Migration/seed tests; admin CRUD; effective-date/overlap tests; board-rule provenance |
| P85 | Admissions and enquiry funnel: enquiry, application, documents, eligibility, seat reservation, parent tracking, conversion and notifications | Concurrent seat tests; upload security; end-to-end applicant-to-student flow |
| P86 | Student and guardian lifecycle: create/import, duplicate resolution, enrollment, allocation, promotion, transfer, withdrawal, graduation and reactivation | DB history/constraints; permission/PII tests; admin UI; full lifecycle E2E |
| P87 | Staff/teacher HR core: invitations, identity linking, employment lifecycle, assignments, departments, documents and substitute coverage | Overlap/concurrency tests; private-document scanning; HR/teacher role E2E |
| P88 | Attendance: student/staff attendance, policy, correction/approval, bulk capture, devices and parent visibility | School-day/timezone tests; offline conflict tests; API/UI/mobile E2E; audit evidence |
| P89 | Timetable and resource scheduling: class/teacher/room constraints, substitutions, recurring schedules and calendar integration | Conflict solver tests; concurrency tests; schedule UI; export and notification flow |
| P90 | Fees and payments: fee structures, invoices, concessions, installments, receipts, refunds, reconciliation and parent payment journey | Ledger invariants; payment sandbox; webhook reconciliation; refund and duplicate-payment E2E |
| P91 | Accounting and expenses: chart of accounts, journals, receipts, expenses, cash/bank, reconciliation and period close | Balanced-ledger property tests; audit; export; finance role E2E |
| P92 | Homework/LMS: authoring, assignment, submission, attachments, grading, feedback, late rules and parent/learner visibility | Storage scanning; grading workflow E2E; mobile upload/retry; permission tests |
| P93 | Exams and report cards: assessment plans, marks, moderation, approvals, templates, PDF, publication and verification | Calculation/property tests; approval separation; accessible PDF validation; parent portal E2E |
| P94 | Parent and teacher experiences: portal/mobile dashboards, communication, consent, notifications, schedules, attendance, fees and learning views | iOS/Android device matrix; role/child switching; push delivery; accessibility E2E |
| P95 | Notifications and communication: provider adapters, templates, localization, delivery, bounce/complaint, retry, preferences and suppression | Selected provider sandbox; callback authenticity; retry/dead-letter; delivery evidence |
| P96 | Transport: routes, vehicles, drivers, student assignments, GPS integration, safety alerts, consent and retention | Provider sandbox/device simulation; guardian permissions; geofence/alert E2E; retention tests |
| P97 | Library, inventory, facilities, hostel, canteen and visitor operations | Stock/asset invariants; booking/capacity tests; role workflows; audit and UI E2E |
| P98 | HR attendance, leave, payroll and statutory export foundations | Payroll calculation tests; approval segregation; privacy controls; jurisdictional review gates |
| P99 | Reports, dashboards and analytics: canonical metrics, reconciliation, filters, exports and scheduled reports | Metric definitions; reconciliation against source ledgers; query-plan/performance tests |
| P100 | Integrations, import/export and public APIs: CSV/XLSX validation, bulk jobs, idempotency, API keys, webhooks and partner sync | Contract tests; malicious-file tests; resumable jobs; audit and rate-limit tests |
| P101 | Document and data governance: private storage, malware scanning, retention, legal hold, export, deletion and consent lifecycle | Storage policy tests; deletion/hold precedence; data-subject workflow evidence |
| P102 | White-label and platform operations: custom domains, branding, tenant routing, support access, secrets and platform Super Admin | Domain ownership challenge; tenant routing isolation; dual approval/MFA; audit review |
| P103 | Mobile offline-first completion: conflict-safe queued mutations, sync cursor, retry, account switching and recovery | Device tests under network loss; duplicate/reorder tests; conflict resolution evidence |
| P104 | PDF and accessibility completion: multilingual shaping/RTL, tagged PDF/UA, reading order, fonts and templates | Arabic/Hebrew/Indic visual + extraction tests; screen-reader audit; license manifest |
| P105 | Production infrastructure: Docker/NGINX, CI/CD, lockfile, secrets, backups, DR, migrations, metrics, tracing and alerting | Reproducible clean install/build; restore drill; failover; load/soak; security scan |
| P106 | Cross-module end-to-end journeys: admission-to-enrollment, attendance-to-report-card, fee-to-ledger, staff-to-payroll, parent-to-mobile | Playwright + mobile E2E with seeded tenants; cross-tenant negative tests; retained artifacts |
| P107 | Security, privacy, board/jurisdiction and operational closure sprint | Threat model; penetration test; legal/board evidence; RPO/RTO and incident drills |
| P108 | Final acceptance and zero-gap reconciliation | All automated suites green; all runtime/third-party gates evidenced; every gap CLOSED or explicitly BLOCKED_EXTERNAL with signed decision; release approval |

## Required phase execution protocol

1. Start from the latest cumulative ZIP and inspect existing code before changing it.
2. Trace each target gap to the relevant schema, migration, service, route, UI, worker and tests. Reuse existing code; do not create parallel duplicate modules.
3. Implement the complete vertical slice, including permission-denied and cross-tenant cases.
4. Add deterministic unit, API/integration, database, browser and device tests appropriate to the feature.
5. Run all available checks. If dependencies/services/provider credentials are unavailable, mark the exact check blocked and preserve the command/evidence needed to run it later.
6. Update both root and `docs/MASTER-OPEN-GAPS-REGISTER.md`, phase status, test report, delivery report, implementation status and changelog.
7. Recount unique gap IDs by status from the structured register and cross-check against the prior baseline. Do not infer closure from source presence.
8. Create and verify one cumulative ZIP for the phase. Never replace the previous cumulative artifact.

## Release gate

P108 cannot declare completion while OPEN, PARTIALLY_IMPLEMENTED/IN_PROGRESS or READY_FOR_VERIFICATION items remain. BLOCKED_EXTERNAL items require a documented owner, decision, evidence and release disposition; they cannot be silently counted as implemented. The product must pass clean-install, migration, API, web, mobile, tenant isolation, security, accessibility, backup/restore, load and provider-sandbox acceptance before production approval.
