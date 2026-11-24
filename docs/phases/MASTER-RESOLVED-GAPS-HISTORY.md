# Master Resolved Gaps History

This file preserves IDs and closure evidence for gaps removed from `MASTER-OPEN-GAPS-REGISTER.md`.

## No closures recorded through P116

No gap has been removed from the open register as of P116 because the project's required runtime/API/database/device verification evidence has not been executed. Source implementation alone is not sufficient for closure.


## P120 — Resource-Level Authorization and Tenant Isolation Remediation (2026-11-18)
- Admissions reads now require `admissions.read`; admissions mutations require `admissions.manage`, in addition to active school membership.
- Access member and assignment user-profile lookups now use `withIdentityContext`; organization listing uses the same identity-scoped context for organization rows.
- Added a static verifier for these controls and retained remaining runtime/handler-wide review items in the open register.
- No gap was closed in P120 because database RLS and runtime authorization evidence has not been executed.

## P183 source remediation
- Added offer seat reservation schema and API source; capacity accounting now distinguishes reserved from enrolled seats, with decline/expiry release and enrollment consumption. Runtime verification remains deferred.

## P184 source remediation
- Pending admission fee handoffs now create a draft student fee ledger charge at conversion; handoff links to the charge ID. Financial publishing/payment/reconciliation acceptance remains open.

## P210
- Source-level closure: SMS/phone OTP deferred and removed as a submission blocker. Both public endpoints return HTTP 410 for SMS with `ADMISSIONS_SMS_OTP_DEFERRED`; applicant UI is email-only; school policy API forces legacy phone requirement false. Static checks passed; no runtime verification is claimed.

## P214 source implementation record
- P214-G001..G003: School Admin Admissions application list search, status filtering, clear filters, counts and empty state. Source-level checks only; runtime validation deferred.

## P215 source implementation record
- P215-G001..G002: Added Admissions review summary cards (review queue, submitted, under-review, documents-pending) with click-through filters in School Admin Web. Counts are derived from the currently loaded school-scoped applications; source checks only, no runtime verification.

## P216 — Admissions reviewer assignment foundation (source implementation)
- Added `assignedReviewerId` to AdmissionApplication and a migration/index.
- Added school-scoped reviewer candidates from active SchoolMembership + active User records.
- Added assignment/unassignment API with membership validation and admissions.manage permission.
- Added School Admin application-row reviewer selector wired to the API.
- Static source assertions and ZIP integrity only; migration/runtime/API/UI acceptance not executed by user instruction.

## P217 — Admissions reviewer workload and queue filters (source implementation)
- Added school-scoped reviewer workload counts based on the loaded active review applications.
- Added assigned/unassigned queue metrics, per-reviewer quick filters, reviewer queue selector and reset behavior.
- No gaps closed in P217 because runtime/integration acceptance is deferred.

## P218 — Admissions reviewer assignment audit trail (source implementation)
- Added `AdmissionReviewerAssignmentHistory` schema and migration, capturing school/application scope, previous/new reviewer, actor, timestamp, optional reason.
- Assignment API records an audit row only when reviewer assignment actually changes and validates the new reviewer membership before updating.
- Added school-scoped reviewer-history GET endpoint and School Admin detail UI display.
- Source assertions and cumulative ZIP integrity only; migration/runtime/API/UI acceptance remain deferred.


## P219 — Admissions review notes and structured recommendations (source implemented)
- Added `AdmissionReviewNote` model and migration storing organization/school/application scope, reviewer, note type, text, optional structured recommendation and creation time.
- Added scoped GET review-note history (read permission) and POST note creation (manage permission); decision-type notes require a recommendation.
- School Admin application details now submit and display comments, decision recommendations, and request-information notes. Final application status changes remain governed by existing transition API and are not automatically changed by recommendations.
- Source assertions only; runtime and migration acceptance deferred.

## P220 — Admissions decision transition guard (source implementation
- Added transition-time guard: APPROVED requires a structured DECISION review note with recommendation APPROVE; REJECT requires a matching REJECT recommendation.
- Missing matching decision note returns 409 (`ADMISSION_DECISION_NOTE_REQUIRED`) and prevents the application status transition. The guard is scoped to the tenant/school/application within the transition transaction.
- Existing allowed-transition checks, concurrency-safe conditional update, and stage history remain intact. Static source review only; no runtime tests or builds performed.

## P221 source implementation record
- Applicant tracking-token endpoint exposes only REQUEST_INFORMATION notes, with note text, creation timestamp and recommendation, and scopes lookup by tenant/school/application.
- Public portal supports correction updates in DOCUMENTS_PENDING while retaining that status; draft editing continues. This is source implementation, not runtime closure evidence.

## P222 source implementation record
- Added lifecycle response fields to AdmissionReviewNote and Prisma migration/index.
- Added applicant response API and applicant portal submission/display flow for school REQUEST_INFORMATION notes.
- Added scoped, permission-protected staff resolution API endpoint.
- Conditional OPEN-only response and conflict handling; no application status mutation by response submission.
- Admin resolution UI and all runtime validation remain open/deferred. Static source evidence only.

## P223 source implementation record
- School Admin application details now display request lifecycle status, applicant response, response timestamp, and resolution timestamp for REQUEST_INFORMATION review notes.
- Added a Resolve request control for OPEN/RESPONDED notes, wired to existing admissions.manage-protected resolve API; details refresh after resolution.
- Source assertions and archive integrity only; builds, typechecks, DB/runtime, API, mobile and E2E validation deferred.


## P224 source implementation record
- Added `followUpToId` linkage to AdmissionReviewNote with migration/index. Follow-up notes are separate REQUEST_INFORMATION entries, preserving parent response and resolution data.
- School Admin UI can initiate a follow-up from responded/resolved requests; form identifies the parent request and submits the linkage.
- API requires admissions.manage and validates parent note tenant/school/application scope plus RESPONDED or RESOLVED status. Existing review-note GET returns linkage fields.
- Static source review and ZIP integrity only; migration/build/runtime/API/mobile/E2E validation remains deferred.


## P225 source implementation record
- Applicant public requests response now exposes follow-up linkage; applicant portal displays correction request chains in chronological timeline format, with original/follow-up distinction, status, applicant response timestamps, and resolution timestamp.
- Source review only; build/typecheck, database/runtime, API integration, mobile and E2E validation remain deferred.


## P226 source implementation record
- P226-G001/G002/G003: Admission document replacement lineage added. Replacement references are validated against rejected same-type documents in the same application and tenant/school; prior records remain intact. Applicant and Admin upload UI selectors pass replacement IDs. Existing quarantine/scanning workflow is retained.
- Evidence: Prisma schema/migration, public/admin upload route source, applicant portal and School Admin UI source, P226 phase report. Runtime validation deferred.

## P227 source implementation record
- P227-G001/G002: School Admin Admissions document timeline added using current document data: upload, scan-request/security state, review outcome/comment, and replacement lineage; replacement ancestry labels versions and timeline events sort chronologically.
- Evidence: `apps/school-admin/src/AdmissionsWorkspace.tsx`, `docs/phases/P227-PHASE-REPORT.md`. Source-level only; runtime validation deferred.


## P228 source implementation record
- Applicant Portal document history is displayed as chronological upload/replacement timeline entries. Replacement ancestry is used for version labels, and each entry shows upload timestamp, document type, current review state and current security state. Applicant-safe guidance is displayed for rejected and verified/clean documents. Reviewer identities and internal notes are not exposed.
- Evidence: `apps/public-portal/src/main.tsx`, `apps/public-portal/src/style.css`, `docs/phases/P228-PHASE-REPORT.md`. Static source checks and archive integrity only; build/runtime/API/mobile/E2E validation deferred.


## P229 source implementation record
- Applicant inbox notifications added with persistent read state and deduplicated event keys. Public APIs validate the tracking token and scope notification operations to the application. Applicant-safe notifications are created for submission, application status transitions, document review results, and information requests; Public Portal displays unread count and mark-read actions.
- Evidence: `backend/api/prisma/schema.prisma`, migration `20261119225000_p229_admissions_applicant_notifications`, `backend/api/src/modules/admissions/admission-applicant-notifications.ts`, public/admin admission route files, `apps/public-portal/src/main.tsx`, `apps/public-portal/src/style.css`, and `docs/phases/P229-PHASE-REPORT.md`. Runtime validation deferred.


## P230 — Master Feature Checklist & Priority Reset

- Created `SCHOOL-MASTER-FEATURE-CHECKLIST.md` at root and mirrored under `docs/`, spanning the full school SaaS roadmap.
- Established checklist update protocol for every phase and priority reset: Admissions basic flows parked; Student Lifecycle next.
- This phase is documentation/governance work; no functional gap is closed by P230.

## P234 — Student enrollment duplicate/conflict handling (source implemented)
- [x] P234-G001 — Duplicate enrollment for the same student and academic year is detected before insert and returns HTTP 409 with a specific explanation.
- [x] P234-G002 — Roll-number collision in the same school, academic year, and grade is detected before insert and returns HTTP 409.
- [x] P234-G003 — Race-time Prisma unique constraint violations are converted to a conflict response instead of a generic server error.
- [ ] P234-G004 — DB/runtime/API/E2E verification remains deferred.

Source implementation evidence: `backend/api/src/modules/students/student.routes.ts`.


## P235 — Applicant-to-student conversion race protection
- [x] P235-G001 — Added a tenant/school/application-scoped PostgreSQL transaction advisory lock before conversion lookup, serializing concurrent conversion requests and ensuring the converted-state check is performed after the lock. The transaction continues to encompass student, guardian, enrollment, fee handoff, and application updates.
- [ ] P235-G002 — Runtime/API/E2E acceptance remains deferred.

Source evidence: `backend/api/src/modules/admissions/admission.routes.ts` conversion endpoint.


## P236 — Direct enrollment section capacity
- P236-G001/G002: Direct enrollment now conditionally claims a seat in a configured grade-section capacity row using an atomic update guarded by current enrolled/reserved counts and the configured capacity. When no capacity row exists, legacy enrollment behavior remains. A failed student-status transition rolls back the enrollment and releases the seat counter within the transaction.
- Validation: source assertions only; build/runtime/API/E2E deferred.


## P237 — Enrollment status lifecycle API (source implemented)
- [x] P237-G001 — Enrollment status transitions are validated through an explicit allowed-transition helper and request schema.
- [x] P237-G002 — Concurrent status updates are guarded by updateMany with the prior status; losing races return HTTP 409.
- [x] P237-G003 — Transfer/withdrawal/completion transitions record end date and decrement configured section enrolled-seat count; the status update, seat release and audit log are transaction-scoped.
- [ ] P237-G004 — Final runtime/build/API/security/mobile/E2E verification deferred.

Source evidence: `backend/api/src/modules/students/student.routes.ts`, `student.schemas.ts`, and `student-lifecycle.ts`.


## P238 — Enrollment history UI and status controls
- Added enrollment-history load/view in School Admin Students workspace using the scoped student detail API.
- Connected status-change controls to the P237 guarded endpoint and refreshes records after success.
- Runtime/build/typecheck/API/browser/security/E2E validation intentionally deferred.


## P239 — Enrollment UI transition filtering (source implementation)
- Student Admin enrollment status dropdown is now state-aware: ENROLLED offers PROMOTED/TRANSFERRED/WITHDRAWN/COMPLETED; PROMOTED offers TRANSFERRED/WITHDRAWN/COMPLETED; terminal states offer no further options. Submit is disabled for an option not permitted by the selected enrollment state.
- Source-level evidence only. Runtime/API/browser validation remains deferred.


## P240 — Capacity-aware enrollment allocation UI (2026-11-19)
- Added capacity configuration retrieval to the Student workspace, showing configured section choices by selected grade and academic year with available-seat counts and full-section disabling.
- Grade changes clear section selection; manual entry is retained as fallback when no section-capacity configuration is available.
- Validation remains deferred; source implementation only.


## P241 — Configured-section enrollment preflight guard
- Implemented a client-side preflight for configured capacity sections. Before submitting enrollment, the selected section must exist for the chosen grade/year and its loaded available-seat calculation must be greater than zero. Invalid selections receive actionable feedback and are blocked. Server-side capacity checks remain authoritative for race conditions or stale snapshots.
- Static source assertions and ZIP integrity only; runtime/build/API/E2E checks deferred.


## P242 — Student profile UI coverage and connected student/guardian workflows
- [x] `P08-G010` — School Admin student/guardian UI connected to authenticated APIs and persistent state. Source evidence: `apps/school-admin/src/OperationalModulesWorkspace.tsx` connected student creation, profile edits, enrollment, status lifecycle, guardian link/update, document upload, and history/detail views; P242 expands API-supported profile fields.
- Validation: static source assertions only; build/runtime/API/browser/security/E2E remain deferred.

## P245
No gaps closed. Added a metadata-only student photo records listing and refresh-on-upload; photo gallery lifecycle and secure preview remain open.


### P246 note
No gap closed during P246. Primary-photo selection implementation is recorded as partial implementation progress only.


### P247 phase note — Student photo preview
- Added private approved-photo preview capability and School Admin preview UI (60-second signed inline URL, access/scan gates, audit log).
- No gap closed in this phase; existing gap counts remain unchanged. Runtime validation is deferred.


### P248 phase note — Student photo deactivation (no gap closure)
P248 adds an active/deactivated flag, guarded soft-deactivation endpoint, audit event, and Admin action. Inactive photo records are blocked from secure preview and primary designation. Replacement is supported by uploading a new approved photo then deactivating the prior record. Hard storage deletion remains deferred. No gap was closed; counts remain unchanged pending runtime/consolidated review.

## P249
No master gaps were closed. P249 added student profile access enforcement and changed/cleared-field audit metadata; closure remains deferred to consolidated validation.


## P250
No master gaps closed. P250 adds secure gallery-thumbnail loading for up to 20 eligible active CLEAN JPEG/PNG photos per explicit request; implementation awaits final runtime/consolidated validation before any gap can be closed.


## P251
No master gaps closed. Added primary-photo deactivation guardrails pending final runtime validation.


## P251
No master gaps closed. Added primary-photo deactivation guardrails pending final runtime validation.


## P256
No gap closure recorded. Source implementation awaits runtime/API/browser validation.

## P257
- No gaps closed in P257. Billing workspace source implementation is recorded, but build/runtime/API evidence is deferred; no closure is claimed.


## P258 note
No gaps closed in P258. Academic term UI/read API added but requires runtime verification before closure.

## P259
- No gaps closed in P259; source implementation additions are not runtime evidence.


## P260
- No gaps closed in P260; guardian edit coverage was expanded at source level, but runtime evidence is deferred.


## P261 — Admissions
- No gaps closed. The date-of-birth form enhancement is source-implemented and remains pending runtime verification.

## P265 gap history
- No gaps closed in P265; source-only implementation has not been runtime validated.


## P266 gap history
- No gaps closed in P266; source implementation is not runtime validated.


## P268 gap history
- No gaps closed in P268. Weekly overview implementation remains pending runtime verification.


## P269
- No gaps closed in this phase; implementation is source-level and awaits runtime evidence.

## P271
- No gaps closed in this phase; daily report source implementation awaits runtime evidence.


## P272
- No master gaps closed. Submission review/grading UI is source-level progress; class-wide targeting, approval workflow and runtime evidence remain open.


## P273
- No master gaps closed. Exam/assessment CRUD, marks save and publish source-level functionality added; roster UX, report-card integration and runtime evidence remain OPEN.


## P288
- No master gap closed. Push channel is explicitly disabled in the Parent Mobile preferences until delivery infrastructure exists. Accessibility improvements and static assertions are source-level evidence only; runtime validation remains open.


## P289 partial closure
- P288-G002 partially addressed by a parent-portal readiness API and dynamic Parent Mobile email availability copy. No secrets are exposed. Delivery testing remains outstanding.


## P290 partial closure
- Email notification preference UI is now disabled when the live channel-readiness API says email delivery is unavailable. Accessibility state is synchronized with the disabled control.


## P291 partial follow-up record
- P290-G001 remains partially open: P291 adds an explicit accessible manual channel-readiness refresh and a success/error path. Automatic foreground/config-change refresh remains unresolved. No validation gap was closed.


## P292
- No gap closed in this phase. Foreground refresh lifecycle implementation is a partial remediation of P290-G001 only; runtime evidence is still pending.


## P293
- No gap closed. Parent Mobile now shows explicit notification channel readiness reasons; runtime validation and delivery provider work remain open.


## P294
- No gap closed in this phase. Preference save feedback, duplicate-submission guard, and success-gated state updates are implemented; runtime verification remains pending.

## P387
- Implemented tenant/school-scope assignment UI state reset at onboarding readiness refresh start. Source verifier 8/8 PASS. This is a bounded UI hardening slice, not closure of the broader F03 onboarding gap.

## P388
- Implemented readiness checklist scope reset: checklist entries, last refreshed timestamp, and recommended-next-step state clear before refresh; no active session/school scope exits safely. Source verifier 8/8 PASS. This is a bounded UI hardening slice; broader F03 remains open and runtime acceptance is pending.

## P389
- Closed source-slice gaps for organization invitation management: safe listing, pending revoke, audit event, duplicate pending invitation guard, token acceptance serialization, and scoped role assignment deduplication. Verifier 15/15 PASS. Invitation delivery and F03 overall are not closed.

## P390
- Closed source slice: server-side prerequisite enforcement for terms, calendars, working days, and policies. Evidence: P390 verifier 10/10 PASS plus historical onboarding verifier regressions. Runtime acceptance is not implied.


## P391 — Organization invitation email delivery and acceptance UI
- CLOSED (source slice): Configured email delivery path, invitation URL hash token, hash-only DB token storage, idempotency header, delivery timeout, safe revocation/audit on provider failure, and organization-admin acceptance UI. P391 verifier 14/14 PASS; updated P389 verifier 15/15 PASS. Live delivery and runtime acceptance remain unverified.

## P392 resolved source slice
- Dependency-aware onboarding readiness statuses, blocker lists, actionable counts, workflow completion metadata, actionable-first recommendation and corresponding admin status labels. Source verifier 11/11 PASS. Full F03 not closed.

## P393
- No master F03 gap closed by P393. Delivered UI/source enhancement: blocked task rows display named incomplete prerequisite tasks using existing prerequisite data.

## P394 source-slice closure history
- Assignment-owner CSV preview/import implemented with validation and partial-result reporting; source verifier 11/11 PASS. Runtime acceptance pending.

## P395 — Onboarding assignment CSV parsing
- Closed source-level gap for robust CSV parsing: quoted comma, escaped quote, multiline fields, CRLF handling and malformed quoted input rejection. Static assertions 12/12 and runtime parser cases 5/5 passed.

## P395 — Robust CSV assignment parser
- Closed parser robustness gap in onboarding assignment CSV import. Source supports quoted commas, escaped quotes, embedded newlines, CRLF and malformed quote rejection. Static assertions 12/12 and parser behavior 5/5 passed.

## P396
- **P396-G001 CLOSED (source slice):** Added versioned configuration transfer export, validated preview and permission-guarded apply for Profile, Weekly Working Days, and Policies. Best-effort compensating rollback attempted on API failure. Verifier 15/15 PASS.

## P397 — Academic year/term configuration transfer (source slice)
- Versioned JSON export retrieves academic years and their terms.
- Import validation checks required fields, duplicate codes/sequences, term types and date boundaries.
- Existing school academic-year codes are rejected during preview.
- Additive apply is guarded by `academics.manage`; imported years are not made current. Source verifier 20/20 PASS.
- Does not resolve atomic import, calendar/events, multi-campus inheritance, full F03 or runtime acceptance.

## P398 source-slice resolution record
- **Calendar/event configuration transfer scope resolved at source level:** versioned JSON export for selected calendar and events; preview and validation; additive import creating a new calendar and event rows; `academics.manage` apply gate. Verifier 18/18 PASS.
- This is a scoped source resolution only. No runtime verification or atomic rollback is claimed; broader F03 gap remains open.

## P399 partial closure — calendar timestamp validation
- Calendar event start/end values now use strict timezone-explicit ISO 8601 parsing. Invalid local/date-only values, rollover dates, invalid clocks, and invalid offsets are rejected. This resolves only the timestamp-validation subgap; transactional import remains open.

## P400 — Partial foundation delivered (not gap closure)
- Added reusable campus inheritance resolver/validator for profile, working-days and policies. This is recorded as partial implementation only; the multi-campus inheritance gap remains OPEN until persistence, APIs, UI, authorization and chain-resolution behavior are implemented and verified.

### P401
- Resolved: pure campus inheritance-chain traversal and resolution helper with ancestor-to-child ordering, missing target/parent rejection, cycle detection, duplicate document ID rejection, and inherited-scope merge/override behavior. Evidence: `scripts/verify-p401-campus-inheritance-chain.mjs` 16/16 PASS.


## P402 — Campus inheritance editor utility slice
- CLOSED (source slice): Campus inheritance draft/edit primitives now support validated defaults, inheritance toggles, whole-scope override set/remove, nested path updates, scope summaries, and unsafe-path protection. P402 verifier 16/16 PASS. This does not close UI/API/persistence integration.

### P403-R01 — Campus inheritance document persistence foundation
- Persisted inheritance documents with organization/school/campus uniqueness, JSONB, tenant RLS, permission-gated APIs, validation, and audit hooks.
- Evidence: P403 verifier 15/15; static-only. Full feature remains open.


## P404
- Closed source-slice gap: persisted campus inheritance parent-chain cycle guard. The endpoint validates the proposed graph before the upsert and returns HTTP 409 on a cycle. Verifier 13/13 PASS (graph scenarios included).

## P406 resolved
- **P406-G001 CLOSED (source slice):** Explicit campus-effective configuration read endpoint combines base school profile, working-days and policy data with persisted inheritance overrides. Focused verifier 17/17 PASS; P400–P405 regressions pass. Not runtime verified.

## P407 — Campus registry foundation
- **P407-G001 CLOSED (source slice):** Persisted campus registry table with tenant/school RLS, validation/constraints, list/create/update/soft-archive APIs, audit events and registry validation wired into inheritance save/effective configuration endpoints. Focused verifier 20/20 PASS. Runtime execution remains unverified.

## P408-G001 — Campus Registry administration UI source integration
- Added school-admin campus registry workspace and permission-filtered navigation wired to authenticated API context.
- Create, edit, archive, list, validation and confirmation UI implemented.
- Evidence: P408 focused verifier 15/15 PASS; source syntax scan 251 files/0 errors. Runtime/build validation remains pending.

## P409 resolved source slices
- P409-G001: Campus-effective configuration context added to School Configuration workspace as a read-only campus selector and resolved configuration preview (verifier 11/11).

## P410 resolved source implementation gaps
- **P410-G001 CLOSED:** Campus inheritance administration UI integrated with School Admin navigation and authenticated APIs. Scope inheritance toggles and JSON overrides support profile, working days, and policies.
- **P410-G002 CLOSED:** Campus inheritance graph saves are serialized per school with transaction advisory lock and revalidation, preventing the concurrent stale-graph cycle race at source level.
- **P410-G003 CLOSED:** Configuration transfer imports now use a server-side tenant transaction for all supported scopes; sequential partial academic/calendar import risk and best-effort rollback are replaced by atomic transaction rollback.
- **F03 source implementation CLOSED:** documented onboarding readiness, task orchestration/ownership, invitation lifecycle, campus configuration foundation and import/export source flows are complete. Runtime/acceptance testing remains deferred.


## P411 source-slice closure
- Closed P411 implementation gap: board-keyed starter curriculum metadata catalogue and read-only list/single-pack APIs, with explicit provenance and non-official-content disclaimer, focused tests and verifier. Official curriculum content and remaining F04 work are not closed.

## P412 resolved source slice
- **P412-G001 CLOSED:** Added tenant/school-scoped CurriculumOutcome model/migration with source provenance, version/grade/optional subject scope, review workflow, source verifier and test source. Focused source verifier 16/16 PASS. Runtime/migration/unit tests remain unexecuted.


## P414 resolved source slice
- **P414-G001 CLOSED:** Outcome editing and draft-only deletion delivered. Updates are permission/entitlement gated, tenant/school scoped, limited to DRAFT/IN_REVIEW, validate grade/subject scope and preserve unique outcome-code constraints. Draft deletion requires UI confirmation and is rejected for reviewed records. P414 verifier 19/19 PASS; P411/P412/P413 regressions and parser scan pass. Runtime validation remains unverified.


## P415 resolved source slice
- **P415-G001 CLOSED:** Curriculum outcome CSV template, filtered export, preview validation and all-or-nothing commit import implemented. Preview surfaces row-level validation errors; import revalidates in transaction and creates only DRAFT outcomes. Verifier 23/23 PASS; CSV runtime smoke 4/4 PASS; P411-P414 regressions pass; parser scan 258 files/0 errors. Runtime acceptance remains deferred.


## P416 resolved source slice
- **P416-G001 CLOSED:** Outcome-to-exam mapping source implementation added: school/tenant-scoped persistence and constraints, RLS, mapping read/create/delete API, grade/subject alignment validation, and Admin mapping UX. Verifier 26/26 PASS; unit test source created but not executed. Runtime/build/DB/browser/mobile/E2E acceptance remains unverified.


## P417 — Curriculum Outcome Coverage & Assessment Alignment Dashboard
- Added a tenant/school/version-scoped coverage dashboard API with grade, review-status and subject filters. It aggregates mapped/unmapped/multi-mapped outcomes, mapping totals, mapped exam counts and coverage percentages.
- Grade-wise and subject-wise coverage breakdowns are included, along with exam-wise coverage for all matching school exams (including exams with zero mappings), unmapped-outcome action lists and multi-mapped outcome details. Exam query is restricted by school, outcome grade(s), and curriculum academic year when configured.
- Added the School Admin coverage dashboard integrated into the outcomes workspace, showing KPI cards, grade/subject/exam tables and unmapped/multiple-mapping action lists. Dashboard subject selection resets when version/grade/review filters change.
- Focused verifier: 24/24 PASS. Pure-function runtime smoke: 7/7 PASS. P411–P416 regression verifiers pass. TS/TSX parser scan: 262 files, 0 parse diagnostics.
- Full build/typecheck, Prisma validation/migration, live API/DB/RLS, browser/mobile and E2E acceptance remain deferred/unverified.

## P418 resolved source-slice gaps
- Lesson-plan CRUD source implementation with curriculum version, grade, optional subject and outcome association.
- Admin UI lesson planning workflow integrated into curriculum outcomes workspace.
- Focused verifier: 19/19 source assertions PASS. Runtime acceptance remains deferred and is tracked separately.

## P419
- Closed at source slice: date-based weekly and monthly lesson-planner visualization, list view, date navigation, grade/subject filters and unscheduled lesson list.
- Evidence: `scripts/verify-p419-weekly-lesson-planner.mjs` 23/23 checks passed; existing P418 lesson planner verifier 24/24 passed.
- Not closed: drag-and-drop date rescheduling and full runtime/browser/mobile/E2E acceptance.

## P423 source implementation closure
- **P423-G001 — Coordinator reflection review source slice — CLOSED (source-only):** Added school-scoped review API, filtering, follow-up status, coordinator notes/audit fields and School Admin UI. Focused verifier 24/24 PASS; transpilation 0 syntax diagnostics. This closure does not represent runtime acceptance; P423-G002 remains open.

## P424 source implementation closure
- **P424-G001 — Reflection-derived actionable tasks — CLOSED (source-only):** Added task persistence, migration with tenant RLS/composite FKs, coordinator task creation and management, teacher assignment-scoped task list/status APIs and UI. Evidence: focused verifier 24/24 and P411–P423 regressions passed; syntax transpilation 0 diagnostics. Runtime acceptance remains open.


## P425 source-slice resolution
- **P425 source monitoring slice implemented:** due-bucket filters, coordinator counts and date views, teacher mobile due-date indicators. Source verifier 20/20 PASS and TS transpilation diagnostics 0. Runtime acceptance is not closed; see P425-G001 through G004.

## P426 closures
- No unrelated or runtime-dependent gaps closed in P426. Source-level feature checks are recorded in P426 test report; runtime evidence remains pending.

## P428 source-slice closure
- P428-G000 (source slice): Teacher preferences, school reminder policy, scheduler enforcement, Teacher Mobile toggles and focused source verification implemented. Runtime verification is not considered closed; tracked separately as P428-G001/G003.

- **P428-G002 RESOLVED (P429 source slice):** Coordinator UI for school reminder defaults and frequency controls implemented in `CurriculumTaskReminderPolicyWorkspace.tsx`, integrated into Curriculum Outcomes. Verifier `verify-p429-school-reminder-policy-ui.mjs` 16/16 PASS. Runtime acceptance remains separate/open.

## P430
- **P429-G002 CLOSED (aggregate scope only):** Added coordinator-visible aggregate reminder preference counts without individual names/identifiers; P430 verifier 17/17 PASS. Individual-level visibility remains intentionally excluded for privacy.

## P431 source-level closures
- P431-G001: Reporting cohort restricted to active teaching designations and linked active staff accounts.
- P431-G002: Aggregate metrics suppressed below minimum cohort size of 5; coordinator UI suppresses details.

## P432 source-slice closures
- P432 reminder policy history source slice: append-only audit model/migration, transactionally captured actor/action/previous/new values, history endpoint and coordinator UI implemented. Focused verifier 21/21 PASS. Runtime validation remains separately open in active gaps.

## P433 source-slice closures
- Added scoped date/action/actor filters, deterministic cursor pagination, and filtered CSV export (maximum 1,000 records) to the reminder policy audit history API.
- Added School Admin filter controls, load-more paging, and CSV export.
- P433 verifier: 17/17 PASS; API route and React TSX transpile diagnostics 0. Runtime acceptance remains open.

## P434 source-slice closures
- **P433-G004 CLOSED (source slice):** Replaced the 1,000-row-only export gap with asynchronous export jobs: requester-bound status/download, filter snapshot, worker, 50,000-row cap, 24-hour expiry/purge, stale job expiration, and UI status/download controls. P434 focused verifier 26/26 PASS. Runtime acceptance remains tracked under P434-G001/G002/G003.

## P435 source-slice closures
- P435 export job management source slice: requester-scoped recent job listing, queued-only cancel, failed-only retry, attempts tracking and stale-processing recovery, plus Admin controls. Focused verifier 21/21 PASS; P434 regression 26/26 PASS. Runtime validation remains tracked as open.

## P436 (source-slice resolved)
- Implemented export job operational dashboard and school-scoped health endpoint (queue metrics, age, duration sample, recent failure codes). Source checks passed; runtime validation is not claimed.

## P437 — Export Queue Capacity & Backpressure
- Delivered: configurable active-job caps per school/requester; duplicate queued filter request suppression; HTTP 429 capacity response with retry guidance.
- **P437-G001 OPEN:** Runtime DB/API acceptance, concurrency race validation for capacity enforcement, and tenant RLS.
- **P437-G002 OPEN:** Full workspace build/typecheck and browser/mobile E2E.
- **P437-G003 OPEN:** Multi-school fairness remains global FIFO; evaluate round-robin fairness and worker scaling.
- **P437-G004 OPEN:** Validate caps against real workload and query performance; DB-level atomic enforcement is not implemented.

## P438 resolution evidence
- P438 source checks for bounded candidate scan, school rotation preference, FIFO fallback, configurable bounded interval/scan size, and conditional claim: 11/11 PASS. Note: this is source-verification only, not runtime fairness proof.

## P439 resolution evidence
- Implemented configurable concurrency (1–8, default 2), concurrent job handling, bounded candidate selection, and conditional status claims. Source verifier 15/15 PASS. Runtime claim races/load are explicitly not considered resolved pending integration evidence.
## P440 source-level implementation evidence
- Worker heartbeat now writes STARTING/HEALTHY/DEGRADED state to the existing BackgroundWorkerHeartbeat table; independent heartbeat cadence and shutdown cleanup are implemented. School-scoped export health API returns status, age, last success/error, and consecutive failures; Admin UI displays these diagnostics. P440 verifier 15/15 PASS, P439–P432 regressions 141/141 PASS, and TypeScript transpile syntax diagnostics 0. Live runtime validation is pending, so runtime gaps remain open.


## P441 implemented (source-level; not runtime closed)
- Export worker stale/degraded alert creation and recovery event implementation. Source verification passed; runtime gap items remain open.

## P443 — Alert Escalation Console & Lifecycle Visibility
- Completed: escalation metadata surfaced in platform alert API and Super Admin console.
- Added lifecycle filters for escalated-only and unacknowledged alerts.
- Focused verifier: 7/7. Regression verifiers P442–P432: 175/175. Total: 182/182.
- Runtime/full build/E2E validation remains open.

## P445 resolved gap
- **P444-G001:** Assignment user IDs now require an active platform administrator identity. Source implementation plus focused verifier provides evidence; live runtime validation remains open in P445-G002.

## P449
No gaps closed in P449: source-level implementation and static verification do not meet the project evidence standard for runtime gap closure.
