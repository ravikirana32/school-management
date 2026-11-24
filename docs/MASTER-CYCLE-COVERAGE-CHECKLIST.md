# School Management SaaS — Cycle 1 Basic Functional Coverage Checklist

> This is the breadth-first roadmap. Existing implementations are preserved and reconciled; a phase does not blindly rebuild a feature. Cycle 1 focuses on usable basic workflows across the whole product. Cycle 2 deep completion is not to begin until P313/P314 coverage audit and completion baseline.

## Status definitions
- **Not Started** — no meaningful implementation found.
- **Partial** — implementation exists but primary workflow is incomplete.
- **Basic Complete** — basic end-to-end workflow implemented at source level; runtime validation is still separately tracked.
- **Deep Pending** — advanced/edge-case work intentionally deferred to Cycle 2.
- **Deep Complete** — Cycle 2 scope completed.
- **Validated** — verification evidence recorded.

## Per-feature basic acceptance checklist
- [ ] UI/page/screen exists
- [ ] Main actions are functional
- [ ] API connected
- [ ] Backend business logic implemented
- [ ] DB schema/persistence implemented where required
- [ ] Basic input validation
- [ ] Role/permission handling
- [ ] Loading, empty, success and error states
- [ ] Related modules connected
- [ ] Web workflow usable
- [ ] Mobile workflow usable where applicable
- [ ] Deep/advanced TODOs recorded for Cycle 2

## Phase sequence

| Phase | Scope | Basic coverage target | Cycle 1 status | Cycle 2 status |
|---|---|---|---|---|
| P253 | Organization & Multi-school | Organization listing, school listing/creation, school switching, tenant-scoped data access | **Basic Complete (source-level; runtime pending)** | **Deep Pending** |
| P254 | Authentication & Access | Login/logout, password reset, sessions, roles and permission checks | **Partial (source audited; basic flows present, reset email delivery unavailable)** | **Deep Pending** |
| P255 | User & Staff Management | Staff CRUD, roles, departments/designations, activation/deactivation | **Partial (profile edit UI/API added; other basics already present)** | **Deep Pending** |
| P256 | SaaS Super Admin | Tenant list/create, tenant overview and lifecycle status | **Not Started / Audit Required** | **Deep Pending** |
| P257 | Subscription & Billing Basics | Plans, subscriptions, basic invoice records and status | **Not Started / Audit Required** | **Deep Pending** |
| P258 | School Settings & Configuration | School profile, academic defaults and settings | **Partial — Basic UI/API coverage audited; academic term UI gap added; runtime verification pending** | **Deep Pending** |
| P259 | Student Records — Core | Student create/edit/profile/list/search/detail | **Partial — existing API and operational UI audited; name edit added; runtime pending** | **Deep Pending** |
| P260 | Guardian & Family | Guardian CRUD, contacts, family links and relationships | **Partial — existing guardian/family flows audited; expanded edit controls added; runtime pending** | **Deep Pending** |
| P261 | Admissions | Enquiry/application, review, accept/reject, conversion basics | **Partial — existing advanced admission workflows audited; applicant DOB field added to admin draft creation; runtime pending** | **Deep Pending** |
| P262 | Enrollment | Academic year/class/section enrollment and basic allocation | **Basic Complete — source audit; runtime pending** | **Deep Pending** |
| P263 | Student Lifecycle | Active, transfer, promotion, withdrawal and graduation basic workflows | **Basic Complete — source audit; runtime pending** | **Deep Pending** |
| P264 | Student Documents | Upload/register, list, secure download, categories | **Partial — source implementation** | **Deep Pending** |
| P265 | Student Operations | Search, status filter, loaded-page CSV export; bulk import pending | **Partial — basic filter/export added; import pending; runtime pending** | **Deep Pending**
| P266 | Academic Structure | Academic years, terms, grade levels, and section capacity configuration | **Partial — existing year/term/grade flows audited; section capacity UI added; runtime pending** | **Deep Pending** |
| P267 | Subjects & Curriculum | Subjects, class/grade mapping and basic curriculum records | **Partial — existing curriculum APIs and subject mapping UI audited; mandatory/optional subject configuration added; runtime pending** | **Deep Pending** |
| P268 | Timetable | Periods/time slots, schedules and teacher allocation basics | **Partial — existing timetable CRUD/import/templates/room governance audited; weekly overview added; runtime pending** | **Deep Pending** |
| P269 | Teacher Academic Assignment | Teacher-class-section-subject assignments | **Partial — basic assignment create/list extended; runtime pending** | **Deep Pending** |
| P270 | Attendance | Daily attendance marking, editing and viewing | **Partial — attendance correction request/review UI added; runtime pending** | **Deep Pending** |
| P271 | Attendance Reports | Daily class/student summaries and attendance status report | **Partial — daily report UI added; source-level only** | **Deep Pending** |
| P272 | Homework & Assignments | Create, assign, view, submit and basic status tracking | **Partial — existing homework APIs/mobile/guardian workflows retained; School Admin submission review and grading UI added; source-only** | **Deep Pending** |
| P273 | Exams & Assessment | Exam setup/schedule and marks entry | **Not Started / Audit Required** | **Deep Pending** |
| P274 | Results & Grades | Basic grade calculation, results and report cards | **Partial — source implemented** | **Deep Pending** |
| P275 | Fees & Fee Structure | Fee categories and class-based fee setup | **Not Started / Audit Required** | **Deep Pending** |
| P276 | Student Fee Assignment | Fee assignment, discounts/concessions basic workflow | **Not Started / Audit Required** | **Deep Pending** |
| P277 | Fee Collection | Payment recording, receipts and outstanding balance | **Not Started / Audit Required** | **Deep Pending** |
| P278 | Finance & Expenses | Basic expense records and financial entries | **Not Started / Audit Required** | **Deep Pending** |
| P279 | Financial Reports | Collection, dues and basic finance summaries | **Not Started / Audit Required** | **Deep Pending** |
| P280 | Communication Center | Announcements, notices and basic message management | **Not Started / Audit Required** | **Deep Pending** |
| P281 | Notifications | In-app notification delivery and basic preferences | **Not Started / Audit Required** | **Deep Pending** |
| P282 | Parent Portal | Parent access to linked children, attendance, fees and results | **Not Started / Audit Required** | **Deep Pending** |
| P283 | Teacher Portal | Teacher classes, attendance, homework and marks workflows | **Not Started / Audit Required** | **Deep Pending** |
| P284 | Student Portal | Student timetable, homework, attendance and results | **Not Started / Audit Required** | **Deep Pending** |
| P285 | Messaging | Basic school/teacher/parent messaging workflow | **Not Started / Audit Required** | **Deep Pending** |
| P286 | Teacher Mobile App | Mobile login, assigned classes, attendance, assignments, marks | **Not Started / Audit Required** | **Deep Pending** |
| P287 | Parent Mobile App | Child profiles, attendance, fees, announcements and results | **Not Started / Audit Required** | **Deep Pending** |
| P288 | Student Mobile App | Timetable, homework, attendance, results and notifications | **Not Started / Audit Required** | **Deep Pending** |
| P289 | Mobile API Integration | Core mobile workflows use connected APIs and persisted data | **Not Started / Audit Required** | **Deep Pending** |
| P290 | Mobile Navigation & UX Coverage | Basic navigation, forms, loading/empty/error/success states | **Not Started / Audit Required** | **Deep Pending** |
| P291 | Transport Management | Routes, vehicles, drivers and student allocation | **Not Started / Audit Required** | **Deep Pending** |
| P292 | Transport Tracking Basics | Assigned route and transport visibility | **Not Started / Audit Required** | **Deep Pending** |
| P293 | Library | Books/copies, search, issue and return | **Not Started / Audit Required** | **Deep Pending** |
| P294 | Inventory | Items/categories, stock and basic transactions | **Not Started / Audit Required** | **Deep Pending** |
| P295 | Certificates & Documents | Basic certificate/document generation and record storage | **Not Started / Audit Required** | **Deep Pending** |
| P296 | HR Management | Staff employment profiles and basic HR records | **Not Started / Audit Required** | **Deep Pending** |
| P297 | Payroll Basics | Salary structure, salary records and basic payroll flow | **Not Started / Audit Required** | **Deep Pending** |
| P298 | Workflow & Approvals | Requests, approve/reject, status tracking | **Not Started / Audit Required** | **Deep Pending** |
| P299 | Audit & Activity | Basic activity entries for key operations | **Not Started / Audit Required** | **Deep Pending** |
| P300 | Calendar & Events | Calendar, holidays and event CRUD/viewing | **Not Started / Audit Required** | **Deep Pending** |
| P301 | Reports & Dashboards | Basic dashboards and module reports | **Not Started / Audit Required** | **Deep Pending** |
| P302 | Import & Export | CSV/Excel basic import/export for prioritized entities | **Not Started / Audit Required** | **Deep Pending** |
| P303 | Integrations | Integration settings and connection framework basics | **Not Started / Audit Required** | **Deep Pending** |
| P304 | API Coverage | Close basic API gaps required by existing/new UI workflows | **Not Started / Audit Required** | **Deep Pending** |
| P305 | Cross-Module Integration | Basic data and workflow links between modules | **Not Started / Audit Required** | **Deep Pending** |
| P306 | Search & Navigation | Consistent navigation and basic global search coverage | **Not Started / Audit Required** | **Deep Pending** |
| P307 | Feature Coverage Audit — Web | Audit all scoped basic features for usable UI workflows | **Not Started / Audit Required** | **Deep Pending** |
| P308 | Feature Coverage Audit — API/Backend | Audit UI action/API/backend/persistence connectivity | **Not Started / Audit Required** | **Deep Pending** |
| P309 | Feature Coverage Audit — Mobile | Audit mobile workflow coverage by applicable module | **Not Started / Audit Required** | **Deep Pending** |
| P310 | Role & Permission Coverage | Basic roles/permissions across core workflows | **Not Started / Audit Required** | **Deep Pending** |
| P311 | Data & Workflow Connectivity | Source-level audit of cross-module data flows | **Not Started / Audit Required** | **Deep Pending** |
| P312 | Cycle 1 Gap Closure | Implement basic gaps discovered in audits | **Partial — fee structure draft edit and date payload correction; runtime pending** | **Deep Pending** |
| P313 | Cycle 1 Final Inventory | Set evidence-based Cycle 1 status for all features | **Not Started / Audit Required** | **Deep Pending** |
| P314 | Cycle 1 Completion Report | Freeze coverage baseline and establish Cycle 2 backlog | **Not Started / Audit Required** | **Deep Pending** |

## Cycle 2 deep-completion backlog (apply across modules after Cycle 1)
- Advanced rules, edge cases and complex business scenarios
- Detailed validation and permission/security review
- UX/responsive/mobile refinement
- Performance and scalability optimization
- Advanced reporting, analytics and automation
- Audit, retention, privacy/compliance hardening
- Bulk operations and offline support where appropriate
- Unit, API, integration, E2E, regression and runtime validation

## Tracking fields for each feature
- Permanent Feature ID; module; functionality; dependency; priority
- Cycle 1 status and acceptance checklist
- Cycle 2 status and deep checklist
- Web/Admin, API/Backend, Mobile and integration status
- Basic validation vs deep validation status
- Test status (deferred/ready/completed)
- Implementation evidence/files; remaining work; validation evidence

## Execution rule
Phases P252–P314 are an initial phase plan, not a promise that every listed phase will require code changes. During each phase inspect the actual source, reuse existing basic functionality, implement real gaps, update statuses with evidence, and adjust phase scope without skipping any domain. Full runtime/build/test/mobile/deployment validation remains deferred to the validation stage unless explicitly brought forward.


## P253 — Organization & Multi-School Basic Coverage

- [x] Organization Admin token-based data loading and error/loading states
- [x] Organization list and selected-organization detail summary
- [x] School list scoped to selected organization
- [x] Basic school creation UI with name/code/timezone validation
- [x] API integration for organization and school list/create flows
- [x] Existing School Admin membership selector supports school switching; preserved
- [x] Basic empty/success/error states
- [x] Cycle 2 TODOs: organization onboarding UI, school edit/deactivate/archive UI, lifecycle controls, duplicate-code handling UX, organization profile editing, runtime validation and automated tests
- [ ] Runtime validation (deferred to final validation cycle)


## P255 — User & Staff Management Basic Coverage
- Existing connected staff listing/creation, departments/designations, status lifecycle, teacher assignment, employment history and audit foundations were retained.
- Added missing staff profile edit workflow to School Admin and a tenant-scoped `PATCH /staff/members/:staffId` API with school-bound department/designation validation and audit event.
- Cycle 1: **Partial** at source level; runtime validation deferred.
- Cycle 2: account invitation delivery, private staff document UX/lifecycle refinements, qualifications/experience fields UI, attendance/leave/shifts, workload, payroll, advanced search/export, authorization matrix and test hardening remain pending.


## P256 — SaaS Super Admin Basic Coverage
- Existing protected platform dashboard and backend admin capabilities retained.
- Implemented missing basic UI workflows for organization creation, API-backed search, pagination, loading/error/empty/success feedback.
- Cycle 1: Partial at source level; runtime validation deferred.
- Cycle 2 TODO: tenant profile editing/lifecycle UI, support/domain/branding/settings/secrets/operations alerts UI expansion, billing and advanced admin tools.

## P257 — Subscription & Billing Basics
- **Status:** Partial — source basic workspace added; runtime validation pending.
- **Already present and retained:** plans, interval pricing, organization subscription create/read, invoice listing, entitlement lookup, webhook intake, payment attempt/idempotency foundations, tenant isolation policies.
- **Implemented missing basic coverage:** school-admin billing tab with plan cards/interval selection, subscription status/period display, invoice list, refresh, loading/empty/error/success feedback, organization-scoped API calls.
- **Cycle 2/deep pending:** payment provider checkout/reconciliation, upgrade/downgrade/cancel, invoice detail/PDF/export, tax/compliance rules, advanced dunning, runtime/security tests.


## P268 — Timetable
- Existing timetable slot CRUD, teacher assignment, period/day scheduling, room inventory, conflict detection, CSV preview/import/export, bell schedule templates, and room alias migration governance retained.
- Added a basic weekly timetable overview grouped by weekday and period, with subject, time, room, and assignment reference. Empty weekdays and no-data state are explicitly shown.
- Cycle 1: Partial at source level; runtime validation pending.
- Cycle 2: advanced scheduling optimization, mobile/runtime validation, and deep timetable refinements remain pending.

## P269 — Teacher Academic Assignment
- Audited existing teacher assignment API, schema, School Admin form, assignment listing and timetable integration.
- Basic assignment create/list was already present. Extended assignment creation UI to capture class-teacher designation and optional effective start/end dates; payload uses API-supported `isClassTeacher`, `startsOn`, and `endsOn` fields. Assignment listing now surfaces curriculum subject reference, class-teacher flag, effective dates, and active status when present.
- Cycle 1: Partial (source implementation; runtime validation pending).
- Cycle 2: subject picker/assignment edit and lifecycle UX, deep workload rules, comprehensive authorization scenarios and runtime validation remain pending.


## P273 — Exams & Assessment
- Added tenant-scoped exam creation/list APIs and school-admin exam register.
- Added exam marks JSON entry/save and marks publication APIs, with school-student validation and published-record immutability.
- Cycle 1: Partial source implementation; build/runtime validation deferred.
- Cycle 2: Student roster-driven marks UI, report-card integration, examination analytics, audit refinements and runtime validation remain pending.


## P274 — Results & Grades
- Basic exam percentage/grade/pass calculations and class result summary implemented in source.
- Roster-driven marks entry implemented in P274; basic results view is available.
- Board-specific grading, persistent report-card aggregation and advanced term/subject summaries remain Cycle 2/deep pending.
- Runtime verification deferred.


## P312 — Cycle 1 Gap Closure — Fee Structure Draft Editing
- Draft structures can be edited from School Admin and saved through the existing school-scoped PATCH endpoint.
- Payload cleanup avoids invalid blank optional date strings.
- Effective date prefill and runtime validation remain open.


## P315 — Attendance Grade/Section Catalog Selection
- Cycle 1 basic workflow: **Source-complete; runtime validation pending**
- Evidence: AttendanceWorkspace uses school grade catalogue API and section capacity API to populate and filter selectors; manual fallback remains when sections are not configured
- Cycle 2 deep enhancements: bulk mark actions, offline sync edge cases, advanced reports/policy automation
- Test status: static source assertions 8/8 PASS; runtime/build/typecheck not executed


## P414 — F04 curriculum outcome data management (source slice)
- Outcome update endpoint and edit workspace are implemented for DRAFT/IN_REVIEW outcomes.
- Draft-only hard delete is implemented with explicit UI confirmation.
- Tenant/school scope, curriculum version/grade/subject alignment, academics.manage permission, entitlement, and duplicate-code validation are retained.
- Focused verifier: 19/19 PASS; P411/P412/P413 regression verifiers pass; syntax scan 257 files / 0 errors.
- Remaining: bulk import/export, outcome-to-assessment mapping, official board content packs and runtime acceptance.

## P415 — Curriculum Outcomes Bulk Import/Export
- Added CSV template download and version outcome export with optional review-status and grade filters.
- Added upload/paste import preview with validation issue rows and all-or-nothing commit; imports create DRAFT records only.
- Limits and safeguards: 500 rows, 1.5 MB, school/version/grade/subject checks, duplicate checks, schema validation, entitlement and `academics.manage` gates.
- Evidence: P415 verifier 23/23; CSV runtime smoke 4/4; P411 15/15, P412 17/17, P413 22/22, P414 19/19; syntax scan 258 files/0 diagnostics.
- Runtime/build/DB/browser/mobile/E2E validation remains deferred.


## P416 — Curriculum outcome ↔ assessment mapping
- [x] Persisted school/tenant scoped outcome-to-exam mapping source slice
- [x] API list/create/delete with membership, academics.manage, entitlement and scope checks
- [x] Grade and subject compatibility validation
- [x] School Admin UI view/add/remove mapping workflow
- [x] Focused verifier 26/26 PASS; P411-P415 source regression verifiers pass
- [ ] Prisma schema validation and migration execution
- [ ] API/database/RLS integration, browser/mobile and E2E acceptance
- [ ] Granular assessment component/question mapping and authoritative board curriculum content


## P417 — Curriculum Outcome Coverage & Assessment Alignment Dashboard
- Added a tenant/school/version-scoped coverage dashboard API with grade, review-status and subject filters. It aggregates mapped/unmapped/multi-mapped outcomes, mapping totals, mapped exam counts and coverage percentages.
- Grade-wise and subject-wise coverage breakdowns are included, along with exam-wise coverage for all matching school exams (including exams with zero mappings), unmapped-outcome action lists and multi-mapped outcome details. Exam query is restricted by school, outcome grade(s), and curriculum academic year when configured.
- Added the School Admin coverage dashboard integrated into the outcomes workspace, showing KPI cards, grade/subject/exam tables and unmapped/multiple-mapping action lists. Dashboard subject selection resets when version/grade/review filters change.
- Focused verifier: 24/24 PASS. Pure-function runtime smoke: 7/7 PASS. P411–P416 regression verifiers pass. TS/TSX parser scan: 262 files, 0 parse diagnostics.
- Full build/typecheck, Prisma validation/migration, live API/DB/RLS, browser/mobile and E2E acceptance remain deferred/unverified.

## P418 — Curriculum Lesson Planning & Outcome Integration
- [x] Lesson-plan persistence model and outcome-link persistence model
- [x] Version-scoped lesson-plan listing endpoint
- [x] Create/edit and draft-only delete endpoints
- [x] Scope checks for school, grade, subject and curriculum version
- [x] Curriculum outcomes linked to lessons
- [x] Lesson-planning UI integrated into Curriculum Outcomes workspace
- [x] Focused P418 source verifier 19/19 PASS
- [ ] Prisma schema validation and migration execution
- [ ] Live API/DB/RLS validation, browser/mobile and E2E acceptance

- [x] P419 curriculum lesson planner week/month/list views and grade/subject filters — source slice verified 23/23; runtime acceptance pending.

- [x] P420 source slice: curriculum lesson plan teacher assignment model, tenant migration/RLS, scoped APIs, teacher candidate validation, primary teacher control, School Admin UI, focused verifier.
- [ ] P420 runtime acceptance: install dependencies; Prisma validate/generate; migrate; API authorization and DB/RLS integration; browser/mobile/E2E validation.
- [x] P421 teacher lesson workspace source slice: assignment-only read endpoint, linked outcomes, teacher-owned DRAFT → PLANNED → COMPLETED workflow, mobile UI; focused verifier 29/29.
- [ ] P421 runtime acceptance: full typecheck/build, DB migration/runtime API/RLS, teacher mobile device and E2E validation.

## P422 — Teacher Lesson Reflection & Notes
- Added teacher reflections on completed lessons: teaching notes, challenges, follow-up actions and actual duration; records are append-only per teacher/lesson to preserve reflection history. Teacher workspace returns latest reflection and history.
- Source slice verifier: 30/30 PASS. API/mobile transpile: 0 diagnostics. Runtime/build/database/device/E2E acceptance remains unverified.

- [x] P423 source slice: academic coordinator reflection review API, filterable review workspace, follow-up status workflow, coordinator notes and review audit; verifier 24/24.
- [ ] P423 runtime acceptance: Prisma validation/generation/migration, live API/DB/RLS/permission checks, build/typecheck, browser/mobile E2E.
- [ ] P423 UX enhancement: searchable teacher/grade/subject filters, pagination, task assignee/due dates.

- [x] P424 source slice: reflection-linked actionable tasks, due dates/priorities, coordinator create/list/update APIs and UI, teacher-assigned task list/status in mobile; focused verifier 24/24 PASS.
- [ ] P424 runtime acceptance: Prisma validation/generation/migration, tenant RLS and role authorization integration, full build/typecheck, device/browser/E2E.
- [ ] P424 enhancements: reassignment, completion notes UI, overdue reminders and task history.


## P425 — Follow-up Task Monitoring
- [x] API due buckets: overdue, due today, upcoming, no due date.
- [x] Coordinator task metrics and due-date views.
- [x] Teacher Mobile overdue/due-today indicators.
- [ ] School timezone policy and boundary acceptance.
- [ ] Reminder/escalation notification delivery.
- [ ] Pagination/aggregated counts beyond loaded limit.
- [ ] Full runtime/build/E2E acceptance.

- [ ] P426 notification inbox and task alerts implemented at source level.
- [ ] P426 migration/live tenant authorization and mobile runtime acceptance pending.
- [ ] P426 automated reminder scheduling/provider delivery/preferences pending.

## P427 — Automated Notification Scheduling
- [x] Standalone 15-minute scheduler worker.
- [x] Due-soon reminders for unfinished tasks within 24 hours.
- [x] Daily overdue reminders with school-timezone dedupe keys.
- [x] Tenant/school scoped task scan and duplicate protection.
- [x] Worker package entry and production Compose service.
- [ ] Runtime DB/RLS/worker deployment acceptance.
- [ ] External notification delivery, retry, receipts and preferences.

## P428 — Notification Preferences & Reminder Controls
- [x] Teacher due-soon and overdue preferences API using existing NotificationPreference
- [x] Teacher Mobile preference toggles
- [x] Coordinator school-default APIs (academics.manage)
- [x] Scheduler honors school defaults and teacher overrides
- [x] Configurable overdue reminder frequency validation (12–168 hours)
- [x] Focused source verifier (21/21) and P426/P427 regression verifiers
- [ ] Coordinator defaults UI
- [ ] Runtime DB/API/RLS, build/typecheck and E2E validation

- [x] P429 Coordinator school reminder policy UI: toggles, cadence selector, save/refresh/reset, permission gate and focused verifier (16/16).
- [ ] P429 Runtime acceptance, complete build/typecheck, DB/RLS and browser/device E2E.
- [ ] P429 Teacher-level preference aggregate visibility/privacy API design.

## P430 coverage
- [x] Coordinator-safe reminder preference aggregate endpoint
- [x] Tenant/school and academics.manage scoping
- [x] Aggregate-only data without identifiers
- [x] School Admin summary UI and refresh
- [x] Focused source verifier
- [ ] Validate active-staff cohort semantics and privacy thresholds
- [ ] Live API/RLS, full build/typecheck, browser/mobile E2E
- [ ] Push/email provider operations

## P431 coverage
- [x] Active teaching-role designation cohort filter added to reminder aggregate.
- [x] Tenant and school scoped lookups.
- [x] Low-count privacy suppression (<5).
- [x] Admin workspace suppression messaging.
- [ ] Privacy stakeholder review and runtime DB/RLS/auth acceptance.
- [ ] Full build/typecheck and browser/mobile E2E.

## P432 reminder-policy audit trail
- [x] Audit model, actor/action/timestamp, previous/new values implemented.
- [x] Tenant/school scope, forced RLS and database immutability trigger authored.
- [x] Permission-gated bounded history API and Admin history UI.
- [x] Focused verifier 21/21 and syntax diagnostics 0.
- [ ] Runtime migration/RLS/trigger validation.
- [ ] Prisma client generation and full build/typecheck.
- [ ] Browser/mobile E2E.

## P433 — Reminder audit history enhancements
- [x] Date-range filter API/UI
- [x] Action filter API/UI
- [x] Actor ID substring filter API/UI
- [x] Bounded cursor pagination
- [x] CSV export (filtered, max 1,000 rows)
- [x] Focused verifier and regression source checks
- [ ] Runtime DB/API, full build/typecheck, browser/device E2E

## P434 — Large audit export jobs
- [x] Queue filtered reminder policy audit export jobs (source)
- [x] Requester/school scoped status and download routes
- [x] Worker atomic claim, tenant-scoped read, CSV escaping and row cap
- [x] 24-hour expiry/purge and stale-job handling
- [x] School Admin queue/status/download UI
- [x] P434 focused verifier 26/26 and TS syntax checks 0
- [ ] Runtime migration/RLS, multi-worker, recovery and download acceptance
- [ ] Full build/typecheck and browser/device E2E
- [ ] Implement streaming/chunking for datasets beyond 50k rows

## P435 — Export job management and recovery
- [x] Recent export job listing, requester/tenant/school scoped (source)
- [x] Cancel queued jobs only (source)
- [x] Retry failed jobs and reset stale job metadata (source)
- [x] Attempts counter and 0–3 DB constraint (source)
- [x] Recover stale PROCESSING jobs after 10 minutes; fail after three attempts (source)
- [x] School Admin job list, refresh, cancel, retry, download controls (source)
- [x] P435 focused verifier 21/21; P434 regression 26/26; syntax 0
- [ ] Runtime migration/RLS, recovery simulation, concurrent worker acceptance
- [ ] Full build/typecheck and browser/mobile E2E

- [ ] P436 runtime endpoint/auth/RLS, query performance, worker observability and UI E2E validation.

## P437 — Export Queue Capacity & Backpressure
- Delivered: configurable active-job caps per school/requester; duplicate queued filter request suppression; HTTP 429 capacity response with retry guidance.
- **P437-G001 OPEN:** Runtime DB/API acceptance, concurrency race validation for capacity enforcement, and tenant RLS.
- **P437-G002 OPEN:** Full workspace build/typecheck and browser/mobile E2E.
- **P437-G003 OPEN:** Multi-school fairness remains global FIFO; evaluate round-robin fairness and worker scaling.
- **P437-G004 OPEN:** Validate caps against real workload and query performance; DB-level atomic enforcement is not implemented.

- [ ] P438 queue fairness runtime/load verification — OPEN
- [ ] P438 restart-safe/multi-instance fairness — OPEN
- [ ] P438 configurable worker concurrency — OPEN
- [ ] P439 concurrent claim safety with multiple worker instances — OPEN
- [ ] P439 throughput/backpressure under realistic queue load — OPEN
- [ ] P439 restart-safe fairness — OPEN
- [ ] P439 full build/typecheck and browser/mobile E2E — OPEN
- [ ] P440 worker heartbeat persistence and stale-state detection validated against live database/API — OPEN
- [ ] P440 historical worker metrics persistence and alerting — OPEN
- [ ] P440 full build/typecheck and browser/mobile E2E — OPEN


## P441 cycle checklist
- [x] Source alert transitions for stale/degraded/recovered states
- [x] Configurable bounded alert thresholds
- [x] Focused source verifier and prior phase regressions
- [ ] Runtime outbox/webhook delivery
- [ ] Multi-instance/restart behavior
- [ ] Full build and browser/mobile E2E

## P443 — Alert Escalation Console & Lifecycle Visibility
- Completed: escalation metadata surfaced in platform alert API and Super Admin console.
- Added lifecycle filters for escalated-only and unacknowledged alerts.
- Focused verifier: 7/7. Regression verifiers P442–P432: 175/175. Total: 182/182.
- Runtime/full build/E2E validation remains open.

## P444 — Alert Lifecycle Workflow
- [x] Acknowledgement note support
- [x] Alert assignment and reassignment history
- [x] Resolution with required note
- [x] Lifecycle history API and Super Admin controls
- [ ] Live DB/API acceptance
- [ ] Platform identity assignment validation
- [ ] Full build/typecheck and browser/mobile E2E

## P445 delta
- Implemented source-side assignment identity validation, SLA deadline setting, query-time overdue detection, owner workload aggregation, and durable one-time follow-up recording.
- Focused verifier 11/11; P432–P444 regressions 193/193. Runtime and automatic reminder delivery gaps remain open.
- Added five active P445 validation/automation gaps; prior historical counts are not recalculated in this delta.

- P445 resolved P444-G001 at source/verifier level: assignment identity validation is now implemented. Live runtime validation is still open.

## P446 coverage
- [x] SLA reminder automation source implementation
- [x] Overdue escalation source implementation
- [x] Durable one-time markers and indexed candidate selection
- [x] Alert feed and Super Admin visibility
- [ ] Live PostgreSQL, webhook, multi-instance, build, and E2E validation

- [x] P447 source implementation and verifier-backed checks; [ ] live DB/runtime/build/E2E verification remains.

## P448 Coverage
- [x] Persisted policy endpoint and validation implemented (source-level).
- [x] Recipient IDs validated against active platform-admin identities (source-level).
- [x] Audit record written for policy updates (source-level).
- [x] Super Admin policy view/edit added (source-level).
- [ ] Worker consumes persisted severity policy.
- [ ] Live API/database, browser, full build/typecheck, and E2E validation.

## P449 coverage delta
- [x] Consume persisted severity policy in SLA worker.
- [x] Apply severity-specific reminder and escalation intervals.
- [x] Carry configured recipient IDs in reminder/escalation payloads.
- [x] Capture policy version in generated events.
- [x] Honor policy disabled flag.
- [x] Focused source verifier and package script.
- [ ] Validate provider recipient routing at runtime.
- [ ] Live database/worker integration and concurrency tests.
- [ ] Full build/typecheck and browser/mobile E2E.

- **P450:** Recipient-specific alert outbox fan-out implemented; source verifier 14/14. Provider/channel preferences and runtime delivery checks remain open.

## P451 notification channel preferences
- [x] Channel preference GET/PUT API
- [x] Default + per-recipient channel configuration
- [x] Active platform-admin validation and audited persistence
- [x] Worker respects WEBHOOK preference
- [x] Super Admin channel preference editor
- [ ] In-app delivery adapter and inbox
- [ ] Email provider adapter
- [ ] Live provider/runtime/concurrency/build/E2E verification

## P452 notification inbox coverage
- [x] Cursor-based inbox page contract implemented at source level
- [x] Bounded limit validation (1–100; default 50)
- [x] Recipient/org/school/channel scope retained
- [x] Unread count in page response and dedicated endpoint
- [x] Optional category grouping
- [ ] Live DB/API authorization and pagination integration tests
- [ ] Web/mobile client integration and UX validation
- [ ] Notification retention/pruning implementation and verification
- [ ] Full workspace build/typecheck and E2E campaign


## P580 — Documentation & Docker Runtime Foundation

Source/configuration delivered. Runtime Docker, migration and E2E acceptance pending. See `SCHOOL-SaaS-ROADMAP.md` and `P580-VERIFICATION-MATRIX.md`.
