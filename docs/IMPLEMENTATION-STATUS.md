# Implementation Status

## Current baseline
- P00: Product analysis, architecture, roadmap and gap baseline — documentation complete.
- P01: Monorepo, app/API shells, PostgreSQL/Redis compose baseline and CI scaffold — source generated; runtime acceptance pending.
- P02: Identity, authentication, memberships, RBAC primitives, session persistence and tenant-context helper — source generated; runtime/security acceptance pending.
- P03: Super Admin platform control-plane APIs, tenant lifecycle events, settings, support grant records and initial console — source generated; runtime/security acceptance pending.
- P04: Organization onboarding, owner/school memberships, school lifecycle, invitation foundation and PostgreSQL RLS policies — source generated; runtime/database/security acceptance pending.
- P05: Subscription plans, organization subscriptions, invoices, payment attempts, webhook idempotency foundation and entitlements — source generated; runtime/payment/security acceptance pending.
- P06: School profiles, academic years/terms, calendars/events, working days, attendance/grading policy foundations and school-scoped RLS — source generated; runtime/database/security acceptance pending.\n- P07: Board catalogue, school board profiles, grade levels, curriculum versions, subject mappings and curriculum entitlement foundation — source generated; runtime/database/security acceptance pending.\n- P08: Student, guardian, student relationship, enrollment, pickup contact and document metadata foundation — source generated; runtime/database/security acceptance pending.

## Verification boundary
No dependency installation, Prisma validation/generation/migration, Docker startup, API execution, browser/mobile execution, automated test run or payment gateway sandbox test is represented as passed. See phase reports and master gap register.


## P09 — Admissions and enrolment workflow
Source scaffold delivered: enquiries, application lifecycle, stage history, document metadata, grade-section capacity configuration, offers, accepted-application conversion, tenant-scoped RLS migration and API routes. Runtime verification pending; see `docs/phases/P09-PHASE-REPORT.md`.


## P10 — Staff and teacher directory
Source foundation delivered: departments, designations, staff records, employment history, status/audit events, teacher assignments, document metadata, tenant-scoped APIs and forced-RLS migration. Runtime verification pending; see `docs/phases/P10-PHASE-REPORT.md`.


## P11 — Roles, permissions and staff access hardening
Source foundation delivered: permission catalog/resolver, baseline school roles, custom role creation, assignment/revocation, permission introspection, verified existing-account staff linking and teacher self-assignment endpoint. Runtime verification pending; see `docs/phases/P11-PHASE-REPORT.md`.


## P12 — Student Attendance Foundation
Status: source scaffold implemented; runtime acceptance NOT VERIFIED.
Delivered attendance session lifecycle, class-scoped bulk marking, enrollment validation, correction workflow, audit trail, RLS migration, API docs and lifecycle test source. See `docs/phases/P12-PHASE-REPORT.md`. P12 open gaps are recorded in `MASTER-OPEN-GAPS-REGISTER.md`.


## P13 — Attendance Hardening
Status: source hardening implemented; runtime acceptance NOT VERIFIED. Added conditional state transitions, correction review claiming, pending-correction uniqueness and additional entitlement guards. See `docs/phases/P13-PHASE-REPORT.md`.


## P14 — Attendance UI Integration
Status: source implementation delivered; runtime acceptance NOT VERIFIED. School Admin attendance workspace now calls the attendance API and uses the enrolled roster endpoint. See `docs/phases/P14-PHASE-REPORT.md`.


## P15 — Teacher Attendance Mobile
Status: source implementation delivered; runtime acceptance NOT VERIFIED. Teacher Expo attendance workflow and assignment-scoped backend APIs added. See `docs/phases/P15-PHASE-REPORT.md`.


## P16 — Teacher Mobile Authentication & Secure Sessions
Status: source implementation delivered; runtime acceptance NOT VERIFIED. Teacher sign-in uses the existing login/refresh/logout APIs; refresh tokens are stored with Expo SecureStore, access tokens remain in memory, and 401 responses trigger a single-flight refresh/retry. Organization/school IDs remain manual. See `docs/phases/P16-PHASE-REPORT.md`.


## P17 — Teacher Membership Discovery & School Selection
Status: source implementation delivered; runtime acceptance NOT VERIFIED. Added authenticated self-service school membership discovery, tenant-context validation of active school/staff membership, minimal role/assignment summary and teacher mobile school picker. Manual tenant ID fields were removed. See `docs/phases/P17-PHASE-REPORT.md`; P17 gaps remain open in the master register.

## P18 — Teacher timetable and daily workspace
- Source implementation: completed.
- Static checks and syntax transpilation: run in artifact verification; see P18 phase report.
- Prisma/database/API integration/Expo runtime acceptance: not verified.
- P18-G001..G009 remain open pending runtime validation and extended timetable capabilities.

## P19 — Timetable Management & Conflict Resolution
- Source implementation: completed for update, conflict preflight, JSON batch validation/import and JSON export.
- Static source assertions and TypeScript/TSX syntax transpilation: performed for changed files; see P19 artifact manifest.
- Prisma validation, generated-client typecheck, Vitest execution, PostgreSQL/RLS migration and API integration: NOT RUN.
- Concurrent import safety is not guaranteed; database-level constraint/locking remains an open gap.
- P19-G001..G009 are recorded in `MASTER-OPEN-GAPS-REGISTER.md` and mirrored under `docs/`.


## P20 — Academic Calendar & Timetable Exceptions
- Source implementation: completed for room inventory foundation, date-specific CANCEL/SUBSTITUTE/OVERRIDE records, teacher timetable projection and API advisory locking.
- Static source assertions and TS/TSX syntax transpilation: performed; see P20 artifact manifest.
- Prisma validation/client generation, migration application, Vitest, PostgreSQL/RLS/API concurrency tests, Expo build and device E2E: NOT RUN.
- Room-code enforcement, CSV, admin editor/templates, timezone acceptance, notifications and offline/week UX remain open in P20-G001..G009.


## P21 — Timetable CSV, Templates & Editor
**Source implementation:** Completed. **Runtime acceptance:** Pending.
- CSV parser/preview/import/export, 500-row synchronous import limit.
- Bell schedule template persistence and transactionally applied slots.
- API-backed School Admin editor with assignment and canonical room pickers.
- Teacher mobile day/week navigation.
- New timetable writes enforce active room codes; legacy labels are preserved.
- Prisma, PostgreSQL/RLS, Vitest, API, browser and device tests not run. See `docs/phases/P21-PHASE-REPORT.md` and `MASTER-OPEN-GAPS-REGISTER.md`.


## P22 status — source complete, runtime pending
- Room lifecycle APIs and database trigger migration added.
- Legacy room usage report added (no automatic data rewrite).
- Teacher seven-day timetable and bounded SecureStore cache added; offline is read-only.
- Syntax transpilation and static source checks passed. PostgreSQL, Prisma, API, Expo and device verification not run.
- See `docs/phases/P22-PHASE-REPORT.md` and `MASTER-OPEN-GAPS-REGISTER.md`.


## P23 — Room Mapping & Timetable Authentication Integration
- Source implementation: COMPLETE.
- Room alias registry, approval workflow and transactional application: IMPLEMENTED; database runtime verification pending.
- Timetable editor login/refresh/logout: IMPLEMENTED; universal School Admin shell auth and membership discovery remain open.
- Syntax transpilation and static assertions: PASS.
- Prisma validation, migration execution, PostgreSQL/RLS tests, Vitest, API integration, full typecheck and browser E2E: NOT RUN.
- See `docs/phases/P23-PHASE-REPORT.md`, `docs/phases/P23-ARTIFACT-MANIFEST.json` and `MASTER-OPEN-GAPS-REGISTER.md`.


## P24 — Source implementation complete; runtime acceptance pending
- Shared authenticated School Admin context now drives Attendance and Timetable workspaces.
- Active membership discovery and academic-year picker added; manual tenant IDs removed from those two modules.
- Room alias dry-run preview, maker-checker approval and transactional audit events added.
- Changed source syntax transpilation and static source checks passed; cumulative ZIP integrity verified.
- Other admin tabs remain preview-only or not yet integrated with shared API context.
- Prisma validation, PostgreSQL/RLS, API integration, full typecheck/build, Vitest and browser E2E not run.
- See `docs/phases/P24-PHASE-REPORT.md` and `MASTER-OPEN-GAPS-REGISTER.md`.


## P25 — Source implementation complete; runtime acceptance pending
- Added school-scoped effective-permission loading and capability-based navigation; preview-only screens are explicitly marked and gated.
- SCHOOL_ADMIN receives the current permission catalogue through idempotent seed and onboarding linking.
- Timetable management APIs accept SCHOOL_ADMIN or active school members with `academics.manage`.
- Added PostgreSQL trigger source for recurring teacher/room overlap protection, date-specific exception conflicts, advisory-lock serialization and append-only AuditLog.
- Added permission helper unit tests and PostgreSQL acceptance checklist.
- TypeScript syntax transpilation and targeted static checks passed; Prisma/PostgreSQL/Vitest/full typecheck/build/API/browser/device tests were not run.
- See `docs/phases/P25-PHASE-REPORT.md`, `docs/phases/P25-ARTIFACT-MANIFEST.json` and `MASTER-OPEN-GAPS-REGISTER.md`.


## P26 — School Configuration Persistence
- Source implementation: COMPLETE for school profile, academic-year create/list, calendar/event create/list, working days and attendance/grading policies.
- Curriculum, student, staff and access modules: PREVIEW ONLY.
- Runtime acceptance: NOT VERIFIED. Package install, Prisma, PostgreSQL/RLS, API integration, full build/typecheck, Vitest and Playwright not run.

## P27 — Operational Modules API Integration
- Source implemented: curriculum board/profile, grades and versions; student list/search/create; staff list/create and teacher assignments; roles/permissions list, custom role creation and role assignment.
- Authentication: uses shared School Admin `request()` helper with active organization/school membership context.
- Static source assertions: 12/12 PASS.
- TypeScript/TSX syntax transpilation: 3/3 PASS.
- Cumulative ZIP integrity: PASS (428 entries).
- Full typecheck/build, Prisma/database, API integration and browser E2E: NOT RUN.
- Runtime acceptance: NOT VERIFIED.
- Remaining P27 work is captured in `MASTER-OPEN-GAPS-REGISTER.md` and `docs/phases/P28-ENTRY-CRITERIA.md`.

## P28 — Operational Workflows & Authorization Hardening
- Source implementation: COMPLETE for curriculum subject create/version status; student admission with optional guardian, enrollment and pickup contact; staff department/designation create, status changes and assignment selectors; access member/assignment listing, revocation and audit view.
- Backend authorization: granular `academics.*`, `students.*`, `staff.*`, `access.*` permission enforcement for affected route groups.
- PII: `students.pii.read` and `staff.pii.read` added; protected detail fields and application-level PII read audit events added.
- Permission matcher unit-test source added; tests not executed.
- TypeScript/TSX syntax transpilation: PASS for 7 changed files.
- Targeted static source assertions: PASS; root/docs gap register parity: PASS.
- Prisma validation, migrations, PostgreSQL/RLS, API integration, Vitest, full typecheck/build, Playwright and Expo/device tests: NOT RUN.
- Runtime acceptance: NOT VERIFIED. See `docs/phases/P28-PHASE-REPORT.md` and P28 entries in `MASTER-OPEN-GAPS-REGISTER.md`.

## P29 — Guardian, Staff Lifecycle & Curriculum Guard
- Source implemented: guardian list/link/create/update with PII permission, duplicate review conflict and audit events; School Admin guardian workflows; staff employment-history list/append and separation closure; curriculum activation advisory lock and P29 unique-index migration with duplicate preflight.
- Unit-test source added for guardian email/phone normalization and employment effective-date rules; Vitest NOT RUN.
- TypeScript/TSX syntax transpilation: PASS for 8 changed files.
- Prisma validation/client generation, PostgreSQL migration/RLS/concurrency, API integration, full typecheck/build, Vitest, Playwright and Expo/device acceptance: NOT RUN.
- Runtime acceptance: NOT VERIFIED.
- Parent account invitation and private binary document storage are NOT IMPLEMENTED; metadata registration must not be represented as upload support.
- P29-G001 through P29-G010 appended to root and docs master gap registers; all earlier unresolved gaps carried forward.


## P30 — Parent Identity, Private Documents & Integrity
- Source implemented: encrypted parent invitation creation/acceptance/revocation with explicit guardian consent, 48-hour expiry, token-hash lookup, and verified account linking. Email delivery worker/provider is NOT included.
- Source implemented: guardian merge preview and explicit transaction-locked merge; different account conflicts block merging.
- Source implemented: private S3-compatible presigned POST upload policy, quarantine, HEAD metadata verification, HMAC scanner callback, clean promotion and CLEAN-only signed downloads. Malware scanner engine/worker and bucket infrastructure are external dependencies.
- Source implemented: PostgreSQL employment-history overlap preflight and GiST exclusion constraint; migration not applied.
- Source implemented: cursor-paginated access audit endpoint.
- TypeScript syntax transpilation, targeted static checks, migration assertions, manifest validation and cumulative ZIP integrity: PASS.
- Prisma validation/client generation, migrations, PostgreSQL/RLS/concurrency, S3, scanner, email delivery, Vitest, full typecheck/build and Playwright: NOT RUN.
- Runtime acceptance: NOT VERIFIED. P30-G001 through P30-G012 added; all unresolved P00–P29 gaps carried forward.


## P31 — Parent Portal, Delivery Workers & Consent Controls
- Source implemented: versioned consent notice persisted and previewed before acceptance; existing account password proof; verified guardian link plus organization/school membership and PARENT role provisioning in acceptance transaction.
- Source implemented: parent school discovery, guardian-scoped children and submitted/locked attendance APIs; strict active membership, parent permission, accepted non-withdrawn consent and canReceiveCommunications checks.
- Source implemented: consent withdrawal records timestamp/audit, leaves organization/school membership and removes PARENT role assignment while preserving school-managed communication preferences.
- Parent Expo app: invitation token preview/consent acceptance, login/refresh/logout with SecureStore, school picker, linked children, published attendance and consent withdrawal.
- Parent invitation worker: BullMQ retry/backoff, idempotent HTTPS provider adapter, dead-letter queue and encrypted outbox reconciliation.
- Document scan worker: BullMQ dispatch, 120-second signed download URL, HTTPS scanner provider adapter; callback HMAC signs timestamp + exact raw body with five-minute skew and one-time QUARANTINED transition.
- Static syntax transpilation: PASS for 16 changed TS/TSX files; JSON config parsing PASS. Unit tests added but NOT RUN.
- Prisma validation/client generation, migrations, PostgreSQL/RLS, Redis, S3, real email/scanner provider, Expo build/device, full typecheck/build, Vitest and Playwright: NOT RUN.
- Runtime acceptance: NOT VERIFIED. See P31 phase report and P31 entries in master gap register.

## P32 — Parent Attendance Pagination & Portal Hardening
- Source implemented: parent attendance cursor pagination, deterministic ordering, bounded page size, same-scope cursor validation, inclusive end-date filtering, and Parent app Load more/reset behavior.
- Added helper Vitest source; not executed because project dependencies are not installed.
- TypeScript/TSX syntax transpilation: PASS for 4 changed files.
- Prisma validation, PostgreSQL/RLS, API integration, Vitest, full typecheck/build, Redis/BullMQ, email/scanner provider, S3, Playwright and Expo device acceptance: NOT RUN.
- Runtime acceptance: NOT VERIFIED. P31-G009 partially addressed at source level only; see P32 gap register.


## P33 — Source implementation complete; runtime acceptance pending
- Parent portal now includes source workflows for fee statements/manual payment history, homework, report cards and school notifications.
- School APIs can create/publish fee charges, manually reconcile payments, publish homework/report cards and fan out consent-scoped notifications.
- Five new tenant-scoped models and forced-RLS migration are present.
- The Parent mobile app consumes the new read APIs.
- Online gateway, homework submission, report-card PDF/approval, push/email notification delivery and School Admin authoring UI remain out of scope/open.
- Prisma validation, migration application, PostgreSQL/RLS, API integration, Vitest execution, full typecheck/build and device/browser E2E have not been run. Runtime acceptance is NOT VERIFIED.


## P34 — School Admin Parent Operations
- Source implemented: School Admin fees and manual payment reconciliation workspace; homework authoring/publication; report-card authoring/publication; parent in-app notification authoring and operator inbox.
- Source implemented: school-scoped operator list APIs (maximum 100) and DRAFT-to-PUBLISHED APIs with audit events. Notification recipients are still derived by the backend from consented, verified guardian relationships.
- Manual payment does not call a gateway. Homework submission/grading, report-card templates/approval/PDF, push/email delivery and provider receipts remain open.
- TypeScript/TSX syntax transpilation PASS 5/5, targeted static assertions PASS 24/24 and pure helper smoke checks PASS 9/9. Prisma validation, DB migration/RLS/concurrency, API integration, Vitest, full builds/typecheck and Playwright/Expo E2E NOT RUN. Runtime acceptance NOT VERIFIED.


## P35 — School Operations Pagination & Privacy
- Source implemented: cursor pagination for operator fee, homework, report-card and notification list APIs; default 30/max 100; same-scope cursor-anchor validation; stable createdAt/id ordering; composite indexes and School Admin Load more UI.
- Notification API projections continue to omit recipient account IDs.
- Helper Vitest source added; executed dependency-free helper smoke checks 8/8 PASS.
- TypeScript syntax transpilation PASS 4/4 changed TS/TSX files. Prisma validation, migration, PostgreSQL/RLS/API integration, Vitest, full typecheck/build, Playwright and Expo E2E NOT RUN. Runtime acceptance NOT VERIFIED.
- P35-G001 through P35-G011 added; P34-G006/G011 partially addressed at source level. All unresolved P00–P34 gaps carried forward.


## P36 — Source implemented; runtime acceptance pending
- Homework submission lifecycle supports parent text answers, ungraded resubmission, operator grading and parent feedback visibility.
- Parent notification unread count is available with active consent and linked-child scope.
- Database migration includes tenant composite FKs, forced RLS, score constraints and indexes.
- Homework attachments/rubrics/teacher mobile grading, report-card schema approval/PDF, notification batch/outbox and payment gateway remain open.
- TypeScript syntax transpilation PASS 1/1 and static source assertions PASS 12/12. Prisma validation, migration execution, PostgreSQL/RLS/API integration, Vitest, full typecheck/build, Playwright, Expo E2E and k6 NOT RUN. Runtime acceptance NOT VERIFIED.

## P37 — Source implemented; runtime acceptance pending
- Homework attachments are source integrated with the private S3 upload/quarantine/scanner/promote/download lifecycle. Upload requires accepted non-withdrawn parent consent and a linked child; only CLEAN files can be downloaded.
- Teacher homework lists and grading/history/reopen routes enforce active staff assignment to the student's current year/grade/section. Teacher mobile app includes homework review, score and feedback UI.
- Rubric criterion results are persisted with bounded scores; grade/reopen history is append-only at the database trigger level.
- Report-card schema/approval/PDF, school-managed rubric catalogue, parent mobile attachment UI, notification outbox and payment gateway remain open.
- TypeScript syntax transpilation PASS 5/5 changed TS/TSX files. Prisma validation/migration, PostgreSQL/RLS/API, Redis/S3/scanner provider, Vitest, full builds/typecheck, Playwright, Expo device E2E and k6 NOT RUN. Runtime acceptance NOT VERIFIED.

## P38 — Source implemented; runtime acceptance pending
- Versioned report-card schema, schema-bound score validation, principal approval/rejection and private PDF artifact workflow added.
- P38 migration, permission seed, API/security docs, tests, phase report, artifact manifest and P39 entry criteria added.
- Source implementation is not runtime acceptance. Prisma validation/migration, PostgreSQL RLS/API, S3, PDF parser, Vitest, full typecheck/build and browser/device E2E remain unverified.

## P39 — Report-card Operations UI
- Source implemented: School Admin report-card schema draft/activation and approval queue UI; tenant-scoped report-card listing with approval timeline; parent mobile private PDF download action.
- Source checks: see `docs/phases/P39-PHASE-REPORT.md` and `P39-ARTIFACT-MANIFEST.json`.
- Runtime status: NOT VERIFIED. Prisma/PostgreSQL/RLS/API/S3, Vitest, full typecheck/build, Playwright and Expo device E2E not run.
- Remaining: visual schema editor/lookups, branded multi-page PDFs/QR, board pack provenance, notification outbox and payment provider decision.

## P40 — Report-card Designer, Branded PDF & Notification Outbox
- Source implemented: tenant-scoped academic-year/grade/board lookup API; structured schema designer with subject/component editing and mark-total preview; school policy-backed PDF brand colour/footer/signature settings.
- Source implemented: multi-page A4 PDF renderer with page numbers and text verification code; consent-aware, deduplicated in-app notification batches and outbox records are persisted in the same transaction as report-card publication.
- Source implemented: parent notification preference read/update APIs for categories and IN_APP/EMAIL/PUSH channels. Only IN_APP is currently delivered; EMAIL/PUSH are preferences only and no provider worker is claimed.
- Verification: TypeScript syntax transpilation PASS 6/6; PDF multi-page helper smoke PASS; `pdfinfo` PASS (3 pages, A4); recipient consent/deduplication smoke PASS; manifest and gap-register parity PASS.
- Not run: Prisma validate/generate, migration apply/rollback/reapply, PostgreSQL forced-RLS/API integration, Vitest, full typecheck/build, Playwright, Expo E2E, provider contract tests and k6. Runtime acceptance NOT VERIFIED.
- Remaining: QR verification, multilingual fonts/RTL, logo/template library, board assessment packs, external notification worker/receipts/retries/dead-letter, parent notification UI/inbox lifecycle and payment provider decision.


## P41 — Source implemented; runtime acceptance pending
- PDFKit embeds bundled Noto fonts for Latin and major Indian scripts; QR symbols encode a random 128-bit artifact verification code. Arabic glyph coverage is embedded but RTL shaping is not claimed.
- Public report-card verification returns school/year/term/issue metadata only and uses a narrow read-only GUC/RLS context.
- Report-card publication creates channel-specific IN_APP and EMAIL outbox records; IN_APP and EMAIL preferences are independent.
- Dedicated BullMQ worker rechecks active guardian link, communication permission, verified email, accepted non-withdrawn consent and current email preference before HTTPS provider delivery. Retries, idempotency and dead-letter state are implemented in source.
- Verification: see `docs/phases/P41-PHASE-REPORT.md` and `P41-ARTIFACT-MANIFEST.json`. Prisma/migration/PostgreSQL/RLS/provider/Vitest/full builds/browser/mobile/k6 NOT RUN. Runtime acceptance NOT VERIFIED.
- Remaining: RTL shaping, logo upload/template library, provider receipts/bounces, push delivery, parent inbox lifecycle, board pack provenance and payment provider decision.


## P42 — Parent Notification Inbox Lifecycle
- Source implementation delivered: snapshot-watermarked keyset pagination (default 30, max 100), current-consent cursor-anchor validation, unread count, individual/bulk read state, Parent mobile Load more/Mark all read controls and school-switch reset.
- Added recipient/school descending index and migration `20261117200000_p42_parent_notification_inbox`.
- Verification: TypeScript syntax transpilation 4/4 and pure cursor helper smoke checks 7/7 PASS; static source assertions and ZIP integrity PASS.
- Not run: Prisma validation/generation, migration apply/rollback, PostgreSQL RLS/API integration, Vitest, full builds/typecheck, Playwright, Expo device E2E and k6. Runtime acceptance NOT VERIFIED.
- Deferred: private logo/template library, retention/legal-hold workflow, RTL/accessibility, delivery receipts/bounces/PUSH, distributed QR rate limiting and payment provider decision.


## P43 — School Branding, Named Templates & Outbox Leases
Status: source implementation delivered; runtime acceptance NOT VERIFIED. Added quarantined private school-logo upload and malware scan integration, CLEAN-only logo activation/private retrieval and PDF embedding, named immutable report-card template versions and atomic notification outbox leases with owner/expiry checks. See `docs/phases/P43-PHASE-REPORT.md`, `docs/phases/P43-ARTIFACT-MANIFEST.json` and `MASTER-OPEN-GAPS-REGISTER.md`.


## P44 — Source delivered; runtime acceptance pending
- School Admin branding tab, permission-gated private logo upload and approved-logo refresh are source implemented.
- Public QR verification now uses Redis atomic rate limiting, hashed caller identity and fail-closed Redis outage behavior.
- TypeScript syntax transpilation passed for five changed files. Prisma/database, Redis, S3/scanner, browser/mobile and performance integration tests were not run.
- Arabic RTL shaping, email receipts/bounces/complaints, PUSH lifecycle and logo retention/legal hold remain open.


## P45 — Notification delivery receipts
Status: source implementation delivered; runtime acceptance NOT VERIFIED. Canonical signed webhook contract, provider allowlist, event idempotency ledger, bounce/complaint states and chronological reconciliation added. No provider selected; native provider adapter/sandbox remains deferred. See `docs/phases/P45-PHASE-REPORT.md`, `P45-ARTIFACT-MANIFEST.json` and master gap register.


## P46 — Tenant email suppression
Source implementation delivered; runtime acceptance NOT VERIFIED. School-scoped keyed email hashes, permission-gated management APIs, audit/release lifecycle and worker suppression check added. UI and provider-global suppression remain open. See P46 phase report and master gap register.


## P47 — School email suppression operations
Source delivered: School Admin suppression management UI, active/released views, add/release workflow, school-scoped audit timeline and privacy-safe API list response. Runtime acceptance not verified. Provider-global suppression/native adapter and Arabic RTL shaping/tagged PDF remain open.

## P48 — Versioned suppression HMAC key rollover
- Source implemented: current/previous key version resolution, versioned persistence, current-key writes, dual-version API duplicate detection and worker pre-send enforcement.
- Static verifier: 11/11 PASS; TS syntax: 4 files, 0 syntax diagnostics.
- Runtime Prisma/PostgreSQL/RLS/worker/API acceptance remains unverified; production approval not granted.

## P49 — Notification lifecycle regression coverage
- Added key-rollover regression test cases and static lifecycle verification across P45–P48.
- Added detailed PostgreSQL/Redis integration acceptance plan.
- Static verifier: 12/12 PASS; TS syntax: 0 diagnostics. Runtime acceptance pending.

## P50 — Hardened notification webhook contract
- Source implemented: strict canonical event schema/state mapper and stricter signature header parsing.
- Static verifier: 12/12 PASS; TS syntax: 5 files, 0 diagnostics.
- Vitest, route/PostgreSQL integration and provider sandbox acceptance remain unverified.

## P51 — Webhook route-level regression tests
- Added mocked HTTP route tests and raw-body middleware ordering checks.
- Static verifier: 10/10 PASS; TS syntax: 1 test file, 0 diagnostics.
- Vitest and real PostgreSQL/RLS/concurrency acceptance remain unverified.

## P52 — Monotonic notification event reconciliation
- Source implemented: provider event ledger remains append-only while outbox summary updates follow timestamp and terminal-state precedence.
- Static verifier: 8/8 PASS; TS syntax: 3 files, 0 diagnostics.
- Vitest/PostgreSQL concurrency and worker runtime acceptance remain unverified.

## P53 — Notification provider retry/dead-letter policy
- Source implemented: retryable/permanent provider response classification and lease-conditional immediate dead-letter settlement.
- Static verifier 10/10 PASS; TS syntax 3 files, 0 diagnostics.
- Worker/Redis/PostgreSQL/provider sandbox runtime acceptance remains unverified.

## P54 — Worker lease and terminal-state guards
- Source implemented: centralized terminal-state checks and atomic claim filters.
- Static verifier 8/8 PASS; TS syntax 3 files, 0 diagnostics.
- Multi-worker Redis/PostgreSQL runtime acceptance remains unverified.

## P55 — Notification log privacy and safe diagnostics
- Source implemented: shared Pino redaction list and safe worker failure summaries.
- Static verifier 11/11 PASS; TS syntax 6 files, 0 diagnostics.
- Runtime Pino/collector and worker acceptance remains unverified.

## P56 — Safe notification operational events
- Source implemented: allowlisted event builder and worker outcome logging without recipient PII or provider secrets.
- Static verifier 10/10 PASS; TS syntax 3 files, 0 diagnostics.
- Runtime logger/collector and worker acceptance remains unverified.

## P57 — School suppression keyset pagination
- Source implemented: tenant-validated cursor pagination, bounded audit retrieval, supporting index/migration and School Admin Load more UI.
- Static verifier 11/11 PASS; TS syntax 4 files, 0 diagnostics.
- Database migration/query-plan and browser acceptance remain unverified.

## P58 — Suppression release concurrency guard
- Source implemented: conditional active-state release transition and atomic audit insertion.
- Static verifier 7/7 PASS; TS syntax 1 file, 0 diagnostics.
- PostgreSQL concurrency/transaction/RLS acceptance remains unverified.

## P59 — Notification endpoint rate limiting
- Source implemented: Redis atomic rate limits for webhook ingress and suppression mutations, hashed identities and fail-closed behavior.
- Static verifier 11/11 PASS; TS syntax 6 files, 0 diagnostics.
- Redis multi-replica/outage and trusted proxy runtime acceptance remains unverified.

## P60 — Webhook payload and media-type guards
- Source implemented: JSON-only webhook contract and 64 KB webhook body limit.
- Static verifier 8/8 PASS; TS syntax 2 files, 0 diagnostics.
- Vitest and reverse-proxy ingress acceptance remains unverified.

## P61 — Canonical webhook contract versioning
- Source implemented: v1 schema default/validation and persisted contract version with additive migration.
- Static verifier 7/7 PASS; TS syntax 3 files, 0 diagnostics.
- Prisma migration and PostgreSQL/Vitest acceptance remain unverified.

## P62 — Webhook replay payload integrity
- Source implemented: payload-hash-aware duplicate detection and concurrent unique-race conflict handling.
- Static verifier 10/10 PASS; TS syntax 2 files, 0 diagnostics.
- PostgreSQL transaction/concurrency/RLS acceptance remains unverified.

## P63 — Provider bounce/complaint to school suppression
- Source implemented: recipient HMAC/version persisted before send; provider bounce/complaint events create school-local suppression and audit.
- P63 static verifier 11/11 PASS; P62 verifier 10/10 PASS; TS syntax 3 files, 0 diagnostics.
- Prisma/PostgreSQL/RLS/worker/provider runtime acceptance remains unverified.

## P64 — Provider event versus manual release precedence
- Source implemented: late provider events cannot undo a later manual release; newer events may suppress again.
- Static verifier 8/8 PASS; P63 verifier 11/11 PASS; TS syntax 4 files, 0 diagnostics.
- PostgreSQL event/release concurrency acceptance remains unverified.

## P65 — Versioned suppression hash aliases
- Source implemented: versioned hash-alias table, backfill, API create/release, worker lookup and webhook alias creation.
- Static verifier 10/10 PASS; TS syntax 4 files, 0 diagnostics.
- Prisma/PostgreSQL/RLS/Vitest runtime acceptance remains unverified.

## P66 — Suppression key health and retirement readiness
- Source implemented: key-health API, School Admin counts panel and safe retirement/rollback runbook.
- Static verifier 9/9 PASS; P65 verifier 10/10 PASS; TS syntax 2 files, 0 diagnostics.
- Runtime API/Prisma/RLS/browser acceptance remains unverified; production key retirement not approved.

## P67 — Cross-layer suppression regression coverage
- Source implemented: shared alias helpers, API/worker reuse, cross-layer helper tests and admin key-health aggregation tests.
- Static verifier 10/10 PASS; P65 10/10 PASS; P66 9/9 PASS; TS syntax 7 files, 0 diagnostics.
- Full runtime E2E remains unverified; see P67 regression matrix.

## P68 — Final cumulative readiness review
- Static verification: 21/21 phase verifiers PASS.
- TypeScript/TSX syntax: 142 files, 0 diagnostics (transpile-only; no semantic typecheck claim).
- Consolidated gaps: 431 unique IDs; root/docs copies identical.
- Runtime tests, Prisma/PostgreSQL/RLS, Redis/BullMQ, provider sandbox and browser/mobile E2E remain NOT RUN.
- Production readiness: NOT APPROVED.

## P79 — Authenticated identity bootstrap
- Source: implemented (`GET /api/v1/auth/me`).
- Static source contract: 9/9 pass.
- API/RLS/browser/mobile runtime acceptance: pending.
- Remediation programme: `docs/REMEDIATION-ROADMAP-P79-P108.md`.
- Current gap inventory: 254 OPEN, 97 PARTIALLY_IMPLEMENTED, 111 READY_FOR_VERIFICATION, 12 BLOCKED_EXTERNAL, 0 CLOSED (474 total).

### P80 — Authentication reset completion
- Added one-time password-reset consumption, Argon2 password replacement, active-session revocation and success audit. Reset-request delivery remains unavailable until a provider adapter is selected.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P81 — Organization lifecycle transitions
- Added organization status transition API with reason validation, terminal archive behavior, school suspension/reactivation cascade, lifecycle event and audit records.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P82 — RBAC permission policy primitives
- Added deterministic exact/module-wildcard/global permission evaluation. Existing role and assignment routes remain the API implementation; delegation, cache invalidation and full negative E2E remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P83 — Subscription lifecycle policy
- Added an explicit allowed-transition policy for pending, trial, active, past-due, paused, canceled and expired subscriptions. Billing provider and reconciliation remain external/integration gaps.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P84 — Academic period validation
- Added strict date ordering and parseability invariant for academic periods. DB overlap exclusion and calendar UI/runtime integration remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P85 — Admissions capacity invariant
- Added integer-safe seat capacity calculation accounting for enrolled and reserved seats. Transactional reservation and applicant UI remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P86 — Student lifecycle policy
- Added allowed student status transitions, rejecting reactivation from completed state. Existing lifecycle route still requires DB/UI runtime acceptance.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P87 — Staff assignment overlap policy
- Added inclusive date-range overlap detection for employment/assignment constraints. Database exclusion/concurrency and HR UI remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P88 — Attendance correction policy
- Added guard requiring unlocked status, correction window and explicit approval. Device/offline and API E2E remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P89 — Timetable conflict policy
- Added teacher/room/class overlap detection for same-day slots. Constraint persistence and scheduling UI remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P90 — Accounting journal invariant
- Added balanced debit/credit validation with nonnegative, single-sided line checks. Persistent chart-of-accounts and posting/reversal flows remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P91 — Fee/payment amount invariant
- Added amount, paid and refunded bounds to prevent overpayment/refund state. Provider checkout and settlement reconciliation remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P92 — Homework late submission policy
- Added due-date comparison for submissions. Attachment scanning, grading workflow and mobile upload remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P93 — Assessment percentage calculation
- Added bounded marks calculation with deterministic two-decimal percentage output. Moderation, approval and report-card E2E remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P94 — Guardian/student privacy policy
- Added explicit three-condition guardian access decision requiring relationship, active consent and active student. Full policy middleware and portal E2E remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P95 — Notification retry policy
- Added bounded retry predicate respecting retryability and maximum attempts. Provider sandbox delivery remains blocked externally.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P96 — Transport geofence policy
- Added validated nonnegative distance/radius check. GPS provider, device simulation and alert delivery remain external/integration gaps.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P97 — Inventory stock invariant
- Added stock adjustment guard preventing negative inventory and invalid integer quantities. Stock ledger and facility UI remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P98 — Payroll net calculation
- Added bounded gross/deduction calculation with currency rounding. Statutory jurisdiction review and payroll posting remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.

### P99 — Analytics report range validation
- Added parseable ordered report date range and configurable maximum duration. Canonical metric reconciliation and query performance remain open.
- State: source foundation delivered; DB/API/UI/runtime acceptance pending.


## P100 — Student lifecycle across API, School Admin and Parent Mobile
- API: lifecycle date validation and list lifecycle dates source implemented.
- School Admin: status transition form and lifecycle history view source implemented.
- Parent Mobile: current status display and server refresh action source implemented.
- Unit/integration/E2E test creation and local runtime validation are deferred per user direction.
- P100-G001..G003 remain in the master gap register; no runtime acceptance is claimed.


## P101 — Document and Data Governance
- Source implemented: data-subject request workflow, legal holds, retention policies and review-only retention preview.
- Source implemented: consent history capture and School Admin governance workspace.
- Pending: Prisma/migration/runtime acceptance, export/erasure execution, legal approvals and jurisdiction-specific retention policy.


## P102 — White-label and Platform Operations
- Source implemented: custom domains, DNS TXT verification, domain activation and tenant host routing guard.
- Source implemented: tenant-level branding, public tenant context, public portal branding and Super Admin control-plane UI.
- Source implemented: AES-256-GCM secret vault and support-access request lifecycle with independent approval/fresh-MFA gate.
- Pending: MFA challenge completion, support-session enforcement, production DNS/TLS provisioning, secret key-ring rotation/consumer integration, Prisma/runtime/build acceptance.


## P103 — Mobile Offline-first Completion
- Source implemented: attendance mutation idempotency receipts and keyset sync cursor API.
- Source implemented: teacher offline attendance queue, retry/backoff, conflict handling and account-scoped cache/queue recovery.
- Source implemented: parent pagination page caching and persisted account identity.
- Pending: full offline write coverage, receipt cleanup, Prisma/runtime/Expo/device validation.


## P104 — PDF Accessibility and Multilingual Layouts
- Source implemented: tagged PDF/UA-1 target, logical structure tree, accessible tables/figures/artifacts and language metadata.
- Source implemented: Arabic/Hebrew bidi and ActualText, Noto script font runs, contrast-safe colors and three visual layouts.
- Source implemented: versioned language/layout template UI, PDF artifact metadata and staff download.
- Pending: Prisma migration, PDF runtime generation, veraPDF/PAC, manual screen-reader review and stale test updates.


## P105 — Production Infrastructure, Backup/Restore and Observability
- Source implemented: production secrets/env guard, Dockerfiles, Compose topology, Nginx edge and deployment workflow.
- Source implemented: encrypted PostgreSQL backup/restore, retention, Prometheus/Alertmanager/Grafana config, metrics and trace-context propagation.
- Pending: authentic pnpm lockfile, image builds, Compose runtime, Prisma migration, backup restore drill, offsite/PITR, alert delivery and production deployment.


## P106 — Cross-module Journey Foundations
- Implemented source: journey overview API and School Admin read-only workspace.
- Existing source metrics reused across admission, enrollment, attendance, report cards, fees, staff, guardians and notifications.
- Still open: accounting ledger posting, payroll, full journey runtime acceptance and deferred automated test programme.

## P107 — Security, Privacy and Operational Assurance

Source implementation added for a tenant-scoped security operations register, forced-RLS migration, audited API and School Admin workspace. Threat-model and operational guidance added. Runtime, Prisma migration, semantic typecheck/build, penetration testing, legal review and DR restore exercises remain outstanding. See `P107-STATUS.md` and `MASTER-OPEN-GAPS-REGISTER.md`.

## P108 — Final Acceptance and Zero-Gap Reconciliation

P108 static audit and evidence reconciliation are delivered. Final acceptance is NOT GRANTED: unresolved functional, verification and external-dependency gaps remain. Continue from `MASTER-OPEN-GAPS-REGISTER.md`; do not treat P108 phase completion as production approval. See `P108-ACCEPTANCE-REPORT.md`.

## P109 — Authenticated Identity Bootstrap
- School Admin `/auth/me` bootstrap: implemented at source level; runtime verification pending.
- Teacher/Parent mobile `/auth/me` bootstrap: not yet implemented; tracked in P109 gap register.

## P110 — Cross-Application Identity and Session Bootstrap
- Teacher and Parent mobile now validate the server-owned identity through `/api/v1/auth/me` on login and every successful refresh/restore path.
- Secure account email/cache namespace is updated from the authenticated API response.
- Reconnect handles definitive 401/403 revocation separately from transient offline failures.
- Pending: iOS/Android runtime, account-switch, concurrent refresh, membership revocation and offline cache acceptance. See `P110-STATUS.md` and P110 entries in the master gap register.


## P112
Backend refresh-token family tracking and authenticated session-management endpoints are implemented at source level. Prisma migration, database/API concurrency validation and runtime acceptance remain outstanding.

## P113 — Authentication Abuse Protection

Source-level implementation delivered for Redis-backed auth endpoint throttling. Login/password-forgot use account and IP dimensions; other auth endpoints use IP limits. Runtime, proxy trust, production threshold tuning and abuse alerting remain open. Refer to `P113-STATUS.md` and `docs/security/P113-AUTHENTICATION-ABUSE-PROTECTION.md`.


## P115 — Progressive Account Protection and Security Alerts
Source-level cooldown and alert-event generation implemented. External alert delivery, MFA/adaptive challenge, Redis/API runtime validation and production acceptance remain open. See `P115-STATUS.md` and `MASTER-OPEN-GAPS-REGISTER.md`.

## P116 — MFA foundation
TOTP enrollment and session step-up verification, encrypted seed storage, one-time recovery codes and a fresh-MFA platform-admin gate are implemented at source. The P116 Prisma migration and runtime acceptance remain pending. WebAuthn, universal role-based enforcement, provider delivery, biometric re-authentication and admin recovery remain open.


## P117
MFA policy evaluation and client challenge/enrollment flows are implemented at source. Central API enforcement for all protected routes and runtime verification remain outstanding. See `P117-STATUS.md`.


## P118 — Central MFA enforcement
Central MFA enforcement is implemented for routes invoking shared `authenticate()`. Complete API route inventory and runtime acceptance remain outstanding; see P118 status and master gap register.


## P120 — Resource-Level Authorization and Tenant Isolation
- Implemented: admissions read/manage permission separation; identity-context wrapping for access user lookups and organization listing; static verifier and gap documentation.
- Pending: database RLS verification, API authorization tests, cross-tenant negative tests, and complete review of all route handlers/workers.
- Tests remain deferred per project instruction; no runtime acceptance is claimed.


## P121 — Parent resource ownership
Source-level implementation delivered. Parent homework attachment flows now share strict accepted-consent and exact guardian/student ownership checks. Broader teacher authorization and runtime verification remain open.

## P122 — Teacher-to-Student Resource Authorization
- Report-card read surfaces now filter active staff identities to currently assigned class/section students.
- Artifact metadata and PDF URL issuance perform object-level assignment checks.
- Remaining: student PII, guardian details, fees, historical/substitute-teacher policy, other modules, workers and runtime cross-tenant verification.
\n## P123 — Student PII, Guardian and Fee Authorization\n- Source implementation completed; runtime validation remains pending. See `P123-STATUS.md` and `docs/api/P123-STUDENT-PII-AUTHORIZATION.md`.\n
## P124 — Attendance, Timetable and Academic Resource Authorization
- Implemented source-level attendance session date scoping, teacher-assigned student attendance-history filtering and exact academic-year/date correction-request authorization.
- Reviewed teacher self-timetable assignment/effective-date boundaries and retained administrator-only timetable configuration.
- Static verifier 19/19 PASS; changed TypeScript syntax transpilation 0 diagnostics.
- Runtime/API/database/cross-tenant acceptance remains pending; unit/API/browser/mobile test creation and execution remain deferred.


## P125 — Fees, Payments and Financial Resource Authorization
- Added granular payment-detail read and manual-payment record permissions plus a least-privilege `SCHOOL_FINANCE` role.
- Restricted payment detail projection in School Admin fee lists to `fees.payments.read`; manual payment writes require `fees.payments.record`.
- Fee charge authoring remains under `fees.manage`; parent fee access remains consent-bound.
- Refund/reversal, gateway settlement and accounting ledger remain unimplemented. Runtime validation and builds are pending; tests remain deferred.


## P127 — Accounting Ledger and Double-Entry Financial Posting
- Source implemented: school chart of accounts, monthly periods, journal entries/lines, fee charge/payment/refund posting, trial balance, period close controls, tenant RLS and immutable balanced journal constraints.
- Pending: Prisma validation, migration execution, PostgreSQL runtime verification, historical opening balances, provider settlement/bank reconciliation, credit notes and statutory finance review.
- Gap register updated; no unverified gaps closed.

## P128 — Accounting Reports, Reconciliation and Financial Workflows

- Account-wise general ledger, date filtering, daily collections/refunds and fee outstanding report APIs added.
- Internal cash-clearing source-to-ledger comparison added; not a bank statement reconciliation.
- Append-only, permission-protected journal reversal added.
- School Admin Accounting & Finance workspace added.
- P128-G001..G003 recorded; no closure claimed pending database/runtime verification.


## P129 — Historical Accounting Migration and Opening Balances
- Source implementation: complete for summarized student-level opening-balance staging, independent approval and journal posting.
- Historical charge/payment/refund transaction backfill: not implemented.
- Runtime database verification: pending.
- Unit/API/browser/mobile test creation and execution: deferred as directed.
- See `docs/api/P129-OPENING-BALANCE-IMPORT.md` and `P129-TEST-REPORT.md`.


## P130 — Historical Fee Transaction Migration and Financial Reconciliation
- Added staged tenant-scoped historical charge/payment/refund import batches with source references, student, original transaction dates, amount, currency, payment method and refund settlement evidence.
- Added independent approval, immutable approved batches, transactional/idempotent journal posting and student/currency historical receivable reconstruction.
- Added School Admin Finance workspace import, approval, posting and reconciliation views; Finance Officer approval permission is explicit and self-approval is rejected.
- Historical journals preserve original dates and are blocked by closed periods; operational fee records are not recreated or mutated.
- Added P130-G001..G003 and updated P129-G002; no gaps closed pending runtime/database verification.
- Unit/API/browser/mobile test creation and execution remain deferred as directed.


## P131 — Historical Fee Subledger Integration and Migration Completion
- Implemented explicit CHARGE → PAYMENT → REFUND source allocation references for historical operationalization.
- Implemented append-only tenant-scoped operational link table and migration.
- Implemented authorized operationalization after ledger posting; fee charges, payment allocations and settled refund/event history are materialized without duplicating accounting journals.
- Added operational linkage reconciliation endpoint and School Admin Finance controls.
- Runtime database, API, authorization, concurrency and signed financial source reconciliation remain pending. Unit/API/browser/mobile test creation and execution remain deferred as directed.


## P132 — Historical financial controls
- Optional operator-declared source control totals validated against imported rows and rechecked at independent approval.
- Added historical-to-opening balance overlap review by student and currency.
- Added School Admin controls and three P132 master gaps. Cryptographic source signatures and runtime verification remain open.


## P133 — Historical financial exception management
- Cross-batch allocation evidence, guarded API and append-only database records implemented.
- Exception scan/list/resolve workflow with audit events implemented.
- School Admin Finance workspace integration implemented.
- Cross-batch allocation consumption during operationalization remains open; no runtime readiness claim.
- Prisma/PostgreSQL validation and runtime verification pending. Unit/API/browser/mobile test creation and execution remain deferred as directed.

## P134 — Cross-Batch Historical Operationalization
- P133 full-value cross-batch PAYMENT_TO_CHARGE and REFUND_TO_PAYMENT allocations are now consumed by operationalization.
- Cross-batch targets must already be operationalized; legacy same-batch source references remain supported.
- Split allocations and dependency-graph orchestration remain open gaps P134-G002/P134-G003.
- No new database migration and no duplicate journal posting. PostgreSQL/runtime verification remains pending.


## P135 — Historical Batch Dependency Planning
- Dependency-plan API and School Admin preview delivered with topological ordering and cycle reporting.
- Multi-batch execution remains outstanding; split/partial operationalization remains unsupported by the one-to-one P131 linkage model.
- P134-G002 is PARTIALLY_IMPLEMENTED; P135-G001 is PARTIALLY_IMPLEMENTED; P135-G002 is OPEN. No gaps closed.
- Runtime PostgreSQL and production build acceptance are not claimed.

## P137 — Historical Allocation Coverage Preview
- School Admin Finance now summarizes allocation coverage per historical source row and displays allocated/source/remaining amounts.
- Amounts are aggregated in integer minor units; rows are classified as fully, partially or over allocated.
- Split payment/refund operationalization, allocation-list pagination and dependency-ordered batch execution remain open.
- Runtime database verification remains pending; unit/API/browser/mobile test work remains deferred.


## P138 — Historical Split Allocation Operationalization
- Source implementation: split payment and refund allocation slices are materialized through the P136 one-to-many mapping when the immutable allocation sum exactly covers the source row.
- Source/target balance checks, per-allocation idempotency and transaction-scoped batch lock are retained.
- Refunds targeting a historical payment that itself has multiple operational payment slices are blocked pending explicit target-slice evidence.
- Multi-batch dependency execution remains advisory.
- PostgreSQL migration/runtime verification pending; unit/API/browser/mobile test creation and execution remain deferred.
- See `docs/api/P138-SPLIT-ALLOCATION-OPERATIONALIZATION.md` and `P138-STATUS.md`.


## P139 — Dependency-Ordered Historical Batch Execution
- API now executes prerequisite batches before dependent batches, rejects cycles before mutation, isolates each batch transaction and records resumable progress.
- Existing per-batch advisory locks and idempotent operationalization detection are reused.
- School Admin Finance can execute a calculated plan and inspect completed/blocked/remaining progress.
- Runtime PostgreSQL acceptance is pending; no gaps closed.


## P140 — Refund payment-slice targeting
- Source implementation delivered; migration/runtime verification pending. See `P140-STATUS.md` and `docs/api/P140-REFUND-PAYMENT-SLICE-TARGETING.md`.


## P141 — Searchable refund payment-slice selection
- Source implementation delivered; PostgreSQL/runtime verification pending. Searchable, tenant-scoped payment-slice lookup and per-slice refundable balance visibility are available in School Admin Finance. See `P141-STATUS.md` and `docs/api/P141-SEARCHABLE-REFUND-PAYMENT-SLICES.md`.


## P142 — Refund Payment-Slice Reservation and Reconciliation
- Source delivered: shared payment-slice lock, active-refund and pending-allocation capacity enforcement, reconciliation and Finance UI updates.
- Status: partially implemented pending PostgreSQL/runtime concurrency and tenant-isolation evidence.


## P143 — Parent-visible refund status timeline
- Source implementation delivered across PostgreSQL migration/Prisma model, API, School Admin Finance UI, and Parent Mobile API/cache/UI integration.
- Runtime migration, API authorization, and device acceptance remain pending; this phase is not declared runtime-verified.


## P144 — Parent-initiated refund request

Source vertical slice added in Parent Mobile and API: payment-specific request form, consent and guardian-link checks, payment ownership, idempotency, reserved amount validation, audit/lifecycle events, offline action guard and timeline refresh. Runtime acceptance pending.

## P165–P172 closure block

Alert taxonomy and dedupe contracts added; document-scan terminal failures and refund-evidence cleanup failures emit durable operations alerts. Operations/storage/evidence remaining gaps are carried in the master register. Runtime acceptance remains pending.


## P173 — Admissions & Student Enrollment
Source implementation delivered for connected staff web/mobile workflows, admission document quarantine/scan lifecycle and capacity-aware enrollment. Runtime acceptance is deferred. Parent self-service, guardian deduplication, fee handoff, configurable rules, auto admission numbers and offer-time seat reservations remain open. See `P173-DELIVERY-REPORT.md`.

## P210 — Admissions SMS/Phone OTP deferral
- SMS/phone OTP is disabled across public request and verify endpoints.
- Applicant submission no longer requires phone verification; the phone remains a collected contact field.
- Public applicant portal and school policy UI are email-only for verification.
- Static source checks: 7/7 passed. Build/typecheck/runtime/E2E are deferred because dependencies are not installed in this environment.
- Admissions remains incomplete; P211+ gap block in the master register tracks remaining work.


## P252 — Cycle 1 roadmap baseline
- Cycle 1 basic coverage roadmap established; phase inventory is P253–P314.
- Cycle 2 deep completion explicitly deferred until Cycle 1 audit and completion.
- P252 is tracking/documentation baseline only; no active gaps closed.


## P253 — Organization & Multi-School Basic Coverage
- Organization Admin now loads organizations, selects an organization, lists its schools, and creates schools through API-connected forms.
- Existing organization onboarding API, membership discovery, tenant context, and School Admin school switcher were preserved.
- Cycle 1 basic coverage is source-complete for the listed workflows; runtime validation remains deferred.
- Cycle 2 backlog: onboarding UI, organization profile edit, school edit/deactivate/archive, lifecycle UI, duplicate-code UX, runtime tests.

## P254 — Authentication & Access Basic Coverage
- Cycle 1 status: Partial. Existing login, token refresh/rotation, session management, permission loading and MFA workflows were source-audited; forgot-password request UI was added.
- Reset-email provider and full email-driven token recovery UX remain pending. No gap closures claimed; runtime validation deferred.


## P255 — User & Staff Management Basic Coverage
- Audited existing connected staff listing/create, department/designation, status, teacher assignment, employment history and audit foundations; did not duplicate these workflows.
- Implemented basic staff profile editing in School Admin, backed by `PATCH /staff/members/:staffId`; API validates department/designation references within the current school and records a `PROFILE_UPDATED` staff audit event.
- Cycle 1 status: **Partial** (source implementation; runtime validation deferred).
- Cycle 2 backlog retained: verified account invitation/delivery, document UX and full qualifications/experience, attendance/leave/shifts, workload/payroll, advanced validation/security and tests.


## P256 — SaaS Super Admin
- Cycle 1: Partial, source implemented. Organization create, search and pagination UI now connected to existing platform endpoints.
- Existing platform dashboard and advanced backend operations retained.
- Cycle 2 pending: expanded platform operations UI and lifecycle UX.
- Runtime validation deferred; no gaps closed.

- P257: Subscription & Billing Basic Coverage — existing billing backend retained; missing organization-facing billing workspace added (plans, interval selection, subscription status/start, invoices). Static/source review recorded; runtime validation pending.


## P258 — School Settings & Configuration Basic Coverage
- Existing school profile, academic years, calendars/events, weekly working days and attendance/grading policies audited and retained.
- Added academic term selection, listing and create UI; added school-scoped GET academic terms API.
- Cycle 1: Partial; runtime verification pending. Cycle 2 advanced configuration remains backlog.

## P259 — Student Records Core
- Status: Partial (source-level audit and small basic gap implementation).
- Existing advanced student operations preserved; no deep refactor.
- Runtime/build/API/UI/mobile validation deferred.


## P260 — Guardian & Family
- Cycle 1: Partial (source-level). Existing guardian linking, directory, updates, duplicate-review, parent invitation/consent and portal security preserved. Guardian edit UI expanded to expose supported profile and relationship flags.
- Cycle 2: Deep family workflows and privacy/identity refinements pending. Runtime/build/API/browser/mobile validation deferred. No gaps closed.


## P261 — Admissions
- Cycle 1 status: Partial (source-level audit and basic DOB field gap implementation).
- Existing advanced admission flows preserved.
- Cycle 2 deep refinements pending. Runtime/build/API/browser/mobile validation deferred; no gaps closed.


## P262 — Enrollment
- Cycle 1 basic enrollment coverage: **Basic Complete (source audit only; runtime validation pending)**.
- Existing creation flow, configured section capacity checks, history, and allowed status transitions retained.
- Advanced allocation and cross-year automation remain Cycle 2.


## P263 — Student Lifecycle
- Student lifecycle transition state machine, status-change API/history, School Admin lifecycle UI, enrollment lifecycle transitions, and Parent Mobile current-status refresh foundation source-audited as basic coverage present. Runtime/API/browser/mobile validation pending; no gaps closed.

## P264 — Student Documents
- Cycle 1 status: Partial (source implementation). Student document records can be loaded in School Admin and CLEAN records can request secure 60-second download links.
- Existing private quarantine, scanner, rejection, audit, access control and photo workflows preserved. Runtime/build/API/browser/mobile validation pending; no gaps closed.
- Cycle 2: deep document governance/retention/compliance refinements pending.

## P265 — Student Operations
- **Partial — source implemented:** status filter and loaded-page CSV export added to School Admin Operational Modules workspace.
- Existing server search/pagination retained (first 50 results). Full-directory export, CSV import/preview/duplicate validation/rollback, bulk selection/actions, and runtime verification remain pending.


## P266 — Academic Structure
- Existing academic year, term, and grade-level flows retained; section-capacity configuration/list UI connected to existing API.
- Cycle 1 status: Partial, source-level.
- Runtime/build/API/browser/mobile validation deferred.
- Gaps closed: 0.


## P267 — Subjects & Curriculum
- Existing curriculum catalogue, board profile, grade, version, and subject creation coverage preserved.
- Implemented mandatory/optional subject selection in School Admin and included `isMandatory` in the subject API payload; displayed in subject listing.
- Cycle 1 status: Partial (source implementation; runtime validation pending).
- Cycle 2: subject editing/archive, board-specific rules, bulk curriculum operations.


## P268 — Timetable
- Existing persisted timetable CRUD, teacher assignments, conflict detection, rooms, CSV workflows, templates, and room alias migration retained.
- Added weekly overview for timetable slots grouped by weekday and period.
- Cycle 1 status: Partial (source implementation; runtime verification pending).
- Cycle 2: advanced scheduling optimization and deep conflict validation remain pending.
- Gaps closed: 0.


## P269 — Teacher Academic Assignment
- Added class-teacher designation and optional effective date range to the existing teacher assignment form/API payload. Expanded assignment list fields. Source validation only; runtime pending.


## P270 — Attendance
Source-level coverage extended with correction request form for recorded attendance and admin pending correction review/approve/reject panel, using existing tenant-scoped APIs and server permission checks. Static checks and archive integrity performed. Runtime/build/typecheck/API/browser/mobile/E2E verification deferred. No gaps closed.


## P271 — Attendance Reports
- Cycle 1: Partial (source implementation). Added daily class/session summary and student-level report for selected date; runtime validation pending.
- Cycle 2: Historical range trends, export, advanced analytics remain pending.


## P272 — Homework & Assignments
- Partial source implementation: School Admin submission review and basic grading UI added to existing homework workspace.
- Existing tenant-scoped APIs for assignment drafts/list/publish, parent text submissions/resubmissions, secure attachments, teacher submissions list/grade/history/reopen and consent-aware parent views retained.
- Class/section-wide assignment targeting and approval workflow remain gaps. Runtime/build/API/browser/mobile/E2E validation deferred; no gaps closed.


## P273 — Exams & Assessment
- Partial source implementation: Prisma assessment model/migration, authenticated tenant-scoped APIs for exam list/create, marks entry and publish, plus School Admin workspace.
- Validates academic year/grade ownership, exam date range, student school membership and marks maximum. Published exams are locked against marks edits.
- Roster-driven UI, report-card/result integration, advanced grading/analytics and runtime/build/API/browser/mobile/E2E validation remain OPEN. No gaps closed.


### P338 — Admission Offer Lifecycle
- API: public offer listing and accept/decline response added.
- Expiry: transaction persists EXPIRED state and releases active reservation.
- Audit: stage history + applicant notification added.
- Remaining: applicant UI and Cycle 2 runtime/build/E2E.


## P340
Admissions capacity dashboard Cycle 1 source implementation completed: year-scoped capacity KPIs and section utilization/status view. Cycle 2 runtime and full regression validation remains deferred.

## P413 — Curriculum Outcomes Administration UI
- Source implementation: completed; authenticated version/grade/subject selection, outcome filtering and listing, create form with provenance, review workflow actions and permission-gated write controls.
- Verifier: 22/22 PASS.
- Full build/typecheck/runtime/API/DB/browser/mobile/E2E acceptance remains deferred.


## P414 Curriculum Outcome Editing
- Delivered source slice: editing DRAFT/IN_REVIEW outcomes, draft-only deletion with confirmation, tenant/school and grade/subject scope validation, permission/entitlement checks.
- Focused verifier: 19/19 PASS. P411–P413 regression verifiers PASS. Parser scan 257 files/0 diagnostics.
- Runtime build/typecheck/migration/live API/DB/browser/mobile/E2E acceptance deferred. Bulk import/export, assessment mapping and official content remain open.

## P415 — Curriculum Outcomes CSV Bulk Import & Export
- Source implementation completed: template/export endpoints, filtered exports, import preview, row-level issue report, all-or-nothing commit and CSV upload/paste admin UX.
- Import checks school/version/active-grade/subject scope, duplicate codes, schema constraints and provenance; 500-row/1.5 MB caps.
- Import commits DRAFT records only.
- P415 verifier: 23/23 PASS; CSV runtime smoke: 5/5 PASS; P411-P414 regression verifiers PASS; syntax scan: 258 files, 0 diagnostics.
- Full build/typecheck, Prisma/live DB/API, browser/mobile and E2E acceptance remain deferred.


## P416 — Curriculum Outcome ↔ Assessment Mapping
- Added persisted mappings between school curriculum outcomes and school assessment exams with composite tenant/school FKs and RLS.
- API provides scoped mapping list/create/delete; create requires `academics.manage` and curriculum entitlement and enforces grade and subject alignment.
- School Admin supports viewing, adding and removing compatible assessment mappings.
- P416 verifier 26/26 PASS; P411-P415 regressions pass; parser scan 260 TS/TSX files, 0 diagnostics.
- Prisma validation/migration, full build/typecheck, live API/DB/RLS, browser/mobile/E2E remain unverified.
- P416 validation: 260 TS/TSX parser scan, 0 diagnostics; pure helper runtime smoke 5/5 PASS; compiler/typecheck blocked by missing @types/node. Prisma and live integration/runtime acceptance remain deferred.


## P417 — Curriculum Outcome Coverage & Assessment Alignment Dashboard
- Added a tenant/school/version-scoped coverage dashboard API with grade, review-status and subject filters. It aggregates mapped/unmapped/multi-mapped outcomes, mapping totals, mapped exam counts and coverage percentages.
- Grade-wise and subject-wise coverage breakdowns are included, along with exam-wise coverage for all matching school exams (including exams with zero mappings), unmapped-outcome action lists and multi-mapped outcome details. Exam query is restricted by school, outcome grade(s), and curriculum academic year when configured.
- Added the School Admin coverage dashboard integrated into the outcomes workspace, showing KPI cards, grade/subject/exam tables and unmapped/multiple-mapping action lists. Dashboard subject selection resets when version/grade/review filters change.
- Focused verifier: 24/24 PASS. Pure-function runtime smoke: 7/7 PASS. P411–P416 regression verifiers pass. TS/TSX parser scan: 262 files, 0 parse diagnostics.
- Full build/typecheck, Prisma validation/migration, live API/DB/RLS, browser/mobile and E2E acceptance remain deferred/unverified.

## P418 status
- Curriculum lesson planning: source implementation slice complete; persisted model, migration, scoped API CRUD and integrated admin UI are present.
- Focused verifier 19/19 PASS; P411–P417 regression verifiers PASS.
- Prisma/build/live API/DB/RLS/browser/mobile/E2E validation are not complete and remain open.

## P419 — Curriculum Lesson Planning Weekly Planner & Calendar
- **Source implementation complete:** existing lesson planning UI now supports Week, Month/Calendar and List modes; week/month navigation and Today; grade/subject filters; unscheduled lesson draft list; date grouping; and schedule card duration/status display.
- **P419 verifier:** 23/23 PASS.
- **Regression verifiers:** P411 15/15, P412 17/17, P415 source 23/23, P416 26/26, P417 24/24, P418 24/24 PASS. P415 CSV runtime smoke could not execute due missing TypeScript loader/dependencies in Node runtime.
- **Acceptance still open:** full typecheck/build, Prisma validation/generation, migration, live API/database/RLS, browser, mobile, E2E.

## P420 status
- Lesson-plan teacher assignment source implementation complete: persisted assignment model/migration, active teaching staff candidate endpoint, assignment read/update endpoints, school/tenant isolation, permission and entitlement checks, primary teacher selection, and Admin UI controls.
- P420 verifier: 27/27 PASS. P411–P419 source verifiers passed. TS syntax transpilation passed; dependency-backed typecheck/build and live DB/API/UI runtime remain unverified.

## P421 — Teacher Lesson Workspace
- Source implemented: authenticated teacher assigned lesson workspace API, assignment-scoped status transition endpoint, and teacher mobile lesson workspace cards/actions. P421 verifier 29/29 and changed-file syntax checks passed. Full runtime/build/typecheck/database/mobile/E2E acceptance pending.

## P422 — Teacher Lesson Reflection & Notes
- Implemented reflection records and history per assigned teacher and completed lesson.
- Mobile teacher workspace includes reflection fields for teaching notes, challenges, follow-up actions and actual duration.
- Focused verifier 30/30 PASS; API and mobile transpile 0 diagnostics.
- Runtime integration validation remains open.

## P423 — Lesson Reflection Review & Follow-up Management
- Source implementation complete: coordinator reflection review API, scoped filters, follow-up status and notes, audit data, School Admin workspace.
- Focused verifier 24/24 PASS; API and changed UI transpile without syntax diagnostics; regression verifiers P411–P422 passed.
- Runtime typecheck/build, Prisma validation/generation/migration, live DB/RLS/permission integration and E2E acceptance pending.

## P424 — Reflection Follow-up Tasks & Action Ownership
- Source implementation complete: tasks are created from a teacher reflection and assigned to the reflection author; task lifecycle, due dates, priority and coordinator controls are available. Teacher Mobile displays assigned tasks and permits status updates while online.
- P424 verifier 24/24 PASS; P411–P423 regression verifiers PASS; changed files transpile with zero syntax diagnostics.
- Runtime build/typecheck, Prisma validate/generate, migration, DB/API/RLS authorization, mobile and E2E acceptance pending.


## P425 — Follow-up Task Monitoring & Overdue Management
**Source slice delivered:** API due-bucket filters; coordinator task metrics and due-date filter; teacher/mobile due indicators. Focused verifier 20/20 PASS; changed API, Admin TSX and Teacher Mobile TSX transpile with zero syntax diagnostics. Task retrieval remains bounded (500 coordinator records/300 teacher records). Dashboard metrics reflect loaded task records, not an unbounded global total.
**Runtime acceptance pending:** full build/typecheck, DB/API/RLS, browser/mobile and E2E. Notification/reminder delivery is not implemented.

## P426 — Follow-up notifications
- Source implementation complete: notification persistence, assignment alert, inbox, mark-read, coordinator-triggered due-soon/overdue reminders, Teacher Mobile notification center.
- Automatic scheduler/push/preferences and runtime acceptance remain open.

## P427 — Automated Notification Scheduling
Source slice complete: 15-minute scheduler worker, 24-hour due-soon reminders, daily overdue notifications, school-timezone dedupe, pagination, duplicate protection, logs, graceful shutdown, package script and production Compose service. Focused verifier 18/18 PASS; worker syntax transpilation 0 diagnostics. Runtime build/typecheck, DB/RLS, migration/worker deployment and E2E pending. Push/email provider delivery, receipts, retries and preferences remain open.

## P428 — Notification Preferences & Reminder Controls
Source complete: teacher-specific reminder preference APIs and mobile toggles; coordinator school-default API; tenant-scoped policy model/migration; scheduler preference enforcement and configurable overdue cadence. Focused verifier 21/21 PASS; P426/P427 regression 26/26 and 18/18 PASS; changed TypeScript files transpile with 0 diagnostics. Coordinator default UI and live runtime/build/typecheck/database/RLS/E2E acceptance remain open.

## P429 status
Coordinator-facing school task reminder defaults UI delivered: due-soon/overdue toggles, recurrence cadence, save/refresh/reset, and academics.manage permission gate. Focused verifier 16/16 PASS; syntax diagnostics 0. Teacher individual preference aggregation and runtime validation remain open.

## P430 — Privacy-Aware Reminder Preference Summary
- Completed source implementation: coordinator aggregate preference summary API and School Admin display.
- P430 verifier: 17/17 PASS; P429 updated verifier: 27/27 PASS.
- Runtime/build/E2E and privacy/cohort validation remain open.

## P431 — Teacher cohort and privacy safeguard
- Completed: teaching-role designation filtering, linked active teacher cohort, low-count suppression (<5), coordinator UI suppression messaging.
- Focused verification: P431 15/15; P430 17/17; P429 27/27; P428 21/21; P427 18/18; P426 26/26.
- Runtime build/database/authorization/RLS/browser/mobile E2E remain open.

## P432 Reminder Policy Audit Trail
- **Source slice implemented:** immutable audit records for reminder-policy create/update/reset, permission-gated history API, coordinator UI with actor/time/action and before/after values.
- Focused verifier: 21/21 PASS; TypeScript syntax diagnostics 0.
- **Runtime acceptance remains open:** Prisma validation/client generation, PostgreSQL migration/RLS/trigger, full typecheck/build and browser/mobile E2E. Actor display-name lookup is also open.

## P433 — Reminder audit history improvements
- Source implementation complete: filter by date/action/actor ID, tenant/school-scoped cursor pagination, filtered CSV export capped at 1,000, and coordinator UI controls.
- P433 verifier 17/17 PASS; P432 21/21, P431 15/15, P430 17/17, P429 27/27, P428 21/21, P427 18/18, P426 26/26, P425 20/20, P424 24/24 passed.
- Syntax diagnostics 0 for API route and UI TSX. Full build, typecheck, DB/runtime/RLS, and E2E remain open.

## P434 — Large Reminder Audit Export Jobs
- Source slice: complete. Queued export jobs, status/download endpoints, worker, retention cleanup, and Admin UI controls implemented.
- Verification: P434 26/26; P433 17/17; P432 21/21. TypeScript syntax diagnostics 0; Compose YAML parse PASS.
- Runtime acceptance remains open: Prisma/migration, PostgreSQL/RLS, worker concurrency/recovery, full build/typecheck, and browser E2E.
- Export capacity currently capped at 50,000 audit rows per job.

## P435 — Export Job Management & Recovery Controls
- Source implementation: recent export jobs list, queued cancel, failed retry, attempt tracking, stale processing recovery after 10 minutes (retry up to 3 attempts), and Admin job controls.
- P435 verifier 21/21 PASS; P434 verifier 26/26 PASS; TypeScript transpile diagnostics 0 across routes, worker, and Admin TSX.
- Runtime migration/RLS, multi-worker recovery, full build/typecheck, and browser/mobile E2E remain open.

## P436 — Export Job Operational Observability
- Source implemented: health endpoint + Admin diagnostics card.
- Focused verifier 18/18; P435-P432 regression verifiers pass; API/TSX syntax 0 diagnostics.
- Runtime migration/database/RLS authorization, full build/typecheck, and browser/mobile E2E remain unverified.

## P437 — Export Queue Capacity & Backpressure
- Delivered: configurable active-job caps per school/requester; duplicate queued filter request suppression; HTTP 429 capacity response with retry guidance.
- **P437-G001 OPEN:** Runtime DB/API acceptance, concurrency race validation for capacity enforcement, and tenant RLS.
- **P437-G002 OPEN:** Full workspace build/typecheck and browser/mobile E2E.
- **P437-G003 OPEN:** Multi-school fairness remains global FIFO; evaluate round-robin fairness and worker scaling.
- **P437-G004 OPEN:** Validate caps against real workload and query performance; DB-level atomic enforcement is not implemented.

## P438 — Export Queue Fair Scheduling & Worker Configuration
- Delivered bounded FIFO candidate scanning and a process-local school rotation preference to reduce queue monopolization.
- Worker polling interval and school scan limit configurable and bounded. Single-job-per-cycle behavior remains.
- P438 verifier 11/11; P437–P432 regressions all pass. Runtime/load tests and full build/E2E remain open.

## P439 — Export worker concurrency
- Configurable concurrency: default 2, bounded 1–8; concurrent job processing with guarded claims.
- P439 source verifier 15/15; P438–P432 regressions 126/126 combined.
- Database race/load validation, full build, live API, and browser/mobile E2E remain unverified.
## P440 — Export worker monitoring
- Added heartbeat persistence, independent refresh timer, degraded-state tracking, and API stale-state classification (UNKNOWN/STALE).
- Admin export-health workspace now displays worker health, heartbeat age, last success, last error code, and consecutive failures.
- P440 15/15 focused; P439–P432 141/141 regression assertions; 0 syntax diagnostics. Live runtime and full build/E2E remain open.


### P441 — Export Worker Alerting
Implemented stale/degraded worker alerts and recovery notices via OperationsAlertOutbox. P441 source verifier 12/12 passed; P440–P432 regressions passed. Runtime delivery remains unverified.

## P443 — Alert Escalation Console & Lifecycle Visibility
- Completed: escalation metadata surfaced in platform alert API and Super Admin console.
- Added lifecycle filters for escalated-only and unacknowledged alerts.
- Focused verifier: 7/7. Regression verifiers P442–P432: 175/175. Total: 182/182.
- Runtime/full build/E2E validation remains open.

## P444 — Alert Acknowledgement, Assignment & Resolution
- Source implementation: acknowledgement notes, platform-alert assignment, resolution notes and durable lifecycle audit history; Super Admin UI lifecycle controls and filters.
- Focused verifier: 11/11. P432–P443 regression verifiers: 182/182. Combined: 193/193. Syntax diagnostics: 0.
- Runtime migration/API authorization, platform identity assignment validation, full build/typecheck and browser/mobile E2E remain pending.

## P445 — Alert SLA, Ownership & Follow-up Management
- Implemented active platform-admin assignment validation, SLA due dates and overdue detection, workload summaries, durable follow-up reminder records, and Super Admin UI controls. Focused verifier 11/11; P432–P444 regression scripts 193/193. Runtime and scheduled delivery verification pending.

## P446
Automated SLA reminders (60-minute window) and one-time overdue escalations are implemented in the worker using durable markers and outbox events. Source verifiers pass; runtime/integration validation remains open.

## P447 — Alert automation policy reliability
- Source implemented and verifier-backed (12/12 focused; 228/228 regression assertions across P432–P447). Live database/provider/build/E2E checks remain pending.

## P448 — Alert Policy Management, Recipient Routing & Recovery
- Source implementation complete: persisted severity routing policy endpoints, recipient validation, bounded values, audit, and Super Admin JSON editor. Focused verifier 14/14; route and UI syntax diagnostics 0. Stored policy is not yet consumed by SLA automation worker.

## P449 — Alert Policy Execution
- Implemented: persisted policy consumption, per-severity SLA thresholds, recipient-aware outbox payloads, policy version metadata, safe defaults, disabled-policy handling.
- Source-level verifiers pass; runtime DB/webhook/full E2E validation remains outstanding.

## P450 — Alert Delivery Routing & Recipient Notification Integration
- Source implemented: recipient fan-out, recipient-specific dedupe keys, recipient delivery metadata, independent outbox retry records.
- P450 focused verifier 14/14; P449 and P448 verifiers 14/14 each; P445 verifier 11/11; worker syntax diagnostics 0.
- Live provider, database/concurrency, full build/typecheck and browser/mobile E2E validation remain open.

## P451 — Notification channel preferences
- Implemented persisted channel preferences and recipient opt-in filtering for WEBHOOK alert delivery. IN_APP/EMAIL preferences are modeled but adapters remain unimplemented.
- Focused verifier 18/18; P450 updated verifier 14/14; P449 and P448 14/14 each. Syntax diagnostics: 0.
- Runtime/provider/build/E2E verification remains open.

## P452 — In-App Notification Inbox Pagination & Grouping
Source implementation completed: existing communications inbox supports cursor paging, unread count, and optional category grouping. Static verifier 10/10 PASS. Runtime test, full build, DB/API, and browser/mobile E2E are not verified.


## P580 — Documentation Consolidation & Docker Runtime Foundation

Four canonical documents now live at repository root: `SCHOOL-SaaS-FEATURE-CATALOG.md`, `SCHOOL-SaaS-ROADMAP.md`, `MISSED-FUNCTIONALITY-BACKLOG.md`, and `SCHOOL-SaaS-FEATURE-GAPS.md`. Local Docker configuration: `docker-compose.local.yml` and `DOCKER-LOCAL-QUICKSTART.md`. Runtime acceptance is pending.
