# School Management SaaS — Master Functionality, Gap Register & Delivery Roadmap

**Audit date:** 2026-11-27  
**Purpose:** The working product baseline for selecting and completing one end-to-end functionality at a time across the API, database, web/mobile applications, roles and operations.  
**Status:** Broad source implementation is present. Local web/API services are running. Product-wide functional, security and production acceptance is **not complete**.

> **Use this document to plan new work.** It reconciles the current repository and the most recent delivery/acceptance evidence. Older catalogues, backlogs and phase reports remain useful as historical evidence, but their estimates and statuses must not override this current audit. Before implementing any item, inspect the current code and its phase references; do not rebuild an existing source feature merely because an older gap says it is missing.

## 1. Executive assessment

The repository is a substantial multi-application school-management platform, not an empty scaffold. Source exists for platform administration, organization/school management, school operations, admissions, academics, family/student/teacher/staff experiences and several specialist modules. Recent code also adds library, transport, hostel, health, canteen and payroll capabilities that are absent from earlier inventory snapshots.

The current local Docker environment responds:

- The four web entry points on ports `15173`–`15176` return HTTP 200.
- API liveness and readiness return HTTP 200; readiness reports configuration, PostgreSQL and Redis as healthy.
- This confirms a **local service smoke test only**. It does not prove a successful login for every role, complete persistence, correct authorization, a complete business journey, mobile-device connectivity or production readiness.

The biggest project risks are therefore not simply “missing screens.” They are:

1. The workspace has no committed `pnpm-lock.yaml`, so the dependency graph and production/frozen install are not reproducible.
2. The latest release documents explicitly record **NO-GO**: all-workspace builds, Prisma/PostgreSQL migration acceptance, restricted-role tenant-isolation tests, provider flows, mobile/browser journeys, accessibility, disaster recovery and independent reviews remain unaccepted.
3. Many domains have models, API routes and workspaces, but source presence is not proof that the full role-to-role workflow is wired and works.
4. The School Admin shell still exposes some **local-preview / no-server-write** forms; each page must be classified before treating it as operational.
5. Driver source has pickup/drop/handover controls, but its footer says trip start/end and pickup confirmation are unavailable. Reconcile this UI/backend behavior; GPS input is a manual-coordinate foundation rather than native device tracking.
6. Several product areas in the original product inventory have no dedicated end-to-end domain evidenced in the current API module list.
7. Project planning documents disagree on baseline, scope and status; historic gap counts contain duplicate, verification and governance tasks as well as missing product features.

**Recommended rule:** Do not call a functionality “complete” until one realistic use case is implemented and accepted end-to-end for each affected role and application, including persistence, authorization, error handling, tests and runtime evidence.

## 2. Audit scope, method and status meanings

This audit used the root product/runbook documents, current feature catalogue and gap matrix, the master registers, P579–P581 delivery/acceptance evidence, current workspace/package/source inventories, API route registration, Prisma model/migration inventory, app entry points and representative workflows. It also checked the currently running local service endpoints.

The repository contains **3,626 tracked files**, including **2,069 Markdown files**, **nine application workspaces** (four web and five mobile), a shared API, **27 API domain directories**, **162 Prisma migration directories**, and about **75 tracked test files**. This is a repository-wide static audit and targeted source review—not a line-by-line code review of every historical phase artifact, nor a security audit. Source and historical records must be rechecked when a phase starts.

| Status | Meaning |
|---|---|
| **Source present** | Current source or schema/migration evidence exists. Functional completeness is not implied. |
| **Partial / integration required** | A real workflow exists in part, but a role, state transition, API, app, provider, or adjacent module remains incomplete or unproven. |
| **Not evidenced as a complete feature** | No dedicated end-to-end implementation was found in the current module/app inventory. Narrow adjacent functionality may exist. Confirm scope before creating it. |
| **Runtime smoke verified** | A local process/endpoint responds. This is not a user-journey acceptance result. |
| **Not verified** | Required builds, tests, migration runs, browser/device workflows, or independent evidence are not recorded as passed. |

No percentage-complete estimates are used: the older percentage figures were subjective and are not test results.

## 3. Current application and role coverage

| Application / main roles | Evidence in current source | Main gap to close |
|---|---|---|
| **Super Admin / Platform Administrator** — `apps/super-admin` | Platform console and organization/platform API source are present. | Complete and verify platform lifecycle, permission boundaries, support-safe operations, plans/subscriptions, audit and tenant isolation. |
| **Organization Admin** — `apps/organization-admin` | Organization/school administration and invitation workflows are present. | Prove create/configure/switch school and invite/accept/revoke journeys with correct delegated access and organization boundaries. |
| **School Admin** — `apps/school-admin` | Broad navigation and workspaces cover onboarding, campuses, admissions, student/staff/access, curriculum, attendance, timetable, finance, reports, communications and specialist operations. | Some shell pages explicitly offer “Local preview only · no server write.” Audit each tab and replace or clearly disable previews; verify the effective permission and persisted API workflow per action. |
| **Public Portal / Applicant** — `apps/public-portal` | Public enquiry, application and tracking flows are present. | Validate tenant/school discovery, applicant identity/contact verification, document review, status updates, capacity/offer/payment handoff, provider delivery and conversion into enrolled student data. |
| **Parent / Guardian** — `apps/parent-mobile` | Linked-school/child context, attendance, fees/refunds, homework, report cards, notifications/messages and specialist panels (transport, library, health, canteen, hostel) are present. | Verify guardian-link safety and multi-child/school isolation; complete notification/payment/provider behavior and offline/reconnect acceptance on devices. |
| **Teacher** — `apps/teacher-mobile` | Auth/session, school discovery, timetable, attendance, homework review/grading, lesson/reflection tasks, messaging/notifications and offline queue source are present. | Prove assignment scoping, conflict/retry behavior, offline synchronization and complete teacher-to-student/parent publication on devices. |
| **Student** — `apps/student-mobile` | Profile/school selection, academic planning, homework submission/attachments, assessment results, communication and services/library/canteen source are present. | Complete device/API acceptance, account-link lifecycle, offline behavior and data visibility after school/child context changes. |
| **Staff** — `apps/staff-mobile` | Admissions, health, canteen, payroll, HR/leave and finance evidence panels are present. | Validate each role-specific panel against real assigned memberships, server authorization, app navigation and complete operational workflows. |
| **Driver** — `apps/driver-mobile` | Assigned route/trip display, per-student pickup/drop/handover controls, incident report and consent-aware manual GPS endpoint are present. | Reconcile the app footer (which says trip start/end and pickup confirmation are unavailable) with the pickup/drop controls in the same screen. Trip start/end are not present in the inspected screen; validate the real backend lifecycle/handover, add secure membership discovery and native location permissions/provider, then prove parent-visible status. |

All mobile apps are source workspaces; no real iOS/Android device acceptance is recorded. Do not equate an Expo server starting with a mobile workflow passing.

## 4. Functionality inventory and current gap state

All rows below require appropriate API/database/permission and cross-role acceptance unless a narrower limitation is explicitly stated.

| Functionality | Current evidence | Remaining work / acceptance focus | Main roles and surfaces |
|---|---|---|---|
| **Platform SaaS, organizations and schools** | Platform/organization API modules, administration UIs, tenant lifecycle and onboarding source. | Tenant provisioning, owner/admin lifecycle, school creation/switching, plan/entitlement enforcement, suspend/reactivate behavior and support access must be proven across every endpoint and worker. | Platform Admin, Organization Admin, School Admin; Super Admin, Organization Admin, School Admin, API/workers. |
| **Authentication, identity, sessions and RBAC** | Login/session/MFA/password-recovery source, memberships and permission helpers; authorization-related tests exist. | Verify invitations and email/phone verification, role/membership lifecycle, recovery delivery, session revocation, every protected resource and negative cross-tenant/cross-school tests. MFA is intentionally disabled by default under the current feature-flag decision; production policy/key/recovery acceptance remains required before enabling it. | All roles and all apps/API. |
| **School onboarding and configuration** | Guided server-derived readiness, task assignment, campus registry/inheritance, profile, calendar and policy workspaces. | Confirm each checklist action writes to the server, prerequisites are enforced server-side, school/campus inheritance is understandable and rollback/transfer cannot corrupt live settings. | Organization Admin, School Admin, Principal; Organization Admin and School Admin. |
| **Academics, boards and curriculum** | Board starter packs, grade/subject configuration, curriculum outcomes, mappings, lesson planning/reflections and timetable source exist. | Validate version approvals/effective dates, authoritative board content/provenance, school-local dates, promotion/rollover and the teacher daily learning flow. Starter packs are metadata, not official curriculum compliance. | School Admin, curriculum lead, Principal, Teacher, Student, Parent; School Admin, Teacher, Student, Parent. |
| **Admissions and applicant lifecycle** | Public enquiry/application/tracking, review, documents, eligibility, reservations, offers, notifications and accepted-application conversion have substantial API/schema/UI source. | Prove one application end-to-end, including contact verification, upload/quarantine/scan, reviewer action, concurrency-safe seat reservation, offer/response, fee handoff, student/guardian/enrollment creation, audit and applicant/parent status. | Applicant/Parent, Front Office/Admissions, Finance, School Admin; Public Portal, School Admin, Parent, API/workers. |
| **Student records and lifecycle** | Student profile/list, guardian links, enrollment/history, rollover and account-link source exist. | Complete duplicate review/merge, admission-number policy, imports, class/section allocation, promotion, transfer, withdrawal/graduation and retention/export/deletion lifecycle. | School Admin, Front Office, Principal, Parent, Student; School Admin, Parent, Student. |
| **Guardians and parent identity** | Guardian relationships, invitations, consent/linking and parent child/school discovery source exist. | Validate secure identity matching and invitation delivery/accept/revoke, custody/relationship changes, consent withdrawal, multiple guardians, multi-school children and denial for unrelated students. | School Admin, Parent/Guardian; School Admin, Parent, API. |
| **Attendance** | Admin/teacher marking, corrections/review, attendance roster and parent/student viewing/notification source exist. | Close the complete mark → correction/approval → notification → parent/student view/report journey, including school calendar, teacher assignment scope, concurrency and offline resync. | School Admin, Teacher, Front Office, Parent, Student; School Admin, Teacher, Parent, Student. |
| **Timetable and rooms** | Editor, templates, import/export, room lifecycle/aliases, exceptions, teacher week/day view and offline cache source exist. | Validate conflict protection under PostgreSQL concurrency, publish/revision notifications, substitutions, timezone/DST and mobile offline/reconnect behavior. | Timetable Admin, Principal, Teacher, Student, Parent; School Admin, Teacher, Student, Parent. |
| **Homework, teaching and assessment** | Homework publication, student submissions/attachments, teacher grading, assessment/result calculations and report-card source exist. | Prove create → assign → notify → submit/resubmit → secure scan → grade → publish → student/parent retrieval with correct marks, audit, permission and retention. | Teacher, Student, Parent, School Admin; Teacher, Student, Parent, School Admin. |
| **Report cards and academic records** | Report-card governance/templates/publication and PDF source are present. | Verify result inputs, approval/versioning, accessible PDF rendering, secure retrieval, correction history and parent/student authorization. | Teacher, Principal, School Admin, Parent, Student. |
| **School fees and accounting** | Fee structures, charges, installments, concessions, invoices/receipts, allocations, refunds, historical imports and ledger/reconciliation source exist. | Validate cash/manual and real gateway flows, exact allocation/rounding, receipt integrity, reversal/refund, accounting postings, reconciliation, concurrency, reports and parent status. A record/UI or manual payment is not gateway acceptance. | Finance Officer, School Admin, Parent, Platform Admin for SaaS billing; School Admin, Parent, API/provider workers. |
| **SaaS subscriptions and platform billing** | Plan/subscription/invoice/payment-attempt/entitlement foundations and platform/admin workspaces exist. | Complete tax/jurisdiction, recurring renewal, proration, failed payment/dunning, webhook signature/replay, entitlement enforcement and tenant suspension/reactivation; verify provider sandbox and ledger. | Platform Admin, Organization Admin, Finance; Super Admin, Organization Admin, API/workers. |
| **Communications and notifications** | School messages, parent/student inboxes, preferences, suppression, outbox, delivery receipts/webhooks and retry source exist. | Configure and prove actual email/SMS/push providers, recipient consent/preferences, delivery receipts, retries/dead letters, duplicate prevention, deep links and failure recovery. In-app source alone does not prove external channel delivery. | School Admin, Teacher, Staff, Parent, Student; all relevant web/mobile apps and workers. |
| **Documents, privacy and governance** | Private upload/security scan primitives, retention/consent/legal-hold and data-governance workspace source exist. | Prove provider/scanner infrastructure, access audit, retention and deletion execution, data export, legal hold, privacy notice/consent lifecycle and PII redaction. Avoid claiming compliance without jurisdiction-specific review. | School Admin, designated privacy staff, Parent/Student, platform support; School Admin, Parent, Student, API/workers. |
| **Staff, HR, leave and payroll** | HR lifecycle, leave and payroll API/workspace/mobile source exists. | Validate employee onboarding/linking, assignment changes, leave request/approval, payroll calculation/period close/payslip/payment state, access separation and audit. No payroll disbursement should be inferred from a payslip view. | HR Manager, Staff, Principal, Finance; School Admin, Staff Mobile, API. |
| **Library** | Library API, migrations, School Admin workspace and Parent/Student screens exist. | Complete catalogue/copy/import, borrower policy, issue/return/renewal/reservation/fines/lost-damaged ledger, notices and role/data acceptance. These capabilities are newer than P350’s “no module” finding. | Librarian, School Admin, Student, Parent; School Admin, Student, Parent. |
| **Transport and driver operations** | Routes/stops, assignment, personnel, trip attendance/handover, parent status, incidents, GPS consent/retention and fees have source. | Verify actual driver trip lifecycle, handover and pickup/drop state transitions (the screen controls and its footer currently disagree); add trip start/end if in scope, native GPS/provider integration, offline behavior, guardian privacy, incident escalation and fee/accounting handoff. Current GPS demo uses manual coordinates. | Transport Coordinator, Driver, Parent, School Admin; School Admin, Driver, Parent. |
| **Hostel/residential operations** | Allocations/capacity, roll-call/curfew, visitors/gate passes, leave/guardian notices, checkout and finance/safeguarding source exist. | Verify occupancy/capacity races, guardian approval/notification, gate lifecycle, duty/incident escalation, charges/refunds and child-safeguarding access boundaries. | Warden, School Admin, Parent/Guardian, Student; School Admin, Parent, staff roles. |
| **Health and wellbeing** | Student health records/cases, consent, safety incidents/escalation and staff/parent panels exist. | Verify explicit consent, least-privilege field access, emergency-only disclosure, notification/escalation, retention and auditable access with synthetic data. | Nurse/authorized health staff, School Admin, Parent/Guardian; School Admin, Staff, Parent. |
| **Canteen and meal services** | Menus/preorders, dietary safety, wallet, production, stock/procurement lots and staff/parent/student panels exist. | Validate stock and meal state transitions, allergies/dietary permissions, balances/reconciliation, refunds, supplier receiving and real payment/provider boundaries. | Canteen Staff, Finance, Parent, Student; School Admin, Staff, Parent, Student. |
| **General product areas not evidenced as dedicated end-to-end modules** | The product catalogue includes broader LMS/virtual classroom, discipline, school-wide procurement/inventory/assets/facilities, grievance/complaints, surveys, generic visitor management and configurable analytics/report builder. Narrow adjacent features exist (e.g. canteen purchasing, hostel visitor log and calendar events). | Confirm which are in the agreed product scope. For included areas, add dedicated ownership, workflows, APIs, persistence, permission matrix and app journeys; do not treat the narrow adjacent feature as full module coverage. | School Admin plus relevant Teacher, Student, Parent, Finance, Operations roles; affected apps/API. |
| **Reporting, search, imports/exports** | Module-specific reports, operational workspaces, CSV/JSON flows, audit and export job foundations exist. | Identify required standard reports per role; complete pagination/filtering, imports with preview/rollback, cross-module consistency and authorized export/download. A general report designer/analytics product is not evidenced. | School Admin, Organization Admin, Platform Admin, Finance, Principal; relevant web apps. |
| **Offline/mobile synchronization** | Parent cache/preferences, Teacher mutation queue/timetable cache, Student read/retry/cache foundations exist. | Run physical-device tests for reconnect, exactly-once behavior, stale versions/conflicts, account/context switch, logout/cache clearing, attachment retries, accessibility and degraded network. | Parent, Teacher, Student, Driver, Staff; all five mobile apps. |
| **Operations and production readiness** | Docker local Compose, health/readiness, metrics/tracing source, worker shutdown, monitoring/runbooks and backup guidance exist. | Complete reproducible build, production configuration, backups/restores/PITR, failover, load/soak, alert thresholds, secrets/SBOM, incident ownership, rollout/rollback rehearsal and approved RPO/RTO. | Platform/Operations owners; all services and workers. |

### 4.1 Areas to treat as “not evidenced,” not automatically “unimplemented”

The current API has dedicated domain directories for core, finance, notification, document, health, library, transport, hostel, canteen, HR, payroll and other operational modules. The absence of a *dedicated* module in the current route inventory is a reason to run a scoped audit, not permission to assume no useful code exists.

The following larger product capabilities are **not evidenced as complete end-to-end domains** in the current module and app inventory:

- Course/content LMS, online classes and a broad learning-resource platform.
- Student discipline/behavior workflow.
- School-wide purchasing, inventory/stock, asset and facilities management (narrow canteen purchasing and hostel operations are present).
- General visitor management outside the hostel gate workflow.
- Complaints/grievances and survey/poll lifecycle.
- A general-purpose analytics/report builder beyond module-specific reports.
- Broader event management beyond academic calendar/events.

For each, confirm the required scope with the product owner before marking it “not started” or creating new schema/routes.

## 5. Consolidated actionable gap register

These are umbrella gaps distilled from the feature inventory and release evidence. They intentionally do not duplicate hundreds of phase-level rows. Existing `Pnnn-Gnnn` identifiers remain unchanged in the historical registers.

| ID | Priority | Gap | Completion evidence / exit condition |
|---|---|---|---|
| **GAP-01** | P0 / blocker | Reproducible workspace dependencies are absent (`pnpm-lock.yaml` is not tracked). | Commit authentic lockfile; clean pnpm 9.15.0 frozen install succeeds in CI and container build; generate dependency-resolved SBOM/license/vulnerability report. |
| **GAP-02** | P0 / blocker | All-workspace semantic build and test status is not accepted. | Run each package’s semantic typecheck, lint (where defined), unit/integration suite and four web builds/five mobile builds; retain results and resolve failures. |
| **GAP-03** | P0 / blocker | Prisma/database migration lifecycle is not accepted on clean and upgraded PostgreSQL. | Validate/format/generate Prisma; deploy all migrations on clean and upgrade datasets; verify constraints/RLS/data integrity; exercise documented recovery/rollback strategy and retain logs. |
| **GAP-04** | P0 / critical | Tenant, organization, school, role, resource and worker isolation is not proven under production-like database permissions. | Restricted DB-role positive/negative RLS/API tests; test missing scope, wrong tenant/school, role revocation, pool reuse, background jobs and support access across representative endpoints. |
| **GAP-05** | P1 / critical | Primary journeys are not accepted as complete cross-application vertical slices. | Select a journey and test its initiating role, API/state change, database record, downstream notification, receiving role/app, unauthorized negative case, retry/duplicate case and audit evidence. |
| **GAP-06** | P1 / high | School Admin still has local-preview/no-server-write interactions; page completeness is mixed. | For each navigation tab record API, persistence, permissions, server-side validation, loading/empty/error/success behavior and test. Implement or explicitly label/remove every preview-only action. |
| **GAP-07** | P1 / critical | Finance/provider workflows are not accepted end-to-end. | Payment/refund sandbox, webhook signature/replay/idempotency, ledger allocation/reversal, invoice/tax/receipt, reconciliation and parent-visible status all pass with no fabricated settlement evidence. |
| **GAP-08** | P1 / high | Notification, object storage and malware scan providers are not configured/accepted as production integrations. | Provider-specific credentials/configuration, verified callbacks, retries/dead-letter/reconciliation, consent/preferences, private file lifecycle and scanner failure tests pass. |
| **GAP-09** | P1 / high | Role coverage is uneven across mobile, particularly Driver trip lifecycle; device acceptance is absent. | Reconcile Driver pickup/drop controls with its footer, verify backend handover/state transitions, add trip start/end if in scope and native GPS consent flow; test all five mobile apps on supported iOS/Android devices, including role access, offline/reconnect and accessibility. |
| **GAP-10** | P1 / medium | Demo data is not a complete fixture for the full feature catalogue and every role walkthrough is not evidenced. | Seed valid workflows for selected modules, run seeder twice, verify row counts/idempotency, authenticate each demo role, and test positive/negative visibility. Never fabricate payment, provider, approval or safeguarding evidence. |
| **GAP-11** | P2 / high | General product modules in §4.1 are absent or not evidenced as dedicated end-to-end areas. | Confirm scope; then add one module at a time with API/data/UI/role/acceptance contract or formally defer/remove it from product commitments. |
| **GAP-12** | P0 / critical | Security, child privacy, safeguarding, accessibility and jurisdiction/legal acceptance is not independently signed off. | Independent threat-model/security review and remediation; child safeguarding/privacy/legal review; manual WCAG/assistive-tech evidence; approved retention/deletion and data processing decisions. |
| **GAP-13** | P0 / critical | Disaster recovery and production operations remain unproven. | Encrypted backup restore/PITR, failover and worker recovery drills; measured, approved RPO/RTO; load/soak/SLOs; alerts and on-call/incident ownership; production-like deployment and rollback rehearsal. |
| **GAP-14** | P2 / medium | Documentation, status counts and ownership are inconsistent across root/legacy sources. | Keep this document current; reconcile the P580/P581 gap count and catalogue; assign owner/priority/dependencies/acceptance criteria to each active functionality; archive stale percentage estimates from planning decisions. |

**Related release records:** P579 release blockers RB-01–RB-10 and P579-G001–G008; P580-G001–G008; P581-G001–G008. See [the feature gap matrix](SCHOOL-SaaS-FEATURE-GAPS.md), [P579 status](docs/phases/P579/P579-STATUS.md), [P579 blocker register](docs/phases/P579/P579-RELEASE-BLOCKERS.md), [P577 acceptance boundary](docs/testing/P577-BROWSER-MOBILE-ACCESSIBILITY-ACCEPTANCE.md), [P578 reliability boundary](docs/operations/P578-RELIABILITY-DR-ACCEPTANCE.md), [Docker quick start](DOCKER-LOCAL-QUICKSTART.md) and [demo runbook](DEMO-DATA-TEST-RUNBOOK.md).

## 6. Recommended phase-by-phase sequence

This is a dependency-aware sequence, not a commitment to rewrite each module. Keep each feature phase small enough to deliver one usable journey. Where a feature already exists in source, close only its verified gaps.

### Phase 0 — Reproducible baseline and acceptance harness

**Scope:** GAP-01–GAP-03; local and CI build/test/migration reproducibility.  
**Roles/apps:** Engineering/Operations; all nine apps and the API.  
**Exit:** lockfile/frozen install, semantic checks, builds, Prisma/client generation and clean/upgraded migration evidence. The currently running local stack is a smoke baseline, not a substitute.

### Phase 1 — Tenant identity, authorization and session safety

**Scope:** GAP-04; organization/school membership, role permission matrix, session/revocation, MFA flag policy, API and worker scope.  
**Roles/apps:** Platform Admin, Organization Admin, School Admin, Teacher, Parent, Student, Staff, Driver and specialist staff.  
**Exit:** role-by-action matrix, authorized and denied tests, RLS under restricted DB role, membership/role changes take effect, audit records are correct.

### Phase 2 — Organization-to-school provisioning and onboarding

**Scope:** create organization/school, invite users, select school, guided setup, campus inheritance, academic year/calendar/grade/section/room/fee readiness.  
**Roles/apps:** Platform Admin → Organization Admin → School Admin/Principal.  
**Exit:** new tenant is usable without manual database edits; setup persists, follows dependencies, applies entitlements and is isolated from other tenants.

### Phase 3 — Public admission to enrolled student

**Scope:** enquiry/application → contact verification → document checklist and scan → review/eligibility → capacity-safe offer/reservation → acceptance/payment handoff → student/guardian/enrollment/account link.  
**Roles/apps:** Applicant/Parent, Front Office/Admissions, Principal, Finance, School Admin; Public Portal, School Admin and Parent.  
**Exit:** one synthetic applicant completes the journey; every state is visible to the authorized next role, no duplicate conversion, notifications and audit are recorded, and unauthorized access is denied.

### Phase 4 — Student and family lifecycle

**Scope:** student/family profile, verified guardian linking, enrollment/section assignment, class changes, promotion/rollover, transfer and exit.  
**Roles/apps:** School Admin, Front Office, Principal, Parent, Student.  
**Exit:** student and guardian records remain correctly linked through lifecycle transitions; family/mobile views update; history/audit and access restrictions are preserved.

### Phase 5 — Academic delivery and classroom loop

**Scope:** curriculum/teacher assignment → timetable → attendance → lesson/homework → student submission → teacher evaluation → assessment/report-card publication.  
**Roles/apps:** Curriculum/Timetable Admin, Teacher, Student, Parent, Principal.  
**Exit:** the same student/class/academic year stays consistent across API/database, School Admin, Teacher, Student and Parent apps; dates/timezone, permissions, offline conflict and notifications are tested.

### Phase 6 — Fees, payments and accounting

**Scope:** fee configuration → student charge/installment/concession → invoice/payment → allocation/receipt → journal/reconciliation → refund/reversal → Parent status. Keep SaaS subscription billing as its own clearly bounded stream.  
**Roles/apps:** Finance Officer, School Admin, Parent; Platform Admin for SaaS billing.  
**Exit:** exact amounts and balances reconcile, provider callbacks are verified/idempotent, financial corrections are auditable and reports tie back to transactions.

### Phase 7 — Staff, HR, leave and payroll

**Scope:** staff identity/membership → employment/assignment → leave request/approval → payroll calculation and payslip → payment status/accounting.  
**Roles/apps:** HR Manager, Staff, Principal, Finance; School Admin and Staff Mobile.  
**Exit:** membership scopes, approvals, period close, sensitive field access and payroll totals are tested; actual disbursement is explicitly separate unless a real provider is accepted.

### Phase 8 — Specialist school operations (one module per feature phase)

**Scope:** audit and complete Library, Transport/Driver, Hostel, Health, and Canteen independently; then decide whether school-wide procurement/inventory/assets/facilities, LMS, discipline, grievance/surveys and visitor management are in scope.  
**Roles/apps:** Relevant Librarian, Transport Coordinator/Driver, Warden, Nurse, Canteen Staff, School Admin, Student and Parent.  
**Exit:** each selected module has full state lifecycle, role restrictions, audit, operational mobile/parent views, notifications/provider dependencies and domain-specific demo/test records.

### Phase 9 — Communication, documents, reports and data governance

**Scope:** announcements/messages/inbox/provider dispatch, private documents, export, retention/deletion, standard reports and search.  
**Roles/apps:** School/Organization Admin, Teacher, Parent, Student, privacy/operations roles.  
**Exit:** consent-based audience selection, provider receipts/retry, secure files, correct retention/export and accurate reports are independently tested.

### Phase 10 — Production readiness and release decision

**Scope:** GAP-12–GAP-13 and remaining runtime/device evidence: privacy, security, accessibility, safeguarding, dependency/SBOM/secrets, reliability, DR and operational ownership.  
**Roles/apps:** Authorized product, security, privacy, safeguarding, operations and support owners.  
**Exit:** all critical blockers have evidence or a formally authorized risk acceptance; a documented GO decision replaces the current NO-GO.

**Cross-phase rule:** Do not postpone the receiving application until a later phase. Each phase delivers all affected surfaces together. Example: attendance is not complete when teachers can mark it; it must also reach parent/student views under the correct identity and school scope.

## 7. Definition of done for every selected functionality

Copy this checklist into the phase issue or work item before coding:

- [ ] **User outcome:** one clear outcome and supported state transitions; define what is in/out of scope.
- [ ] **Roles and applications:** initiating, approving, viewing and support roles named; every impacted web/mobile app listed.
- [ ] **Preconditions/dependencies:** academic year, membership, entitlement, provider, consent and setup requirements specified.
- [ ] **Data:** schema/invariants/migration/seed/retention and audit requirements documented; no hidden manual database steps.
- [ ] **API:** validation, authorization, tenant scope, pagination/idempotency/concurrency and stable error responses covered.
- [ ] **UX:** loading, empty, success, error, retry, duplicate-submit and inaccessible/unavailable-provider states are explicit.
- [ ] **Cross-role completion:** the next authorized role receives and can act on the changed state; unauthorized roles cannot read or mutate it.
- [ ] **Tests:** unit + API/database integration + web E2E + mobile/device coverage at the risk-appropriate level, including negative authorization.
- [ ] **Operations:** logs/metrics avoid PII; background work retries safely; external providers have documented setup and failure behavior.
- [ ] **Demo evidence:** synthetic fixtures exercise valid workflow states; no fake provider settlement, approval or safeguarding evidence.
- [ ] **Acceptance:** run against the intended database/runtime, retain sanitized evidence, update this roadmap and linked gap IDs.

## 8. Source-of-truth and document governance

Use this document as the **current planning and status entry point**. Preserve historical phase artifacts and their identifiers; do not delete, silently rewrite or renumber their evidence.

| Existing document | Use / caveat |
|---|---|
| [README](README.md) and [consolidated documentation](SCHOOL-MANAGEMENT-SAAS-CONSOLIDATED-DOCUMENTATION.md) | Entry points; link to this master roadmap. |
| [Feature catalogue](SCHOOL-SaaS-FEATURE-CATALOG.md) | Detailed historical/source feature inventory; P580 baseline predates current source changes. |
| [Feature gap matrix](SCHOOL-SaaS-FEATURE-GAPS.md) and [master open-gap register](docs/MASTER-OPEN-GAPS-REGISTER.md) | Phase-level IDs and original gap wording. The feature-matrix header reports P580’s 737 total; the master register later appends eight P581 items. Reconcile the summaries before using a total. Counts also include verification/governance tasks, not just missing product features. |
| [Missed-functionality backlog](MISSED-FUNCTIONALITY-BACKLOG.md) | Discovery source containing many older P00–P30 gaps. Treat as candidates, not current truth; inspect code and later phase reports before scheduling. |
| [P350 major functionality inventory](docs/P350-MAJOR-FUNCTIONALITY-INVENTORY.md) | Historical pre-specialist-module snapshot. Its “no dedicated module” findings for library, transport, hostel, health, canteen and payroll are superseded by later source/migration evidence. |
| [P579 status](docs/phases/P579/P579-STATUS.md) and [release blockers](docs/phases/P579/P579-RELEASE-BLOCKERS.md) | Current production NO-GO and explicit acceptance boundary; do not mark these gates passed because local services start. |
| [P581 demo runbook](DEMO-DATA-TEST-RUNBOOK.md) | Local fictional data and credentials. Seed execution and all-role walkthrough require separate runtime evidence. |
| [Docker quick start](DOCKER-LOCAL-QUICKSTART.md) | Local development only; no production deployment claim. |

When updating this file, record the date, evidence, status, impacted roles/apps, unresolved items and prior gap IDs. Move completed work to resolved only after the actual acceptance evidence exists.

## 9. Immediate next action

Start with **Phase 0 / GAP-01**: establish the authentic pnpm lockfile and reproducible frozen workspace install. Then run the dependency-backed builds, tests and database migration baseline. Once this reveals a stable executable baseline, select **Phase 1 (tenant authorization)** or **Phase 3 (admission-to-enrollment)** as the first user-facing vertical functionality according to product priority.

Do not treat the current local Docker response as production readiness, and do not implement a large module bundle before its specific user journey, owner, roles and acceptance criteria are agreed.
