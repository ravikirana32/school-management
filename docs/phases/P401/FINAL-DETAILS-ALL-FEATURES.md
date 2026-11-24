# School Management SaaS — Final Details of All Features

**Source-of-truth baseline:** P358 cumulative release  
**Baseline archive:** `school-management-saas-P358-cumulative.zip`  
**Purpose:** This document is the master functional inventory and Cycle 2 (C2) implementation plan. Work phase-by-phase from this document. Preserve existing code; audit before reworking. A feature is not considered complete merely because a model, route, screen, or static verifier exists.


## 1. Baseline assessment and rules

| Measure | Current estimate | Meaning |
|---|---:|---|
| Major functional domains represented in source | ~75% | Broad domain coverage exists |
| Basic workflow implementation in source | ~60–65% | Workflows exist at varying depths |
| End-to-end integration (API/database/web/mobile) | ~40–45% | Integration and runtime proof are incomplete |
| Runtime/build/test confidence | ~15–20% | Full project-wide execution not demonstrated |
| Enterprise/production readiness | ~25–30% | Enterprise controls and evidence remain open |
| Overall functional implementation estimate | ~62% | Planning estimate, not a test pass rate |

Estimates are expert planning estimates based on source inventory and documented gaps, not measurements. They must be recalculated after C2-01 to C2-04 using build/runtime/E2E evidence.

### Completion evidence standard
- **Implemented (source):** source code appears to implement the described behavior; runtime not necessarily verified.
- **Remaining:** missing, incomplete, integration, validation, or enterprise-hardening tasks.
- **Close a gap only with evidence:** implementation reference plus appropriate test/build/runtime/E2E/security evidence. Do not mark a gap closed from a static text check alone.
- Audit current implementation before adding or replacing code. Avoid duplicate modules and regressions.


## 2. Application surfaces

### Web applications
- Super Admin — platform/control-plane administration, tenant/platform foundations. **Estimate: 65% platform domain.**
- Organization Admin — organization-level configuration and management foundations. **Included in organization/tenant setup estimate (~55%).**
- School Admin — operational school administration workspace across available modules. **Coverage varies by module; not a single completion percentage.**
- Public Portal — public admissions/applicant-facing foundations. **Admissions estimate: ~60%.**

### Mobile applications
- Parent Mobile — **~40%**: some child, health, canteen and other panel foundations; complete daily parent journey is unfinished.
- Student Mobile — **~25%**: auth/canteen foundation; daily academic/self-service features are incomplete.
- Teacher Mobile — **~45%**: attendance, timetable and offline foundations; teaching workflows need completion.
- Staff Mobile — **~50%**: admissions, HR/leave, payroll, canteen and health panels exist in source; full workflow/role coverage incomplete.


## 3. Feature inventory — completed source and remaining work

Percentages are estimates of source implementation coverage, not test success.


### F01 — Platform, SaaS, multi-tenant foundation — 65%
**Implemented/source represented**
- Multi-organization and multi-school entities/relationships.
- Organization and school membership foundations.
- Platform administration/control-plane settings and tenant lifecycle records.
- Subscription plans, subscriptions, invoices, payment attempts, webhook/entitlement foundations.
- Support-access grant records and security-operation records.
- Branding, tenant configuration and custom-domain foundations.
- Tenant/school context helpers and PostgreSQL RLS/migration foundations.

**Remaining**
- Finish platform UI and operator workflows for tenant creation, suspension, activation, transfer, closure and deletion.
- Verify entitlement/plan limits enforced on every applicable endpoint, job and feature.
- Complete subscription lifecycle, invoicing, failed-payment/retry/dunning and usage metering.
- Tenant provisioning/deprovisioning automation and safe tenant export/migration.
- Custom domain verification/SSL lifecycle; configurable tenant branding fully applied.
- Tenant isolation negative tests for every tenant-sensitive resource and background worker.

### F02 — Authentication, identity, sessions and RBAC — 60%
**Implemented/source represented**
- Auth/session foundations, user membership and school/organization scope.
- Role/permission catalog, role assignment and permission helpers.
- Password recovery and MFA foundations/data model.
- School context and membership discovery foundations.

**Remaining**
- Complete invitation issue/accept/revoke lifecycle with verified email/phone.
- MFA enrolment, recovery codes, enforcement policies and tested recovery.
- Refresh/session revocation, token-family reuse detection and logout-all-devices.
- Account lockout/rate limits, brute-force protection and abuse detection.
- Permission matrix for every API/UI action; least privilege and field-level access for sensitive data.
- Negative authorization tests (IDOR, privilege escalation, wrong school, wrong organization).
- SSO/OIDC initially; SAML and SCIM for enterprise tier as later scope.

### F03 — Organization/school onboarding and configuration — IN_PROGRESS
**Implemented/source represented**
- Organization/school profile and configuration foundations.
- Academic year/term, calendar, policy and working-day foundations.
- Membership/configuration and school context.
- P370: permission-gated guided onboarding readiness dashboard/checklist, read-only and sourced from existing school-scoped APIs; Configure/Review navigation to existing workspaces.
- P371: sequential wizard navigation, accessible step selection, next-incomplete recommendation, all-steps list.
- P372: source-level dependency gates for current onboarding steps; academic year requires profile, terms require academic year, calendar requires profile/year, working days require profile, attendance/grading policies require profile/year. Configure actions are blocked with an accessible prerequisite explanation until required readiness is present.
- P373: versioned, organization/school-scoped browser persistence of the selected onboarding step; only navigation index is persisted, and API-derived completion remains unchanged.
- P374: consolidated server-derived readiness endpoint (seven checks) scoped to organization/school and protected by authenticated active-school membership; admin onboarding consumes API-derived readiness rather than duplicate client calculations.
- P375: server readiness checks expose descriptions and remediation guidance; Admin renders actionable guidance.
- P376: server readiness API owns prerequisite metadata and next-incomplete recommendation; configure actions are dependency-gated.
- P377: server-persisted wizard resume position scoped to organization/school; validated step allowlist and permission-gated writes; local fallback retained.
- P378: persistent task ownership for each checklist step, active-school member roster, assignment/unassignment API with permission and membership validation, audit events, Admin assignee selectors, and forced tenant RLS for assignment/progress tables.
- P379: removed a duplicated Prisma schema declaration block and repeated generator/datasource configuration; uniqueness verifier passes and P377/P378 onboarding models are retained.
- P380: readiness/onboarding now covers board affiliation and active grade-level configuration, with guided remediation, dependency ordering, and updated progress/assignment allowlists (nine checks).
- P381: readiness/onboarding adds active school-room/resource and published fee-structure checks with tenant-scoped queries, remediation and dependency gates; the guided checklist now has eleven steps.

**Remaining**
- School owner/admin invitations and invitation acceptance/email delivery; P378 assignment supports existing active school members only.
- Configuration setup completeness: grades, sections, subjects, rooms, fee policies, role setup and dependency-ordered write workflows.
- Backend-enforced prerequisites and end-to-end validation across setup mutations (current UI gates are not universal server enforcement).
- Multi-campus configuration inheritance/overrides.
- Bulk configuration import/export with preview, validation and rollback.
- Runtime acceptance: Prisma generation/schema validation, migration execution, API typecheck/build, browser verification and E2E.

### F04 — Academics, boards, curriculum and progression — 55%
**Implemented/source represented**
- Board catalogue/profile foundations for CBSE, ICSE, State Board, IB, IGCSE and Other.
- Grade levels, subjects, subject mapping and curriculum version foundations.
- Academic years/terms and calendar foundations.
- Curriculum configuration foundations.

**Remaining**
- Board-specific curriculum/content packs and mapping of outcomes/competencies.
- Curriculum version approvals, change history and effective dates.
- Academic planning, lesson planning and curriculum coverage tracking.
- Student promotion, retention, transfer, graduation and rollover workflows.
- Grade/section capacity and allocation rules.
- Academic setup and curriculum management UI complete; imports/exports.
- Validate board policy differences; do not assume one generic policy fits all boards.

### F05 — Timetable, rooms and scheduling — 70%
**Implemented/source represented**
- Teacher, class and room timetable foundations.
- Room inventory and aliases.
- Bell schedule templates and timetable exceptions.
- Conflict detection foundations.
- Teacher timetable/day workspace.
- Import/export foundations and offline/read-only caching foundations.

**Remaining**
- Finish timetable editor usability, bulk scheduling and import preview/validation.
- Substitute teacher assignment and absence coverage workflow.
- Resource booking for rooms/labs/equipment.
- Complete teacher/class/room conflict validation including concurrency.
- Constraint-based scheduling (availability, workload, subject periods, room suitability).
- Timezone/daylight and calendar edge-case tests where applicable.
- Timetable publishing, revision, notification and acknowledgement workflow.

### F06 — Admissions and applicant portal — 60%
**Implemented/source represented**
- Admission enquiry and application lifecycle/stage history.
- Offer foundations and accepted-application conversion.
- Applicant tracking/public portal foundations.
- Verification/session/challenge foundations.
- Grade capacity and seat-reservation foundations.
- Admission documents metadata and eligibility foundations.

**Remaining**
- Complete applicant and admissions reviewer/admin workspaces.
- Secure document upload, file validation, malware scanning and verification/rejection.
- Admission checklist, configurable criteria, interview/assessment, offer expiry and waitlist.
- Capacity-safe reservation under concurrent applicants.
- Fees/deposit and payment handoff integration.
- Notifications for each status, missing document and deadline.
- Convert accepted applicant to student/enrollment/class with idempotency and audit.
- Admission analytics, bulk actions and exports.
- Full applicant-to-enrolled-student E2E.

### F07 — Student records and lifecycle — 55%
**Implemented/source represented**
- Student profile and enrollment records.
- Enrollment/status history foundations.
- Student document metadata.
- Guardian relationship and pickup-contact foundations.

**Remaining**
- Student number generation and lifecycle state machine.
- Transfer-in/out, withdrawal, graduation, alumni, reactivation and re-enrolment.
- Duplicate detection, review and safe merge.
- Bulk import with mapping/preview, validation, error file and rollback.
- Student profile completeness, document checklist and history.
- Student self-service profile and consent preferences.
- Class/section allocation, promotion and rollover connected end-to-end.

### F08 — Guardians, parent accounts and family relationships — 55% (shared student/parent foundations)
**Implemented/source represented**
- Guardian records and student-guardian relations.
- Pickup contacts and relationship metadata.
- Parent invitation/linking foundations.

**Remaining**
- Verify guardian identity and relationship; prevent unauthorized child linking.
- Invitation acceptance and secure linking/unlinking/relinking.
- Multiple guardians, custody restrictions, emergency contacts and access rules.
- Consent capture/version/withdrawal.
- Parent profile, notification preferences and security settings.
- Family account with multiple children and multi-school boundaries.
- Complete parent self-service/mobile journeys.

### F09 — Attendance — 70%
**Implemented/source represented**
- Attendance sessions and class roster bulk marking.
- Attendance corrections and request/review foundations.
- Teacher-scoped attendance APIs/mobile foundations.
- Audit event foundations.

**Remaining**
- Late, early departure, partial day, absence reasons, holidays and leave integration.
- Check-in/check-out and office correction workflow.
- Parent notifications and configurable absence thresholds.
- Attendance analytics, daily/monthly summaries and exports.
- Attendance policy configuration and validation.
- Complete web/teacher/parent integration and E2E tests.

### F10 — Homework, assignments and learning activities — 50%
**Implemented/source represented**
- Homework/assignment foundations.
- Submission records, attachment foundations and grading-event foundations.

**Remaining**
- Teacher assignment creation, edit, publish, target classes/subjects and due dates.
- Student submission, attachment upload, late submission, resubmission and status.
- Teacher review, comments, grade/feedback and rubric.
- Parent visibility, reminders and notifications.
- Calendar integration, filters, dashboards and complete mobile journey.
- Secure file lifecycle and E2E coverage.

### F11 — Assessments, examinations, marks and report cards — 50%
**Implemented/source represented**
- Assessment/exam data model foundations.
- Grading event foundations.
- Report-card schema, approval and PDF artifact foundations.

**Remaining**
- Exam calendar, exam setup, timetable, seating and attendance/absence handling.
- Marks entry, bulk import, validation, moderation and audit history.
- Grade scales, weighted calculations, rounding, subject totals and configurable board rules.
- Report-card generation, preview, approval, publish/revoke and PDF generation.
- Parent/student result views and notifications.
- Performance analytics, class rank where policy permits, exports and E2E.

### F12 — Staff and teacher management — 55%
**Implemented/source represented**
- Staff directory, department/designation and profile foundations.
- Employment history, staff documents and audit events.
- Teacher assignments, school membership discovery and selection foundations.

**Remaining**
- Full CRUD and staff-number generation.
- Invitation, account linking and identity verification.
- Employment contract, joining, probation, confirmation, transfer, exit and rehire lifecycle.
- Qualifications, skills, certification and expiry reminders.
- Substitute/cover teacher workflow.
- Bulk import/export and staff self-service.
- Complete permission and cross-school tests.

### F13 — HR, recruitment, leave and performance — 45%
**Implemented/source represented**
- Vacancy/candidate intake and interview foundations.
- Leave request/approval foundations.
- Performance review records and lifecycle checklist foundations.
- HR mobile leave foundation.

**Remaining**
- Recruitment stages, candidate communications, interview panel, offer and hiring conversion.
- Onboarding/offboarding tasks, assets, access revocation and exit checklist.
- Leave types, balances, accrual, carry-forward, holidays, approval delegation and cancellation.
- Staff attendance integration and leave/payroll proration.
- Performance goals, review cycles, evidence, feedback, ratings and calibration.
- Training, certification and compliance tracking.
- HR analytics, complete UI/mobile workflows and tests.

### F14 — Payroll — 40%
**Implemented/source represented**
- Salary structure and staff salary assignment foundations.
- Payroll run/items and calculation foundations.
- Review/approval/payment status foundations.
- Staff mobile payroll/payslip panel foundation.

**Remaining**
- Configurable earning/deduction components and effective-dated salary changes.
- Attendance, leave, unpaid days, overtime, arrears and proration.
- India statutory rules: PF, ESI, PT, TDS, gratuity, bonus and eligibility/thresholds, maintained with qualified review and updates.
- Loans/advances and recovery schedule.
- Payroll review, approval, lock, reversal and audit controls.
- Bank transfer file/export, payment reconciliation and failed-payment handling.
- Payslip generation/download, payroll ledger posting and reports.
- Payroll test vectors, parallel-run reconciliation and privacy/access tests.

### F15 — Fees, billing, collections and refunds — 50%
**Implemented/source represented**
- Fee structures/charges and payment records.
- Refund records/events and reconciliation foundations.
- SaaS subscription/invoice/payment-attempt foundations.

**Remaining**
- Student fee plan assignment, due schedules, invoice generation and numbering.
- Discounts, concessions, scholarships, siblings, deposits, fines and installment plans.
- Payment gateway integration with webhook signature/idempotency.
- Cash/cheque/online/manual payment workflows and receipts.
- Partial payment, allocation, reversal, refund/partial refund and credit notes.
- Failed payment retries, reminders, dunning and reconciliation.
- Fee ledger, ageing, outstanding balance and reports.
- Tax/GST configuration as applicable and accounting integration.
- Finance E2E and reconciliation tests.

### F16 — Accounting, expenses and procurement — 45%
**Implemented/source represented**
- Accounts, accounting periods, journal entries and journal lines.
- Historical accounting import/reconciliation foundations.
- Expense records, approval workflow and summary foundations.

**Remaining**
- Double-entry validation, balanced journal enforcement and posting lifecycle.
- Chart-of-accounts configuration, financial period close and lock.
- Bank reconciliation and import formats.
- Vendor/supplier management, purchase requests, purchase orders, goods receipt and invoice matching.
- Budgets, cost centers and budget approval/variance.
- Fixed assets, depreciation and disposal.
- GST/TDS accounting workflows, exports and audited reports.
- Accounting integration from fees, payroll, canteen, transport and hostel.
- Audit/reversal and reconciliation test suite.

### F17 — Communications, notifications and messaging — 45%
**Implemented/source represented**
- Message threads/messages and school communication foundations.
- Parent notification/preferences.
- Outbox, batch, delivery event/webhook and suppression foundations.

**Remaining**
- Provider adapters for email, SMS, WhatsApp and push notifications.
- Template management, localization, variables, preview and approvals.
- Queue workers, retry/backoff, dead-letter and replay.
- Delivery receipt/status, opt-out, consent and preference enforcement.
- Role-scoped direct/group messaging, moderation and attachment security.
- Scheduled messages, announcements, targeted audience and read receipts.
- Communication center, logs, cost monitoring and provider failure alerts.

### F18 — Documents, privacy, consent and governance — 35%
**Implemented/source represented**
- Document metadata and governance foundations.
- Consent events, data governance requests, retention policy and legal hold foundations.

**Remaining**
- Secure object/file storage with private buckets and encryption.
- Upload limits, MIME/extension/content validation, malware scanning and quarantine.
- Signed URLs with short TTL, authorization checks and download audit.
- Versioning, verification workflow, expiry and renewal reminders.
- Consent version, capture evidence, withdrawal and purpose restrictions.
- Retention execution, legal hold, subject access/export and deletion/anonymization.
- Privacy incident handling, access review and policy/legal review.

### F19 — Health and wellbeing — 40%
**Implemented/source represented**
- Student health profiles/events and incident foundations.
- Restricted health workspace and parent/staff mobile panel foundations.

**Remaining**
- Health roles, field-level scopes and explicit access controls.
- Consent and guardian visibility rules.
- Emergency contacts, allergy/condition/medication safety workflow.
- Nurse/authorized staff case workflow, incident triage and follow-up.
- Emergency escalation, incident notifications and audit.
- Safeguarding policies, restricted notes and access logging.
- Mobile integration, reporting and privacy/security tests.

### F20 — Canteen and meals — 55%
**Implemented/source represented**
- Menu items, meal plans and meal allocation foundations.
- Orders, order items, serving/order status and payment-status foundations.
- Stock foundation and admin/parent/student/staff panels.

**Remaining**
- Recipe/ingredient management and stock consumption.
- Vendor purchase, receiving, lot/expiry and inventory adjustments.
- Meal preorder, cutoff, cancellation, refund and pickup workflow.
- Wallet/payment integration, reconciliation and meal-plan entitlements.
- Production quantity planning, wastage and stock alerts.
- Dietary/allergen handling and safety controls.
- Kitchen/serving staff operations, analytics and mobile/E2E validation.

### F21 — Library — 35%
**Implemented/source represented**
- Catalogue titles, physical copies and accession/shelf details.
- Loan/issue, return, active-loan view and reservation foundations.
- School Admin library workspace.

**Remaining**
- Barcode/QR scanning and bulk accession/import.
- Reservation queue ordering, hold/fulfillment, cancellation and expiry.
- Renewals, borrowing rules, borrower categories and limits.
- Fine calculation/settlement; lost/damaged book lifecycle.
- Student/parent catalogue and reservation mobile/web flows.
- Overdue notification, reporting/export and audit controls.

### F22 — Transport — 30%
**Implemented/source represented**
- Vehicle registration/capacity/status/document metadata foundations.
- Route and ordered stop/schedule foundations.
- Student transport allocation.
- Trip creation/start/end and trip-event foundations.
- Transport Coordinator permission/role and Admin workspace.

**Remaining**
- Driver/attendant records, assignment, verification and mobile workflow.
- Vehicle/route/stop capacity enforcement and conflict-safe allocation.
- Parent/guardian route details and child pickup/drop status.
- GPS/live tracking integration with configurable provider.
- Pickup/drop attendance, absence, missed stop and safe handover controls.
- Push/SMS notifications and geofence events.
- Incident/emergency escalation, maintenance and document expiry alerts.
- Transport fees, payment/ledger integration, route analytics and E2E.

### F23 — Hostel — 30%
**Implemented/source represented**
- Hostel buildings/type, rooms and capacity foundations.
- Bed generation, occupancy and student allocation.
- Checkout and hostel incident records.
- Hostel Warden role/permission and Admin workspace.

**Remaining**
- Warden/student/parent mobile workflows.
- Roll-call, curfew, attendance and night-checks.
- Visitor/gate register and authorized access.
- Hostel leave request, approval, gate pass and guardian communication.
- Room/bed capacity-safe allocation, transfer, waitlist and checkout settlement.
- Hostel fees, deposits, refunds and ledger.
- Duty roster, maintenance requests, incident escalation and safeguarding.
- Hostel reports, notifications, permissions and E2E.

### F24 — Parent Mobile — 40%
**Implemented/source represented**
- Parent mobile app foundations/authentication.
- Some child-focused and specialist panels (including health/canteen source foundations).
- Notification and child-link foundations.

**Remaining**
- Multi-child dashboard and secure child switching.
- Attendance history, daily status and notifications.
- Timetable/calendar and school events.
- Homework/assignment list, submission support where permitted, feedback.
- Exam timetable, results and report cards.
- Fee dues, invoices, payments, receipts, refund status.
- Messages/announcements and teacher contact rules.
- Documents, consent, profile and security settings.
- Transport route, vehicle/driver details, pickup/drop alerts and tracking when enabled.
- Library account/reservations; hostel account/leave/visitor notifications when applicable.
- Push notification preferences, deep links, offline/error states and device E2E.

### F25 — Student Mobile — 25%
**Implemented/source represented**
- App/auth foundations.
- Canteen screen/foundation in inspected source.

**Remaining**
- Student home/dashboard.
- Timetable, school calendar and announcements.
- Attendance history and status.
- Homework/assignment submission and teacher feedback.
- Exam schedule, results and report card.
- Fee status/payment where student policy allows.
- Library search, loans, reservation and renewal.
- Transport route, pickup/drop status and notifications.
- Hostel roll-call, leave/gate pass where applicable.
- Profile, documents, privacy, notification preferences.
- Offline access, sync/error states, accessibility and device E2E.

### F26 — Teacher Mobile — 45%
**Implemented/source represented**
- Auth and school/teacher context foundations.
- Attendance workflow and timetable/day view foundations.
- Offline/read-only cache and offline mutation foundations.

**Remaining**
- Class/subject/roster and timetable daily dashboard.
- Attendance marking, edits with audit and sync-conflict handling.
- Homework creation, assignment, submission review and feedback.
- Marks entry, gradebook and assessment workflows.
- Class announcements and parent communication controls.
- Substitution/cover and calendar integrations.
- Offline conflict resolution, retry/queue status and secure local storage.
- Mobile accessibility, push, crash monitoring and iOS/Android E2E.

### F27 — Staff Mobile — 50%
**Implemented/source represented**
- Auth and staff context foundations.
- HR/leave, payroll/payslip, admissions, health and canteen panel foundations.

**Remaining**
- Role-based home and staff self-service.
- Profile, documents, work schedule, attendance and leave balance.
- Leave application/approval with full lifecycle and payroll sync.
- Payslip view/download, payroll privacy and acknowledgement.
- Staff tasks/approvals, announcements and messaging.
- Department workflows and permissions.
- Offline/error states, push, accessibility and device E2E.

### F28 — Reporting, dashboards, analytics and exports — 35%
**Implemented/source represented**
- Some module summaries, report-card/PDF foundations and operational report data.

**Remaining**
- School-wide dashboard with role-specific KPIs.
- Attendance, academics, admissions, fees, finance, HR and operations dashboards.
- Cross-campus consolidated views and drill-down.
- Report builder with filters, grouping and saved views.
- CSV/XLSX/PDF exports, scheduled delivery and access control.
- Data definitions/metric consistency, historical trend and audit.
- Performance, pagination, aggregation and privacy validation.


## 4. Enterprise capabilities to add/complete

### Enterprise security and privacy
- Threat model and risk register; secure coding review.
- Tenant and school isolation tests for APIs, DB, workers, storage and cache.
- MFA, session/device management, SSO (OIDC/SAML), SCIM for eligible enterprise customers.
- Field-level authorization for health, payroll, safeguarding and financial data.
- Audit-log export, access review, break-glass support access and alerts.
- Encryption in transit/at rest, key management/rotation, secrets management.
- Dependency scanning, SBOM, vulnerability management and security patch process.
- Rate limiting, WAF, bot/abuse controls, upload scanning and penetration testing.
- Privacy operations: consent, retention, data export, deletion, incident/breach workflow, data residency/legal review.

### Reliability, operations and SaaS delivery
- Structured logs, metrics, tracing, correlation IDs and alerting.
- Liveness/readiness, health checks, graceful shutdown and queue monitoring.
- Automated backups, restore drills, RPO/RTO and disaster-recovery plan.
- CI/CD with migration safety, rollback strategy and release approvals.
- Environment management, feature flags and secrets handling.
- Tenant onboarding, suspension, export, migration and deletion tools.
- Usage metering, subscription/entitlement enforcement and billing operations.
- Load, stress, soak and concurrency tests; query optimization and caching.

### Professional UX and accessibility
- Consistent design system and component standards across web/mobile.
- Responsive layouts, keyboard navigation and WCAG accessibility.
- Loading, empty, error, retry and success states for every workflow.
- Search, filters, pagination, bulk actions, import/export and audit history.
- Localization, time zone, date/number/currency formats and board/school policy configuration.
- Contextual help, onboarding, product tours and user feedback.


## 5. Cycle 2 plan — feature-wise remaining work

Cycle 2 is a remediation/verification programme. Before changing a feature, audit its existing code, tests and gaps. Each phase produces a cumulative ZIP only, with root and docs copies of master active/open gap registers, phase report, changelog and verification summary. Preserve prior source; no phase-only archives.

### C2-01 — Build Stabilization & Workspace Baseline
**Feature scope:** entire repository and all Web/Mobile/API workspaces.  
**Remaining work:** dependency install reproducibility; package manager/lockfile alignment; lint; typecheck; unit tests; Prisma validate/generate; clean API startup; web builds; Expo checks/builds; environment and startup documentation; repair failures and record exact commands/results.  
**Exit evidence:** reproducible clean install and successful checks/builds for each workspace or a documented blocker list; no unverified pass claims.

### C2-02 — Database Integrity, Migration Safety & Tenant Isolation
**Feature scope:** all Prisma models, migrations, tenant/school scoped APIs, DB policies, background workers.  
**Remaining work:** fresh DB migration; upgrade migration from baseline; migration rollback/recovery strategy; constraints/index review; tenant/school scope audit; RLS enabled/forced where appropriate; non-owner DB role tests; cross-tenant negative tests; IDOR tests; worker/cache/storage tenant isolation; concurrency tests for capacity, allocation, payment and other race-sensitive flows.  
**Exit evidence:** migrations apply cleanly, schema/client match, tenant-isolation matrix passes, failures are documented and fixed or explicitly retained.

### C2-03 — Identity, Authentication, RBAC & Security Hardening
**Feature scope:** F02 and security controls touching all modules.  
**Remaining work:** invitation lifecycle; verified contact; MFA; recovery codes; account recovery; session revocation; token reuse detection; rate limiting; permission matrix; least privilege; sensitive field scopes; audit; authorization negative tests; secure admin/support access; security headers and secrets review.  
**Exit evidence:** auth/RBAC test matrix including positive and negative cases; MFA/recovery/revocation validated; no known critical tenant/privilege issue left unresolved.

### C2-04 — Core School Admin E2E & Student Lifecycle
**Feature scope:** F03, F04, F06, F07, F08, F09 and core F05/F10/F11.  
**Remaining work:** onboarding wizard; academic setup; board/grade/section/subject setup; admissions review and secure document workflow; capacity-safe offers; applicant conversion; student/guardian linking; student lifecycle (transfer/withdraw/graduate/reactivate); duplicate handling; promotion/rollover; attendance/leave/late/early; homework submission/review; exam setup/marks/report-card workflow; publish/notify. Connect API/database/admin UI and web journeys.  
**Exit evidence:** complete school setup → admission → enrollment/class → attendance/timetable → homework/exam/report card journey validated with role and tenant checks.

### C2-05 — Parent Mobile: Complete Parent Daily Journey
**Feature scope:** F08, F24 and parent-facing F06/F07/F09/F10/F11/F15/F17/F18/F19/F20/F21/F22/F23.  
**Remaining work:** family dashboard/multi-child; verified child-link; attendance; timetable/calendar; homework; exams/results/report cards; fees/invoices/payments/receipts/refunds; announcements/messages; documents/consent/profile; notifications; transport/route/trip status; library; hostel leave/alerts; health visibility with strict authorization; offline/error/retry/deep links/accessibility.  
**Exit evidence:** parent scenarios run end-to-end on supported iOS/Android devices with correct child access, push and error/recovery behavior.

### C2-06 — Student Mobile: Complete Student Daily Journey
**Feature scope:** F25 and student-facing academics, communications, fees, canteen, library, transport and hostel.  
**Remaining work:** dashboard; timetable; calendar; announcements; attendance; homework/submission/feedback; exam/results/report card; fee view/payment if policy permits; documents; library catalogue/loan/reservation; canteen preorder/status; transport pickup/drop; hostel roll-call/leave/gate-pass; profile/privacy; push; offline/cache/sync/error recovery.  
**Exit evidence:** student scenarios validated on supported devices and school policies; no cross-student data access.

### C2-07 — Teacher & Staff Mobile Workflow Completion
**Feature scope:** F12/F13/F14/F26/F27 plus classroom/HR operational workflows.  
**Remaining work:** teacher home, timetable, class rosters, attendance corrections/audit, homework creation/review, grading/marks, announcements/communication, substitution/cover; staff home, profile/docs, work attendance, leave balances/request/approval, HR tasks, payslips, admissions/health/canteen role-specific access; offline queue/sync conflicts; notifications; permissions.  
**Exit evidence:** teacher and staff workflow suites pass on devices; role boundaries and offline recovery verified.

### C2-08 — Finance, Fees, Payroll & Accounting
**Feature scope:** F14, F15, F16 and related platform subscription billing F01.  
**Remaining work:** fee plans/schedules/invoices; discounts/concessions; gateways/webhooks/idempotency; receipts; partial payment/allocation; refunds/credit notes; failed payments/reconciliation/dunning; accounting double-entry and periods; expenses/vendor/purchase/budget; assets; payroll components/proration/statutory calculations with expert validation; bank files; payslips; accounting links; finance audit and exports.  
**Exit evidence:** fee collection and refund reconciles to ledger; payroll sample cases independently reconcile; accounting periods/postings enforce invariants; integration tests and security tests pass.

### C2-09 — Admissions, Documents, Notifications & Communication
**Feature scope:** F06, F17, F18 and document/notification paths across all modules.  
**Remaining work:** admissions checklist/reviewer; file upload validation and malware scan/quarantine; private storage/signed downloads; verification/expiry; document retention and consent; email/SMS/WhatsApp/push providers; templates/localization; retry/backoff/dead-letter/replay; delivery receipts; suppression/opt-out; message center; scheduling, audience rules and audit.  
**Exit evidence:** admission submission/review/decision/document communication workflow succeeds; secure file controls and delivery/retry tests pass.

### C2-10 — Specialist Operations (Health, Canteen, Library, Transport, Hostel)
**Feature scope:** F19–F23.  
**Remaining work:** health privacy/consent/authorized care/incident workflow; canteen recipes/ingredients/inventory/purchase/wastage/payment reconciliation; library barcode/renewals/fines/reservations/notifications; transport drivers/attendants/mobile/GPS/pickup-drop/geofencing/fees/safety; hostel warden/roll-call/curfew/visitors/gate pass/leave/fees/maintenance/safeguarding. Connect each specialist module with appropriate Admin, Parent, Student, Teacher or Staff app.  
**Exit evidence:** each module has complete operator and relevant user journeys, permission checks, mobile integration, concurrency controls and reports; provider/device dependencies clearly recorded.

### C2-11 — Enterprise Reporting, UX, Operations, Security & Pilot Readiness
**Feature scope:** F28, enterprise capabilities and cross-system product readiness.  
**Remaining work:** dashboard/report builder/export/scheduled reports; design-system consistency and accessibility; localization; observability/logs/metrics/traces; alerting; backups and restore drills; RPO/RTO; security/threat model/penetration testing; SBOM/dependency scan; load/soak/performance; CI/CD/release/rollback; SaaS billing/usage; tenant migration/export; SSO/SCIM plan; support/runbooks; demo seed data; training; pilot acceptance criteria and feedback process.  
**Exit evidence:** pilot checklist signed off; critical/high defects resolved or accepted with mitigation; release/rollback/restore tested; support and training materials ready.


## 6. C2 phase-to-feature map

| C2 phase | Primary features | Cross-cutting coverage |
|---|---|---|
| C2-01 Build stabilization | All features/workspaces | Build/typecheck/lint/schema/startup |
| C2-02 DB & tenant isolation | All F01–F28 | migrations, RLS, scopes, race conditions |
| C2-03 Identity & security | F01/F02 and all protected modules | RBAC, MFA, sessions, authorization |
| C2-04 Core school E2E | F03–F11 | admissions, student lifecycle, academics, attendance, reports |
| C2-05 Parent mobile | F08/F24 and parent-facing features | fees, academics, transport, library, hostel, health, comms |
| C2-06 Student mobile | F25 and student-facing features | academics, homework, results, canteen, library, transport, hostel |
| C2-07 Teacher & staff mobile | F12–F14/F26/F27 | classroom, grading, HR, payroll, approvals |
| C2-08 Finance | F01/F14/F15/F16 | billing, fees, payments, accounting, payroll |
| C2-09 Admissions/documents/communications | F06/F17/F18 | secure upload, notifications, consent, delivery |
| C2-10 Specialist modules | F19–F23 | health, canteen, library, transport, hostel |
| C2-11 Enterprise/pilot | F28 + enterprise controls | reporting, SRE, security, UX, compliance, release |


## 7. Completion tracking template

For every feature and C2 phase, maintain:
- Status: Not started / In progress / Implemented / Verified / Blocked / Deferred.
- Estimated completion before and after.
- Existing code paths reviewed.
- New/changed files and APIs/schema.
- Web/mobile surfaces connected.
- Permission/tenant/security review.
- Tests added and executed (command, outcome, date).
- Build/runtime/E2E/device evidence.
- Remaining gaps with IDs in master register.
- Acceptance criteria and reviewer notes.


## 8. Master C2 acceptance principles

1. Preserve cumulative history and prior functionality; do not create phase-only ZIP releases.
2. Each C2 phase audits the current code before implementation; implement gaps, avoid duplicates.
3. Complete the feature through database, API, UI, mobile/integration where applicable.
4. Add tests in the phase when feasible, but Cycle 2 must execute and document actual tests—not merely write them.
5. Track root `MASTER-ACTIVE-GAPS-REGISTER.md` and `MASTER-OPEN-GAPS-REGISTER.md` and their docs mirrors. Add new gaps; close only with evidence.
6. Include phase report, changelog, verification report and cumulative ZIP integrity checks in each release.
7. Static checks are explicitly labeled static; never claim build/runtime/E2E/device validation unless run successfully.
8. Maintain a cumulative release ZIP only, with previous entries preserved, no duplicates, archive integrity and SHA-256.
9. After each C2 phase, update this document's feature status and percentages based on evidence; this document remains the master functional scope and acceptance reference.
10. Scope is feature-wise remaining work. Additional enterprise needs discovered during implementation must be added to the register and this document with clear rationale.


## 9. Overall readiness target

The target is not simply “all screens exist.” A feature is enterprise-ready when its core workflow is connected and verified, permissions and tenant boundaries are proven, data integrity/recovery are handled, errors and notifications are usable, accessibility and operational requirements are addressed, and documentation/runbooks are available.

**Starting Cycle 2: C2-01 Build Stabilization & Workspace Baseline.**


## C2-01 progress — Build Stabilization (P359)

**Source stabilization delivered; phase validation remains blocked.** C2-01 was started on P358. Three source parse defects were repaired (Transport routes, AdmissionsWorkspace and OperationalModulesWorkspace student-photo JSX). Repository tooling now includes TypeScript syntax scanning, workspace manifest/config checks, Node/pnpm engine declarations, shared flat ESLint configuration, Expo build/lint scripts for the four mobile apps, and updated selected legacy verifier checks.

Evidence: 246 TS/TSX files parsed with 0 syntax errors; domain tests 20/20 pass; Node script syntax checks pass; workspace audit 64 pass and 1 blocker (missing pnpm lockfile); legacy verifier sweep 170 total, 149 pass and 21 fail. Dependency-based typechecks/lint/build, Prisma/database/Redis/API startup, Expo/device and E2E/security checks were not run because the lockfile/dependencies are absent and package registry DNS was unavailable.

**C2-01 remaining work:** generate and commit lockfile; install reproducibly; fix typecheck/lint/build errors; repair remaining verifier failures; execute Prisma/database/Redis/API smoke tests; bundle/device validate all mobile apps; run E2E/security gates; validate production environment. See `P359-STATUS.md` and `docs/deployment/C2-01-WORKSPACE-STABILIZATION.md`.

---

## Cycle 2 execution status update (P360)

- **C2-01 Build Stabilization:** source-level remediation is underway; not accepted/closed because reproducible dependency installation and dependency-based builds/runtime validation are blocked by registry DNS/network (`EAI_AGAIN`).
- P360 added a workspace package manifest integrity verifier. It checks 13 workspace manifests, unique package names, dependency declarations, `workspace:` dependency resolution and referenced script targets; all 0 errors.
- Additional checks: 246 TypeScript/TSX files parse with 0 syntax errors; domain rules tests 20/20 pass; 144 other static verifiers pass. Combined static suite is 144/145 due the lockfile gate.
- **C2-01 remaining acceptance work:** registry access, pnpm/lockfile, semantic typecheck, lint, production builds, Prisma/database/API runtime, Expo bundle/device and E2E/security validation.
- C2-02 must not be treated as completed until C2-01 acceptance requirements are met.
# P361 — C2-01 Dependency-Free CI Source Gate

**Status:** Source-level CI improvement delivered; C2-01 remains blocked pending dependency installation and runtime validation.

## Implemented
- Added `scripts/verify-c2-01-ci-source.mjs`, a dependency-free orchestrator for four checks: TypeScript/TSX syntax, workspace manifest integrity, domain invariant tests, and P80–P108 source contracts.
- Added root script `verify:c2-01:ci-source`.
- Added a separate `source-only-gates` job to `.github/workflows/ci.yml`, so core source checks can run even while lockfile/install/build jobs are blocked.
- Added the same source-gate invocation before the lockfile/install requirement in the existing CI build job.

## Validation
- Source gate: 4/4 PASS.
- TypeScript/TSX parser: 246 files scanned, 0 parse errors.
- Workspace manifests: 13 inspected, 13 unique names, 0 errors.
- Domain invariant tests: 20/20 PASS.
- P80–P108 source-contract check: PASS.

## Remaining C2-01 blockers
- No pnpm lockfile; registry access was previously blocked by `EAI_AGAIN`.
- Dependency-based typecheck/lint/build, Prisma validation/generation, DB migration, API runtime, web builds, Expo exports/device checks, full E2E/security tests, and production deployment acceptance remain unverified.
- C2-01 is not accepted; do not proceed to C2-02 until these acceptance blockers are resolved.


## P362 — C2-01 Register Mirror Integrity
- Register and feature/changelog mirror parity is now automatically checked for six source/mirror pairs.
- Root/docs/docs-phases gap-register parity was restored.
- Source-only C2-01 gate is expanded to 5/5 checks; full dependency-based validation is still pending.

## C2-01 P363 Stabilization Update
- CI workflow contract is now source-audited with a dependency-free verifier covering source-only checks, lockfile/frozen install, Prisma generation, API and web build steps, production Compose validation, and Trivy filesystem scanning.
- C2-01 source-only gates: 6/6 pass. Full install/build/runtime acceptance remains blocked pending pnpm lockfile and dependency registry availability.

## P364 — Bootstrap Readiness Diagnostics
Added `scripts/diagnose-c2-01-bootstrap.mjs` and `diagnose:c2-01:bootstrap` to report Node, packageManager, lockfile, pnpm availability/version, `.npmrc` and registry configuration without exposing secrets or attempting install. Added contract verifier `verify:p364` and integrated into C2-01 source-only CI gate. Source gate: 7/7 PASS; bootstrap diagnostic: 4/7 PASS with lockfile/pnpm warnings. C2-01 remains blocked.

## P365 — Container Runtime Contract Audit
- Added a static contract verifier for the root Node engine/pnpm version and API/web Dockerfile Node 22 + Corepack pnpm 9.15.0 alignment.
- Runtime contract: 8/8 PASS; verifier contract: 7/7 PASS; CI source gate: 9/9 PASS.
- This checks declared configuration only. Docker builds and application runtime validation remain unverified due to the unresolved lockfile/dependency bootstrap.


## P366 — C2-01 Stabilization Closure Audit

- Added a final stabilization closure contract verifier and verifier self-contract; both are integrated into the dependency-free CI source gate.
- The audit confirms that CI explicitly requires the lockfile, frozen install, Prisma generation, API/web builds, production Compose validation, and source-only checks.
- **C2-01 source-level stabilization work is complete to the extent possible in this environment.** Full acceptance is still blocked because registry DNS returned `EAI_AGAIN registry.npmjs.org`, preventing pnpm 9.15.0 acquisition and lockfile generation. No lockfile was fabricated.
- Dependency-based typecheck/lint/build, Prisma/database/Redis/API runtime, Expo mobile/device, E2E/security, and production deployment checks remain OPEN and must be completed when dependencies and infrastructure are available.
- Per user direction, C2-02 can start next; C2-01 acceptance remains a tracked risk and is not marked accepted.


### P367 C2-02 Database & Tenant Isolation source audit
Static inventory covers 165 Prisma models, of which 150 have organizationId and/or schoolId; all 150 pass the source-level tenant-scope index/unique check. Required tenant context helpers are present. Added a composite tenant index/migration for TransportTripEvent. Database migration execution, RLS catalog checks, non-owner role, cross-tenant negative/IDOR, worker/cache/storage isolation, concurrency and API acceptance are still open pending runtime infrastructure.


### C2-02 P367 source audit and runtime acceptance boundary
The P367 static audit inspected 165 Prisma models (150 tenant-scoped) and passed the source-level tenant scope index/unique coverage check for all 150. TransportTripEvent composite tenant index/migration was added. Runtime migration, RLS, non-owner, cross-tenant, worker/cache/storage, concurrency and API acceptance remain open; see C2-02-ACCEPTANCE-GAP-MATRIX.md.

### P368 C2-03 Identity/Auth Security source audit
A static source audit now checks key auth controls: JWT algorithm/issuer/audience/expiry and secret minimum; active user/session checks; MFA enrollment/freshness policy; Argon2id password hashing; opaque-token hash helper; Redis-backed fail-closed rate limiting and privacy-safe abuse counters; Helmet; and auth/MFA/permissions module presence. This is source evidence only and does not establish runtime RBAC or security acceptance. See `C2-03-ACCEPTANCE-GAP-MATRIX.md`.

### P369 C2-03 RBAC & authorization source audit
- Static RBAC helper, wildcard semantics, tenant/school scope guards, active membership, school-scoped role assignment, authentication middleware, and route-module marker inventory are audited.
- Audit is wired into the dependency-free CI source gate. This is source evidence only; route-by-route runtime negative authorization and tenant isolation tests remain OPEN.

### P375 — F03 Onboarding remediation guidance
- Readiness checks include server-authored titles, descriptions, and remediation guidance.
- Admin wizard and expanded checklist display next-step guidance for incomplete checks.
- Completion remains server/API-derived; no configuration state is mutated by the guide.
- Source contract verifier: 10/10 PASS. Runtime acceptance remains pending.

### P376 — F03 server-owned dependency metadata
- The readiness API returns prerequisites for all onboarding checks and a recommended next incomplete key.
- School Admin consumes the API dependency graph and recommended next step; fallback metadata supports compatibility.
- UI configuration actions remain gated against resolved prerequisite completion. Source verifier P376: 10/10 PASS.
- Remaining F03 work: shared server progress/ownership and invitations, backend-enforced setup writes, full configuration sequencing, multi-campus overrides, bulk import/export preview/rollback, and runtime acceptance.

### P377 — F03 onboarding resume persistence
- Server persists the wizard resume step per organization/school.
- Admins with `school.settings.manage` can save the step; active membership is required.
- Step keys are allowlisted; saving progress never changes configuration completion.
- Admin consumes server resume state and keeps local storage as fallback.
- Runtime/database acceptance remains pending.

### P379 — F03 enabling prerequisite
- Removed a duplicated Prisma model/enum declaration block and trailing duplicate generator/datasource configuration. Preserved P377/P378 onboarding models. Source verifier: 6/6 PASS. Prisma CLI validation and generated-client/runtime acceptance remain pending.

### C2-04 / F03 Onboarding — P382 update
- Implemented a CSV export action in the guided onboarding readiness workspace.
- Export columns: step, key, status, description, remediation, prerequisites, assigned owner.
- CSV escaping, UTF-8 BOM, dated filename, and URL cleanup included.
- F03 remains IN_PROGRESS; this is a convenience/reporting slice only.

### C2-04 / F03 Onboarding — P383 update
- Added All / Assigned to me / Unassigned filters to the onboarding task details view.
- Signed-in member resolution uses the loaded school roster and case-insensitive email matching; Mine is disabled when no match exists.
- Counts are shown for each filter, and original checklist numbering is preserved.
- P383 verifier: 11/11 PASS; P370–P383 regression verifiers all pass; syntax scan: 247 files, 0 parse errors.
- F03 remains IN_PROGRESS; server workflow, invitation delivery, backend prerequisite enforcement, multi-campus overrides, bulk import/rollback and runtime acceptance remain open.

## P384 update — F03 onboarding assignment feedback
- Assignment save UI now communicates pending and successful states accessibly per task; failed requests clear stale success and retain error reporting.
- Source verifier P384: 10/10 PASS; P370–P383 regressions PASS; syntax scan 247 files/0 errors.
- F03 remains IN_PROGRESS. Runtime/build/DB/browser E2E are still unverified.

## P385 — F03 concurrent assignment saves
- Task assignment save status now uses a per-task boolean map so independent task saves can remain pending concurrently.
- Controls only disable for the specific task currently saving; per-task success feedback remains scoped.
- Verifier P385: 10/10 PASS. Regression verifiers P370–P385 PASS. Source syntax: 247 scanned, 0 parse errors. Package audit: 13 packages, 0 errors.
- F03 remains IN_PROGRESS; invitations, orchestration, backend prerequisite enforcement, multi-campus inheritance/overrides, import preview/rollback, and runtime acceptance remain open.
## P386 — F03 assignment error isolation
- Failed assignment saves now retain errors per task; retries and successful responses clear only the matching task's error, and inline errors use alert semantics.
- P386 verifier 8/8 PASS; P370–P386 regressions PASS; TypeScript syntax scan 247 files/0 errors.
- F03 remains IN_PROGRESS; runtime/API/database/browser/E2E validation is pending.


### P387 — Onboarding assignment state scope reset
- Onboarding readiness reload clears assignment roster/map and task-level feedback/loading state before fetching the current school scope, preventing stale data from another scope from lingering during load or when assignment refresh fails.
- Source verification only; runtime acceptance pending.

### P388 — Onboarding readiness scope reset
- Readiness checklist items, refresh timestamp, and server recommended-next-step state are cleared at refresh start. Missing session scope safely stops loading and does not leave stale checklist state visible.
- Source verifier 8/8 PASS; P370–P388 source verifiers PASS; TypeScript syntax scan 247 files/0 errors. Runtime/API/database/browser/E2E validation pending.
- F03 remains IN_PROGRESS.

### P389 — F03 invitation management
- Added organization-admin invitation listing with safe response fields and derived status; added pending invitation revocation with audit logging.
- Organization Admin UI supports invitation creation, list/status visibility and revoke.
- Duplicate active pending invitations for the same normalized email/role/school scope are rejected. Acceptance attempts serialize using token advisory lock and avoid duplicate scoped role assignment.
- P389 verifier 15/15 PASS; P370–P388 regressions PASS; syntax scan and workspace manifest audit PASS.
- F03 remains IN_PROGRESS: delivery, full configuration orchestration, backend prerequisite enforcement, multi-campus inheritance/overrides, bulk import/preview/rollback and runtime acceptance remain open.

## P390 — Core School Onboarding API prerequisite gates
- **Delivered source behavior:** Term creation requires current ACTIVE academic year; calendar creation requires complete profile and active current year (calendar academic-year reference must also be current/ACTIVE); working-day configuration requires completed school profile; policy configuration requires completed school profile and current active academic year.
- **Verifier:** `scripts/verify-p390-f03-backend-prerequisites.mjs` — 10/10 assertions pass.
- **Status:** F03 remains IN_PROGRESS. Remaining work includes invitation delivery/deep links, full setup orchestration, multi-campus inheritance/overrides, bulk configuration preview/validation/rollback, and runtime/API/DB/browser/E2E acceptance.


## F03 checkpoint after P391
- Organization invitation delivery/acceptance source slice is implemented with fail-closed configuration, hash-only token storage, safe provider-failure revocation, and acceptance UI.
- F03 is **NOT COMPLETE**. Remaining: full dependency orchestration, multi-campus inheritance/overrides, bulk configuration import/export preview/validation/rollback, and runtime acceptance.
- F04 has not started.

## P392 — F03 dependency-aware onboarding status
- Readiness check objects now include `blockedBy`, `status`, and `actionable`.
- Readiness summary now includes blocked/actionable counts, `allComplete`, and `workflowStatus`.
- Recommended next action prioritizes an actionable incomplete step.
- Admin workspace displays prerequisite-blocked vs ready-to-configure state.
- Verifier P392: 11/11 PASS. This is a source slice, not complete F03 acceptance.

### P393 F03 Onboarding blocker details
- Blocked onboarding task rows now list the exact incomplete prerequisite tasks. This is a remediation visibility improvement; F03 remains incomplete.

## P394 — Onboarding assignment CSV import
- Organization-admin onboarding task assignments can be imported from CSV after preview. Valid task keys and active member emails are required; duplicate/unknown rows are blocked. Blank email unassigns. Apply is sequential and may partially succeed; failures are reported. This does not close bulk school configuration import/rollback gaps.

### P395 — Onboarding assignment CSV parsing
- Improved assignment import parser for quoted fields, escaped double quotes, multiline cells and CRLF. Rejects malformed quoted data. P395 source and parser checks pass; UI/API runtime acceptance remains pending.

## P396 — School configuration JSON transfer
- Profile, weekly working-days and attendance/grading policies can be exported to a versioned JSON file and imported by paste with validation and preview before apply.
- Import is limited to the current configuration tab and uses permission gating. Rollback is compensating/best effort, not atomic.
- Academic/calendar domains and multi-campus inheritance/overrides remain gaps. F03 is still IN_PROGRESS.

## P397 — Academic year and term configuration transfer
- Configuration transfer now includes academic years and terms.
- Export retrieves nested terms for each year; import validates date containment, duplicate codes/sequences, and supported term types.
- Import preview blocks year codes already present in the selected school. Apply is permission-gated and additive; imported years are not marked current.
- Partial creation may occur if sequential API calls fail; no transaction or rollback is claimed.
- P397 verifier 20/20, P396 verifier 15/15, P370–P397 sweep 28 verifiers PASS, syntax scan 248 files/0 errors. F03 remains open.

## P398 — Calendar and event configuration transfer
- School admins can export the selected calendar and events as versioned JSON.
- Import previews and validates calendar name, up to 500 events, event title/type/timestamps, all-day and instruction-day flags, audience and duplicate title/start-time records.
- Applying creates a new calendar and event records; it does not overwrite existing calendars and is gated by `academics.manage`.
- Calendar import remains sequential/non-transactional; partial creation is possible. Full runtime acceptance remains outstanding.
- P398 verifier 18/18; P397 verifier 20/20; P396 verifier 15/15; P370–P398 verifier sweep passed; syntax scan 248 files/0 parse errors.
- F03 remains IN_PROGRESS; F04 not started.

### P399 — Calendar import timestamp validation
- Calendar event start/end timestamps must now be ISO 8601 date-times with explicit timezone offsets. Invalid dates, timezone-less values, invalid clocks and malformed offsets are rejected before import apply.

## P400 — Campus configuration inheritance foundation (partial)
- Reusable versioned document model, structural validator and resolver implemented for profile, working-days and attendance/grading policies.
- Inheritance semantics: nested plain objects merge recursively, arrays replace, `null` is an explicit override, absent overrides preserve base values; base configuration is not mutated.
- Multi-campus end-to-end integration is still not complete: campus persistence, CRUD/API/UI, permissions, inheritance-chain traversal/cycle handling remain open. Do not mark this feature complete.

## P401 — Campus inheritance chain resolution
- Implemented pure chain resolver across campus inheritance documents.
- Resolves root-to-target order, validates docs/duplicate IDs, rejects missing parent/target and cycles.
- Uses inherited-scope deep merge and non-inherited replacement semantics.
- Not yet wired into campus persistence, APIs, authorization or UI.
