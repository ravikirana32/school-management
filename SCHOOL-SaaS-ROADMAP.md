# School Management SaaS — Consolidated Roadmap

**Baseline:** P580 cumulative (P579 + P580).  **Next phase:** P581 — Reproducible Workspace & Dependency Closure.

## Roadmap status rules
- **Delivered** means a phase artifact/source change is present in the cumulative repository.
- **Runtime accepted** requires reproducible install, migration, build, integration/E2E and relevant security/operations evidence. It is not inferred from a delivered phase.
- P579 release decision remains **NO-GO** until mandatory runtime and independent acceptance gates are evidenced.

## Completed cycle delivery

| Cycle / stream | Phase range | Delivery position | Remaining acceptance |
|---|---:|---|---|
| C2-08 Finance & Fee Management | P509–P520 | 12/12 planned phases delivered | DB lifecycle, finance reconciliation, provider and E2E acceptance remain tracked in gaps |
| C2-09 Admissions, Documents & Communications | P526–P537 | 12/12 planned phases delivered | Applicant journeys, provider delivery, document lifecycle, security and E2E acceptance |
| C2-10 Specialist School Operations | P538–P571 | 34/34 planned phases delivered | Runtime, builds, migrations, cross-app integration and operational acceptance remain |
| C2-11 Production Readiness & Consolidated Gap Remediation | P572–P579 | 8/8 phase artifacts delivered | Frozen install, Prisma/PostgreSQL, builds, RLS, providers, mobile/web E2E, DR and independent reviews remain |
| P580 Documentation Consolidation & Docker Runtime Foundation | P580 | Source/configuration delivered | Docker build/start, migration, API/web/mobile runtime acceptance remains open |

## Earlier Cycle 2 scope and phase-to-feature mapping

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



## C2-08 to C2-11 detailed roadmap and progress source notes


## Source: `C2-09-ROADMAP.md`

# Cycle C2-09 — Admissions, Documents & Communications (planned 12 phases)

**Planned phase range:** P526–P537, following P525 finance remediation close-out.

| Phase | Planned focus |
|---|---|
| P526 | Admissions workflow foundation and configuration |
| P527 | Applicant intake and application form UX/API |
| P528 | Application statuses, transitions and audit trail |
| P529 | Document checklist and requirement rules |
| P530 | Secure document upload, metadata and access scope |
| P531 | Admissions review, decision and exception handling |
| P532 | Admission-to-enrollment conversion and student record creation |
| P533 | Communication templates and audience targeting — Completed |
| P534 | Bulk communication orchestration and delivery tracking — Completed |
| P535 | Parent/student notifications and preferences — Completed |
| P536 | Admissions and communications reports, filters and exports | Completed
| P537 | Cross-app integration, permissions, accessibility and cycle close verification | Completed (source audit)

This is the planned cycle scope. Phase completion is counted only after source changes and focused evidence; runtime/build/E2E acceptance remains separately tracked.

## Source: `C2-09-PROGRESS.md`

# Cycle C2-09 Progress

- Cycle range: P526–P537 (12 phases)
- Source implementation phases: P526–P537 (12/12 completed)
- Current phase: P537 — Cross-app Integration, Permissions, Accessibility & Cycle Closure (source-audit complete)
- P537 focused source audit: 15/15 PASS
- P532–P536 focused verifiers: all passed in this session (19/19, 15/15, 15/15, 15/15, 17/17 respectively)
- P533–P537 source evidence is static/source-level; no runtime build or full E2E evidence is claimed.
- Cycle status: source-phase sequence complete; runtime/acceptance closure remains BLOCKED/PENDING due carried-forward gaps.
- Next cycle: C2-10 — Specialist Modules. Detailed phase range and scope breakdown to be established before starting; do not invent phase count.

## Source: `C2-10-ROADMAP.md`

# C2-10 Specialist Operations Roadmap (P538–P571)

- P538–P552: COMPLETE — cumulative foundation and specialist module phases.
- P553: COMPLETE — Library borrower categories, borrowing rules/limits, renewals and overdue policy.
- P554: COMPLETE — Library reservation queue, FIFO hold assignment, pickup holds, cancellation, expiration and fulfillment.
- P555: COMPLETE — reservation-aware renewal, fine ledger, borrower balances and settlements.
- P556: COMPLETE — fine management UI, borrower search/balances, audited adjustments, settlements and printable receipts.
- P557: COMPLETE — lost/damaged copy lifecycle, replacement charges, write-off workflow and inventory status updates.
- P558: COMPLETE — parent/student self-service circulation views, reservation queue/pickup visibility, due/overdue notification preview and in-app dispatch, reports and CSV export.
- P559: COMPLETE — driver/attendant profiles, license/document verification and expiry, route assignment validation, Admin onboarding, and Driver mobile read foundation.
- P560: COMPLETE — tenant-scoped capacity report, vehicle-seat enforcement for student allocations, student/route/stop/vehicle validation and Admin capacity display.
- P561: COMPLETE — pickup/drop attendance, absence, missed stop, handover recipient, driver/attendant mobile roster/status updates and daily attendance summary.
- P562: COMPLETE — GPS provider abstraction/configuration, personnel consent grant/revoke, privacy-aware location capture/history, bounded retention, Admin and Driver Mobile foundation (native GPS integration remains OPEN).
- P563: COMPLETE — parent transport route/stop/vehicle visibility for consented linked children, current-day trip/attendance timeline, live driver location gated by GPS enablement + active driver consent + current trip + 5-minute freshness, optional stop coordinates/Admin coordinate input, Parent Mobile Transport screen, Haversine geofence foundation (automatic geofence events and notifications remain OPEN).
- P564: COMPLETE — transport incident lifecycle and severity, emergency escalation metadata, vehicle maintenance schedule/history, vehicle inspections, compliance expiry report, School Admin workflows and Driver Mobile incident reporting (automatic escalation, scheduled reminders, evidence attachments and runtime validation remain OPEN).
- P565: COMPLETE — school-scoped transport fee plans, monthly invoice generation for active allocations, payment and receipt ledger, audited discounts/waivers, outstanding balances, Admin workflows and consent-scoped parent fee visibility/Parent Mobile summary (gateway, refunds, scheduled billing, analytics exports and runtime acceptance remain OPEN).
- P566: COMPLETE — hostel building-scoped morning/evening/night roll-call, resident attendance statuses, verified-absence closure gate, curfew policy and late-return register with grace minutes, night-check rounds/entries, and verification-first safety escalation workflow; full runtime/mobile/guardian-notification acceptance remains OPEN.
- P567: COMPLETE — visitor registration, privacy-minimized identity details, resident/building validation, duplicate active authorization guard, auditable approve/deny/block decisions, time-bounded visitor passes, gate check-in/check-out, resident outpasses linked only to already-approved leave requests, outpass approval/departure/return lifecycle and School Admin workflows (runtime/RLS/mobile/accessibility acceptance remains OPEN).
- P568: COMPLETE — guardian leave create/edit/cancel, warden approve/deny, one-pass-per-leave issuance, explicit per-student guardian notification consent, in-app + consent-gated email outbox/provider lifecycle, automatic late-return monitor, checked-out resident return check-in, Parent Mobile and School Admin workflows (runtime/RLS/provider/device acceptance remains OPEN).
- P569: COMPLETE — hostel capacity dashboard, tenant-scoped bed transfers, prioritized waitlist, time-limited offers, acceptance/decline/expiry, automatic next-offer on released beds, clearance checklist and separately approved settlement lines (full runtime/accounting/parent notification acceptance remains OPEN).
- P570: COMPLETE — hostel fees, deposits, refunds, duty roster, maintenance, safeguarding and reporting (runtime/accounting/provider/legal gates remain OPEN).
- P571: COMPLETE — cross-module integration inventory, 36/36 source assertions, 158-migration file inventory, full static verifier run (328/357 PASS; 29 FAIL), master-gap reconciliation and final release evidence (runtime/build/RLS/provider/device/accessibility/legal gates remain OPEN).
- P564: COMPLETE — transport incident lifecycle and severity, emergency escalation metadata, vehicle maintenance schedule/history, vehicle inspections, compliance expiry report, School Admin incident/maintenance/expiry UI and Driver Mobile incident reporting (automatic escalation, scheduled reminders, evidence attachments and full runtime validation remain OPEN).
- P570: COMPLETE — tenant-scoped hostel fee plans/invoices and calendar-day proration, append-only payment ledger, deposit collection/deduction/refund request/approval/execution ledger, duty roster overlap guard, maintenance ticket lifecycle with occupied/reserved bed safeguards and evidence-based closure, restricted safeguarding case access/audit and Parent Mobile fee visibility. Gateway/canonical accounting automation, billing scheduler, warden mobile, reports and production runtime/security acceptance remain OPEN.


## C2-10 closure note
The planned phase sequence P538–P571 is delivered (34/34). Closure is limited to phase-scope delivery and evidence packaging. The product must not be described as production-ready until P571-G001–G012 and the 29 failed static verifiers are resolved with reproducible evidence.

## Source: `C2-10-PROGRESS.md`

# C2-10 Specialist Operations Progress

- P553: COMPLETE — borrower policies and circulation rules.
- P554: COMPLETE — reservation queue, FIFO hold assignment, pickup holds, cancellation, expiration, fulfillment-to-loan and Admin UI.
- P555: COMPLETE — reservation-aware renewal blocking, overdue fine ledger accrual, borrower fine balances, reason-audited adjustments/waivers and settlements.
- P556: COMPLETE — admin fine ledger workspace, borrower search/balances, audited adjustments, settlement workflow, ledger detail and printable receipts.
- P557: COMPLETE — copy lifecycle marking LOST/DAMAGED/AVAILABLE with mandatory reason, optional replacement charge ledger entry, write-off transition and inventory status updates.
- P558: COMPLETE — student/consented-parent library portal views, history, reminders, reservation queue/pickup visibility, reports and CSV export.
- P559: COMPLETE — transport personnel profiles, verification/document expiry, assignments, Admin onboarding and driver mobile read foundation.
- P560: COMPLETE — school-scoped capacity report; active student allocation validation; route/stop/student/vehicle tenant validation; vehicle seat-cap enforcement; Admin route and stop capacity display.
- P561: COMPLETE — trip/stop/student pickup-drop attendance, absent and missed-stop status, handover recipient, tenant-validated admin and verified assigned driver/attendant mobile attendance, daily summary.

Cycle position: **26/34 phases complete (P538–P563), 8 remaining (76.5%)**.

P561 focused verifier: **16/16 PASS**. P559 regression: **24/24 PASS**. P560 regression: **17/17 PASS**. P357 transport regression: **45/45 PASS**. TypeScript/TSX transpilation for API transport routes, School Admin Transport UI and Driver Mobile: **0 diagnostics**. P560 baseline archive manifest validation: **4,605 entries; no missing entries or hash/size failures; ZIP CRC PASS**. Full Prisma validation/generation, migration execution, dependency-backed package builds/typechecks, database/API runtime, browser/device, accessibility, concurrency and E2E acceptance remain pending.

- P562: COMPLETE — GPS provider abstraction/configuration, explicit personnel consent grant/revoke, verified driver location API, bounded retention and privacy-aware history, Admin controls and Driver Mobile manual-location foundation. Native GPS integration remains OPEN.

Cycle position: **25/34 phases complete (P538–P571), 9 remaining (73.5%)**.

P562 focused verifier: **19/19 PASS**. P561 regression: **16/16 PASS**. P560: **17/17 PASS**. P559: **24/24 PASS**. P357: **45/45 PASS**. API transport routes, School Admin Transport UI and Driver Mobile TSX syntax transpilation: **0 diagnostics**. Prisma validation/generation, DB migration/runtime, dependency builds/typechecks, native GPS/device/browser, accessibility, privacy/security, concurrency and E2E acceptance remain pending.

## P563 completion
- P563: COMPLETE — consent-scoped parent route visibility, privacy-gated fresh live location (GPS enabled, driver consent, current-day trip and <=5-minute ping), current-day trip/attendance summary, optional stop coordinates and Admin stop coordinate input, Parent Mobile Transport screen, Haversine geofence helper.
- P563 focused verifier: **17/17 PASS**. Geofence helper assertions: **4/4 PASS** (compiled and executed). Parent/transport API, geofence, Admin UI and Parent Mobile files transpile: **0 diagnostics**. Full build/typecheck, Prisma validation/DB migration/runtime, native GPS/background, maps, notifications, accessibility/security/concurrency and E2E remain pending.

- P564: COMPLETE — tenant-scoped transport incident reporting and lifecycle, emergency contact escalation metadata, vehicle maintenance scheduling/history, vehicle inspection records, consolidated vehicle/personnel/document expiry and maintenance due report, School Admin workflows and Driver Mobile incident reporting.

Cycle position: **27/34 phases complete (P538–P571), 7 remaining (79.4%)**.

P564 focused verifier: **25/25 PASS**. P562 regression: **19/19 PASS**. P561 regression: **16/16 PASS**. P560 regression: **17/17 PASS**. API transport routes, School Admin Transport Workspace and Driver Mobile TSX transpilation: **0 diagnostics**. Prisma validation/generation, live DB migration/runtime, dependency-backed builds/typechecks, emergency notification delivery, browser/device, accessibility, security, concurrency and E2E remain OPEN.


## P565 completion
- P565: COMPLETE — transport fee plans, active-allocation monthly invoice generation, invoice records, payment records and receipt numbers, audited discount/waiver adjustments, outstanding ledger and totals, Admin workflows and consent-scoped parent fee visibility/Parent Mobile summary. Gateway settlement/refunds, scheduled billing, exports and full runtime acceptance remain OPEN.

Cycle position: **28/34 phases complete (P538–P571), 6 remaining (82.4%)**.

P565 focused verifier: **34/34 PASS**. P564 regression: **25/25 PASS**. P562: **19/19 PASS**. P561: **16/16 PASS**. P560: **17/17 PASS**. P559: **24/24 PASS**. Combined focused assertions: **135/135 PASS**. Four changed API/Admin/Parent Mobile TypeScript/TSX files transpile with **0 diagnostics**. Prisma validation/generation, live DB migration/runtime, dependency builds/typechecks, payment gateway/webhooks/refunds, browser/device, accessibility, load/concurrency and E2E remain OPEN.


## P566 completion
- P566: COMPLETE — added tenant-scoped HostelAttendanceSession and HostelRollCallRecord models; building/date/session roll-call creation and active resident roster; PRESENT/ABSENT/LATE/ON_LEAVE/NOT_VERIFIED status capture; absence verification with a required note and session-close guard for unverified absences; configurable curfew policies with grace-minute calculation; late-return event record/resolve; night-check rounds and per-resident entries; not-in-room observations create verification-first safety escalations; verification and resolution lifecycle; School Admin workflows; audit events.
- P566 focused verifier: **44/44 PASS**. P358 hostel baseline regression: **43/43 PASS**. P562 transport GPS regression: **19/19 PASS**. P564 transport incident regression: **25/25 PASS**. P565 transport fees regression: **34/34 PASS**. API route and School Admin TSX syntax transpilation: **0 diagnostics**.
- Cycle position: **29/34 phases complete (P538–P571), 5 remaining (85.3%)**.
- Not run: Prisma CLI validate/generate, clean/upgraded PostgreSQL migration execution, DB/API runtime integration, dependency-backed builds/typechecks, role/RLS negative tests, browser/device, native warden mobile, accessibility, concurrency/load and full E2E. Guardian notification provider delivery and parent/student hostel mobile views remain OPEN.


## P567 completion
- P567: COMPLETE — visitor registration tied to an active hostel resident and validated building; minimal identity collection (identity type + last four only); duplicate active visitor authorization guard; auditable APPROVED/DENIED/BLOCKED decisions; time-bounded visitor gate passes; validity-checked gate check-in/check-out; resident outpass request linked to an existing APPROVED HostelLeaveRequest; outpass approval revalidates the leave and resident; departure and return events; pass expiry handling; School Admin visitor and gate-pass workflows.
- P567 focused source verifier: **52/52 PASS**. P566 hostel attendance source regression: **44/44 PASS**. P358 hostel foundation regression: **43/43 PASS**. API route and School Admin TSX syntax transpilation: **0 diagnostics**.
- Cycle position: **30/34 phases complete (P538–P571), 4 remaining (88.2%)**.
- Not run: Prisma CLI validate/generate, clean/upgraded PostgreSQL migration execution, DB/API runtime integration, dependency-backed builds/typechecks, production-role RLS/cross-school negative tests, browser/device, accessibility, concurrency/load and full E2E. These remain OPEN; P568 leave approval/guardian communication is intentionally not implemented in P567.


## P568 completion
- P568: COMPLETE — extended HostelLeaveRequest with resident allocation, destination/contact policy, creator, approval/denial actors and timestamps, decision note, cancellation, actual return, late-return and updated-at fields. Added explicit per-student HostelGuardianConsent with opt-in leave updates, in-app/email channel preferences, grant/revoke timestamps and audit. Added idempotent HostelLeaveNotificationEvent ledger linked to the leave request.
- Guardian portal supports leave request create/edit/cancel, request history and explicit notification consent. Mutations require `parent.hostel.manage`, accepted/verified guardian access and a linked student with active hostel allocation. School Admin/warden can review, approve/deny, inspect notification delivery history and verify return check-in.
- Warden approval creates the linked P567 resident gate-pass with a validity window matching the approved leave. Overlapping leaves are blocked; transaction advisory locks serialize per-student leave changes and per-leave pass issuance. Legacy P567 manual outpass creation now rejects duplicate passes for the same leave.
- Notification fanout creates parent in-app notifications only for accepted, verified linked guardians with explicit leave consent and enabled channel preferences. Email uses the existing NotificationOutbox and HTTPS provider worker; the worker rechecks consent, verified guardian email, parent invitation consent, school suppression and channel preference at send time. Provider webhook events update the hostel notification ledger. No claim of actual delivery is made until the existing provider worker/webhook confirms it. SMS and push are not enabled in P568.
- Added a recurring hostel late-return monitor worker and production Compose service. It marks only overdue requests whose resident gate-pass is still CHECKED_OUT as LATE_RETURN and notifies consented guardians. Return check-in changes the pass to RETURNED and the leave request to RETURNED or RETURNED_LATE.
- P568 focused source verifier: **72/72 PASS**. P567 regression: **57/57 PASS**. P566 regression: **44/44 PASS**. P358 regression: **43/43 PASS**. Combined focused assertions: **216/216 PASS**. Nine changed API/worker/Admin/Parent Mobile TS/TSX files transpile with **0 diagnostics**.
- Cycle position: **31/34 phases complete (P538–P571), 3 remaining (91.2%)**.
- Not run: Prisma CLI format/validate/generate, clean/upgraded PostgreSQL migration execution, DB/API runtime integration, dependency-backed builds/typechecks, production-role RLS/cross-school negative tests, real provider delivery/webhook E2E, browser/device, accessibility, concurrency/load and full E2E. SMS/push provider delivery and dedicated native warden app remain OPEN.

- Master gap register snapshot after P568: **631 unchecked entries** — 375 explicitly `OPEN`, 72 `READY_FOR_VERIFICATION`, 7 `IN_PROGRESS`, 23 `DEFERRED`, 1 `PARTIAL`; remaining legacy entries use mixed prose/status labels and are retained without silently closing them.


## P569 completion
- P569: COMPLETE — added four tenant-scoped Prisma models for bed transfer history, prioritized hostel waitlist, checkout clearance and settlement lines; capacity summary by bed status and building; advisory-lock serialized bed transfer with source/destination ownership and availability checks plus student gender/hostel-type eligibility guard; waitlist registration, eligibility and priority, preferred building/type, time-bounded offer, reserved-bed claim, acceptance-to-allocation, decline and expiry; automatic next eligible waitlist offer when a bed is released by transfer or approved checkout; audited checkout checklist and independently approved settlement lines; final checkout approval closes the allocation, releases the bed and offers it to the next eligible waitlist entry. School Admin capacity/transfer/waitlist/checkout workspace added.
- P569 focused source verifier: **46/46 PASS**. API routes and School Admin TSX transpilation: **0 syntax diagnostics**.
- Not run: Prisma format/validate/generate, clean/upgraded PostgreSQL migration/runtime, dependency-backed semantic builds/typechecks, API/database integration, production RLS/cross-school negative tests, Parent Mobile views, guardian notification delivery, accounting/proration/refund execution, scheduled offer-expiry worker, browser/device, accessibility, concurrency/load and full E2E. These remain OPEN in P569-G001–G010.
- Cycle position: **32/34 phases complete (P538–P571), 2 remaining (94.1%)**. Next: P570 Hostel fees, deposits, refunds, duty roster, maintenance, safeguarding and reporting.

- Master gap register snapshot after P569: **641 unchecked entries** — previous P568 snapshot 631 plus 10 new P569 gaps. No existing gap was closed without verification evidence.

## P570 completion
- P570: COMPLETE — added eight tenant-scoped Prisma models for fee plans, invoices, payment records, deposit accounts/events, duty assignments, maintenance tickets and safeguarding cases; school-scoped fee plan/invoice/payment APIs; deterministic calendar-day proration and persisted invoice calculation breakdown; append-only payment records and invoice advisory lock; immutable deposit event ledger with collection/deduction and separately approved/executed refunds; pending/approved refund reservation prevents deductions from consuming committed balance; duty roster prevents overlapping active assignments for the same staff user; maintenance tickets require closure evidence and prevent occupied/reserved bed removal from service; restricted safeguarding records use dedicated read/manage permissions and audited case access; Parent portal and Parent Mobile show linked-student invoice/payment status; School Admin fee, duty and maintenance workspaces.
- P570 focused verifier: **57/57 PASS**. P569 regression: **49/49 PASS**. P568: **72/72 PASS**. P567: **57/57 PASS**. P566: **44/44 PASS**. P358: **43/43 PASS**. Four changed API/Admin/Parent Mobile TS/TSX files transpile with **0 syntax diagnostics**.
- Cycle position: **33/34 phases complete (P538–P571), 1 remaining (97.1%)**. Next: P571 cross-module integration, permissions, accessibility, concurrency, cycle gap reconciliation and closure.
- Not run: Prisma CLI format/validate/generate, clean/upgraded PostgreSQL migration/runtime, semantic typecheck/dependency build, API/database integration, production RLS/cross-school denial, canonical accounting journal, payment gateway/bank reconciliation/refund provider E2E, scheduled billing/late-fee worker, browser/device, accessibility, concurrency/load, safeguarding privacy/legal review and full E2E. These remain OPEN in P570-G001–G012.
- Master gap register snapshot after P570: **653 unchecked entries** — P569 snapshot 641 plus 12 new P570 gaps. No prior gap was closed without verification evidence.


## P571 completion — final C2-10 phase
- P571: COMPLETE as an integration audit and evidence-delivery phase. Added a cross-module source/inventory verifier (**36/36 PASS**), inventoried **158** migration folders (all contain migration.sql), executed the complete static verifier runner (**328/357 PASS; 29 FAIL**) and retained all failures with exact verifier IDs. The root/docs/docs-phases master gap-register mirrors were updated; no existing gaps were closed without implementation and reproducible evidence.
- Environment blockers: pnpm, Prisma CLI, Docker, workspace node_modules, PostgreSQL and provider/device infrastructure are unavailable in this run. Prisma validate/generate, clean/upgraded DB migrations, semantic builds/typechecks, DB/API integration, production RLS, concurrency/load, provider E2E, browser/device/offline/accessibility and independent privacy/legal review remain OPEN in P571-G001–G012.
- C2-10 phase sequence: **34/34 phases delivered (P538–P571)**. This closes the planned phase sequence only; it is not a production-readiness certification. The 29 failing static verifiers and all P571 operational gates remain tracked.
- P571 focused integration assertions: **36/36 PASS**. ZIP CRC, SHA-256 and deep manifest verification: PASS.

## Source: `C2-11-ROADMAP.md`

# C2-11 Production Readiness & Consolidated Gap Remediation Roadmap (P572 onward)

**Baseline:** P571 cumulative. **Purpose:** resolve the release blockers accumulated across C2-01–C2-10, using evidence-backed closures only. C2-10 (P538–P571) remains complete and is not reopened.

## Wave sequence

| Phase | Workstream | Acceptance focus | Status |
|---|---|---|---|
| P572 | Workspace and static gate remediation | pnpm 9.15.0 lockfile/frozen install, static verifier suite, manifest integrity | Source remediation delivered; lockfile gate blocked |
| P573 | Prisma and database migration acceptance | format/validate/generate; clean and upgraded PostgreSQL migrations; drift/rollback | BLOCKED — environment prerequisites unavailable; migration artifacts inventoried |
| P574 | Dependency-backed build and API integration | all 14 workspace packages typecheck/build; DB-backed API tests | BLOCKED — preflight added; registry/toolchain/database prerequisites unavailable |
| P575 | Tenant isolation and authorization | production-role RLS, cross-org/school/student/guardian negative tests | Source hardening delivered; runtime acceptance BLOCKED by P573/P574 prerequisites |
| P576 | Financial and notification provider E2E | payments, refunds, email/SMS/push, webhook idempotency and reconciliation | Source contract delivered; provider/database acceptance BLOCKED |
| P577 | Browser/mobile journey and accessibility | all nine apps (four web, five mobile), offline recovery, WCAG/manual assistive-tech validation | Source test foundation delivered; browser/device acceptance BLOCKED |
| P578 | Reliability and operational acceptance | concurrency/load, worker lifecycle, observability, backup/restore, DR | Source foundation delivered; runtime acceptance BLOCKED |
| P579 | Independent review and cycle closure | privacy/security/legal review, master gap reconciliation, release decision | Delivered as review artifact; NO-GO — runtime and independent sign-offs remain blocked |

## P574 evidence boundary

P574 adds a fail-closed prerequisite preflight. The manifest audit found 14 packages with no dependency/script-target errors; the syntax scan found 315 files with zero parse errors; P501 and P502 focused verifiers pass after restoring missing historical register mirrors. The npm registry probe returned EAI_AGAIN, pnpm-lock.yaml is absent, and pnpm, Prisma CLI, Docker, psql and installed dependencies are unavailable. Frozen install, Prisma generation, semantic builds and PostgreSQL integration were not run.

## Execution rules
- Preserve all P571 functionality and all historical phases; no destructive simplification to make checks pass.
- Never fabricate pnpm lockfile metadata, database execution evidence, provider callbacks or accessibility sign-off.
- Update the root `MASTER-OPEN-GAPS-REGISTER.md` and identical docs mirrors; close only with implementation plus reproducible verification evidence.
- Keep source checks, semantic builds, database runtime, provider E2E and independent reviews as distinct evidence categories.
- C2-10 remains closed at phase-delivery level; C2-11 owns the remaining release-readiness remediation.


## P577 evidence boundary
P577 adds Playwright/axe test foundations, four web entry smoke specs, mobile journey matrix, synthetic test-tenant contract and manual accessibility/offline runbook. Driver mobile receives accessible roles/names/selected states and a trip attendance scoping correction. Foundation verifier 51/51 PASS; three changed TS/TSX files syntax-transpile with zero diagnostics. The pnpm lockfile and dependencies remain unavailable; no Playwright/axe execution, browser target, seeded tenant, device/simulator, offline recovery or manual WCAG/VoiceOver/TalkBack audit was performed. P577-G001–G008 remain OPEN.


## P578 evidence boundary
P578 strengthens shared worker shutdown with per-step timeouts, idempotent invocation and best-effort completion of worker drain, queue close and database disconnect while surfacing aggregated errors. Added focused shutdown tests, a bounded HTTPS-only k6 health smoke profile, and a backup/restore, failure-drill, observability and RPO/RTO acceptance runbook. P578 verifier PASS 6/6; P75 shutdown regression PASS 10/10 after updating a stale phrase assertion to match expanded cleanup semantics; P77 observability regression PASS 10/10; TypeScript syntax transpile PASS 2/2. k6, Docker, PostgreSQL, Redis, load/soak, backup/restore, failover and RPO/RTO drills were NOT RUN. P578-G001–G008 remain OPEN.


## P579 independent review and closure evidence boundary
P579 delivered the final review package, machine-readable evidence inventory, release-blocker register, risk disposition, source-level SBOM/dependency declaration inventory, secrets-scan limitation record, deployment/rollback plan and fail-closed go/no-go decision. Focused C2-11 verifiers were rerun: P571, P575 (two), P576, P577, P578 and P70–P78 passed; P573 migration verifier returned BLOCKED because the authentic pnpm lockfile is absent. The all-history static runner was attempted but exceeded the five-minute execution window after 68 PASS results and one lockfile-related C2-01 workspace failure; it is INCOMPLETE, not a pass.

No pnpm frozen install, Prisma validate/generate, semantic builds, PostgreSQL migration, restricted-role RLS, payment/provider E2E, browser/device/assistive-technology, k6 load/soak, backup/restore/PITR, failover, production secret scan or independent security/privacy/legal/safeguarding/operations review is claimed. The release decision is **NO-GO** until the mandatory gates are verified or formally risk-accepted by authorized stakeholders. P579-G001–G008 remain OPEN.

## Source: `C2-11-PROGRESS.md`

# C2-11 Progress — Production Readiness & Consolidated Gap Remediation

- Baseline: P571 cumulative.
- C2-10 (P538–P571): complete, 34/34 planned phases delivered.
- P572: source-level verifier remediation delivered; six stale assertions corrected; the real lockfile gate remains blocked.
- P573: BLOCKED. Dependency-free inventory found 14 workspace package manifests and 158 non-empty migration SQL files; 20 repeated timestamp prefixes need dependency-aware review. No pnpm, Prisma CLI, PostgreSQL or Docker runtime was available.
- P574: BLOCKED. Added fail-closed build/integration preflight; 14 package manifests pass, source syntax scan passes 315/315, P501 verifier passes 24/24, P502 verifier passes 17/17 after restoring historical mirror files. Registry request returns EAI_AGAIN; no pnpm lockfile, dependencies, Prisma CLI, Docker or PostgreSQL client/server.
- P574 full static verifier runner remains INCOMPLETE: the pre-fix run reached 298 PASS and 3 FAIL before timeout. The P501/P502 mirror failures were fixed and their focused verifiers rerun successfully; a complete post-fix run remains outstanding. C2-01 lockfile gate remains blocked.
- P572-G001–G008, P573-G001–G008 and P574-G001–G008 remain OPEN. P571 baseline had 665 unchecked entries; P572, P573 and P574 each added 8, for **689 unchecked entries** in the phase ledger.
- No frozen install, Prisma validation/client generation, semantic build, PostgreSQL migration/seed/upgrade, API/database integration, production RLS, provider, browser/device or independent review acceptance is claimed.

Next: restore registry-enabled pnpm 9.15.0 and PostgreSQL runtime, complete P574 acceptance, then begin P575 tenant isolation/authorization runtime acceptance. Do not bypass prerequisites.

- P575: SOURCE IMPLEMENTATION DELIVERED; RUNTIME SECURITY ACCEPTANCE BLOCKED. Hardened tenant context helpers to reset all eight transaction-local identity/privilege/service selectors before applying the intended context; added static inventory and PostgreSQL catalog/no-context acceptance SQL. P575 static verifier PASS; P70 contract 10/10; executable mock checks 9/9; syntax scan 315/315. Inventory: 251 Prisma models, 235 tenant-scoped, 158 migration SQL files. Direct exact-table RLS scan found 75 ENABLE, 75 FORCE and 80 CREATE POLICY statements; dynamic SQL is excluded and catalog state is unknown. PostgreSQL, restricted-role, cross-tenant API, pool reuse, semantic builds and E2E remain NOT RUN. P575-G001–G008 remain OPEN; master register now has 697 unchecked entries.

C2-11 phase position: P572–P575 delivered as phase artifacts (4/8); P575 is not runtime/security accepted. Remaining phase sequence: P576 financial/provider E2E, P577 browser/mobile/accessibility, P578 reliability/operations, P579 independent review and final cycle closure. Do not bypass P573/P574 prerequisites.


- P576: SOURCE CONTRACT DELIVERED; PROVIDER/DATABASE ACCEPTANCE BLOCKED. Payment webhook now requires `t=<unix-seconds>,v1=<HMAC-SHA256>` over timestamp + exact raw body; five-minute replay window, constant-time digest comparison, strict header parsing, 64 KB payload cap and provider-id validation added. Existing payload-hash event replay/conflict logic and notification webhook delivery/bounce/complaint/suppression code retained. P576 static contract verifier PASS 20/20; executable helper checks PASS 8/8; three changed TS files transpile with zero syntax diagnostics. No payment gateway or notification provider sandbox credentials were available; no payment reconciliation, invoice settlement, refund/chargeback ledger, PostgreSQL, restricted-role, notification provider callbacks or browser E2E were executed. P576-G001–G008 remain OPEN; master unchecked count rises from 697 to 705.

C2-11 phase position: P572–P576 delivered as phase artifacts (5/8); P573–P576 acceptance blockers remain open. Remaining phases: P577 browser/mobile journeys and accessibility, P578 reliability and operations, P579 independent review and final cycle closure. The P573/P574 toolchain/database entry gates remain mandatory.


- P577: SOURCE TEST FOUNDATION DELIVERED; BROWSER/MOBILE/ACCESSIBILITY ACCEPTANCE BLOCKED. Added Playwright 1.56.1 and axe-core Playwright 4.10.2 root devDependency declarations; desktop/mobile Chromium config; four-web-app entry smoke tests and axe WCAG 2.2 A/AA serious/critical gate; Parent/Teacher/Student/Driver/Staff device journey matrix; synthetic tenant fixture contract; offline, Kannada, responsive and manual WCAG/assistive-tech runbook. Driver mobile now has explicit button/header roles, accessible names, selected states and trip-scoped attendance actions (corrected action reference outside trip iteration). P577 foundation verifier PASS 51/51; TS syntax transpile PASS 3/3; package JSON PASS. pnpm-lock absent, pnpm and Node Playwright dependencies/browser binaries unavailable; no browser URLs, seeded tenant, adb/xcrun/Maestro, Docker/PostgreSQL. Playwright, axe, mobile, offline, semantic builds and manual accessibility NOT RUN. P577-G001–G008 remain OPEN; master unchecked entries increase from 705 to **713**.

C2-11 phase position: P572–P577 delivered as phase artifacts (6/8); P573–P577 runtime acceptance blockers remain open. Remaining phases: P578 reliability/operations and P579 independent review/final cycle closure. Do not bypass P573/P574/P575 entry gates.


- P578: SOURCE RELIABILITY FOUNDATION DELIVERED; RUNTIME/OPERATIONS ACCEPTANCE BLOCKED. Worker shutdown now bounds each cleanup step (10s default), remains idempotent and attempts queue/database cleanup even after worker-drain failure, surfacing AggregateError. Added timeout/failure/idempotency unit cases, HTTPS-only k6 health smoke profile with provisional thresholds, and backup/restore, failure-drill, observability and RPO/RTO runbook. P578 verifier PASS 6/6; P75 shutdown regression PASS 10/10 after refreshing a stale static phrase assertion; P77 observability regression PASS 10/10; TS syntax transpile PASS 2/2. k6/Docker/PostgreSQL/Redis, load/soak, backup/restore, failover and RPO/RTO NOT RUN. P578-G001–G008 remain OPEN; master unchecked entries rise from 713 to **721**.

C2-11 phase position: P572–P578 delivered as phase artifacts (7/8); production/runtime acceptance blockers remain open across P573–P578. Only P579 independent review, master gap reconciliation and final cycle release decision remains.


- P579: FINAL REVIEW ARTIFACT DELIVERED; **NO-GO / C2-11 RUNTIME ACCEPTANCE NOT CLOSED**. Baseline P578 checksum and ZIP integrity revalidated. Focused verifier results: 15/16 PASS, with P573 migration artifact verifier BLOCKED on missing authentic `pnpm-lock.yaml`; the other focused checks (P571, P575 mock/static, P576, P577, P578 and P70–P78) pass. Historical all-static runner attempted: 68 verifiers PASS and one lockfile-related C2-01 workspace failure before the five-minute tool timeout; suite INCOMPLETE and not certified. Added release blockers, risk disposition, privacy/legal review record, source dependency inventory, secrets-scan limitations, deployment/rollback runbook, operational ownership requirements and a machine-readable go/no-go record. No external review or production runtime acceptance is claimed. P579-G001–G008 remain OPEN; unchecked master-register entries increase from 721 to **729**. C2-11 phase artifacts P572–P579 are 8/8 delivered, but the cycle remains NOT production-accepted.

## Source: `docs/C2-08-ROADMAP.md`

# C2-08 — Finance & Fee Management Roadmap

Cycle 2 implementation sequence. This is a phase plan, not a runtime acceptance statement.

| Phase | Focus | Planned scope | Status |
|---|---|---|---|
| C2-08-01 / P509 | Finance foundation | School finance configuration, default currency, fee categories, enabled payment methods, invoice/receipt prefixes, non-cash reference policy | **Completed — source/static checks** |
| C2-08-02 / P510 | Fee structure enhancements | Consume finance config categories/currency, stronger structures, component validation and scoped templates | **Completed — source/static checks** |
| C2-08-03 / P511 | Student fee assignment | Student/class/year assignment lifecycle, preview, idempotency and duplicate handling | **Completed — source/static checks** |
| C2-08-04 / P512 | Installments & schedules | Due dates, installments, schedule visibility and lifecycle | **Completed — source/static checks** |
| C2-08-05 / P513 | Discounts & concessions | Scholarship, concession, waiver and approval rules | **Completed — source/static checks** |
| C2-08-06 / P514 | Billing & invoices | Invoice generation, adjustments, numbering, document output, approved concession netting and invoice lifecycle | **Completed — source/static checks** |
| C2-08-07 / P515 | Fee collection | Invoice-linked payment recording, partial payments, configured payment methods, idempotent retries and installment allocations | **Completed — source/static checks** |
| C2-08-08 / P516 | Receipts & ledger | Persisted receipt generation, student ledger, transaction traceability and reversals | **Next** |
| C2-08-09 / P517 | Outstanding & late fees | Overdue balances, penalty policy, aging and outstanding workflows | Planned |
| C2-08-10 / P518 | Refunds & reconciliation | Refund/reversal lifecycle, reconciliation, idempotency and reporting | Planned |
| C2-08-11 / P519 | Parent mobile integration | Parent dues, invoices, payment history and receipt visibility | Planned |
| C2-08-12 / P520 | Consolidation | Finance dashboards/reports, integration gap remediation and phase consolidation | Planned |

## P509 carry-forward gaps

- Integrate configured fee categories into fee-structure components and fee-charge validation.
- Enforce configured payment-method enablement and non-cash reference policy in payment recording.
- Validate migration and RLS on clean PostgreSQL locally.
- Add runtime/API integration, tenant-negative and role-negative tests.
- Confirm configured prefixes and currency are consumed by invoice/receipt generation.

## User-run acceptance

Dependency installation, local builds, runtime checks, device checks and E2E acceptance are performed by the user locally. Development phases continue with source/static verification and clear disclosure of what has not been run.

## P514 delivered

- Invoice draft generation from published fee charges, with duplicate prevention.
- Approved concessions snapshotted into invoice totals and installment-aware lines.
- Invoice list/detail API and Finance UI; draft issue and reason-required void workflow.
- Tenant-scoped invoice tables and RLS. Source/static verification only.

## P515 delivered

- Invoice-aware manual payments; invoice net outstanding caps collection.
- School-enabled payment methods enforced and Finance collection UI dynamically populated.
- Matching payment-reference retries return the existing payment; mismatched retries conflict.
- Payments link to invoices and allocate oldest-first across installments, including net concession-adjusted targets.
- Persisted payment-installment allocation rows with tenant composite FKs and forced RLS.
- Invoice/charge/installment/schedule balances and statuses update transactionally.
- Payment history and receipt print include invoice and installment allocation details.
- Source/static checks only; local runtime acceptance remains pending.

## P513 delivered

- Charge-level fixed and percentage concession requests with calculated values.
- Tenant-scoped concession persistence and compound charge scope FK.
- Independent approval/rejection (`fees.approve`); requester self-approval blocked.
- Requests restricted to charges that remain in DRAFT state.
- Pending duplicate requests blocked; approved concession sum cannot exceed gross charge.
- Finance UI request/review panel displays gross, approved concession total, and calculated net amount.
- Gross charge is not mutated in P513; invoice lifecycle/netting is the P514 integration.
- Source/static verification only; local runtime acceptance remains user-run.

## Source: `docs/REMEDIATION-ROADMAP-P79-P108.md`

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

## Source: `P537-C2-09-CYCLE-CLOSURE.md`

# C2-09 Cycle Closure — Source Phase Completion

- Phase range: P526–P537
- Source phases completed: 12/12
- Final phase: P537 — Cross-app Integration, Permissions, Accessibility & Cycle Closure
- P537 source audit: 15/15 PASS
- Runtime acceptance: PENDING; not a production-ready sign-off

## Remaining blockers
- P537-G001: Full builds, API/database integration, browser/mobile and E2E cycle acceptance.
- P537-G002: Formal accessibility and runtime role/tenant/school-negative validation.
- P537-G003: C2-09 runtime acceptance is blocked by carried-forward gaps.
- P536-G001/G002: Server-side pagination/report filters and extended delivery/provider tracking.
- P535-G001/G002/G003: Student preference runtime authorization, offline intent/reconciliation, email/push channels.
- P534-G001/G002: Runtime aggregate verification, recipient-level actions and provider delivery tracking.

C2-09 is source-phase complete; runtime closure remains pending.

## Source: `REMEDIATION-PROGRESS.md`

# Remediation progress through P99

Phases delivered: P80–P99 (20 phases).

Current work is policy and API source foundation. End-to-end acceptance across DB/RLS, API, browser/mobile, workers and external providers is not yet complete. Refer to MASTER-OPEN-GAPS-REGISTER.md for authoritative unresolved status.

## P165–P172 closure block

Alert taxonomy and dedupe contracts added; document-scan terminal failures and refund-evidence cleanup failures emit durable operations alerts. Operations/storage/evidence remaining gaps are carried in the master register. Runtime acceptance remains pending.

## Finance Cycle C2-08 latest: P515
P515 delivers invoice-aware manual payment collection, enabled payment-method configuration enforcement, matching-reference idempotency, invoice net outstanding caps, immutable payment-to-installment allocation records, installment/schedule balance and status updates, and Finance UI allocation/invoice details. P515 focused source verification passed 45 checks and P509–P514 regressions passed. Runtime acceptance remains pending. See `docs/phases/P515/` and `MASTER-OPEN-GAPS-REGISTER.md.

## Finance Cycle C2-08 latest: P516
P516 adds formal immutable fee receipts with school-scoped sequence numbering, idempotent issue API, tenant-scoped receipt list/detail endpoints, receipt snapshot/print UI, and student ledger API/UI for charges, approved concessions, payments and settled refunds with per-currency running balances. P516 focused verifier passed 69 checks; P510–P515 finance regressions passed; modified TS/TSX parser diagnostics are 0. Runtime acceptance remains pending. See `docs/phases/P516/` and the master gap register.


## Finance Cycle C2-08 latest: P517
P517 delivers tenant-scoped outstanding fee balances and aging buckets, currency totals, configurable school late-fee policy and fixed/percentage preview with grace days and optional cap, plus Finance UI. Policy defaults disabled; late fees are preview only, with no auto assessment or posting. Focused verifier 58/58; P513, P514, P515 regression verifiers passed (27/27, 43/43, 45/45); TS/TSX parser diagnostics zero. Live DB/API, tenant/RBAC negative acceptance, full build/typecheck and browser/device E2E remain pending. See docs/phases/P517 and gap register.


## Finance Cycle C2-08 latest: P518
P518 delivers currency-wise refund state/reserve summary, payment-level over-reserved refund detection, and Finance UI exception display. Verifier 25/25; P510–P518 regressions passed; parser diagnostics zero. Runtime acceptance pending. See docs/phases/P518 and master gap register.

## Finance Cycle C2-08 latest: P519
P519 integrates parent-visible finance data with installment schedules, formal receipt snapshots and payment-to-installment allocation details in the parent mobile app. Existing consent/guardian link/tenant scopes and read-only payment initiation behavior are preserved. Focused verifier 29/29 PASS; all P510–P519 focused finance verifiers passed; modified parent route and App.tsx parser diagnostics zero. Runtime database, build/typecheck and browser/mobile E2E acceptance remain pending. See docs/phases/P519 and MASTER-OPEN-GAPS-REGISTER.md.


## Finance Cycle C2-08 latest: P520
P520 adds an operational Finance consolidation overview to the Finance & Accounting workspace, grouping loaded billed, approved concessions, recorded paid, estimated outstanding and refund lifecycle totals by currency; it also shows invoice/refund/overdue counts, payment-method count, late-fee preview state and clearing-reconciliation context. Focused verifier 24/24 PASS; P510–P520 regression sequence PASS; TSX parser diagnostics 0. Totals are bounded-data estimates and not authoritative ledger reconciliation. Runtime/build/browser/mobile/E2E acceptance remains pending. See docs/phases/P520 and MASTER-OPEN-GAPS-REGISTER.md.


### P521 — Finance server-side aggregation remediation
- Added `/accounting/finance-summary` with tenant-school scoped server grouping for charges, concessions, invoices, payments, and refunds by currency/status.
- Added P521 server summary panel and aggregated CSV export.
- Focused source verifier and P510–P520 regression sequence executed; runtime database/build/E2E acceptance remains OPEN.

### P522 — Finance Ledger Reconciliation
- Added tenant-school scoped read-only payment/refund source-to-clearing-ledger reconciliation by currency.
- Comparison uses account 1110 cash/bank clearing conventions: payment clearing debit and refund clearing credit; non-1110 lines are excluded from the comparison totals.
- UI exposes source totals, posted journal totals, variances and categorized exceptions. No journal posting/mutation is performed.
- Focused verifier: 19/19 PASS. Finance regressions P510–P521 PASS. Parser diagnostics 0 for changed TS/TSX files. Runtime/DB/build/browser/E2E acceptance remains open.


### P523 — Finance Reconciliation Date Windows & Drill-down
- Added validated inclusive start/end dates to the reconciliation API. Source payment dates use `paidAt`, settled refunds use `settledAt`, and posted journal rows use `postingDate`; invalid dates and reversed ranges are rejected. Date differences can still produce timing variances and are explicitly explained in the UI.
- Added capped source detail: up to 100 payment rows, 100 settled refunds, and 200 posted journal lines with IDs, references, dates, account codes, debit/credit amounts.
- Finance Workspace date filters and drill-down tables are wired.
- Focused verifier 16/16 PASS; P522 verifier 19/19 PASS; P521 verifier 33/33 PASS; P510–P520 regression sequence PASS; TypeScript/TSX parser diagnostics 0. Runtime PostgreSQL/build/typecheck/browser/mobile/E2E remains OPEN.


## P524 Finance Lifecycle Status Matrix
P524 added payment/refund lifecycle counts and amount aggregation by currency/status and a diagnostic Finance Workspace view. Runtime acceptance remains open.

## Cycle progress snapshot (P524)
- **C2-08 Finance & Fee Management:** 12/12 planned phases complete (P509–P520); finance follow-up remediation P521 onward is separately tracked.
- **C2-09 Admissions, Documents & Communications:** 0/12 planned phases (P526–P537), after P525 remediation close-out.

## P525 — Finance Lifecycle Fixture Matrix & Remediation Close-out
- Added a 12-scenario finance lifecycle fixture specification and focused source verifier.
- P525 14/14; P524 13/13; P523 16/16; P522 19/19; P521 33/33 — **95/95 combined PASS**.
- Runtime database fixtures and broader acceptance remain OPEN; this is source/specification close-out only.

### Cycle snapshot (P525)
- C2-08 Finance & Fee Management: **12/12 planned complete** (P509–P520); remediation P521–P525 separate.
- C2-09 Admissions, Documents & Communications: **0/12 planned** (P526–P537).
- Next: P526 Admissions Foundation & Configuration.

## P526 / Cycle 2 progress update
- Finance & Fee Management C2-08 original phases: **12/12 complete**.
- Finance remediation phases P521–P525 source/specification work completed; runtime validation remains open.
- C2-09 Admissions, Documents & Communications planned P526–P537: **1/12 complete**.
- P526 Admissions Foundation & Configuration: source implementation complete; **18/18 focused assertions passed**.
- Next phase: P527 Applicant Intake API & Forms.

## P527 — Applicant Intake API & Forms
- Added versioned public intake metadata (`1.0`) for enquiry and application fields and a school-context validated `/admissions/intake-form` endpoint.
- Public portal consumes metadata and shows required/optional field summaries. Existing public application and draft routes preserved.
- Focused verifier P527 20/20; regressions P526 18/18, P525 14/14, P524 13/13, P522 19/19 — **84/84 PASS**.
- C2-08 Finance: 12/12 complete. C2-09 Admissions: **3/12 complete (P526–P528)**. Next P529.
- Runtime database/build/typecheck/browser/mobile/E2E validation remains OPEN.

## P528 — Application Status Transitions & Audit
- Transition preflight API added with current status, allowed transition options, terminal-state marker and recent stage history; common blockers return stable codes/context.
- P528 verifier: **21/21 PASS**. Admissions regressions P527/P526: **38/38 PASS**. Finance regressions P525–P520: **119/119 PASS**. Combined selected assertions: **178/178 PASS**.
- C2-08 Finance remains **12/12 complete**. C2-09 Admissions is **3/12 complete (P526–P528)**. Next P529.
- Runtime, tenant-negative, full build/typecheck, browser/mobile and E2E validation remain open.

## P529 Update

P529 — Admissions Document Checklist & Rule Resolution: source implementation delivered; focused verifier 22/22 PASS and P528 regression 21/21 PASS. Runtime/build/UI/E2E validation remains open.

## P530 P530 admissions secure-upload progress
- Completed source implementation and focused verification (25/25 assertions).
- C2-09 admissions/document/communications progress: 5/12 phases complete (P526–P530).
- Next phase: P531. Runtime/build/E2E remain pending.


## Historical phase delivery index

This index is a navigational summary of phase headings recorded in the P579 cumulative status/changelog. It is not an acceptance certificate.

| Phase | Recorded title | Evidence state |
|---|---|---|
| P00 | Added product, architecture, data, security, module and roadmap baseline. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P01 | Added monorepo engineering foundation, app/API shells, local service compose and CI scaffold. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P02 | 2026-11-16 | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P03 | 2026-11-16 | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P04 | 2026-11-16 | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P05 | 2026-11-16 | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P06 | 2026-11-16 | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P07 | 2026-11-16 | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P08 | 2026-11-16 | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P09 | Admissions and enrolment workflow | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P10 | Staff and teacher directory | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P11 | Roles, permissions and staff access hardening | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P12 | Student Attendance Foundation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P13 | Attendance Hardening | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P14 | Attendance UI Integration | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P15 | Teacher Attendance Mobile | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P16 | Teacher Mobile Authentication & Secure Sessions | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P17 | Teacher Membership Discovery & School Selection | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P18 | Teacher timetable and daily workspace | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P19 | Timetable Management & Conflict Resolution | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P20 | Academic Calendar & Timetable Exceptions | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P21 | Timetable CSV, Templates & Editor | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P22 | status — source complete, runtime pending | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P23 | Room Mapping & Timetable Authentication Integration | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P24 | Source implementation complete; runtime acceptance pending | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P25 | Source implementation complete; runtime acceptance pending | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P26 | School Configuration Persistence | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P27 | Operational Modules API Integration | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P28 | Operational Workflows & Authorization Hardening | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P29 | Guardian, Staff Lifecycle & Curriculum Guard | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P30 | Parent Identity, Private Documents & Integrity | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P31 | Parent Portal, Delivery Workers & Consent Controls | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P32 | Parent Attendance Pagination & Portal Hardening | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P33 | Source implementation complete; runtime acceptance pending | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P34 | School Admin Parent Operations | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P35 | School Operations Pagination & Privacy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P36 | Source implemented; runtime acceptance pending | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P37 | Source implemented; runtime acceptance pending | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P38 | Source implemented; runtime acceptance pending | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P39 | Report-card Operations UI | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P40 | Report-card Designer, Branded PDF & Notification Outbox | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P41 | Source implemented; runtime acceptance pending | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P42 | Parent Notification Inbox Lifecycle | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P43 | School Branding, Named Templates & Outbox Leases | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P44 | Source delivered; runtime acceptance pending | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P45 | Notification delivery receipts | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P46 | Tenant email suppression | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P47 | School email suppression operations | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P48 | Versioned suppression HMAC key rollover | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P49 | Notification lifecycle regression coverage | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P50 | Hardened notification webhook contract | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P51 | Webhook route-level regression tests | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P52 | Monotonic notification event reconciliation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P53 | Notification provider retry/dead-letter policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P54 | Worker lease and terminal-state guards | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P55 | Notification log privacy and safe diagnostics | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P56 | Safe notification operational events | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P57 | School suppression keyset pagination | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P58 | Suppression release concurrency guard | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P59 | Notification endpoint rate limiting | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P60 | Webhook payload and media-type guards | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P61 | Canonical webhook contract versioning | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P62 | Webhook replay payload integrity | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P63 | Provider bounce/complaint to school suppression | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P64 | Provider event versus manual release precedence | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P65 | Versioned suppression hash aliases | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P66 | Suppression key health and retirement readiness | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P67 | Cross-layer suppression regression coverage | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P68 | Final cumulative readiness review | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P69 | –P78 remediation sequence | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P79 | Authenticated identity bootstrap | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P80 | Authentication reset completion | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P81 | Organization lifecycle transitions | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P82 | RBAC permission policy primitives | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P83 | Subscription lifecycle policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P84 | Academic period validation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P85 | Admissions capacity invariant | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P86 | Student lifecycle policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P87 | Staff assignment overlap policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P88 | Attendance correction policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P89 | Timetable conflict policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P90 | Accounting journal invariant | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P91 | Fee/payment amount invariant | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P92 | Homework late submission policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P93 | Assessment percentage calculation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P94 | Guardian/student privacy policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P95 | Notification retry policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P96 | Transport geofence policy | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P97 | Inventory stock invariant | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P98 | Payroll net calculation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P99 | Analytics report range validation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P100 | Student lifecycle across API, School Admin and Parent Mobile | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P101 | Document and Data Governance | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P102 | White-label and Platform Operations | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P103 | Mobile Offline-first Completion | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P104 | PDF Accessibility and Multilingual Layouts | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P105 | Production Infrastructure, Backup/Restore and Observability | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P106 | Cross-module Journey Foundations | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P107 | Security, Privacy and Operational Assurance | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P108 | Final Acceptance and Zero-Gap Reconciliation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P109 | Authenticated Identity Bootstrap | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P110 | Cross-Application Identity and Session Bootstrap | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P111 | Multi-Device Session and Account Isolation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P112 | Backend refresh-token family tracking and authenticated session-management endpoints are implemented at source level. Prisma migration, database/API concurrency validation and runtime acceptance remain outstanding. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P113 | Authentication Abuse Protection | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P114 | Account Protection and Abuse Monitoring (2026-11-18) | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P115 | Progressive Account Protection and Security Alerts | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P116 | MFA foundation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P117 | MFA policy evaluation and client challenge/enrollment flows are implemented at source. Central API enforcement for all protected routes and runtime verification remain outstanding. See `P117-STATUS.md`. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P118 | Central MFA enforcement | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P119 | API Authentication and Authorization Coverage Audit | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P120 | Resource-Level Authorization and Tenant Isolation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P121 | Parent resource ownership | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P122 | Teacher-to-Student Resource Authorization | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P124 | Attendance, Timetable and Academic Resource Authorization | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P125 | Fees, Payments and Financial Resource Authorization | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P126 | Refund, Reversal and Payment Adjustment Foundation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P127 | Accounting Ledger and Double-Entry Financial Posting | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P128 | Accounting Reports, Reconciliation and Financial Workflows | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P129 | Historical Accounting Migration and Opening Balances | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P130 | Historical Fee Transaction Migration and Financial Reconciliation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P131 | Historical Fee Subledger Integration and Migration Completion | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P132 | Historical financial controls | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P133 | Historical financial exception management | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P134 | Cross-Batch Historical Operationalization | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P135 | Historical Batch Dependency Planning | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P136 | One-to-Many Historical Operational Allocation Link Foundation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P137 | Historical Allocation Coverage Preview | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P138 | Historical Split Allocation Operationalization | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P139 | Dependency-Ordered Historical Batch Execution | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P140 | Refund payment-slice targeting | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P141 | Searchable refund payment-slice selection | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P142 | Refund Payment-Slice Reservation and Reconciliation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P143 | Parent-visible refund status timeline | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P144 | Parent-initiated refund request | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P146 | Added settlement reconciliation visibility for settled refunds in Finance workspace; retained existing ledger integration. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P147 | Added refund reconciliation discrepancy review indicator in Finance workspace. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P148 | Added refund record drill-down details in Finance workspace. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P149 | Added durable refund reconciliation reviewer notes with status, API endpoints, audit logging and Finance UI integration. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P150 | Added reconciliation note history display, status updates and resolution timestamps with audit logging. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P151 | Added durable refund reconciliation evidence references with tenant-scoped APIs, audit logging and Finance UI integration; binary upload remains open. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P156 | Staff Mobile Evidence Upload Reliability | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P158 | Durable Staff Mobile Evidence Recovery | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P160 | Refund evidence operations dashboard | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P165 | –P172 closure block | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P173 | Admissions & Student Enrollment | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P210 | Admissions SMS/Phone OTP deferral | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P234 | Student enrollment conflict safeguards | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P235 | Admission conversion concurrency safeguard | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P236 | Direct enrollment section capacity enforcement | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P237 | Enrollment status lifecycle API | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P238 | Enrollment history UI and status controls | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P239 | Enrollment transition UI guardrails | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P240 | Student enrollment allocation UI uses configured capacity options filtered by academic year and grade, with seat counts and full-section disabling. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P241 | Configured-section enrollment preflight guard | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P242 | Student profile editor coverage | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P245 | Student Photo Records Listing | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P246 | Student primary-photo selection | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P247 | Student Records & Profiles: Secure Photo Preview | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P248 | Student Photo Deactivation Lifecycle | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P249 | Student profile audit and photo thumbnail refinement | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P250 | Student Photo Gallery Previews | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P251 | Primary Photo Replacement Safety | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P252 | Cycle 1 roadmap baseline | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P253 | Organization & Multi-School Basic Coverage | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P254 | Authentication & Access Basic Coverage | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P255 | User & Staff Management Basic Coverage | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P256 | SaaS Super Admin | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P257 | Subscription & Billing Basic Coverage | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P258 | School Settings & Configuration Basic Coverage | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P259 | Student Records Core | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P260 | Guardian & Family | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P261 | Admissions | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P262 | Enrollment | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P263 | Student Lifecycle | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P264 | Student Documents | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P265 | Student Operations | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P266 | Academic Structure | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P267 | Subjects & Curriculum | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P268 | Timetable | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P269 | Teacher Academic Assignment | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P270 | Attendance | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P271 | Attendance Reports | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P272 | Homework & Assignments | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P273 | Exams & Assessment | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P274 | Results & Grades (2026-11-19) | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P315 | Attendance catalog selectors | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P330 | Student Homework Attachment Submission | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P332 | Admission eligibility & checklist UX completion | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P333 | Guardian Identity & Duplicate Applicant Review | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P334 | Admission Reviewer Personal Queue | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P335 | Reviewer Workload & SLA | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P336 | Admission Decision & Review History Completion | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P337 | Applicant Withdrawal Lifecycle | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P338 | Admission Offer Lifecycle | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P339 | Seat Reservation Lifecycle Completion | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P340 | Admissions capacity dashboard Cycle 1 source implementation completed: year-scoped capacity KPIs and section utilization/status view. Cycle 2 runtime and full regression validation remains deferred. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P343 | Admission Payment Lifecycle | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P344 | Admission Receipts & Refunds | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P345 | Admissions Notification Completion | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P346 | Admissions Consent & Preference Integration | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P347 | Admissions Exception Monitoring | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P349 | Admissions Public Security Completion | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P351 | Health & Wellbeing (Cycle 1 implementation, partial verification) | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P352 | Canteen & Meals | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P353 | Payroll | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P354 | HR Lifecycle | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P355 | Mobile Coverage Audit | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P356 | Library Management | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P357 | Transport Management | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P358 | Hostel Management | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P359 | C2-01 Workspace Stabilization | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P360 | C2-01 supplemental build-stabilization remediation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P362 | Register Mirror Integrity | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P363 | CI Workflow Contract Audit | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P364 | C2-01 Bootstrap Diagnostics | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P365 | Container Runtime Contract Audit | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P366 | C2-01 Stabilization Closure Audit | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P367 | C2-02 Tenant Isolation Audit | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P368 | C2-03 Authentication, RBAC & Security Source Audit | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P369 | C2-03 RBAC/authorization audit | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P370 | Guided School Onboarding Readiness | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P371 | Guided Onboarding Step Navigation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P372 | Onboarding Dependency Gates | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P373 | Onboarding Progress Persistence | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P374 | Server-derived onboarding readiness (C2-04/F03) | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P375 | Onboarding actionable remediation details (C2-04/F03) | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P376 | Onboarding dependency graph owned by readiness API (C2-04/F03) | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P377 | Persisted school onboarding wizard resume position server-side, scoped by organization and school. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P378 | Onboarding task ownership (C2-04/F03) | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P379 | Prisma schema deduplication prerequisite | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P380 | F03 board and grade readiness | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P381 | F03 room and fee readiness | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P382 | F03 Onboarding readiness CSV export | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P383 | Onboarding assignment filters | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P384 | Onboarding assignment save feedback | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P385 | School onboarding assignment controls now track saving state independently per task, avoiding one in-flight save affecting another task's UI state. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P386 | F03 assignment error isolation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P387 | Tenant-scoped onboarding assignment state reset | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P388 | Onboarding readiness scope reset | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P389 | Organization invitation lifecycle hardening | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P390 | F03 backend prerequisite enforcement | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P391 | F03 invitation email delivery and acceptance | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P392 | F03 onboarding readiness API now provides dependency-aware blockers, COMPLETE/BLOCKED/ACTIONABLE states, actionable counts and overall workflow status; next-action selection prioritizes actionable incomplete steps. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P393 | F03 blocker detail display | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P394 | F03 onboarding task assignment CSV import | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P395 | Onboarding assignment CSV parser hardening | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P396 | School configuration transfer | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P397 | Academic year and term configuration transfer | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P398 | Calendar and event configuration transfer | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P399 | Hardened calendar/event configuration import timestamp validation to require timezone-explicit ISO 8601 date-times, including strict date/clock/offset validation. Added `verify:p399`. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P400 | Campus configuration inheritance foundation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P401 | Campus inheritance chain resolution | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P402 | Campus inheritance override editing utilities | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P403 | Campus Inheritance Persistence | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P404 | Persisted Campus Inheritance Cycle Guard | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P405 | Effective persisted campus inheritance resolution | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P406 | Campus effective configuration read view | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P407 | Campus registry foundation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P408 | Campus Registry Administration UI | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P409 | Campus-effective configuration context | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P410 | F03 Source Implementation Closure | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P411 | Board Curriculum Starter Packs | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P412 | Curriculum outcomes and competency mapping foundation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P413 | Curriculum Outcomes Administration UI | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P414 | Curriculum Outcome Editing | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P415 | Curriculum Outcomes CSV Bulk Import & Export | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P416 | Curriculum Outcome ↔ Assessment Mapping | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P417 | Curriculum Outcome Coverage & Assessment Alignment Dashboard | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P418 | status | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P419 | Curriculum Lesson Planning Weekly Planner & Calendar | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P420 | status | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P421 | Teacher Lesson Workspace | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P422 | Teacher Lesson Reflection & Notes | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P423 | Lesson Reflection Review & Follow-up Management | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P424 | Reflection Follow-up Tasks & Action Ownership | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P425 | Follow-up Task Monitoring & Overdue Management | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P426 | Follow-up notifications | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P427 | Automated Notification Scheduling | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P428 | Notification Preferences & Reminder Controls | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P429 | status | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P430 | Privacy-Aware Reminder Preference Summary | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P431 | Teacher cohort and privacy safeguard | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P432 | Reminder Policy Audit Trail | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P433 | Reminder audit history improvements | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P434 | Large Reminder Audit Export Jobs | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P435 | Export Job Management & Recovery Controls | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P436 | Export Job Operational Observability | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P437 | Export Queue Capacity & Backpressure | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P438 | Export Queue Fair Scheduling & Worker Configuration | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P439 | Export worker concurrency | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P440 | Export worker monitoring | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P441 | Export Worker Alerting | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P443 | Alert Escalation Console & Lifecycle Visibility | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P444 | Alert Acknowledgement, Assignment & Resolution | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P445 | Alert SLA, Ownership & Follow-up Management | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P446 | Automated SLA reminders (60-minute window) and one-time overdue escalations are implemented in the worker using durable markers and outbox events. Source verifiers pass; runtime/integration validation remains open. | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P447 | Alert automation policy reliability | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P448 | Alert Policy Management, Recipient Routing & Recovery | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P449 | Alert Policy Execution | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P450 | Alert Delivery Routing & Recipient Notification Integration | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P451 | Notification channel preferences | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P452 | In-App Notification Inbox Pagination & Grouping | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P502 | 2026-11-23 | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P556 | Library Fine Management UI, Borrower Balances & Receipts | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P557 | Library Lost/Damaged Lifecycle, Replacement Charges & Write-off | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P558 | Library Parent/Student Journeys, Notifications, Exports & Acceptance Improvements | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P559 | Transport personnel, verification, assignment and Driver mobile foundation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P560 | Transport Route/Stop/Vehicle/Student Capacity Allocation | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P561 | Transport Pickup/Drop Attendance, Absence, Missed Stop & Handover (2026-11-24) | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P562 | Transport GPS Provider Abstraction, Consent, Retention & Configuration | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P563 | Parent Route Visibility, Live Status, Geofence & Notifications (2026-11-24) | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P564 | Transport Incidents, Emergency Response, Maintenance & Document Expiry | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P565 | Transport fees, ledger, analytics and mobile | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P566 | P566 Feature Contract — Hostel Roll-call, Curfew, Attendance & Night Checks | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P567 | P567 Feature Contract — Hostel Visitors & Gate-pass | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P568 | P568 Feature Contract — Hostel Leave & Guardian Communication | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P569 | P569 Feature Contract — Hostel Capacity, Transfers, Waitlist & Checkout | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P570 | P570 Feature Contract | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P571 | P571 Feature Contract — Integration & Evidence | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P572 | P572 Feature Contract — C2-11 Wave 1 | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P573 | P573 Delivery Report — Prisma & PostgreSQL Migration Acceptance | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P574 | P574 Feature / Verification Contract | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P575 | P575 Feature Contract — Tenant Isolation & Authorization | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P576 | P576 Feature Contract — Financial & Notification Provider E2E | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P577 | P577 Feature Contract | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P578 | P578 Feature Contract | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |
| P579 | P579 Delivery Report | Phase artifact recorded in P579 cumulative history; runtime acceptance is tracked separately |

## Current consolidated backlog position

The P579 open ledger contained 729 open checkbox entries. P580 preserved all 729 source entries (including one repeated source row) and added eight P580 follow-up gaps. The consolidated feature-gap matrix therefore contains **737 open rows**; this is not a count of missing features alone, because it includes implementation, partial, integration, verification and acceptance items.

## Upcoming roadmap (proposed sequence after P580)

| Proposed workstream | Focus | Exit evidence |
|---|---|---|
| P580 — Documentation consolidation & Docker runtime foundation | Delivered in this baseline | Four canonical project documents, exact duplicate cleanup, local full-stack Compose stack and startup guide | Source/YAML validation complete; Docker runtime remains open |
| P581 — Reproducible workspace and dependency closure | Obtain authentic pnpm 9.15.0 lockfile, frozen install, dependency graph and SBOM | Frozen install and all workspace dependencies resolve from committed lockfile |
| P582 — Prisma/PostgreSQL acceptance | Schema format/validate/generate; clean install, upgrade, rollback and data integrity | PostgreSQL migration evidence and schema/client checks |
| P583 — All-workspace build and API integration | Semantic typechecks, production builds for all 14 workspaces, API/DB/Redis tests | Clean build logs and passing dependency-backed tests |
| P584 — Tenant security and authorization | RLS, connection pool, IDOR, role matrix, worker isolation | Positive and negative cross-tenant tests under restricted DB role |
| P585 — Provider, finance and communications E2E | Payment/refund, email/SMS/push, webhook idempotency and reconciliation | Sandbox/provider evidence and finance-owner acceptance |
| P586 — Web/mobile journeys and accessibility | Nine app journeys, offline sync, device matrix, WCAG/manual assistive technology | Playwright/device/assistive-technology reports |
| P587 — Reliability, backup/restore and production rehearsal | Load/soak, outages, failover, PITR, measured RPO/RTO, monitoring | Reproducible DR and operational acceptance evidence |
| P588 — Independent release review | Security, privacy, safeguarding, accessibility, legal, support ownership and GO/NO-GO | Authorized sign-offs and resolved or explicitly accepted blockers |

Phase numbering above is a proposed execution plan and can be adjusted if the user approves a different sequence.

## P581 — Demo data, role credentials and local Docker walkthrough (delivered)

- Added opt-in, idempotent Prisma demo seeder for Green Valley Education Group / Green Valley International School.
- Added 14 role demo credentials, Argon2id password hashing, tenant membership and scoped role assignments.
- Seed coverage: 60 students, guardians, enrollments, fee charges, exams and homework assignments; 300 attendance rows across 60 sessions; 20 staff, 20 calendar events, 30 expenses and 30 communications; 12 grade levels.
- Added Docker Compose `seed` profile, root/API seed scripts, environment controls and role-by-role demo test runbook.
- Static source checks passed. Docker runtime, migration execution, actual database seed counts and login/E2E remain NOT RUN because Docker/pnpm/database services are unavailable in the authoring environment.

## P582 — Demo dataset expansion and runtime acceptance (upcoming)

- Execute Docker Compose build/start and Prisma migration deployment on a Docker-enabled host.
- Run the demo seed against a clean database and verify actual row counts and idempotent second run.
- Verify all 14 role logins, tenant scoping and page-level data visibility.
- Expand valid demo fixtures for library, transport, hostel, canteen, payroll, health, document, provider and other feature pages; use valid workflow transitions and never fabricate payment/provider/safeguarding evidence.
- Run API/browser/mobile smoke and capture screenshots or test artifacts for the demo walkthrough.
