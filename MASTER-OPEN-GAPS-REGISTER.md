# School Management SaaS — Feature-wise Complete Gap Matrix

**Source baseline:** P579 cumulative master gap ledger, updated with P580 additions.  
**P579 ledger records preserved:** 2310 (including 2261 ID-bearing lines and 49 unnumbered open rows).  
**P579 open checkbox entries:** 729.  
**P580 new gaps:** 8.  
**Current open checkbox total:** 737.

This is the consolidated feature/functionality-wise gap register. It includes all original ID-bearing gap records (open, partial, ready-for-verification, blocked and other tracked states) plus every unnumbered open checkbox entry. Source descriptions and status wording are preserved verbatim. The category assignment is keyword-assisted; it does not mean every item in a category is wholly unimplemented. A gap may represent a missing workflow, partial functionality, integration, hardening, test, migration, runtime evidence or independent acceptance. No gap is closed by this reorganization.

## Category counts

| Feature / functionality area | Ledger records |
|---|---:|
| Platform SaaS, tenants, organizations and licensing | 302 |
| Identity, authentication, sessions and RBAC | 453 |
| School onboarding, configuration and campuses | 51 |
| Academics, boards and curriculum | 125 |
| Timetable, rooms and scheduling | 83 |
| Admissions and applicant lifecycle | 163 |
| Student records and lifecycle | 87 |
| Parent, guardian and family portal | 103 |
| Attendance and daily operations | 21 |
| Homework, teaching, assessments and report cards | 26 |
| Staff, HR, leave and payroll | 42 |
| Fees, finance, accounting and procurement | 183 |
| Communications, notifications and messaging | 78 |
| Documents, privacy and governance | 142 |
| Health, wellbeing and medical records | 9 |
| Canteen, meals and nutrition | 8 |
| Library and learning resources | 13 |
| Transport, drivers and vehicles | 15 |
| Hostel and residential operations | 2 |
| Mobile apps and offline synchronization | 119 |
| Reporting, analytics and exports | 5 |
| Integrations and external providers | 36 |
| Database, migrations and data integrity | 77 |
| Build, dependencies and developer tooling | 44 |
| Security, audit and compliance | 13 |
| Testing, acceptance and quality assurance | 43 |
| Operations, observability and disaster recovery | 17 |
| Cross-cutting / needs manual classification | 50 |

## All gaps by feature / functionality

### Platform SaaS, tenants, organizations and licensing (302)

- [ ] P00-G012 — Custom domains and white-label tenant routing — OPEN
- [ ] P02-G003 — Implement membership-aware organization/school authorization lookup — OPEN
- [ ] P02-G005 — Enable PostgreSQL RLS on tenant-owned tables and add missing-context/cross-tenant tests — OPEN
- [ ] P02-G006 — Add composite constraint proving SchoolMembership school belongs to its organization — OPEN
- [ ] P02-G015 — Add tenant-isolation and authorization penetration/security test suite — OPEN
- [ ] P03-G001 — Add a first-class tenant lifecycle status column and validated transition state machine on Organization — IN_PROGRESS (P81 authorized transition endpoint and lifecycle audit implemented; global enforcement across every route/worker remains)
- [ ] P03-G002 — Provision initial organization owner and school administrator during tenant onboarding — OPEN
- [ ] P03-G003 — Enforce tenant suspended/deactivated state across every tenant API, worker and scheduled job — OPEN
- [ ] P03-G010 — Add tenant-level status metrics that distinguish current state from historical lifecycle events — OPEN
- [ ] P04-G002 — Execute RLS missing-context and cross-tenant read/write denial tests using non-owner API DB role — READY_FOR_VERIFICATION
- [ ] P04-G004 — Add organization lifecycle enforcement to all API routes, background workers and scheduled jobs — OPEN
- [ ] P04-G005 — Extend RLS to Organization, AuditLog and every future tenant-owned table with safe platform-admin path — OPEN
- [ ] P04-G007 — Add organization owner transfer and additional owner/admin management workflows — OPEN
- [ ] P04-G010 — Add organization/school end-to-end onboarding and switching tests — OPEN
- [ ] P05-G007 — Enforce plan entitlements and usage limits in all module APIs, UI and background jobs — OPEN
- [ ] P05-G014 — Verify billing RLS with non-owner DB role and cross-tenant negative tests — READY_FOR_VERIFICATION
- [ ] P06-G002 — Execute two-tenant/two-school RLS positive and negative tests with non-owner DB role — READY_FOR_VERIFICATION
- [ ] P06-G004 — Connect School Admin configuration preview to authenticated APIs, tenant/school selection and persisted form state — OPEN
- [ ] P06-G011 — Enforce plan entitlements and feature limits across all school configuration mutations — OPEN
- [ ] P07-G002 — Execute cross-tenant RLS and authorization-negative tests using non-owner DB role — READY_FOR_VERIFICATION
- [ ] P07-G010 — Add curriculum setup end-to-end tests and tenant-isolation regression suite — OPEN
- [ ] P07-G013 — Enforce curriculum entitlement and usage limits across every curriculum API and background process — OPEN
- [ ] P08-G002 — Execute cross-tenant RLS and school authorization-negative tests with non-owner DB role — READY_FOR_VERIFICATION
- [ ] P09-G003 — Execute tenant RLS and composite-FK negative tests for all admissions tables — READY_FOR_VERIFICATION
- [ ] P09-G016 — Add entitlement and school-level feature/usage enforcement to every admissions endpoint — OPEN
- [ ] P10-G003 — Execute cross-tenant RLS and composite-FK negative tests for all P10 tables — READY_FOR_VERIFICATION
- [ ] P10-G015 — Enforce staff entitlement, staff-count limits and assignment limits across all entry points — OPEN
- [ ] P11-G003 — Execute role/permission and tenant RLS integration tests using non-owner DB role — READY_FOR_VERIFICATION
- [ ] P11-G009 — Enforce organization-level role administration and delegated access administration — OPEN
| P12-G003 | RLS policies not exercised with production-like app role and cross-tenant tests | OPEN | automated positive/negative RLS tests |
| P12-G004 | Attendance entitlement checks are implemented in mutation authorization paths but have not been proven across every route | OPEN | route-by-route entitlement integration tests |
| P13-G004 | Entitlement coverage not verified endpoint-by-endpoint | OPEN | route authorization integration matrix |
| P13-G005 | RLS has not been tested with production-like application DB role | OPEN | positive and cross-tenant negative tests |
| P14-G002 | Roster API has not been exercised under PostgreSQL RLS and real admin memberships | OPEN | API integration and cross-tenant tests |
| P15-G003 | Teacher roster endpoint not tested against real RLS and membership data | OPEN | API integration and cross-tenant tests |
| P17-G001 | Membership discovery endpoint not exercised against PostgreSQL RLS policies | OPEN | positive and cross-tenant negative integration tests |
- [ ] P18-G003 — Execute forced-RLS cross-tenant tests for timetable slots using non-owner DB role.
| P19-G006 | New update/bulk/export APIs have not been exercised against PostgreSQL/RLS | OPEN | API integration and cross-tenant negative tests |
| P21-G003 | School Admin timetable editor uses manual bearer token and tenant IDs rather than shared auth context | OPEN | global auth/tenant integration and browser E2E |
| P22-G003 | PostgreSQL triggers serialize room/slot/exception room writes, block code changes while referenced, block deactivation while active references exist and reject missing/inactive room references; migration not applied or tested | OPEN | apply migration and verify under app DB role with tenant RLS context |
| P22-G006 | School Admin timetable workspace still uses manually entered bearer token and tenant identifiers | OPEN | shared authenticated app shell integration and browser E2E |
| P23-G004 | P24 adds active membership discovery, organization/school selection and academic-year picker to attendance/timetable workspaces; runtime RLS verification remains pending | PARTIALLY_IMPLEMENTED | execute membership and academic-year isolation tests against PostgreSQL |
| P24-G002 | Membership discovery endpoint and academic-year picker source added; PostgreSQL RLS and lifecycle edge cases not executed | READY_FOR_VERIFICATION | API integration tests for active/inactive memberships, school lifecycle and cross-tenant isolation |
| P25-G008 | School Admin login, membership switching, permission refresh, attendance and timetable have no Playwright E2E | OPEN | browser E2E with positive/negative permission cases and tenant switching |
| P25-G009 | PostgreSQL RLS, timetable triggers, audit immutability and cross-tenant behavior remain unverified under non-owner application role | OPEN | database integration suite using production-like role grants |
| P27-G008 | Prisma validation, PostgreSQL migration/RLS and cross-tenant tests not run | READY_FOR_VERIFICATION | clean database migration and non-owner role integration evidence |
| P27-G009 | Several workflows still accept raw school-scoped IDs (teacher assignment, role assignment); no searchable selectors | PARTIALLY_IMPLEMENTED | add school-scoped pickers and verify identifiers cannot cross tenant boundaries |
| P28-G011 | Curriculum subject/grade/version relationships and enrollment/pickup UI have only source-level validation; cross-tenant and invalid-ID cases not exercised | OPEN | API integration tests proving tenant boundary enforcement and validation behavior |
| P30-G002 | P31 provisions parent school membership/role and parent-scoped APIs after consent; broader portal features and runtime tests remain | PARTIALLY_IMPLEMENTED | runtime parent role/membership provisioning, cross-tenant guardian-linked isolation and prioritized portal feature acceptance |
| P30-G003 | Parent invitation acceptance, consent notice display, withdrawal, membership provisioning and single-use locking source implemented; PostgreSQL/RLS race tests not run | READY_FOR_VERIFICATION | concurrent acceptance and negative lifecycle tests under non-owner DB role |
| P30-G004 | S3-compatible presigned POST/GET source implemented; bucket, IAM, encryption, public-access block, lifecycle and endpoint configuration are deployment responsibilities | READY_FOR_VERIFICATION | provision private bucket and verify access posture, URL expiry, size policy and object lifecycle |
| P31-G002 | Parent delivery worker and scanner worker use transaction-local RLS GUC policies; no dedicated non-owner worker DB credential has been provisioned or tested | OPEN | provision separate least-privilege worker credentials, prove SELECT/UPDATE scope and deny API-role worker access |
| P31-G003 | Invitation acceptance provisions organization/school membership and PARENT role after password/token/consent checks; idempotent seed and PostgreSQL transaction not run | READY_FOR_VERIFICATION | seed clean DB, test new/existing account, rollback, concurrent acceptance and role/membership correctness |
| P31-G004 | Parent school/student/attendance APIs enforce consented guardian links and parent permissions; no API integration or cross-tenant negative tests run | READY_FOR_VERIFICATION | integration tests for sibling/multiple guardian, other-school student, revoked consent, inactive guardian and permission denial |
| P31-G006 | Consent withdrawal stores timestamp/audit, leaves organization/school membership and removes PARENT assignment while preserving school-managed communication preferences; rollback/audit runtime not tested | READY_FOR_VERIFICATION | PostgreSQL transaction tests and verify access denial immediately after withdrawal |
| P33-G008 | Five new Prisma models and forced tenant RLS migration have not been validated/applied | READY_FOR_VERIFICATION | Prisma validate/generate, clean migration, rollback and non-owner RLS tests |
| P33-G009 | Parent authorization, cross-student/tenant denial, notification fan-out and read receipt integration tests not executed | READY_FOR_VERIFICATION | API integration tests for unrelated student, sibling, revoked consent, inactive guardian, wrong recipient and cross-tenant IDs |
| P34-G007 | New operator list/publish APIs use membership and granular permission guards plus tenant context, but no runtime cross-tenant/RLS/negative authorization tests were run | READY_FOR_VERIFICATION | API tests under non-owner DB role for missing permission, inactive membership, cross-tenant IDs and audit events |
| P38-G004 | Parent report PDF endpoint checks accepted consent and communications-enabled guardian link; cross-tenant and consent withdrawal runtime cases untested | READY_FOR_VERIFICATION | non-owner PostgreSQL/API tests for linked/unlinked child, withdrawn consent and wrong tenant |
| P39-G003 | P40 adds tenant-scoped academic-year/grade/board lookups and structured subject/component editor with mark-total preview; schema diff/clone and full browser acceptance remain absent | PARTIALLY_IMPLEMENTED | add version diff/clone/preview and browser tests |
| P39-G004 | P40 adds multi-page A4, brand colour, footer, signature label and text verification code; multilingual fonts, RTL, logo, QR verification and PDF accessibility remain absent | PARTIALLY_IMPLEMENTED | add licensed fonts, RTL, QR verification and accessible tagged PDF |
| P41-G004 | Notification worker has narrow GUC RLS policies, but worker DB role grants and cross-tenant isolation have not been verified | READY_FOR_VERIFICATION | test dedicated non-owner/non-BYPASSRLS role against allowed and denied tables/operations |
| P42-G005 | P43 adds tenant-scoped quarantine/scanning/promotion for private school logos and named immutable report-card template versions; replaced-logo retention and visual editor remain open | PARTIALLY_IMPLEMENTED | add logo history/retention controls and visual template editor after retention/legal decisions |
| P45-G002 | Delivery/bounce/complaint events are idempotently persisted and chronologically reconciled in source; PostgreSQL transaction, uniqueness and RLS behavior not tested | READY_FOR_VERIFICATION | apply migration and run concurrent duplicate, out-of-order, cross-tenant and worker-role tests |
| P45-G003 | Bounce/complaint terminal states exist; suppression list, complaint policy, tenant-local suppression review and remediation workflow remain absent | OPEN | define policy and implement auditable suppression lifecycle with tenant isolation |
| P48-G002 | P45–P47 webhook, suppression, audit and worker PostgreSQL/RLS acceptance remains unrun | OPEN | Apply all migrations on disposable PostgreSQL and test tenant isolation, duplicate/out-of-order webhooks, worker pre-send, API serialization and concurrent create/release under non-owner role |
| P50-G004 | P45–P49 notification tenant RLS/worker integration, Arabic RTL PDF and retention/legal-hold gaps remain open | OPEN | Execute P49 acceptance plan; separately select/validate shaping stack and approve retention policy |
| P51-G004 | Tenant RLS/worker acceptance, RTL/tagged PDF, retention/legal-hold and full application E2E remain unresolved | OPEN | Execute P49 acceptance plan and close each linked gap with runtime evidence |
| P52-G002 | PostgreSQL concurrent webhook delivery, transaction atomicity and cross-tenant RLS remain unverified | OPEN | Execute concurrent signed webhook tests against disposable PostgreSQL and non-owner role |
| P53-G004 | Tenant RLS, RTL/tagged PDF, retention/legal-hold, provider-native webhook and full application acceptance remain unresolved | OPEN | Carry forward all P00–P52 evidence requirements |
| P54-G004 | All prior tenant RLS, RTL/tagged PDF, retention/legal hold, and full system E2E gaps remain open | OPEN | Carry forward unresolved P00–P53 gaps and require runtime evidence |
| P55-G004 | Provider-native adapter, tenant RLS, RTL/tagged PDF, retention/legal hold and full app E2E remain unresolved | OPEN | Carry forward all unresolved P00–P54 gaps and close with evidence |
| P56-G004 | Provider-native adapter, tenant RLS, RTL/tagged PDF, retention/legal hold and full application E2E remain unresolved | OPEN | Carry forward unresolved P00–P55 gaps |
| P57-G001 | School suppression list now uses tenant-scoped keyset pagination and bounded audit retrieval; PostgreSQL query plan not measured | READY_FOR_VERIFICATION | Apply migration, run EXPLAIN ANALYZE at representative scale and verify cursor continuity under concurrent inserts/releases |
| P58-G001 | Release endpoint now uses conditional tenant/status updateMany and writes audit only for the winning transition; PostgreSQL race not executed | READY_FOR_VERIFICATION | Run concurrent release tests and prove one state transition and one audit row |
| P59-G003 | Authenticated suppression mutation rate limits and tenant RLS/API integration remain untested in runtime | OPEN | Run multi-user/multi-school API tests against Redis/PostgreSQL non-owner role |
| P60-G004 | Provider-native adapter, tenant RLS, RTL/tagged PDF, retention/legal hold and full system E2E remain unresolved | OPEN | Carry forward unresolved P00–P59 gaps |
| P62-G004 | Provider-native adapter, tenant RLS, rate-limit runtime, RTL/tagged PDF, retention/legal hold and full E2E remain unresolved | OPEN | Carry forward unresolved P00–P61 gaps |
| P63-G001 | Worker now persists recipient HMAC/version before provider send; webhook creates school-local BOUNCE/COMPLAINT suppression and audit in tenant transaction; runtime tests not run | READY_FOR_VERIFICATION | Run worker/webhook PostgreSQL integration tests for actual recipient hash, suppression creation, audit atomicity and tenant isolation |
| P65-G004 | Provider-native adapter, tenant RLS, rate-limit runtime, RTL/tagged PDF, retention/legal hold and full E2E remain unresolved | OPEN | Carry forward unresolved P00–P64 gaps |
| P66-G001 | Permission-gated key-health endpoint and School Admin counts UI added; runtime Prisma/API/browser acceptance not run | READY_FOR_VERIFICATION | Run key-health API tests, tenant isolation and browser access tests; prove response contains no hash/email/secret values |
| P68-G001 | P47–P67 source/static verification is green, but Vitest, Prisma migration, PostgreSQL/RLS, Redis/BullMQ, provider sandbox and browser/mobile E2E have not been executed in this workspace | OPEN | Run CI and integration acceptance on provisioned services; retain logs, test reports and non-owner RLS evidence |
| P68-G003 | Arabic RTL shaping, licensed multilingual fonts and tagged/accessibility PDF acceptance remain incomplete | OPEN | Implement maintained bidi/shaping and tagged PDF output; verify extraction, visual rendering and accessibility across target locales |
| P69-G004 | TypeScript/Vite/Vitest/Prisma and PostgreSQL/Redis runtime acceptance remain unexecuted | READY_FOR_VERIFICATION | Run package typechecks, builds, tests, Prisma checks and integration suites in provisioned CI |
| P70-G001 | Added catalog audit for tenant-scoped table RLS coverage; PostgreSQL execution has not been performed | READY_FOR_VERIFICATION | Run P70 catalog SQL after clean migration deployment and resolve every reported table |
| P70-G003 | Tenant-context unit test source added for transaction-local GUC setup; Vitest and pooled connection tests not run | READY_FOR_VERIFICATION | Run Vitest plus PostgreSQL pool reuse, rollback and cross-tenant isolation tests |
| P70-G004 | Policy expression correctness, worker service-context least privilege and request-path separation remain unverified | OPEN | Execute two-tenant behavioral RLS tests and worker privilege-boundary tests using non-owner roles |
| P72-G003 | Verified payment webhook events are still not reconciled atomically to PaymentAttempt, BillingInvoice and subscription entitlements | OPEN | Implement provider-neutral normalized event service with transactional state transitions and audit |
| P76-G001 | Font manifest/license retention and RTL fail-closed guard added; PDFKit tests not run | READY_FOR_VERIFICATION | Run PDF generation tests and verify license manifest in packaged distribution |
| P79-G002 | Membership and role/permission queries require production RLS acceptance using non-owner credentials | READY_FOR_VERIFICATION | Run two-user/two-tenant identity-context tests and pooled connection reuse tests |
| P79-G003 | Web/mobile session bootstrap and organization/school context selection E2E are not implemented | OPEN | Integrate /auth/me into web/mobile session startup and verify switching, revoked membership and permission refresh end to end |
| P101-G001 | Governance Prisma models and tenant RLS migration authored; Prisma validation and PostgreSQL migration execution not performed | READY_FOR_VERIFICATION | Validate Prisma, apply migration on clean/upgraded PostgreSQL and verify forced RLS with non-owner role |
| P102-G001 | Custom-domain registry, hashed DNS TXT ownership challenge, verification and activation source implemented; DNS runtime and host routing acceptance pending | READY_FOR_VERIFICATION | Verify TXT success/failure, lifecycle, active-host mapping and cross-tenant host/path isolation in PostgreSQL/API runtime |
| P102-G002 | Tenant branding API, Super Admin editor and public portal tenant-context rendering source implemented; remaining app shells and browser acceptance pending | PARTIALLY_IMPLEMENTED | Integrate branding into organization/school/parent/teacher experiences and verify responsive runtime rendering |
| P102-G003 | Platform secrets vault stores AES-256-GCM ciphertext and redacts plaintext; key provisioning, key-ring rotation and consuming-service integration remain incomplete | PARTIALLY_IMPLEMENTED | Provision production key outside source control, implement multi-key rotation, wire approved consumers and verify tamper rejection/non-disclosure |
| P102-G005 | DNS ownership proof is implemented, but CNAME/edge routing, managed TLS certificate provisioning/renewal and production domain operations are deployment dependencies | BLOCKED_EXTERNAL | Configure hosting/DNS provider, TLS issuance/renewal and edge routing; retain provider/production verification evidence |
| P103-G002 | Authorized keyset attendance audit change-feed cursor API authored; pagination and authorization runtime checks pending | READY_FOR_VERIFICATION | Verify stable ordering, duplicate timestamps, changes during paging, hasMore/nextCursor and assigned-class/tenant isolation |
| P104-G003 | Noto script font runs added for listed Indic/SE Asian scripts; mixed RTL+Indic, other RTL and CJK are deliberately unsupported | PARTIALLY_IMPLEMENTED | Complete language coverage plan, add licensed font/shaping assets and validate mixed-script fallback before enabling more locales |
| P105-G012 | TLS certificate issuance/renewal, external WAF and production provider egress credentials remain deployment-specific | BLOCKED_EXTERNAL | Provision certs, renewal automation, WAF policy and provider credentials in the target environment |
| P106-G001 | Tenant-scoped read-only journey overview API and School Admin workspace authored for admission→enrollment, attendance→report-card and parent→mobile; runtime journey acceptance not performed | READY_FOR_VERIFICATION | Verify all journey metrics against seeded source records, browser workflow and cross-tenant negative cases |
| P106-G004 | Five journey summaries are not full E2E acceptance; API/UI/mobile runtime and seeded multi-tenant negative validation are deferred by user direction | READY_FOR_VERIFICATION | Complete deferred test programme and retain Playwright/mobile/device and cross-tenant evidence |
| P107-G001 | Tenant-scoped security operations register API/UI covers security risks, incidents, compliance evidence and disaster-recovery actions; source verifier passes, but runtime and authorization acceptance are deferred | READY_FOR_VERIFICATION | Apply migration, verify role permissions, tenant isolation, audit records, validation and lifecycle updates on PostgreSQL/API/browser |
| P109-G001 | School Admin now validates the bearer session through `/api/v1/auth/me` before loading tenant school memberships; runtime/session-revocation acceptance remains deferred | READY_FOR_VERIFICATION | Verify valid, expired, revoked and inactive-user sessions; confirm identity email comes from API and membership loading is blocked on failed identity bootstrap |
| P117-G002 | Central MFA policy enforcement is now applied inside the shared authenticate middleware for platform administrators and configured role keys; only identity and MFA bootstrap routes are exempt. Runtime and complete route-coverage verification remain outstanding | READY_FOR_VERIFICATION | Inventory every protected API route and verify direct API requests are denied before enrollment or when the five-minute MFA freshness expires; verify bootstrap exemptions and role assignments |
P117 adds role-key policy evaluation and client-side gating. Platform administrators remain required by default. Additional role keys are configured as a comma-separated list in `MFA_REQUIRED_ROLE_KEYS`. The API status response reports policy reasons, enrollment requirement, challenge requirement and five-minute freshness. Client gating is not a substitute for server-side route enforcement; P117-G002 remains OPEN. No universal server-side enforcement or production acceptance is claimed.
| P119-G002 | Authentication middleware, admissions permissions, identity RLS lookups, parent ownership, teacher report-card class scoping, and P123 student PII/guardian/document assignment scoping have targeted source remediations; complete permission consistency and tenant isolation for all handlers remain unproven | OPEN | Continue handler-by-handler authorization review for membership, scoped permission, resource ownership, tenant context, worker/service paths and deny-by-default behavior; validate cross-tenant denial using a non-owner DB role |
| P120-G002 | Access member/assignment user lookups and organization listing now execute under the authenticated user's identity RLS context rather than an unscoped Prisma client call | READY_FOR_VERIFICATION | Validate user-row RLS policies and verify membership-derived user lookups work only for the authenticated identity; test with a non-owner database role
| P120-G003 | P120 remediates selected permission and identity-context gaps, but full resource ownership, tenant predicate and alternate service-path review across all 22 route files remains incomplete | OPEN | Complete handler-by-handler authorization review, including object-level ownership, tenant context, worker/service paths and cross-tenant negative validation; retain route-level evidence
| P121-G002 | Parent portal child and operational data endpoints use consented guardian/student links; source review confirms exact student scoping for attendance, fees, homework, submissions and report cards | READY_FOR_VERIFICATION | Validate each parent endpoint with linked and unlinked child accounts and consent withdrawal, including cross-tenant negative cases |
| P126-G002 | Refund event history is append-only by PostgreSQL trigger and tenant-scoped with composite foreign keys; migration/runtime enforcement is not yet exercised | READY_FOR_VERIFICATION | Apply migration on clean and upgraded databases; prove UPDATE/DELETE fail for refund events and tenant RLS blocks cross-school reads/writes |
| P127-G001 | Added school-scoped chart of accounts, monthly accounting periods, immutable journal entries/lines, database-enforced balanced-entry validation, fee-charge/payment/refund posting hooks, journal listing, trial balance, account-wise general ledger, daily collection/refund summary, student fee-outstanding reconciliation and internal cash-clearing source-to-ledger comparison | READY_FOR_VERIFICATION | Validate Prisma schema/client generation and migration on clean/upgraded PostgreSQL; prove tenant RLS, append-only triggers, period-close rejection, source idempotency, debit-credit equality and trial-balance totals with a non-owner DB role |
| P129-G001 | Added tenant-scoped student-level opening balance batches with source references, currency/as-of date, separate approval, audit events and balanced net receivables/opening-equity journal posting | READY_FOR_VERIFICATION | Validate Prisma schema/client and migration; prove RLS, composite tenant FKs, draft-only row mutation, approval separation, posting idempotency, closed-period rejection and gross student allocation reconciliation on PostgreSQL |
| P130-G001 | Added tenant-scoped staged historical CHARGE, PAYMENT and externally evidenced REFUND rows; independent approval; immutable batch posting to original-date journals; student/currency reconstruction endpoint and School Admin workflow | READY_FOR_VERIFICATION | Validate Prisma schema/migration and API build; execute PostgreSQL RLS/trigger tests; verify original-date posting in open periods, closed-period rejection, duplicate/idempotent posting, transaction rollback, cross-school denial and source totals against signed legacy records |
| P131-G001 | Added explicit historical payment-to-charge and refund-to-payment source references; added append-only tenant-scoped operational link records; added approved, posted batch operationalization that materializes fee charges, payment allocations and settled refund/event histories without reposting accounting journals; added School Admin controls and linkage reconciliation | READY_FOR_VERIFICATION | Validate Prisma schema/client, migration, RLS, composite FKs, append-only link trigger, authorization, transactional rollback, idempotency, concurrent requests, charge/payment/refund amount limits, fee status calculations and historical journal-to-operational subledger totals on PostgreSQL |
| P131-G003 | P133 adds tenant-scoped append-only cross-batch PAYMENT_TO_CHARGE and REFUND_TO_PAYMENT allocations with student/currency/date/type and over-allocation guards, plus a persisted historical exception queue and one-way audited resolution; operationalization still consumes same-batch source references only | PARTIALLY_IMPLEMENTED | Integrate cross-batch allocation resolution into operationalization and full historical subledger reconstruction; verify allocation concurrency and exception governance on PostgreSQL |
| P132-G001 | Historical import batches can store optional operator-declared charge/payment/refund control totals; creation validates exact minor-unit equality and independent approval rechecks totals; control reconciliation endpoint reports missing/mismatched declarations | READY_FOR_VERIFICATION | Validate migration and Prisma client; verify totals on PostgreSQL, tampered row rejection at approval, concurrent approvals, tenant isolation and finance source-document sign-off |
| P133-G001 | Cross-batch allocation and historical exception workflow implemented with tenant RLS, append-only allocation/event records, allocation ceilings, endpoint row locks and finance resolution workflow | READY_FOR_VERIFICATION | Validate Prisma schema/client and PostgreSQL migration; verify RLS, composite FKs, append-only triggers, allocation concurrency/over-allocation, tenant isolation and one-way exception resolution |
| P134-G001 | P134 operationalization consumes P133 PAYMENT_TO_CHARGE and REFUND_TO_PAYMENT allocations, validates full-value single-target allocations, matching student/currency/date and posted target batches, requires external target operational links, and avoids reposting accounting journals | READY_FOR_VERIFICATION | Validate Prisma client and PostgreSQL; execute same-batch and cross-batch charge/payment/refund flows, rollback, retry/idempotency, tenant isolation, allocation concurrency, amountPaid/refund status and journal-to-operational reconciliation |
| P134-G002 | P135 added dependency planning; P139 adds dependency-ordered batch execution with a transaction-scoped advisory lock per batch, independent commits, audited progress and retry/resume behavior | PARTIALLY_IMPLEMENTED | Verify concurrent orchestration, failure/retry behavior, cycle handling, rollback and tenant isolation on PostgreSQL |
| P135-G001 | Added tenant-scoped operationalization dependency planning with prerequisite expansion, deterministic topological ordering, cycle reporting and School Admin visibility; this is a preview and does not execute batches automatically | PARTIALLY_IMPLEMENTED | Implement transactional multi-batch orchestration with batch-level locks, resumable failure handling, idempotent retries and PostgreSQL runtime verification |
| P135-G002 | P133 persists multiple partial allocation records, and P135 exposes dependency planning, but P136 adds a tenant-scoped one-to-many allocation-to-operational-record persistence model; P138 now consumes the one-to-many mapping for fully covered split payment/refund source rows; runtime verification and ambiguous refunds against a split target payment remain | PARTIALLY_IMPLEMENTED | Verify split payment/refund materialization and source/target remainders on PostgreSQL; implement refund-to-specific-payment-slice selection when the target historical payment is itself split |
| P136-G001 | Added a separate tenant-scoped one-to-many mapping from each immutable historical allocation to its operational charge and one operational payment/refund, with unique materialization, composite tenant FKs, positive amount/shape checks and forced RLS; legacy P131 links remain intact | PARTIALLY_IMPLEMENTED | Apply migration on PostgreSQL; validate Prisma schema/client; integrate mapping into operationalization for split payment/refund allocations; verify exact source/target totals, rounding, concurrency, idempotency, rollback and tenant isolation |
| P136-G002 | P139 adds topological multi-batch orchestration with independent per-batch transactions, advisory locks and resumable retries | PARTIALLY_IMPLEMENTED | Verify dependency ordering, concurrent requests, failure isolation, resume and tenant isolation on PostgreSQL |
| P137-G001 | School Admin Finance now groups immutable allocations by source historical row, totals amounts in integer minor units, and displays fully allocated, partially allocated, or over-allocated status plus remaining amount | PARTIALLY_IMPLEMENTED | Validate API payload behavior with real tenant data, handle pagination beyond the 1,000-row allocation endpoint limit, and verify source totals against PostgreSQL |
| P137-G002 | P136 one-to-many allocation-link model is not yet consumed by operationalization; split payment/refund records are not materialized | OPEN | Verify split materialization, source/target balance reconciliation, idempotency, rollback and tenant-safe retries on PostgreSQL; handle refunds targeting a multi-slice payment explicitly |
| P138-G001 | Operationalization now consumes every fully covering PAYMENT_TO_CHARGE or REFUND_TO_PAYMENT allocation slice and creates a separate operational payment/refund with a P136 allocation-link row; source totals must equal the historical source amount and over-allocation remains blocked | PARTIALLY_IMPLEMENTED | Validate migration, Prisma client and full payment/refund split flows on PostgreSQL; reconcile allocation/source/target totals, amountPaid, refund status, rollback, idempotency, concurrency and tenant isolation |
| P138-G002 | P140 adds targetOperationalPaymentId to refund allocation evidence, validates the selected payment against the target historical payment row, and uses the exact payment slice during refund materialization; ambiguous split targets remain blocked until a slice is selected | PARTIALLY_IMPLEMENTED | Apply migration and verify selected-slice refunds, per-slice refund caps, partial/full refund statuses, retries, rollback, tenant isolation and concurrent allocation on PostgreSQL |
| P138-G003 | P139 adds dependency-ordered batch execution with isolated transactions, per-batch advisory locks, audit progress and retry/resume | PARTIALLY_IMPLEMENTED | Verify lock contention, cycle detection, batch rollback, resumability, audit evidence and tenant isolation on PostgreSQL |
| P139-G001 | Added a tenant-scoped batch orchestration endpoint that expands requested prerequisites, topologically orders targets before dependent source batches, rejects dependency cycles before execution, runs each batch in its own transaction using the existing per-batch advisory lock, stops safely on the first failure, records an audit progress summary and supports retrying the same request to resume already-completed batches idempotently. School Admin Finance now exposes execution and progress. | PARTIALLY_IMPLEMENTED | Apply migrations and generate Prisma client on PostgreSQL; verify multi-batch success, cycle rejection, concurrent requests, per-batch rollback, retry/resume after failure, tenant isolation, audit records and no journal reposting. |
- [ ] P140-G001 — Refund allocations can select a specific operational payment slice for historical payments materialized into multiple payment records; P141 adds searchable slice lookup and per-slice refundable-balance visibility in Finance UI | PARTIALLY_IMPLEMENTED | Apply P140 migration and generate Prisma client; verify single-slice inference, searchable multi-slice selection, invalid/cross-tenant slice rejection, per-slice balance accuracy, refund amount caps, partial/full refund status, idempotency, rollback, retry and dependency orchestration on PostgreSQL; runtime acceptance remains outstanding
| P141-G001 | Added tenant-scoped lookup of operational payment slices for a posted historical PAYMENT row, with search by payment ID/reference/method and per-slice paid, already-refunded and available-refundable amounts. School Admin Finance now selects a slice from results and displays partial/full refund state instead of requiring manual ID entry. | PARTIALLY_IMPLEMENTED | Verify API authorization and tenant isolation; confirm only payment slices linked to the selected historical row are returned; reconcile refundable balances against REQUESTED, APPROVED_PENDING_SETTLEMENT and SETTLED refunds; verify search, pagination/100-result cap, selection and refund creation on PostgreSQL. |
| P142-G001 | Refund allocation reservation and operationalization now share a tenant-scoped payment-slice advisory lock; active refunds and unmaterialized historical refund allocations consume refundable capacity; searchable reconciliation exposes pending reservations and net available balance | PARTIALLY_IMPLEMENTED | Verify concurrent allocation attempts and allocation-versus-operationalization races on PostgreSQL; prove no slice exceeds paid amount under retries/rollback; validate active refund state transitions, materialized reservation de-duplication, exact reconciliation, tenant isolation and School Admin behavior. |
| P143-G001 | Added persisted parent publication state for fee refunds, School Admin publish/hide controls, consent- and guardian-link-scoped parent API, and Parent Mobile status timeline with secure offline cache integration | READY_FOR_VERIFICATION | Apply P143 migration on PostgreSQL; generate/validate Prisma client; verify School Admin permission enforcement and publish/revoke audit events; verify parent consent, guardian-link, cross-tenant and unpublished-record denial; confirm parent response excludes staff identities/internal notes; validate web API integration and Parent Mobile online/offline/cache-clear behavior on iOS and Android |
| P154-G001 | School Admin Finance supports PDF/JPEG/PNG evidence upload through presigned storage POST, completion, scan-state visibility and CLEAN-only secure download. A dedicated Staff Finance mobile client now supports authenticated tenant-scoped evidence listing, PDF/JPEG/PNG upload through presigned storage, scan-state display and CLEAN-only signed downloads. Runtime device/storage/scanner acceptance remains open. | PARTIALLY_IMPLEMENTED | Verify upload initiation, presigned POST, size/MIME enforcement, completion, scanner transitions, rejected-file cleanup, clean promotion, signed download expiry and tenant isolation against configured S3/Redis/scanner; implement a dedicated staff mobile client before claiming mobile parity. |
| P155-G001 | Added a dedicated Expo Staff Finance app with secure staff sign-in, tenant/refund/note selection, evidence listing, PDF/JPEG/PNG file-picker upload (10 MB limit), presigned storage POST, upload completion, scan-state display and CLEAN-only signed downloads. | PARTIALLY_IMPLEMENTED | Install workspace dependencies; typecheck/build the Expo app; verify staff `accounting.reconcile` authorization, tenant isolation, upload MIME/size validation, presigned POST, completion/scan lifecycle, CLEAN-only download and signed URL handling on iOS and Android against configured storage/scanner. |
| P156-G001 | Staff mobile now displays native upload progress, retains an in-memory pending upload for explicit retry after storage-transfer failure, sends an idempotency key with upload initiation, prevents concurrent uploads and provides manual scan-status refresh. | PARTIALLY_IMPLEMENTED | Verify API idempotency enforcement, expired presigned URL behavior, storage retry without duplicate evidence, progress events, scanner status refresh, completion recovery, tenant authorization and CLEAN-only downloads on iOS/Android; run Expo typecheck/build and device acceptance. |
| P157-G001 | Added API-enforced tenant/staff-scoped upload idempotency, SHA-256 request fingerprint, conflict handling, fresh presigned URL on safe replay, and SecureStore pending-upload metadata/retry in Staff Mobile. | PARTIALLY_IMPLEMENTED | Apply migration and generate Prisma client; verify same-key replay, different-payload 409, concurrent initiation, expired URL renewal, completion retry, app restart/cache eviction behavior, tenant isolation, Expo typecheck/build and iOS/Android runtime against PostgreSQL/storage/scanner. |
| P158-G001 | Staff Mobile now copies picked evidence into app documents storage, persists the durable URI, validates the source before retry, cleans local files after completion/cancellation, and exposes a tenant/uploader-scoped cancellation endpoint for PENDING_UPLOAD evidence with object deletion and audit logging. | PARTIALLY_IMPLEMENTED | Implement scheduled server-side expiry/reconciliation for abandoned PENDING_UPLOAD records and quarantine objects; verify cancellation races, storage deletion, SecureStore recovery, Expo typecheck/build, PostgreSQL/API/storage/scanner integration and iOS/Android device behavior. |
| P159-G001 | Added a bounded scheduled worker sweep for refund evidence left in PENDING_UPLOAD for over 24 hours; storage objects are deleted before a guarded REJECTED transition; per-record advisory locks prevent races; failed deletes remain retryable; added lookup index and operational logs. | PARTIALLY_IMPLEMENTED | Deploy worker and migration; verify cleanup against PostgreSQL and S3-compatible storage, cancellation/completion races, worker restart/scheduling, retention policy, metrics/alerts and tenant isolation. |
| P160-G001 | Added tenant-scoped evidence status counts and recent records, overdue-upload and stale-scan indicators, durable storage-cleanup failure metadata, School Admin Finance operations view, audited manual retry for quarantined scans, and advisory-lock-protected retry for abandoned upload cleanup. | PARTIALLY_IMPLEMENTED | Apply migration and regenerate Prisma client; verify API/UI typecheck and builds; tenant and permission isolation; Redis/BullMQ unique retry jobs and throttle; scanner lifecycle; cleanup retry races and object-storage behavior; runtime acceptance against PostgreSQL, Redis, object storage and scanner. |
- **P163-G001 (RESOLVED BY P164):** A separately authorized platform-superadmin operations console now exposes global worker events; school tenant alert APIs continue to hide NULL-tenant events.
- **P163-G002 (OPEN):** Apply migration and verify tenant isolation, acknowledgement/retry audit behavior, 90-day retention, API/UI builds, and webhook delivery in a deployed environment.
| P167 | Alert Configuration And Policy: Documented event-domain/severity policy and stable dedupe window expectations; clarified tenant-vs-platform producer attribution boundaries and webhook delivery dependency. | P167-G001 | OPEN | Tenant-configurable thresholds/routing/suppression UI and persisted configuration are not claimed complete; implement after source audit/acceptance evidence. |
| P168 | Storage Lifecycle And Quota Operations: Reviewed private S3-compatible document-storage primitives (presigned upload, HEAD verification, private signed access, clean-object promotion, deletion). Added storage operational gap tracking and lifecycle guidance. | P168-G001 | OPEN | Automated per-tenant byte/object quota accounting, provider inventory reconciliation, lifecycle policy execution and runtime failure testing remain open; bucket-level usage must not be inferred from database rows. |
| P170 | Evidence Retention And Deletion Governance: Documented separation of PENDING_UPLOAD expiry from QUARANTINED scanner lifecycle and 90-day delivered+acknowledged alert retention; failure metadata remains retryable. | P170-G001 | OPEN | Configurable evidence retention/legal holds, tenant policy enforcement, auditable bulk deletion and storage reconciliation require further implementation and runtime acceptance. |
| P173-G001 | Enquiry capture and conversion to application, application CRUD/stage API, offer issue/response, enrollment conversion, guardian/student/enrollment creation, and section capacity enforcement are wired in API source and School Admin UI. | READY_FOR_VERIFICATION | Apply migrations and run API/web integration acceptance; verify tenant and permission denials. |
| P173-G003 | Admission document uploads now use private presigned storage, server-authorized upload metadata, object verification, quarantine, malware scan dispatch, scanner callback support, CLEAN-only verification, and verified CLEAN-only signed download. | READY_FOR_VERIFICATION | Apply migration; verify S3-compatible storage and scanner callback end-to-end; validate tenant RLS, malformed/mime mismatch, scan rejection and signed download expiry. |
- P177-G004 — Process-local rate limit and active school/tenant validation added. Status: PARTIALLY_IMPLEMENTED; shared limiter and abuse defenses remain.
- P178-G001 — Tenant-branded public portal enquiry UI integrated with P177 enquiry API. Status: READY_FOR_VERIFICATION.
- P178-G004 — Manual organization/school ID input is a temporary implementation; domain-to-school context resolution remains OPEN.
- P181-G001 — Tenant custom-domain context endpoint now returns active schools belonging to the resolved organization, limited to id/name/code. Status: READY_FOR_VERIFICATION.
- P181-G002 — Public portal automatically derives organization ID and displays school selector; manual school-ID entry is fallback only. Status: READY_FOR_VERIFICATION.
- [ ] P190-G007 — Build, tests, tenant/permission-negative and runtime acceptance — DEFERRED.
- **P191-G002 (OPEN):** Verify unit tests, API typecheck/build, integration with provider payloads and tenant-specific template resolution. Project instruction continues to defer comprehensive test/build/runtime acceptance until dedicated phases.
- [x] P195-G001 — Admission conversion uses normalized email/phone matching within active guardians scoped to organization and school.
- [x] P199-G001 — School/organization/recipient-scoped inbox endpoint for admissions IN_APP notifications, newest-first, bounded to 100.
- [x] P199-G002 — Individual notification read action with recipient and tenant scope, idempotent update.
- [x] P201-G001 — Public admissions endpoints use shared Redis-backed atomic fixed-window rate limiting, keyed by organization/school/route pattern/IP.
- [x] P216-G002 — API reviewer candidate listing scoped to organization/school and active membership; assignment endpoint validates active membership.
- [x] P221-G001 — Public tracking-token endpoint exposes applicant-safe REQUEST_INFORMATION notes only (text, timestamp, recommendation), scoped to tenant/school/application.
- [x] P224-G003 — Follow-up creation validates parent request belongs to the same organization, school, and application and is RESPONDED or RESOLVED.
- [x] P226-G001 — Public applicant and School Admin uploads support replacement lineage to a rejected same-type document within the same application/school/organization.
- [x] P229-G001 — Applicant notifications persisted with event type, applicant-safe title/body, timestamp, read state, and application/tenant/school scope.
- [x] P237-G002 — Terminal status transitions record endedOn (requested date or server date) and release configured section enrolled-seat counter in the same tenant-scoped transaction.
| P256-G001 | Super Admin organization create/search/pagination UI source implemented; runtime behavior and permissions not validated | READY_FOR_VERIFICATION | Verify create validation, slug conflict handling, search results, pagination consistency, unauthorized access, persistence, and UI feedback through runtime/API/browser tests |
- [ ] P257-G001 — Runtime/build/API verification of the new subscription & billing workspace — READY_FOR_VERIFICATION
- [ ] P257-G002 — Verify plan selection and subscription start authorization, conflict handling, and tenant scope end-to-end — READY_FOR_VERIFICATION
- [ ] P257-G004 — Subscription change/upgrade/downgrade/cancellation workflows — OPEN (Cycle 2)
| P259-G001 | Student core CRUD/profile editing and list/search/detail flows are implemented at source level; runtime integration remains unverified | READY_FOR_VERIFICATION | Run final API/UI validation for create, search, detail, first/last-name and profile updates, permission denial, tenant isolation, and persistence |
| P260-G001 | Guardian/family flows exist at source level; runtime validation of create/link/update, duplicate review, primary/emergency/pickup flags, consent and invitation remains outstanding | READY_FOR_VERIFICATION | Validate end-to-end API/UI behavior, tenant isolation, permissions and persistence during final test cycle |
- [x] P333-G001 — Admissions conversion identity preflight endpoint (organization/school scoped, admissions.manage) returns normalized guardian contact matches and match reasons.
- **P347-G003 OPEN:** Runtime DB/API, permission/tenant isolation, Admin build/typecheck, browser/mobile and E2E validation remain Cycle 2.
- **P352-G001 OPEN (Cycle 2):** Run Prisma validation/generation, database migration and live API integration checks against PostgreSQL; runtime tenant isolation and permission matrix testing.
- **P353-G006 OPEN (Cycle 2):** Prisma CLI, database migration, live API/tenant isolation, Admin/Staff mobile builds, E2E/regression, security and device validation.
- **P354-G006 OPEN (Cycle 2):** Prisma validation/generation, migration execution, API runtime, tenant/permission/security validation, full builds, E2E/regression, and mobile device validation.
- **P356-G006 OPEN (Cycle 2):** Prisma validate/generate, database migration, runtime API/tenant/security tests, web/mobile build, E2E/regression and device validation.
- [ ] P359-G007 — Production environment, secrets, TLS and operational checker validation against a provisioned deployment — READY_FOR_VERIFICATION
- **P367-G001 CLOSED (source audit):** Added a dependency-free Prisma tenant-scope inventory and index/unique audit. 150/150 tenant-scoped models currently pass the static index/unique coverage check.
- **P367-G003 CLOSED:** Added tenant composite index and migration for TransportTripEvent.
- **P367-G004 OPEN/BLOCKED:** Fresh DB migrate, baseline upgrade, rollback/recovery, Prisma validation/generation, RLS catalog tests, non-owner roles, cross-tenant negative tests, IDOR, workers/cache/storage, concurrency and runtime/API acceptance require a live database and dependency environment.
C2-02 static source audit is completed for this phase. Runtime acceptance gaps remain OPEN: fresh migration, baseline upgrade, recovery/rollback, Prisma validation, PostgreSQL RLS/catalog, non-owner role, cross-tenant negative/IDOR, worker/cache/storage isolation, concurrency, and API integration. P367-G004 remains open until evidence is collected.
- **P368-G003 OPEN:** Runtime authentication/RBAC/authorization-negative/MFA/refresh/revocation/rate-limit/tenant-isolation/security deployment validation remains open; see `C2-03-ACCEPTANCE-GAP-MATRIX.md`.
- **P373-G001 CLOSED (client-local source slice):** Guided onboarding step index persists across refreshes in browser storage, versioned and scoped by organization/school. Only navigation position is stored; checklist completion remains API-derived. Invalid values and storage errors are handled safely. Verifier 12/12 PASS.
- **P374-G001 CLOSED:** Centralized seven-check onboarding readiness endpoint with active-school membership guard and tenant-scoped queries; admin UI consumes the API-derived result. Source contract verifier 14/14 PASS.
- **P377-G001 CLOSED:** Tenant/school-scoped server persistence for onboarding resume position is implemented with a Prisma model and SQL migration.
- **P378-G001 CLOSED (source slice):** School onboarding checklist tasks are assignable to existing active school members through a school-scoped API and Admin UI. Assignment writes require `school.settings.manage`, validate task keys and active school membership, and emit audit events. Source verifier 19/19 PASS. Tenant RLS is enabled and forced on both assignment and progress tables.
- **P381-G001 CLOSED (source slice):** Added tenant-scoped readiness checks for at least one active room and one published school-wide/current-year fee structure; integrated remediation and dependency-gated guided actions. P381 verifier 12/12 PASS.
- **P389-G001 CLOSED (source slice):** Organization Admin now lists invitations with safe status fields, creates invitations, and revokes pending invitations. List/revoke are organization-admin gated; revoke is audited. P389 verifier 15/15 PASS.
- **P390-G001 CLOSED (source slice):** Academic terms require the selected academic year to be current and ACTIVE; calendar writes require a complete school profile and active current year (attached year is validated); working-day writes require complete profile; school-policy writes require complete profile and active current year. Enforcement is API-side within tenant-scoped transactions. P390 verifier 10/10 PASS.
- **P391-G001 CLOSED (source slice):** Organization invitations now require configured provider delivery, send a hash-only invitation token via email payload, fail closed before record creation when delivery configuration is absent, and revoke/audit provider failures. P391 verifier 14/14 PASS; P389 verifier 15/15 PASS.
- **P404-G001 CLOSED (source slice):** Campus inheritance PUT now validates proposed parent chains against tenant/school-scoped persisted parent links and rejects cycles with HTTP 409 before save. P404 verifier 13/13 PASS, including safe/two-node/longer-cycle graph cases.
- **P405-G001 CLOSED (source slice):** Added a permission-gated effective-resolution endpoint for persisted campus inheritance. It validates the target/parent chain, rejects cycles and duplicate records, and combines scope overrides ancestor-to-child using deep merge for inherited scopes and replacement for non-inherited scopes. Tenant/school filters are retained. Verifier: 16/16 PASS.
- **P406-G001 CLOSED (source slice):** Added read-only effective campus configuration API view combining base profile, working days, and policy records with persisted campus inheritance override documents. Tenant/school scope and `school.settings.manage` gate retained. P406 verifier 17/17 PASS.
- **P407-G001 CLOSED (source slice):** Added tenant/school-scoped campus registry migration and list/create/update/soft-archive endpoints; validates fields, uniqueness and status; supports main-campus designation and audit events. Inheritance saves and effective views now require active registry campuses.
- **P412-G001 CLOSED (source slice):** Persisted school-owned curriculum outcomes scoped by version and grade (optional subject), source provenance fields, tenant/school RLS, list/create/review APIs, review transition validation and approval evidence fields. P412 source verifier 16/16 PASS.
- **P414-G001 CLOSED (source slice):** Added permission/entitlement-guarded outcome update API with tenant/school scoping, version/grade/subject alignment, code uniqueness pre-check, and edit restrictions to DRAFT/IN_REVIEW. Added draft-only hard delete API. School-admin UI now edits all outcome and provenance fields and provides confirmed draft deletion. P414 verifier 19/19 PASS; P411 15/15, P412 17/17, P413 22/22 regressions PASS; parser scan 257 files/0 diagnostics.
- **P416-G001 CLOSED (source slice):** Persisted outcome-to-school-exam mappings with tenant/school composite foreign keys, uniqueness, forced RLS, authenticated read, permission/entitlement guarded create/delete APIs, same-grade and subject compatibility validation, and School Admin UI to view/add/remove mappings. Focused verifier 26/26 PASS; 5 unit-test scenarios authored.
- **P418-G001 CLOSED (source implementation slice):** Added persisted lesson plans linked to curriculum versions, grades, optional subjects and outcomes. API provides version-scoped list, create, edit and draft-only delete. Create/edit validates grade, subject/version and outcome/version/grade alignment, with school/tenant scoping, active membership, `academics.manage` and curriculum entitlement guards. Migration uses tenant RLS and composite scope FKs for plans and outcome links. School Admin UI supports create/edit/list, lesson objectives, activities, date, duration, resources, status and outcome association.
- **P420-G001 CLOSED (source slice):** Persisted lesson-plan teacher assignments, primary teacher flag, composite tenant/school FKs, forced RLS, active teaching staff candidates, assignment list/update APIs, school/tenant scope and active-designation validation, permission/entitlement guards, 20-teacher cap, primary teacher membership validation, completed/archived lock, and admin UI assignment controls. P420 focused verifier 27/27 PASS.
- **P421-G001 CLOSED (source slice):** Added authenticated teacher-only assigned lesson-plan read endpoint scoped to the active staff profile and tenant/school. Returned lesson cards include primary/collaborator role and linked outcomes. Added assignment-guarded status transitions DRAFT → PLANNED → COMPLETED; completion requires PLANNED, and completed/archived plans are locked. Teacher Mobile includes refreshable lesson workspace/cards and status controls. P421 focused verifier 30/30 PASS; changed files transpile with 0 syntax diagnostics.
- **P422-G001 CLOSED (source slice):** Added persisted teacher-owned lesson reflections linked to completed lesson plans. Reflections capture teaching notes, challenges encountered, follow-up actions and actual duration. Reflection records append as history per teacher and lesson; teacher workspace returns the latest reflection plus history. API requires active staff profile, lesson assignment, tenant/school scope and COMPLETED lesson status; text lengths and duration are validated. PostgreSQL migration adds composite plan/staff scope FKs, indexes, duration CHECK and forced RLS. Teacher Mobile adds reflection fields and save action for completed lessons. Focused verifier 30/30 PASS; changed API route and mobile app transpile with 0 diagnostics.
- [ ] P424-G001 — Runtime acceptance of lesson reflection task schema/API, tenant RLS, coordinator creation/management and teacher task workflow — READY_FOR_VERIFICATION
- [ ] P427-G001 — Runtime acceptance of scheduler process, active school/organization discovery, due-soon/overdue behavior, timezone dedupe and multi-instance idempotency; verify DB/RLS and worker deployment — READY_FOR_VERIFICATION
- [ ] P428-G001 — Runtime acceptance of teacher preference APIs/mobile controls, coordinator default APIs, migration and tenant RLS — READY_FOR_VERIFICATION
- **P431-G001 CLOSED (source slice):** Aggregate reminder preference report now scopes to active linked staff assigned to active teaching-role designations, tenant/school scoped; focused verifier 15/15 PASS.
- [ ] P432-G001 — Live PostgreSQL migration, tenant RLS and immutable trigger runtime validation — OPEN
- **P433-G003 OPEN:** Live tenant RLS and migration/runtime acceptance, plus browser/mobile E2E.
- **P434-G001 OPEN:** Live migration, Prisma validate/generate, tenant RLS and worker runtime acceptance.
- **P435-G001 OPEN:** Runtime validate migration, Prisma schema/client, requester/tenant/school authorization and RLS for list/cancel/retry endpoints.
- **P436-G001 OPEN:** Runtime validation of school-scoped export health endpoint, authorization, tenant RLS and aggregation semantics against PostgreSQL.
- **P437-G001 OPEN:** Runtime DB/API acceptance, concurrency race validation for capacity enforcement, and tenant RLS.
- **P447-G003 OPEN:** Add persisted per-school/per-severity policy management if product requirements need tenant-level policies; current policy is worker environment configuration.
- **P454-G002 OPEN:** Route-by-route auth/RBAC/tenant-scope review and runtime negative tests remain pending. See `C2-03-ROUTE-SECURITY-INVENTORY.json` and P454 reports.
- **P455-G001 OPEN:** Perform manual handler-by-handler authorization, permission, ownership, and tenant-scope validation; source token extraction is not proof of secure behavior.
- **P455-G002 OPEN:** Add live API negative tests for unauthorized, wrong-school, wrong-organization, and object-ID substitution cases.
| P457-G004 | Handler enforcement, wildcard permissions, tenant/school isolation, full builds and browser/mobile E2E remain unverified | OPEN | Run API authorization negative tests, PostgreSQL RLS tests, full builds and E2E suites |
- [ ] P458-G005 — Session endpoint authorization and tenant/school boundary runtime tests — OPEN
- **P459-G005 OPEN:** Credential lifecycle web/mobile flows, builds, E2E, and tenant/school context regression remain unverified.
- **P460-G004 OPEN:** MFA key provisioning/rotation, web/mobile enrollment UX, recovery experience, API builds, E2E and penetration testing remain unverified.
- **P461-G002 OPEN:** Protected-handler authentication, RBAC, and tenant/school-scope enforcement require endpoint-level negative API tests.
- **P461-G006 OPEN:** MFA enforcement policy, provisioning/rotation, recovery, bypass edge cases, and web/mobile UX require runtime/security acceptance.
- **P461-G007 OPEN:** API/web/mobile build, end-to-end, penetration testing, and tenant/school isolation acceptance remain unverified.
- **P462-G003 OPEN:** Session ownership, tenant/school isolation, MFA enforcement and credential reset negative tests require runtime database/API tests.
- **P466-G003 OPEN:** Cross-organization/cross-school scope enforcement against live data, tenant context, and route handlers requires DB/API integration testing.
- **P467-G001 READY_FOR_VERIFICATION:** Synthetic role fixtures and permission matrix test source added for platform admin, school admin, principal, department head, teacher, front office, finance, parent, library, transport, hostel, and canteen roles.
- **P467-G004 OPEN:** Tenant context, membership lookup, cross-tenant data isolation, API/web/mobile builds, full E2E, and security validation remain unverified.
- **P469-G003 OPEN:** Live membership/permission database, PostgreSQL RLS, cross-tenant production data isolation, and runtime API behavior remain unverified.
- [ ] P471-G003 — Validate cross-tenant and cross-school isolation against running API — OPEN
- [ ] P472-G003 — Validate PostgreSQL RLS and cross-organization/cross-school isolation — OPEN
- **P474-G001 — Secure child context / live authorization:** Multi-child dashboard and context-switch UI implemented. Composite organization/school/student context is used for stale response rejection; server-side membership authorization and live cross-scope runtime validation remain OPEN.
- **P476-G001 — Parent timetable/calendar/exam API implementation:** Source handlers now exist for all three routes with authentication, parent portal authorization, guardian consent, child link, tenant/school predicates, bounded date range, schedule exception support, audience filtering, and published exam filtering. Static verifier 16/16 PASS. SOURCE_VERIFIED; runtime/typecheck OPEN.
- **P482-G006 — Multi-child cross-tenant/cross-school security acceptance:** OPEN; client context safeguards exist, but backend authorization and RLS tests against a live environment are required.
- **P492-G005 OPEN:** Database-backed and device acceptance, including school tenant boundaries, remain pending.
- **P494-G001 OPEN:** Execute live negative authorization tests proving students cannot read another student's records, another school, or another organization through Student Mobile endpoints; static route contract checks are not runtime security evidence.
- **P494-G003 OPEN:** Confirm RLS policy behavior and connection-pool context isolation under concurrent tenant requests against a running PostgreSQL instance.
- **P498-G002 OPEN:** Start PostgreSQL/Redis/API and validate live health/readiness, student service endpoints, tenant isolation, cache behavior and auth flows with runtime data.
- **P499-G005 OPEN:** Complete tenant/school negative authorization tests and full E2E journey coverage.
- **P500-G001 OPEN:** Provision pinned pnpm 9.15.0 via Corepack and generate the initial pnpm-lock.yaml; network registry access is unavailable in this environment, so lockfile generation was not possible.
- **P501-G001 OPEN:** Provision the pinned pnpm 9.15.0 runtime in a network-enabled or pre-populated Corepack environment; current environment has Corepack but pnpm is absent.
- **P502-G001 OPEN:** Resolve the external package-manager bootstrap blocker: pnpm 9.15.0 and the workspace lockfile still cannot be provisioned because registry DNS/network access is unavailable in this environment.
- **P503-G001 OPEN:** Provision pinned pnpm 9.15.0 and generate the workspace lockfile; registry DNS/network remains unavailable.
- **P504-G001 OPEN:** Provision pinned pnpm 9.15.0 and workspace lockfile; registry DNS/network access remains unavailable.
- **P504-G004 OPEN:** Validate API integration tests with PostgreSQL, Redis, Prisma generation/migrations, live endpoints and tenant isolation.
- **P505-G001 OPEN:** Provision pinned pnpm 9.15.0 and workspace lockfile; registry DNS/network remains unavailable.
- [ ] P506-G005 OPEN — Execute full dependency-based workspace build/typecheck after pnpm provisioning and lockfile generation become available.
- **P508-G001 OPEN:** Provision pnpm 9.15.0 and generate the workspace lockfile in a registry-enabled environment; local diagnostic confirms pnpm absent and lockfile missing.
- **P508-G005 OPEN:** Run PostgreSQL/Redis/API startup, migration, health/readiness, integration and tenant-isolation negative tests.
- **P509-G004 OPEN:** Add concurrency, tenant-negative, role-negative and finance configuration API integration tests.
- **P511-G001 OPEN:** Validate fee assignment preview/confirm against live tenant data, including scope boundaries, section selection, repeated submission behavior and duplicate-charge accounting.
- **P511-G004 READY_FOR_VERIFICATION:** Runtime test tenant isolation, audit metadata, and transaction rollback behavior for assignment failures.
- [ ] P512-G002 — Run tenant-negative, RBAC-negative and runtime API integration tests for schedule endpoints — READY_FOR_VERIFICATION
- **P513-G001 READY_FOR_VERIFICATION:** Run Prisma validation/generation and apply concession migration against clean PostgreSQL; validate tenant-scoped FK and enforced RLS behavior.
- **P513-G002 READY_FOR_VERIFICATION:** Runtime API acceptance for request/list/approve/reject, tenant-negative, RBAC-negative, duplicate pending request, self-approval, and concurrent approval.
- **P514-G001 OPEN:** Run Prisma validation/generation and apply the school fee invoice migration on a clean PostgreSQL database; confirm both invoice tables and forced tenant RLS policies.
- **P514-G002 READY_FOR_VERIFICATION:** Runtime acceptance of invoice draft generation, listing/detail, issue and void endpoints; include tenant-negative and RBAC-negative checks and concurrent duplicate-generation checks.
- **P515-G002 OPEN:** Run runtime tenant-negative, RBAC-negative, concurrent payment, duplicate-reference retry/conflict, invoice partial/full payment, installment allocation and transaction rollback integration tests.
- **P516-G001 OPEN:** Run Prisma validation/client generation and apply receipt/counter migration to clean PostgreSQL; verify tenant RLS policies.
- **P516-G002 OPEN:** Runtime API acceptance for receipt issuance/list/detail and student ledger, including tenant-negative and RBAC-negative tests.
- **P517-G005 OPEN:** Late-fee policy configuration UI/API RBAC-negative and tenant-negative acceptance; validate school-level currency policy and cap behavior.
- **P518-G002 OPEN:** Live DB/API validation including tenant-negative and RBAC-negative access.
- **P519-G003 OPEN:** Parent finance runtime acceptance: guardian linking, consent revoked/expired, tenant-negative, permission-negative, stale/offline cache, and mobile/browser tests.
- **P520-G006 OPEN:** Full build/typecheck, tenant/RBAC-negative, runtime DB/API, mobile and end-to-end acceptance remain pending.
- **P521-G002 OPEN:** Verify finance summary aggregation for large schools, query plans/index use and tenant-negative access.
- **P522-G003 OPEN:** Tenant-negative access, permission denial, and cross-school isolation runtime acceptance.
- **P523-G003 OPEN:** Verify tenant-negative access and permission-denial behavior with runtime integration tests.
- **P524-G003 OPEN:** Tenant-negative integration tests, runtime query plans, full builds/typecheck, browser/mobile and E2E acceptance remain outstanding.
- **P524-G003 OPEN:** Tenant-negative integration tests, runtime query plans, full build/typecheck, browser/mobile and E2E acceptance remain outstanding.
- **P525-G002 OPEN:** Validate tenant/school negative cases and performance/query plans at runtime.
- **P526-G001 OPEN:** Validate foundation endpoint against PostgreSQL fixtures and ensure data readiness counts are accurate in tenant/school runtime contexts.
- **P526-G002 OPEN:** Tenant-negative runtime API tests for cross-organization/school academic year and grade level isolation.
- **P527-G002 OPEN:** Runtime endpoint validation, cross-tenant/school negative tests and PostgreSQL integration fixtures.
- **P528-G001 OPEN:** Runtime integration and tenant-negative validation of transition-options endpoint and transition mutation error codes.
- **P529-G003 OPEN:** Full build/typecheck, PostgreSQL tenant-negative tests, browser/mobile validation, accessibility and E2E acceptance.
- **P530-G002 OPEN:** PostgreSQL fixtures and tenant-negative runtime tests for document replacements, scan outcomes and metadata mismatch remain pending.
- **P531-G003 OPEN:** Full API/Admin build/typecheck, browser accessibility, tenant-negative runtime checks, mobile and E2E acceptance remain outstanding.
- **P532-G002 OPEN:** tenant-negative runtime tests and end-to-end validation of reservation match/mismatch, expired reservation, and section-capacity scenarios.
- **P534-G001 OPEN:** Full API/database runtime verification for JSON communicationId filtering, status aggregation and tenant/school-negative access checks.
- **P535-G001 OPEN:** Runtime tests needed for student notification preference API authorization, active student-link guards, and tenant/school isolation negative cases.
- **P537-G002 OPEN:** Formal accessibility audit and runtime role/tenant/school-negative authorization validation have not been executed; static integration evidence is not a substitute.
- [ ] P550-G003 — Meal entitlement validation and deduction are not yet wired automatically into order/preorder/serving lifecycle; consumption is currently an explicit staff API action.
- [ ] P566-G003 — Exercise school membership, hostel.manage permission, tenant RLS and cross-school denial using production-like non-owner DB role — OPEN
- [ ] P567-G004 — Prove production-role RLS and cross-organization/cross-school denial for visitor, pass and linked allocation/leave records — OPEN
- [ ] P568-G004 — Prove production-role RLS and cross-organization/cross-school denial for leave requests, guardian consent, notification events and linked passes — OPEN
- [ ] P569-G004 — Prove production-role RLS and cross-organization/cross-school denial for transfers, waitlist entries, checkout records and settlement lines — OPEN
- [ ] P571-G007 — Execute production-role RLS and cross-tenant negative tests for Library, Transport, Hostel and all tenant-owned resources — OPEN (no PostgreSQL runtime)
- [ ] P572-G008 — Execute production-role RLS/cross-tenant negative tests for school, student, parent, library, transport, hostel, finance and safeguarding resources — OPEN (requires database runtime and non-owner test role)
- [ ] P573-G001 — Provision pinned pnpm 9.15.0 in a registry-enabled or approved mirrored environment and generate the real workspace `pnpm-lock.yaml`; no synthetic lockfile — OPEN (registry DNS resolution unavailable in this execution environment)
- [ ] P574-G005 — Provision isolated PostgreSQL test infrastructure and deterministic seed/cleanup lifecycle — OPEN (Docker and PostgreSQL client/server unavailable)
- [ ] P574-G006 — Execute API/database integration tests for authentication, tenant scope, admissions, student lifecycle, parent/teacher/staff/driver, finance, Library, Transport and Hostel — OPEN (no database runtime or installed test dependencies)
- [ ] P575-G001 — Run P575 catalog acceptance on the migrated PostgreSQL schema and prove every tenant-owned table has ENABLE/FORCE ROW LEVEL SECURITY plus tenant-scoped USING and WITH CHECK policies — OPEN (static inventory found 235 tenant-scoped Prisma models; only 75 direct ENABLE/FORCE statements and 80 direct CREATE POLICY references; dynamic migration loops and actual catalog state remain unverified)
- [ ] P575-G002 — Execute cross-organization, cross-school, cross-student, guardian-link, campus, staff-role and finance/library/transport/hostel negative API tests under a restricted non-owner, non-BYPASSRLS application role — OPEN (no PostgreSQL runtime or seeded fixtures)
- [ ] P575-G003 — Verify tenant context isolation across pooled/reused connections, nested helper composition, background workers and transaction rollback; prove no platform/worker flag leaks between operations — OPEN (source helpers now reset all eight context selectors; executable mock checks pass, but live pool/database tests remain required)
- [ ] P575-G004 — Complete model-to-physical-table ownership inventory, including @@map tables, relation-only ownership and models with indirect tenant scope; review all tables without direct static RLS evidence — OPEN (235 models have organizationId/schoolId fields; direct migration grep is not authoritative for dynamic SQL)
- [ ] P575-G008 — Execute concurrency, pooled-connection, worker, browser/mobile and full cross-tenant regression; archive reproducible database logs and independent security review — OPEN (runtime environment and independent review unavailable)
- [ ] P576-G007 — Verify payment and notification workers use least-privilege tenant context, idempotent outbox processing and cross-school recipient isolation in PostgreSQL — OPEN (static/source checks only; restricted-role database tests remain blocked by P573/P574)
- [ ] P577-G002 — Provision isolated browser test targets and synthetic tenant identities for Super Admin, Organization Admin, School Admin, Teacher, Parent, Student and Driver roles — OPEN (no deployed E2E URLs or seeded test identities supplied)
- [ ] P579-G004 — Generate and review a complete dependency-resolved SBOM, license inventory and vulnerability report from the frozen production dependency graph — OPEN (pnpm lockfile and installed dependency graph unavailable)
- [ ] Review/provision `fees.approve` role grants and validate separation-of-duties — OPEN.
- [ ] Role provisioning/review for `fees.approve`, separation-of-duties verification — OPEN.
- [ ] CAPTCHA, public abuse/proxy review, tracking token lifecycle, tenant/RLS and permission-negative review — OPEN.
- [ ] **P284-VAL01** — Validate student link lifecycle, tenant RLS, verified-email match, school discovery, profile/inbox endpoints and Expo app against DB/API fixtures and devices. **OPEN**.
- [ ] F03-GAP: End-to-end school onboarding orchestration and backend prerequisite enforcement remain OPEN; P387 only addresses tenant-scoped stale assignment UI state and does not close the broader gap.

### Identity, authentication, sessions and RBAC (453)

- [ ] P00-G003 — Global identity linking and duplicate-account resolution rules — OPEN
- [ ] P00-G004 — Complete permission matrix and resource-level authorization policy — OPEN
- [ ] P02-G004 — Wire permission checks into protected API routes and prove deny-by-default — OPEN
- [ ] P02-G007 — Implement password reset completion, one-time token lifecycle and delivery adapter — IN_PROGRESS (P80 completion endpoint and one-time consumption implemented; request delivery adapter, throttling and runtime acceptance remain)
- [ ] P02-G008 — Implement email/phone verification and invitation acceptance workflows — OPEN
- [ ] P02-G009 — Implement MFA enrollment, challenge, recovery codes and encrypted secret storage — OPEN
- [ ] P02-G010 — Add rate limiting, lockout/backoff and credential-stuffing protections — OPEN
- [ ] P02-G011 — Move refresh token to secure HttpOnly cookie for web and secure native storage for mobile — OPEN
- [ ] P02-G012 — Implement refresh-token family tracking, reuse detection and family revocation — OPEN
- [ ] P02-G013 — Add audit event pipeline for login, logout, permission changes and privileged actions — OPEN
- [ ] P02-G014 — Add Playwright web and Maestro/Detox mobile authentication flows — OPEN
- [ ] P02-G017 — Add GET /auth/me with current user, memberships and scoped permissions — READY_FOR_VERIFICATION (P79 source delivered; runtime/API authorization tests pending)
- [ ] P03-G004 — Add route-level platform permissions rather than relying only on isPlatformAdmin boolean — OPEN
- [ ] P03-G005 — Require MFA and dual approval for high-risk platform operations — OPEN
- [ ] P03-G006 — Implement complete support/break-glass access with independent approval, expiry enforcement, session recording and audit — OPEN
- [ ] P03-G011 — Build full Super Admin login and CRUD UI with secure token storage — OPEN
- [ ] P03-G012 — Add end-to-end, authorization-negative and audit verification tests — READY_FOR_VERIFICATION
- [ ] P04-G003 — Configure invitation email delivery, resend, revoke and delivery audit — OPEN
- [ ] P04-G006 — Enforce active school membership and scoped role checks on every school endpoint — OPEN
- [ ] P04-G008 — Add invitation idempotency, duplicate prevention and race-condition tests — OPEN
- [ ] P04-G012 — Add RLS database-role privilege audit and production connection-pool validation — OPEN
- [ ] P07-G009 — Connect School Admin board/grade/curriculum UI to authenticated APIs and persistent state — OPEN
- [ ] P07-G012 — Add curriculum data change audit history and authorized approval flow — OPEN
- [ ] P08-G003 — Implement guardian identity verification, consent, invitation and parent portal relationship linking — OPEN
- [ ] P08-G004 — Add granular student permissions for admissions, teachers, nurses and front office — OPEN
- [ ] P08-G010 — Connect School Admin student/guardian UI to authenticated APIs and persistent state — OPEN
- [ ] P08-G013 — Add audit events for guardian relationship changes, pickup permissions and document access — OPEN
- [ ] P09-G008 — Add guardian/parent self-service application portal, OTP verification, consent and application tracking — OPEN
- [ ] P09-G009 — Add granular role permissions for admissions/front-office/reviewers and field-level PII access — OPEN
- [ ] P10-G004 — Implement staff identity invitation, verified account linking and scoped staff memberships — OPEN
- [ ] P10-G005 — Add granular HR, principal, department-head, teacher and front-office permissions — OPEN
- [ ] P11-G002 — Apply P11 migration on clean/upgraded databases; validate existing RBAC duplicates and rollback — READY_FOR_VERIFICATION
- [ ] P11-G004 — Implement invitation delivery, public token redemption, expiry/revocation and account creation workflow — OPEN
- [ ] P11-G005 — Migrate admissions, student, staff and school configuration APIs to granular permission checks — OPEN
- [ ] P11-G007 — Add HR, principal, department-head and front-office permission matrices reviewed by school operators — OPEN
- [ ] P11-G008 — Add role editing, role deletion, permission change audit and protected system-role policy — OPEN
- [ ] P11-G010 — Add role assignment expiry, effective dates, temporary delegation and approval workflows — OPEN
- [ ] P11-G011 — Add multi-school staff membership and cross-campus role assignment controls — OPEN
- [ ] P11-G012 — Add field-level PII masking, break-glass access and support-session controls — OPEN
- [ ] P11-G013 — Add comprehensive audit logging for role, permission, invitation and account-link changes — OPEN
- [ ] P11-G014 — Connect School Admin role/permission UI to live APIs and assignment workflows — OPEN
- [ ] P11-G015 — Add authorization regression, privilege-escalation, IDOR and API/browser E2E security tests — OPEN
- [ ] P11-G016 — Add permission cache invalidation/versioning and revocation propagation to active sessions — OPEN
- [ ] P11-G017 — Verify global permission wildcard/platform-admin bypass policy and constrain production break-glass — OPEN
| P12-G005 | Teacher and Principal attendance role grants are seeded but not database-verified | OPEN | seed test proving intended role grants only |
| P12-G007 | Session creation uniqueness races need conflict-safe API handling | OPEN | concurrent create test and deterministic 409 response |
| P12-G012 | Guardian read-only attendance portal and consent checks absent | OPEN | guardian authorization and privacy tests |
| P12-G015 | Attendance read authorization needs granular student/class-level access review | OPEN | permission matrix and cross-class read tests |
| P13-G002 | Conditional session transitions not concurrency-tested | OPEN | parallel open/submit/lock integration tests |
| P13-G009 | Guardian attendance access and consent/privacy controls absent | OPEN | guardian authorization/privacy tests |
| P14-G006 | Guardian attendance access and consent/privacy model absent | OPEN | guardian authorization/privacy tests |
| P15-G002 | Assignment/year/section/effective-date authorization not integration-tested | OPEN | positive and negative PostgreSQL API tests |
| P15-G004 | Mobile authentication, refresh and secure token storage are not implemented | OPEN | secure auth flow with platform keystore |
| P16-G002 | Sign-in, startup restore, refresh rotation and logout have not been API integration-tested | OPEN | positive/negative integration tests against PostgreSQL-backed auth sessions |
| P16-G003 | Refresh-token reuse and simultaneous 401 behavior require server/client concurrency tests | OPEN | deterministic parallel refresh/reuse test suite |
| P16-G006 | TOTP enrollment, encrypted seed storage, one-time recovery codes, five-minute session-bound freshness and configurable platform-admin/role-key policy with web/mobile challenge flows are implemented at source; central API enforcement and runtime behavior remain unverified; password-reset delivery and biometric re-authentication remain absent | PARTIALLY_IMPLEMENTED | Implement central API enforcement; apply migration and verify TOTP enrollment/challenge, recovery-code single use, session binding, platform-admin and role-policy deny/allow paths and key management; implement password-reset delivery and decide biometric scope |
| P16-G007 | Mobile auth rate limiting, TLS pinning decision and device security controls not validated | OPEN | threat model, backend rate-limit tests and mobile security assessment |
| P17-G004 | Only active linked staff profiles are discoverable; account-link/invitation lifecycle remains incomplete | OPEN | verified invitation/account-link flow and acceptance tests |
| P17-G007 | Teacher membership API has no dedicated automated route test suite | OPEN | authenticated route tests for empty, single, multiple and revoked memberships |
| P17-G008 | No generalized membership switching for parent/student/administrator applications | OPEN | role-specific product requirements and tested discovery APIs |
- [ ] P18-G009 — Add API integration tests for teacher self-scope and School Admin write authorization.
| P19-G003 | API-backed School Admin timetable workspace and bell templates added in P21; global auth integration and browser E2E remain | PARTIALLY_IMPLEMENTED | authenticated app integration and browser E2E evidence |
| P20-G003 | Persisted School Admin timetable workspace and reusable bell templates added in P21; browser E2E and global auth integration remain | PARTIALLY_IMPLEMENTED | authenticated browser E2E and complete edit workflow |
| P20-G004 | Advisory-lock concurrency behavior, exception writes and forced RLS have not been tested against PostgreSQL | OPEN | multi-connection integration tests using non-owner DB role |
| P20-G005 | P25 adds DB triggers for recurring teacher/room and date-specific exception overlap under school advisory locks; migration/runtime proof remains pending | PARTIALLY_IMPLEMENTED | PostgreSQL concurrency tests and non-owner role verification |
| P21-G001 | CSV preview performs parser/schema validation; authoritative DB checks occur at import; no downloadable row-error CSV yet | PARTIALLY_IMPLEMENTED | preview DB validation and downloadable error report |
| P21-G006 | P25 adds database-level recurring and date-specific teacher/room overlap trigger source; migration/runtime proof remains pending | PARTIALLY_IMPLEMENTED | PostgreSQL concurrency tests and non-owner role verification |
| P22-G001 | Room metadata edit/reactivation, include-inactive listing and safe deactivation source implemented; API/database behavior not runtime-tested | PARTIALLY_IMPLEMENTED | authenticated API tests and PostgreSQL trigger tests |
| P23-G001 | Reviewed room alias registry and pending/approve/apply workflow implemented in source; migration and forced RLS not applied or runtime-tested | PARTIALLY_IMPLEMENTED | apply migration under non-owner DB role; verify alias FK, RLS and rollback |
| P23-G003 | Timetable editor uses platform login, refresh and logout endpoints; authentication is integrated only in timetable workspace, not the full School Admin shell | PARTIALLY_IMPLEMENTED | shared authenticated shell and route guards for every School Admin module |
| P23-G005 | Access/refresh tokens are memory-only; browser reload requires sign-in again; refresh failure handling needs browser acceptance | PARTIALLY_IMPLEMENTED | browser E2E for token rotation, logout, expiry and refresh-token reuse handling |
| P23-G008 | P25 adds database trigger source for recurring teacher/room and date-specific exception overlap; migration and concurrent direct-SQL behavior are not verified | PARTIALLY_IMPLEMENTED | apply migration and pass two-connection PostgreSQL tests under non-owner role |
| P23-G009 | P24 adds actor-attributed transactional audit events and fixed maker-checker approval; DB-level audit immutability and configurable policy remain open | PARTIALLY_IMPLEMENTED | prevent audit UPDATE/DELETE at DB role/trigger layer and test |
| P24-G001 | P25 adds permission-aware navigation and explicit preview-only labels/guards; remaining profile, academic, calendar, curriculum, student, staff and access modules are still local previews | PARTIALLY_IMPLEMENTED | connect preview modules to authenticated APIs and verify route guards in browser E2E |
| P24-G003 | Shared request helper refreshes and retries once on 401; browser reload, simultaneous refresh and reuse behavior not E2E tested | READY_FOR_VERIFICATION | browser tests for login, rotation, logout, expiry and refresh reuse |
| P24-G007 | No PostgreSQL migration/RLS/trigger or concurrent timetable overlap acceptance executed | OPEN | non-owner DB role integration tests and two-connection concurrency suite |
| P25-G001 | P25 permission-aware navigation and timetable authorization source added; API typecheck and endpoint integration not run | READY_FOR_VERIFICATION | full TypeScript/API build and tests with assigned roles |
| P25-G005 | AuditLog UPDATE/DELETE triggers added; privileged owner/superuser can disable triggers or alter functions | PARTIALLY_IMPLEMENTED | non-owner application role proof, privilege review and protected external retention |
| P25-G006 | School profile, academic year, calendar, working days, policies, curriculum, student, staff and access screens remain explicitly preview-only | OPEN | connect each module to authenticated API with validation, audit and E2E |
| P25-G007 | Permission helper unit tests added but Vitest not executed | READY_FOR_VERIFICATION | pnpm install and reproducible green Vitest run |
| P25-G010 | Browser session remains memory-only; reload requires a fresh login | OPEN | approved session persistence design and browser acceptance without unsafe token storage |
| P26-G006 | Curriculum, students, staff and access screens remain preview-only | OPEN | authenticated API integration, field-level authorization and pagination |
| P26-G009 | Configuration mutation APIs now enforce `school.settings.manage` or `academics.manage` instead of a blanket School Admin role; runtime authorization matrix not executed | READY_FOR_VERIFICATION | API integration tests for permitted and forbidden role assignments |
| P27-G002 | Student search/list and admission creation connected; guardian, enrollment, pickup and document workflows remain API-only | PARTIALLY_IMPLEMENTED | implement workflows with PII field-level permission tests and Playwright |
| P27-G003 | Staff list/create/edit, department/designation writes, status lifecycle, teacher assignment and employment-history UI are now connected; verified account linking and document UX remain incomplete | PARTIALLY_IMPLEMENTED | complete verified account-linking/invitation and private-document UI flows; verify staff API permissions and lifecycle end to end |
| P27-G004 | Roles/permission catalogue, custom role creation and assignment-by-ID connected; member picker, assignment listing/revocation and audit view remain | PARTIALLY_IMPLEMENTED | member search, role assignment management and audit E2E |
| P27-G005 | Student/staff/access APIs still use broad School Admin authorization in multiple operations instead of granular module permissions | OPEN | migrate endpoints to granular deny-by-default permissions and prove positive/negative access matrix |
| P27-G006 | P27 frontend uses shared authenticated request helper but no full API integration/browser tests executed | READY_FOR_VERIFICATION | API integration and Playwright E2E with token refresh and school switching |
| P27-G010 | Student list is summary-only but field-level authorization and audit for sensitive student/staff reads are incomplete | OPEN | PII access matrix, audit policy and tests |
| P28-G002 | Student admission now supports one primary guardian, enrollment and pickup-contact UI; guardian editing, merge/deduplication and parent invitation remain absent | PARTIALLY_IMPLEMENTED | complete guardian lifecycle and verified parent account flow with tests |
| P28-G003 | Student detail PII sections are gated by `students.pii.read`; broader PII field inventory and access review remain | PARTIALLY_IMPLEMENTED | complete field/endpoint inventory and role-based negative tests |
| P28-G004 | Department/designation creation, status changes, teacher assignments and employment-history UI present; P255 adds basic staff profile edit UI/API and audit | PARTIALLY_IMPLEMENTED | runtime-verify profile editing, status/employment lifecycle, document storage and permission/audit behavior |
| P28-G007 | Student/staff/access/curriculum routes use granular permission checks; full route inventory and role matrix tests not executed | READY_FOR_VERIFICATION | API integration positive/negative matrix under non-owner DB role |
| P28-G008 | P28 adds `students.pii.read` and `staff.pii.read` permissions and PII audit events; seed execution and PII audit runtime not verified | READY_FOR_VERIFICATION | run idempotent seed and prove allowed/denied PII reads plus audit entries |
| P28-G009 | Permission matcher tests added for exact, module wildcard, global wildcard and denial cases; Vitest not run | READY_FOR_VERIFICATION | run tests in reproducible CI |
| P29-G002 | Guardian PII reads/updates require `students.pii.read` and are audit logged in source; runtime permission and audit tests not run | READY_FOR_VERIFICATION | API tests for allow/deny cases and audit rows under non-owner DB role |
| P29-G003 | Parent account invitation is deliberately not implemented because guardian email/phone ownership is not verified and no complete consent/account-link lifecycle exists | OPEN | verified contact challenge, consent, invitation delivery, token expiry/revocation, account linking and recovery |
| P29-G009 | Access audit remains latest-100 only; pagination, export controls and retention policy remain outstanding | OPEN | cursor pagination, export authorization, retention and tamper-evident external archive |
| P29-G010 | Full student/staff PII field and endpoint inventory remains incomplete beyond guardian and selected detail/list endpoints | OPEN | complete endpoint/field matrix with positive and negative role-based tests |
| P30-G001 | Parent invitation payload is encrypted and queued; P31 adds worker/provider adapter, retries and dead-letter, but real provider remains external | PARTIALLY_IMPLEMENTED | configure and verify a real provider, bounce/delivery receipts, idempotency, secure token delivery and dead-letter replay |
| P30-G009 | Access audit cursor pagination added; pagination stability, retention, export and tamper-evident archive remain | PARTIALLY_IMPLEMENTED | runtime pagination tests, retention policy, authorized export and external immutable archive |
| P31-G001 | Parent invitation BullMQ worker, HTTPS provider adapter, retries, dead-letter and DB outbox reconciliation are source implemented; no real provider configured or delivery tested | PARTIALLY_IMPLEMENTED | configure provider, verify idempotency, delivery/bounce callbacks, token delivery and dead-letter replay end to end |
| P31-G005 | Parent mobile invitation preview, consent display, authentication, school picker, child list, attendance and withdrawal source implemented; Expo build/device E2E not run | READY_FOR_VERIFICATION | Expo typecheck/build and iOS/Android E2E covering accept/login/refresh/switch/withdraw |
| P31-G009 | Parent portal attendance now has stable cursor pagination (P32 source); runtime pagination, authorized export and retention/privacy review remain | PARTIALLY_IMPLEMENTED | PostgreSQL/API pagination tests, authorized export and retention/privacy review |
| P31-G012 | P31 migration revokes P30 pending invitations because exact notice text was not stored; accepted P30 invitations receive a generic historical placeholder | OPEN | review historical consent evidence and communicate/re-invite affected users where legally required |
| P31-G013 | Parent invitation preview is token-possession protected and POST-only, but endpoint rate limiting and abuse monitoring are not implemented | OPEN | add IP/token throttling, abuse alerts and security tests without logging tokens |
| P31-G014 | Worker provider endpoints use generic HTTPS adapter contracts; provider-specific authentication, delivery receipts, callback verification and credential rotation are not configured | OPEN | implement chosen provider adapter, verify callbacks, rotation and operational runbook |
| P31-G015 | Prisma schema, P31 migration, parent role seed, RLS worker policies and all DB integration remain unvalidated in PostgreSQL | OPEN | Prisma validate/generate, clean migration/reapply/rollback, RLS tests using non-owner roles and concurrency suite |
| P31-G017 | Parent account password proof, verified email and guardian link are implemented, but account recovery, MFA, contact change re-verification and multi-guardian account reconciliation remain | OPEN | define and test account recovery/MFA and guardian ownership lifecycle |
| P31-G018 | Parent app stores refresh token in SecureStore, but API base URL/session refresh failure behavior and secure-store device acceptance are not runtime verified | READY_FOR_VERIFICATION | iOS/Android secure storage, token rotation, logout, device backup and refresh-failure tests |
| P32-G004 | P31 real email provider and malware scanner remain unconfigured; P32 environment has no provider credentials or service endpoints | OPEN | configure chosen providers and verify delivery receipts/bounces, scanner magic-byte/malware checks and callbacks |
| P32-G005 | Prisma, PostgreSQL/RLS, Redis/BullMQ, S3, API integration, Vitest, full builds and Playwright remain unexecuted | OPEN | reproducible CI evidence with isolated non-owner DB roles and configured infrastructure |
| P33-G001 | Parent fee statement and manual payment history APIs plus Parent mobile UI are source implemented; no School Admin authoring UI, gateway checkout, refund, receipt PDF or accounting reconciliation | PARTIALLY_IMPLEMENTED | define provider/accounting design and implement tested gateway/refund/reconciliation lifecycle separately from manual records |
| P33-G006 | No School Admin authoring UI for fee charges/payments, homework, report cards or notifications; APIs only | OPEN | build permission-aware School Admin workflows and browser E2E |
| P33-G014 | Full Prisma, PostgreSQL/RLS, Redis/S3/provider, Vitest, builds, typecheck, Expo and Playwright remain unexecuted | OPEN | reproducible CI evidence with isolated services and non-owner database roles |
| P34-G003 | Homework authoring and publication UI is source implemented; submission, private attachment, grading and teacher feedback are absent | PARTIALLY_IMPLEMENTED | implement submission lifecycle, private upload/scan, teacher grading/rubric and feedback with parent visibility tests |
| P34-G004 | Report-card authoring and publish UI accepts JSON result summary; no board/grade schema validation, approval/versioning or PDF generation | PARTIALLY_IMPLEMENTED | implement versioned assessment schemas, approval workflow and generated private PDF with board-specific boundary tests |
| P34-G005 | Parent notification authoring UI and school-side list API are source implemented; transport is in-app only | PARTIALLY_IMPLEMENTED | implement consent-aware outbox, provider delivery, receipts, preferences, retry/dead-letter and unsubscribe behavior |
| P35-G005 | Operator lists filter by student only; search, date range, status filters and export are not implemented | OPEN | add permission-scoped indexed filters and bounded export with audit |
| P35-G006 | Homework submission and text grading/feedback are source implemented in P36; private attachments, rubrics, teacher assignment scoping, history/reopen and runtime verification remain absent | PARTIALLY_IMPLEMENTED | add private scanning, rubric/history, assignment-aware authorization and runtime tests |
| P35-G010 | P35 helper tests are source only; Prisma, PostgreSQL/RLS, API, Vitest, full typecheck/build, Playwright and Expo acceptance not run | OPEN | produce reproducible CI evidence with non-owner DB role and isolated dependencies |
| P36-G001 | P37 adds source-level private attachment upload, scan worker/callback, clean promotion and authorized download; provider/runtime acceptance remains pending | PARTIALLY_IMPLEMENTED | configure S3/scanner and run upload, callback, RLS, consent and download integration tests |
| P36-G003 | P37 adds active staff class/year/grade/section checks and Teacher mobile grading UI; subject-level scope and device/API acceptance remain pending | PARTIALLY_IMPLEMENTED | add subject ID to homework assignment, enforce subject match and run unauthorized teacher/device tests |
| P37-G002 | Parent attachment upload/completion checks accepted consent and linked student; revoked consent, unrelated child, race and RLS cases are not integration tested | READY_FOR_VERIFICATION | run negative authorization and non-owner PostgreSQL RLS tests |
| P37-G004 | Teacher mobile homework list and score/feedback UI are source integrated; no Expo typecheck/build/device E2E | READY_FOR_VERIFICATION | run iOS/Android builds and E2E for session refresh, school switching, grading and sign-out |
| P38-G002 | Approval/rejection workflow, principal permission and author self-approval block are source implemented; workflow concurrency and audit persistence untested | READY_FOR_VERIFICATION | run role, self-approval, stale-state, rejection reason and concurrent approval integration tests |
| P39-G001 | School Admin schema draft, activation and approval queue UI are source integrated; browser workflow and role visibility not tested | READY_FOR_VERIFICATION | Playwright tests for reports.read/manage/approve role combinations, schema creation, activation and review |
| P39-G005 | P40/P41 add transactional batches, independent channel preferences and EMAIL outbox worker with retries/dead-letter; provider receipts/bounces and PUSH remain incomplete | PARTIALLY_IMPLEMENTED | implement provider receipts/bounces and push after provider/device-token decisions; implement transactional consent-aware notification delivery lifecycle |
| P40-G001 | Lookup APIs and structured schema editor are source implemented; version diff/clone, schema activation preview and browser role tests remain absent | PARTIALLY_IMPLEMENTED | add diff/clone/preview and Playwright coverage |
| P40-G009 | Prisma validation, migration apply/rollback/reapply, PostgreSQL RLS/API tests and notification transaction tests not run | OPEN | provide reproducible database acceptance evidence using non-owner credentials |
| P41-G002 | Random 128-bit verification codes and public metadata-only endpoint are source implemented; public RLS policies, abuse/rate controls and endpoint integration are untested | READY_FOR_VERIFICATION | apply migration, test as non-owner role, prove no PII/object URL leak and add distributed WAF rate limiting |
| P41-G005 | IN_APP and EMAIL preferences are evaluated independently; PUSH delivery, device-token lifecycle and provider receipts/bounces remain absent | OPEN | add receipts/bounce/complaint processing and decide push provider/device-token architecture |
| P41-G007 | Prisma validate/generate, migration apply/rollback/reapply, PostgreSQL RLS/API/worker, Vitest, full builds, Playwright, Expo E2E and k6 not run | OPEN | produce reproducible CI evidence with disposable services and non-owner DB roles |
| P42-G002 | Parent mobile has unread count, Load more and Mark all read controls; device/browser workflow and school-switch behavior not tested | READY_FOR_VERIFICATION | Expo iOS/Android E2E for unread changes, pagination, school switching, token refresh and consent withdrawal |
| P42-G008 | Prisma/PostgreSQL/RLS/API, Vitest, full builds, Playwright, Expo E2E and k6 not run | OPEN | produce reproducible runtime CI evidence using disposable services and non-owner DB roles |
| P43-G002 | Named report-card template versions, activation permission, partial unique active index and immutable-content trigger are source implemented; migration/concurrency tests not run | READY_FOR_VERIFICATION | validate Prisma, apply/revert/reapply migration, test concurrent activations and immutability in PostgreSQL |
| P43-G007 | Redis-backed distributed QR verification rate limiting is source implemented; Redis multi-replica integration and browser/device E2E remain unverified | READY_FOR_VERIFICATION | test Redis outage, multi-replica limits, proxy identity trust and QR scan browser/mobile abuse |
| P43-G008 | Prisma validate/generate, migration apply/rollback/reapply, PostgreSQL RLS/API/scanner/worker tests, Vitest, full builds, Playwright, Expo E2E and k6 not run | OPEN | produce reproducible CI evidence using disposable services and non-owner DB roles |
| P45-G006 | PUSH provider and device-token lifecycle remain undecided | OPEN | approve provider, token security, consent, rotation and revocation model |
| P47-G001 | School Admin suppression UI and audit timeline are source implemented; authenticated browser/API behavior has not been run | READY_FOR_VERIFICATION | Run role/permission browser E2E, add/release flows, refresh-token and school-switch tests |
| P47-G002 | P47 list API returns bounded school-scoped audit events without hashes; PostgreSQL RLS, API serialization and cross-school denial remain untested | READY_FOR_VERIFICATION | Run two-school PostgreSQL/API tests under a non-owner non-BYPASSRLS role and prove no email/hash/actor identifier leakage |
| P49-G002 | P45–P48 migration/RLS/webhook/suppression/audit/worker integration acceptance is specified but not executed | OPEN | Execute `docs/phases/P49-NOTIFICATION-LIFECYCLE-ACCEPTANCE.md` against disposable PostgreSQL/Redis with non-owner roles |
| P55-G002 | Notification worker persisted safe error summaries in source; production log aggregation and dead-letter queue inspection remain unverified | OPEN | Validate production logger/collector configuration and verify no recipient PII, hashes, signatures or tokens appear in logs/queues |
| P58-G003 | Transaction isolation, rollback and RLS policies remain unverified on a real non-owner database role | OPEN | Apply migrations and run P49 acceptance plan with two schools and transaction fault injection |
| P59-G002 | Express proxy trust/IP identity and provider webhook burst characteristics not validated in deployment | OPEN | Configure/verify trusted proxy chain and test realistic provider IP/rate burst patterns |
| P62-G003 | Atomic transaction rollback and outbox/event consistency under DB faults remain unverified | OPEN | Execute PostgreSQL fault-injection and concurrency tests with non-owner worker role |
| P65-G003 | Provider event/manual release precedence, alias backfill under existing released rows and concurrent release/create races remain runtime unverified | OPEN | Execute P63/P64/P65 integration plans with fault injection and non-owner RLS role |
| P66-G003 | Alias migration/backfill and current/previous key worker checks remain unverified in PostgreSQL | OPEN | Execute P65 integration plan with non-owner RLS role and key rotation rollback |
| P67-G003 | Prisma alias migration/backfill, RLS, transaction rollback and key retirement dry-run remain unverified | OPEN | Execute P65/P66 integration and retirement runbooks with non-owner RLS role |
| P70-G002 | Application database role SUPERUSER/BYPASSRLS posture is not known in a target environment | OPEN | Configure actual application role and prove it is neither superuser nor BYPASSRLS |
| P73-G001 | Student lifecycle transition API and history schema/migration added; Prisma and PostgreSQL execution not performed | READY_FOR_VERIFICATION | Validate/generate Prisma, deploy migration and verify forced RLS with non-owner role |
| P74-G002 | Account-switch isolation, consent-withdrawal deletion and expiry behavior are source-only | READY_FOR_VERIFICATION | Execute shared-device account-switch, logout, session-expiry and consent-withdrawal scenarios |
| P77-G001 | Request counters/duration and protected metrics endpoint source added; Vitest/scrape tests not run | READY_FOR_VERIFICATION | Run tests and validate Prometheus scrape/auth behavior |
| P77-G003 | Network ACL, alert rules, dashboards, retention and secret-manager token rotation are not configured | OPEN | Complete deployment observability configuration and security review |
| P78-G004 | External provider integrations and jurisdiction/board-specific compliance remain blocked or unapproved | BLOCKED_EXTERNAL | Select providers and obtain authoritative board/legal/provider acceptance evidence |
| P79-G001 | GET /auth/me source contract is implemented; API/Vitest acceptance is pending | READY_FOR_VERIFICATION | Run API integration tests against authenticated active/revoked/expired sessions and verify safe response fields |
| P100-G001 | Student lifecycle transition and history workflows are connected to School Admin UI; local API/database/browser runtime acceptance is deferred | READY_FOR_VERIFICATION | Run local application validation for lifecycle transitions, reason/effective-date persistence, status history and permission enforcement |
| P101-G002 | Data-subject request intake/review API and School Admin UI source added; runtime authorization and workflow acceptance pending | READY_FOR_VERIFICATION | Verify all request transitions, subject scoping, audit records and denied access through API/browser |
| P101-G004 | Automatic export/erasure execution, identity proofing, legal-basis approval and jurisdiction-specific retention schedules remain unimplemented/unapproved | OPEN | Approve legal requirements and implement controlled export/erasure pipeline with hold precedence, approval and evidence |
| P102-G004 | Support-access request/reject/revoke and independent-approver workflow authored; fresh-MFA gate is fail-closed because current auth does not populate `UserSession.mfaVerifiedAt`; grant-backed support session enforcement is absent | OPEN | Complete verified MFA challenge/session binding, implement scoped support-session enforcement/impersonation with approval expiry and full audit |
| P103-G001 | Attendance mark idempotency receipts and payload-hash replay protection authored; concurrent retry and migration acceptance pending | READY_FOR_VERIFICATION | Verify same-key/same-payload replay, same-key/different-payload conflict and concurrent lost-response retry on PostgreSQL/API |
| P103-G003 | Teacher SecureStore queue, stable idempotency keys, bounded retry/backoff, CONFLICT/FAILED states and manual/foreground sync authored | READY_FOR_VERIFICATION | Verify persistence through force-close/restart, network loss/recovery, 409 conflicts, retry/discard and storage limits on iOS/Android |
| P103-G004 | Teacher timetable cache/queue and parent cache are account-scoped; account identity restoration authored | READY_FOR_VERIFICATION | Switch multiple accounts on one physical device and prove no cache/queue leakage; verify sign-out and same-account recovery |
| P103-G006 | Offline mutation coverage is limited to teacher attendance marks; session create/open/submit, homework grading and parent writes remain online-only | OPEN | Complete prioritization, conflict strategy and idempotent server contracts for remaining mobile write workflows |
| P103-G009 | A lost response after server-side refresh-token rotation can leave the client holding a stale refresh token; offline fallback preserves local data but cannot repair a committed rotation whose response was lost | OPEN | Complete refresh-token rotation recovery/idempotency protocol under the P80 authentication workstream and verify replay safely without weakening reuse detection |
| P104-G001 | Tagged PDF structure, document language/title, reading order, semantic tables, figures/alt text and artifacts authored for PDF/UA-1 target | READY_FOR_VERIFICATION | Generate real PDFs and pass veraPDF/PAC; manually verify all structure/reading-order checkpoints |
| P104-G005 | PDF artifact accessibilityTagged/profile/language metadata and staff signed-download endpoint added | READY_FOR_VERIFICATION | Verify metadata persistence, signed URL authorization/expiry and parent/staff download behavior |
| P105-G001 | Authentic pnpm workspace lockfile is absent; CI and Docker builds now require frozen installs and fail closed | OPEN | Restore the correct lockfile for the complete workspace, review package integrity and run clean frozen installs |
| P105-G002 | Secret-file loading and production environment validation authored for required keys, authenticated Redis, HTTPS CORS and provider consistency | READY_FOR_VERIFICATION | Validate on deployment host with real mounted secrets, rotate credentials and confirm no secret values enter logs |
| P105-G003 | Production Dockerfiles, Compose topology, non-root API/unprivileged web images, migrations and TLS Nginx edge authored | READY_FOR_VERIFICATION | Build and scan images, run full Compose stack and verify TLS, health, isolation, routing and worker dependencies |
| P105-G004 | Encrypted PostgreSQL logical backup, checksum/manifest, retention and guarded restore scripts authored | READY_FOR_VERIFICATION | Run backup, checksum verification and isolated restore drill; retain logs and measured restore duration |
| P105-G006 | Prometheus histogram/process metrics, alert rules, Alertmanager webhook and Grafana dashboard configuration authored | READY_FOR_VERIFICATION | Deploy monitoring stack, verify authenticated scraping, alert delivery/resolution and dashboard panels |
| P105-G008 | CI and manually approved GHCR release/deploy workflow authored but blocked by missing lockfile and unconfigured production secrets/runner environment | OPEN | Restore lockfile, configure protected environment/SSH/registry and complete a staged release/deployment |
| P107-G002 | Security operations table migration with forced row-level security authored; Prisma validation, migration execution and non-owner RLS acceptance not performed | READY_FOR_VERIFICATION | Run Prisma validate/generate and clean/upgraded PostgreSQL migration; prove SELECT/INSERT/UPDATE isolation with least-privileged DB role |
| P109-G002 | Teacher and Parent mobile clients have not yet adopted the shared `/auth/me` identity bootstrap contract | OPEN | Integrate identity bootstrap into both mobile session restore/login/reconnect flows and verify revoked membership and account-switch behavior |
| P110-G001 | Teacher and Parent mobile login, refresh and restore now validate server-owned identity through `/auth/me`; source verifier passes but device/runtime acceptance is deferred | READY_FOR_VERIFICATION | Verify login, restore, refresh rotation and server-returned identity on supported iOS/Android devices; confirm cache namespace follows authenticated account |
| P110-G002 | Explicit 401/403 reconnect handling clears local authenticated state and account-scoped parent cache or teacher selection; revoked-session/device acceptance is not performed | READY_FOR_VERIFICATION | Revoke active sessions and memberships server-side, reconnect both apps, verify cached data is no longer exposed and reauthentication is required |
| P110-G003 | Cross-application account-switch, multi-device refresh-token rotation and offline-to-online conflict acceptance remain unverified | OPEN | Complete device-level account-switch and concurrent refresh scenarios, validate queued teacher mutation ownership and parent cache isolation, and retain evidence |
| P111-G001 | Teacher and Parent mobile refresh coordination is now keyed by API origin and refresh-token scope; stale refresh operations are prevented from overwriting a newer sign-in at source level | READY_FOR_VERIFICATION | Exercise concurrent refresh, account switching during refresh and API-origin switching on iOS/Android; verify server token-family rotation/reuse policy |
| P111-G002 | Authenticated server user ID is persisted as a stable local account marker in both mobile apps; broader cache and queue migration from email-hash namespace to immutable user-ID namespace is not complete | PARTIALLY_IMPLEMENTED | Migrate all teacher queues/snapshots and parent caches to server user ID with safe legacy handling; prove cross-account cache isolation and purge behavior |
| P111-G003 | Parent cache and teacher mutation queue are scoped by account and school at source level, but offline queue ownership, multi-device conflict handling and revocation propagation have not been runtime-verified | READY_FOR_VERIFICATION | Complete multi-account device scenarios, revoked membership/session scenarios, pending mutation ownership and conflict/replay validation; retain device/API evidence |
| P112-G001 | Refresh-token rotation now groups sessions into token families, links replaced sessions, and revokes active family sessions when a rotated token is reused; Prisma migration and runtime behavior are not validated | READY_FOR_VERIFICATION | Apply migration, validate Prisma client, and run concurrent refresh/reuse scenarios against PostgreSQL; verify family-wide revocation and safe 401 responses |
| P112-G002 | Authenticated users can list active sessions, revoke an owned session, and revoke all other sessions; API authorization, audit persistence and cross-account isolation remain untested | READY_FOR_VERIFICATION | API integration tests must prove only the owning user can enumerate/revoke sessions, current-session revocation behavior, audit evidence and immediate access-token rejection |
| P112-G003 | Login/refresh/session-revocation lifecycle has source-level audit events and MFA step-up foundation; device labeling, runtime verification and production monitoring remain incomplete | PARTIALLY_IMPLEMENTED | Validate session controls and MFA challenge binding; implement verified device registration/labels and production alerting for refresh-token reuse |
P112 does not close historical gaps solely on source implementation. No gap was fully closed in this phase because runtime/API/database validation remains deferred. Existing P16-G006 was narrowed to the remaining MFA, password-reset delivery and biometric scope; session management work is tracked by P112-G002 pending verification.
| P113-G001 | Redis-backed distributed rate limits are attached to registration, login, refresh, password-forgot and password-reset endpoints; runtime behavior, proxy/IP trust configuration and production thresholds are not verified | READY_FOR_VERIFICATION | Execute API integration tests with Redis; verify per-IP and per-account windows, 429 and Retry-After responses, fail-closed behavior on Redis outage, and safe behavior behind the production trusted-proxy configuration |
| P113-G002 | Privacy-safe abuse counters, admin summary, source-level security alert events and account+source-IP progressive cooldowns are implemented; external alert delivery, MFA/adaptive challenge and threshold tuning remain | PARTIALLY_IMPLEMENTED | Integrate approved alert routing/on-call delivery; verify cooldown recovery, false-positive handling, thresholds and retention |
| P114-G001 | Privacy-safe authentication counters now emit threshold-deduplicated security alert events for repeated failures, rate limits and refresh-token reuse; external alert routing and on-call delivery remain absent | PARTIALLY_IMPLEMENTED | Connect the alert stream to an approved notification/on-call provider; verify delivery, escalation, ownership and retention |
| P114-G002 | The platform-admin-only seven-day abuse summary now also exposes the latest privacy-safe threshold alert events; Redis runtime, authorization-negative cases and operational dashboard acceptance remain unverified | READY_FOR_VERIFICATION | Verify admin/non-admin access, alert stream privacy, Redis outage, daily rollover, retention and metric accuracy with API evidence |
| P114-G003 | Progressive account+source-IP cooldowns are implemented at source after repeated failed logins; adaptive challenge/MFA escalation and verified false-positive recovery remain absent | PARTIALLY_IMPLEMENTED | Add approved MFA/adaptive challenge and account recovery; validate cooldown behavior and abuse-resistance with runtime evidence |
| P115-G003 | TOTP step-up, one-time recovery codes and configurable role-policy challenge/enrollment flows now exist across web/mobile; adaptive risk escalation and verified recovery for cooldown false positives remain incomplete | PARTIALLY_IMPLEMENTED | Verify MFA/recovery flows at runtime; implement adaptive risk challenge and accessible false-positive account recovery |
| P116-G001 | TOTP enrollment, encrypted seed storage, TOTP verification, session-bound five-minute MFA freshness and one-time hashed recovery codes are implemented at source; schema migration and runtime behavior are unverified | READY_FOR_VERIFICATION | Validate Prisma schema, apply migration, test enrollment expiry, TOTP clock drift, recovery-code single use, encryption-key failure and session freshness with API/database evidence |
| P116-G002 | Platform-admin middleware now requires an enrolled TOTP factor and fresh MFA verification; deny/allow paths and all platform-admin route coverage are not runtime-verified | READY_FOR_VERIFICATION | Verify non-admin denial, admin without factor denial, stale-MFA denial, successful step-up access and middleware coverage for every privileged route |
| P116-G003 | TOTP foundation supports configurable platform-admin and role-key policy evaluation plus web/mobile enrollment and challenge flows; WebAuthn/passkeys, email/SMS, biometric re-authentication and administrative recovery remain absent. Central enforcement is now implemented in the shared authenticate middleware for routes using it | PARTIALLY_IMPLEMENTED | Verify middleware coverage across all protected routes and decide additional factors and recovery ownership |
| P117-G001 | MFA status now evaluates platform-admin policy plus configurable role keys from `MFA_REQUIRED_ROLE_KEYS`; policy and freshness metadata are returned to authenticated clients | READY_FOR_VERIFICATION | Validate role assignments, platform-admin policy, empty/malformed configuration, enrollment state and five-minute freshness with API/database evidence |
| P117-G003 | School Admin, Teacher Mobile and Parent Mobile now expose MFA enrollment/challenge workflows and query policy during sign-in/session restoration; device runtime, accessibility, account switching and recovery behavior remain unverified | READY_FOR_VERIFICATION | Verify web/iOS/Android enrollment, challenge, recovery-code use, restore-session challenge, cancellation, account switching and stale-session behavior |
| P118-G001 | Shared authenticate middleware now enforces platform-admin and configured role-key MFA policies before protected handlers execute; runtime behavior is unverified | READY_FOR_VERIFICATION | Verify enrolled/fresh allow path, missing-factor enrollment denial, stale/future timestamp denial, configured role matching, and exempt bootstrap routes using API/database evidence |
| P118-G002 | Source inventory was reconciled in P119 to 236 shared-authenticated route declarations and 14 explicitly reviewed public/token/webhook exceptions across 250 declarations; handler-level authorization and runtime route acceptance remain outstanding | READY_FOR_VERIFICATION | Verify all protected routes and public capability/signature flows at runtime; complete resource-level authorization and alternate ingress/service-path audit |
| P118-G003 | MFA bootstrap endpoints are explicitly exempted so users can load identity/status, enroll and verify; recovery, factor-disable, session-revocation and account-switching behavior still require runtime/security validation | READY_FOR_VERIFICATION | Verify the exact method/path allowlist, ensure factor disable and session management require fresh MFA, and validate recovery and account-switching behavior |
| P119-G001 | Static Express route inventory covers 250 route declarations across 22 route files: 236 use shared authenticate middleware and 14 are explicitly allowlisted public/token/webhook exceptions | READY_FOR_VERIFICATION | Run API integration checks for authenticated allow/deny, all public capability flows, webhook signature failures, rate limits and central MFA policy across every router |
| P119-G003 | Public invitation, password recovery, refresh/logout, payment/notification webhook and report-card verification exceptions are documented with their source controls; runtime abuse/security acceptance remains outstanding | READY_FOR_VERIFICATION | Verify one-time token expiry/replay, HMAC invalid/valid signatures, provider binding, webhook idempotency, public response privacy and rate-limit behavior |
| P120-G001 | Admissions routes now require active school membership plus `admissions.read` for reads and `admissions.manage` for mutations, enabling least-privilege Front Office/Principal role behavior at source level | READY_FOR_VERIFICATION | Verify read-only and manage roles against every admissions endpoint; confirm unauthorized reads/writes are denied and no role can access another school
| P121-G001 | Homework attachment upload, completion and parent download now share a strict guardian ownership predicate requiring the authenticated accepting user, active verified guardian, accepted non-withdrawn consent and exact school/student link | READY_FOR_VERIFICATION | Verify upload, completion and download denial for unrelated parent, unverified guardian, withdrawn consent, mismatched acceptedByUserId, other school and non-linked student; run against non-owner DB role |
| P121-G003 | Staff homework attachment download, P122 report-card reads, P123 student detail/guardian/document controls, and P124 attendance-history reads now have assignment-scoped source controls; broader module and worker boundaries remain unverified | OPEN | Complete teacher-to-class/section/student authorization audit across all modules and internal worker paths; verify all assignment-scoped reads/writes, historical access and substitute-teacher behavior with API/database evidence |
| P122-G002 | P123 adds field-level PII gating, assignment-scoped teacher access to student/guardian details and student documents, and confirms fees require explicit `fees.read`; broader PII and financial access review remains incomplete | OPEN | Audit every student and fee endpoint for teacher role, permission, class assignment and PII minimization; implement least-privilege filtering and verify denial for unrelated students |
| P122-G003 | Current-date and effective-date teacher assignment checks are used for attendance and timetable source paths; historical record access and substitute/cover-teacher authorization remain only partially defined | OPEN | Define school policy for historical records and substitute teachers; implement effective-date-aware access for every academic module and retain approval/audit evidence |
| P123-G002 | Built-in teacher-role users are restricted to currently assigned enrolled students for student detail, guardian details and student-document downloads; custom role combinations and other student resource surfaces remain to be reviewed | READY_FOR_VERIFICATION | Verify assigned/unassigned student access, expired/future assignments, role combinations, document URL issuance, and denial after assignment revocation |
| P123-G003 | School fee listing requires `fees.read`; P125 adds separate `fees.payments.read` and `fees.payments.record` permissions and a least-privilege `SCHOOL_FINANCE` role; P127 adds school-scoped immutable double-entry posting for newly published fee charges, recorded payments and settled refunds. Parent fee access remains consent-bound and requires `parent.fees.read` | READY_FOR_VERIFICATION | Verify teacher denial, finance-role payment-detail visibility and recording, role assignment behavior, parent consent withdrawal, and cross-school fee/payment denial |
| P124-G001 | Teacher attendance session listing now filters assignment validity using the requested attendance date before querying sessions; the session query no longer references assignment-only date fields | READY_FOR_VERIFICATION | Verify teacher session listing for active, future and expired assignments and confirm date/academic-year/grade/section scoping in API and database runtime |
| P124-G002 | Student attendance history now limits non-admin readers to sessions matching an active enrollment and currently effective teacher assignment; correction requests validate the exact session academic year and date | READY_FOR_VERIFICATION | Verify assigned versus unassigned student history, historical sessions, revoked/expired assignments, correction request scope and cross-school denial |
| P125-G001 | School Admin fee-list payment details are now returned only with `fees.payments.read`; fee charge summaries still require `fees.read` | READY_FOR_VERIFICATION | Verify users with fees.read only do not receive payment methods/references/individual payment rows, while users with both permissions do; include cross-school identifiers and pagination |
| P125-G002 | Manual payment recording now requires `fees.payments.record`; a least-privilege seeded `SCHOOL_FINANCE` role receives payment read/record and fee summary read but not `fees.manage` | READY_FOR_VERIFICATION | Run idempotent seed, assign finance role, verify payment recording succeeds only with the new permission, charge creation/publication remains denied, and existing school-admin behavior remains intact |
| P126-G001 | Refund request, independent approval/rejection and externally evidenced settlement source workflows are implemented with idempotency, payment amount reservation, requester/approver separation and audit events | READY_FOR_VERIFICATION | Validate Prisma schema/migration, RLS using a non-owner database role, duplicate idempotency keys, concurrent requests and settlements, partial/full refund arithmetic, rejection reservation release and cross-school denial |
| P128-G001 | Added account-wise general-ledger reporting with date filters, daily collection/refund summaries, student-level fee outstanding aggregation and internal cash-clearing source-to-ledger comparison; school-admin finance workspace consumes these APIs | READY_FOR_VERIFICATION | Validate API authorization and date boundaries on PostgreSQL; reconcile account-wise lines to trial balance; verify multi-currency grouping, pagination/truncation and cross-school denial; build and run School Admin workspace |
| P128-G003 | Added authorized append-only journal reversal by posting a new opposite-sided journal into the current open period; source journals are not edited and duplicate reversal requests return the existing reversal | READY_FOR_VERIFICATION | Verify reversal permission, requester audit, duplicate/concurrent requests, closed-period behavior, original/reversal balance equality and cross-school denial on PostgreSQL |
| P144-G001 | Parent Mobile refund request submission across secured API, guardian link/consent checks, payment ownership validation, idempotency and reservation-aware refund limit; offline action blocked | READY_FOR_VERIFICATION | Apply/validate on PostgreSQL; verify permission and guardian-link denial paths, concurrency reservation, iOS/Android UI and API integration, parent request visible to school staff and full approval/rejection/settlement lifecycle runtime acceptance |
| P145-G001 | Finance workspace approval/rejection with required notes, settlement recording with reference/date/note, parent publication controls and request/rejection/settlement detail visibility | READY_FOR_VERIFICATION | Runtime API/DB acceptance; verify reviewer authorization and self-approval denial, reject/approve transitions, settlement posting/reconciliation and duplicate-reference rejection, parent publication privacy, UI integration and runtime audit evidence |
| P162-G001 | Added a durable deduplicated operations-alert outbox, configurable failure threshold, worker degraded/recovery events, authenticated webhook delivery, idempotency keys and capped exponential retry. | PARTIALLY_IMPLEMENTED | Configure webhook URL/token; apply migration; verify webhook signature/auth/idempotency contract, provider delivery, alert recovery, retry/dead-letter policy and worker restart behavior in deployment. No email/SMS provider is configured by this phase. |
- **P164-G002 (OPEN):** Deploy and verify platform-admin + fresh-MFA enforcement, RLS context, global alert visibility, acknowledgement/retry audit, webhook delivery, and API/UI builds.
| P173-G002 | School Admin Admissions workspace and Staff Mobile Admissions panel use the authenticated admissions API for enquiry/application, stage changes, offers, accept/decline, document upload/list/download and conversion flows. | IN_PROGRESS | Prospective-parent application/enquiry self-service UI in Parent Mobile/Public Portal is not implemented; runtime mobile acceptance remains pending. |
| P173-G005 | Admission document security status, scan dispatch reconciliation, worker cleanup for abandoned PENDING_UPLOAD records and scoped scanner RLS policies are included. | READY_FOR_VERIFICATION | Verify migration, RLS policy behavior with non-owner roles, scanner callback and scheduled cleanup in runtime. |
- P174-G002 — Enrollment conversion reuses a same-school guardian on matching phone or case-insensitive email; safe merge, identity/account linking, uniqueness migration and runtime concurrency remain OPEN.
- P177-G002 — Anonymous application draft intake with generated application number and random tracking token implemented; token hash only is stored. Status: READY_FOR_VERIFICATION.
- P177-G003 — Public status lookup returns limited application fields via bearer tracking token. Status: READY_FOR_VERIFICATION.
- P177-G005 — Parent/Public UI, token-authorized document upload/checklist, public submit/eligibility validation, email/SMS verification, anti-bot, token expiry/revocation and runtime acceptance remain OPEN.
- P178-G002 — Application draft UI, application number and tracking token display/copy integrated with P177 application API. Status: READY_FOR_VERIFICATION.
- P178-G005 — Public document upload/checklist, eligibility and final submission, shared rate limit, CAPTCHA, contact verification, token expiry/revocation and runtime acceptance remain OPEN.
- P179-G001 — Applicant bearer-token document checklist endpoint implemented with board-specific/ANY eligibility-rule resolution. Status: READY_FOR_VERIFICATION.
- P179-G002 — Public upload authorization validates document code against configured checklist; accepts PDF/JPEG/PNG and max 25 MB. Status: READY_FOR_VERIFICATION.
- P179-G005 — Final eligibility/document-verified application submission, public school context resolution, distributed abuse controls, CAPTCHA/contact verification, tracking-token lifecycle and runtime acceptance remain OPEN.
- P180-G001 — Applicant token-authorized submission endpoint added; only DRAFT/DOCUMENTS_PENDING states may submit. Status: READY_FOR_VERIFICATION.
- P180-G006 — CAPTCHA/contact verification, shared abuse controls, token lifecycle, automatic school-context mapping, notifications, runtime/API/security acceptance remain OPEN.
- P182-G002 — Single guardian match is reused; no match creates a guardian; transaction rolls back on ambiguous identity. Status: READY_FOR_VERIFICATION.
- [x] P190-G002 — Notification payload avoids guardian contacts, document contents, tracking token and private notes.
- [x] P194-G001 — Public tracking token expiry field added; public applications receive 30-day expiry.
- [x] P194-G002 — Public status/document/submit token resolver rejects expired and revoked tokens.
- [x] P194-G003 — Valid applicant can rotate tracking token; previous token invalidated by hash replacement.
- [ ] P194-G005 — Token recovery journey and parent portal UX integration — OPEN.
- [ ] P195-G003 — Indexed normalized identity keys or dedicated identity-key table required for scale; current matching enumerates active school guardians.
- [ ] P199-G005 — End-to-end permission-negative tests, migration/runtime validation — DEFERRED.
- [x] P200-G003 — Reconciliation resolves active same-school users with `admissions.manage`; payload excludes tracking tokens, guardian contacts, documents and internal notes.
- [ ] P202-G003 — OTP request/verify endpoints, atomic attempt enforcement, resend cooldown, token binding, and submission gating — OPEN.
- [x] P203-G001 — Added token-bound public verification-code request endpoint for guardian phone/email.
- [x] P203-G004 — Verified timestamp is written to guardian phone/email field on application; endpoints restricted to public-tracking token and draft/document-pending lifecycle.
- [ ] P203-G006 — Production email/SMS provider delivery configuration and secrets — OPEN; only development console delivery can be enabled via `ADMISSIONS_OTP_DEV_CONSOLE=true` outside production.
- [x] P204-G002 — Connected code-request and code-verify calls to the token-bound P203 APIs; added numeric OTP input, loading/disabled states and accessible messages.
- [x] P205-G001 — Token-protected public application status endpoint returns guardian phone/email verified timestamps only; contact values are not exposed.
- [x] P206-G001 — Authenticated school policy read/write API added with admissions.read/manage permission checks.
- [x] P207-G001 — Replaced non-cryptographic `Math.random()` OTP generation with Node crypto `randomInt(0, 1_000_000)`.
- [x] P208-G001 — OTP digest comparison uses Node `timingSafeEqual` for fixed-size SHA-256 buffers.
- [x] P209-G001 — Email contact verification uses configured HTTPS parent email provider endpoint/token/sender.
- [x] P210-G001 — Public SMS OTP request/verify are disabled with explicit 410 deferred response and stable code. (source implemented; static check)
- [x] P210-G002 — Applicant portal presents email-only verification and explains phone OTP is deferred. (source implemented; static check)
- [x] P210-G003 — Phone verification removed from public submission gate; legacy global flag cannot block submission by phone OTP. (source implemented; static check)
- [ ] P216-G003 — Reviewer workload, assignment audit trail, permissions refinement, DB migration/runtime/API/mobile acceptance remain OPEN/deferred.
- [ ] P216-G003 — Reviewer workload, assignment audit trail, permissions refinement, migration/runtime/API/mobile acceptance remain OPEN/deferred.
- [ ] P217-G003 — Assigned-to-me/personal queue requires reliable session user identity; auto-balancing, assignment audit, SLA/priority, notifications and mobile parity remain OPEN.
- [ ] P218-G005 — Reviewer notifications, personal queue using authenticated identity, SLA aging/priority, assignment workload balancing and mobile parity — OPEN.
- [ ] P219-G004 — Decision-note authorization refinement, applicant correction/request-info workflows, notification delivery, mobile parity, builds/typechecks/migration/runtime/API/E2E/security acceptance remain OPEN/DEFERRED.
- [ ] P220-G003 — Reviewer note freshness/actor authorization refinement, applicant correction workflow, notifications, mobile parity, and runtime/API/DB/build/E2E/security acceptance remain OPEN/DEFERRED.
- [x] P221-G002 — Applicants can edit permitted application fields while status is DOCUMENTS_PENDING using tracking token; conditional update guards status/token expiry/revocation and preserves workflow status.
- [x] P222-G003 — Public tracking-token applicant API supports scoped, OPEN-only response submissions with validation and stale/duplicate conflict handling.
- [x] P229-G002 — Token-authenticated public inbox GET and mark-read endpoint; token expiry/revocation and application scope enforced.
- [x] P241-G001 — Before enrollment submission, School Admin verifies the selected section belongs to the configured grade/year allocation and has seats available in the loaded capacity snapshot; invalid or zero-seat selections are blocked with actionable feedback. Backend capacity enforcement remains authoritative for stale snapshots and concurrency.
- Closed active gap `P08-G010`: School Admin student/guardian UI connected to authenticated APIs and persistent state. Source evidence includes `apps/school-admin/src/OperationalModulesWorkspace.tsx` student create/profile, enrollment, guardian link/update, lifecycle, secure document upload, and related history views. P242 expands the profile edit coverage.
| P255-G002 | Staff account-linking/invitation remains limited to existing verified-account linking; no invite delivery or self-service acceptance flow | OPEN | configure invitation delivery and end-to-end invite/acceptance UX |
| P256-G002 | Broader platform operations UI (lifecycle detail, support grants, domains, branding, settings/secrets, alerts) is not yet basic UI-covered end-to-end | OPEN | Audit and implement basic UI/API workflows only where missing; verify each operation and permission boundary |
| P260-G003 | Family-wide multi-student views and deeper guardian identity/privacy refinements are advanced work | CYCLE_2_PENDING | Revisit during Cycle 2 deep completion |
- [ ] **P272-G001** — School Admin homework authoring currently targets an individual student; class/section/subject-wide assignment targeting and bulk student distribution remain OPEN.
- [ ] **P272-G003** — Build/typecheck/API/browser/mobile/E2E verification of homework authoring, submissions, attachments, grading, parent consent and teacher scope remains OPEN (deferred final validation).
- [x] **P280-G001** — Recipient resolution and basic in-app delivery fan-out implemented in P281 for supported audience types, with consent and opt-out protections. Email/push and role inbox UI remain separate gaps.
- [ ] **P288-G001** — Implement push provider/worker, token registration lifecycle, retries, receipts and device delivery operations. **OPEN**.
- P289-G001 — Push provider/device token/delivery worker remains OPEN.
- **P304-G003** — Rollover approvals, dry-run summary reports, permissions, and bulk promotion/transfer reconciliation remain OPEN.
- **P305-G003** — Capacity-aware preview, approval/permission controls, reconciliation and reporting remain OPEN.
- **P306-G003 OPEN** — Capacity reservation, approval/permission gates, audit records and consolidated reporting remain open.
- **P309-G001 OPEN** — Durable server-side audit persistence, immutability, audit access permissions and retention remain open.
- **P313-G001 OPEN** — Runtime integration/build/typecheck and authenticated browser acceptance of catalog selectors, section filtering, preview and assignment remain unverified.
- **P314-G001 PARTIAL** — School Admin Finance workspace now exposes permission-gated payment history per charge and a printable receipt view; API currently returns payment details only when `fees.payments.read` is granted. Runtime acceptance remains unverified.
- **P315-G001 PARTIAL** — Catalog-backed grade/section selector implementation is source-complete; authenticated API and browser runtime acceptance remains unverified.
- **P316-G001 PARTIAL** — Source implementation and static checks pass; dependency-backed build, authenticated API and browser acceptance remain unverified.
| P329-G001 | Parent mobile attachment secure-link request and CLEAN-only gate are source implemented; guardian authorization, signed URL expiry, provider/storage and device acceptance remain unverified | READY_FOR_VERIFICATION | run parent API/RLS/consent negative tests, storage signed-link expiry and iOS/Android open-flow E2E |
- [ ] P333-G004 — Guardian invitation/consent/merge lifecycle and full duplicate applicant resolution remain OPEN.
- [x] P334-G001 — Authenticated session-bound personal reviewer queue endpoint with school/org scope, active status filter and bounded result size.
- [x] P337-G001 — Public tracking-token withdrawal endpoint with reason validation, rate limiting, stage eligibility, transactional state guard, tracking-token revocation and applicant notification. SOURCE_IMPLEMENTED.
- [x] P338-G001 — Tracking-token-authenticated public endpoint lists offers for the matching application with safe fields and school/org scoping. SOURCE_IMPLEMENTED.
- [x] P341-G003 — Upload authorization, private storage multipart submission, completion API, and post-upload refresh confirmed in source. SOURCE_AUDITED.
- **P349-G001 OPEN:** Runtime validation of Redis public admissions rate limiting, proxy/IP configuration, bypass/OTP abuse controls, upload storage security, and cross-school isolation is deferred to Cycle 2.
- **P349-G002 OPEN:** Tracking tokens in URL paths may be captured in access/request logs; header migration requires a compatibility design.
- **P356-G001 PARTIAL:** Library catalogue, physical copies, issue/return, basic reservation endpoints, school Admin UI and permission-seeded roles implemented. Runtime validation unavailable.
- **P368-G001 CLOSED (source audit):** Added static auth/security control inventory; 16/16 source checks pass.
- **P370-G002 OPEN:** School owner/admin invitations and onboarding checklist assignment/ownership remain unimplemented in this slice.
- **P371-G002 OPEN:** Server-persisted wizard progression/checklist ownership, multi-user resumption and onboarding invitations remain unimplemented.
- **P371-G003 OPEN:** Configuration writes and dependency-ordered orchestration across grades, sections, subjects, rooms, fees and roles remain incomplete.
- **P372-G002 OPEN:** Server-side enforcement, persistent progress/checklist ownership, setup mutations and invitations remain unimplemented. UI gating does not provide backend enforcement.
- **P372-G003 OPEN:** Dependency-ordered setup across grade/section/subject/room/fee/role configuration, multi-campus inheritance/overrides and bulk import/export preview/rollback remain open.
- **P373-G003 OPEN:** Owner/admin invitations, configuration writes, backend prerequisite enforcement and full dependency-order setup remain open.
- **P374-G003 OPEN:** Owner/admin invitation, full setup sequencing, and backend configuration prerequisite enforcement.
- **P375-G002 OPEN:** Server-persisted progress/checklist ownership, multi-user resumption and owner/admin invitation/assignment.
- **P375-G003 OPEN:** Configuration writes, full dependency sequencing and backend enforcement across grade/section/subject/room/fee/role configuration.
- **P376-G002 OPEN:** Server-persisted progress, checklist ownership, multi-user resumption and owner/admin invitation/assignment.
- **P377-G005 OPEN:** Invitation/assignment, full configuration writes and dependency enforcement, multi-campus inheritance/overrides, bulk import/export/rollback remain.
- **P378-G002 OPEN:** Owner/admin invitations, invite acceptance and invitation delivery remain unimplemented in onboarding.
- **P378-G003 OPEN:** Full grade/section/subject/room/fee/role setup orchestration and backend prerequisite enforcement remain.
- **P380-G003 OPEN:** Full backend prerequisite enforcement for setup mutations, owner/admin invitations, multi-campus inheritance/overrides and bulk import/export preview/rollback remain.
- **P381-G003 OPEN:** Owner/admin invitations and invitation delivery are not part of onboarding checklist assignment.
- **P382-G003 OPEN:** F03 owner/admin invitation lifecycle/delivery, setup orchestration, server mutation prerequisite enforcement, multi-campus inheritance/overrides and bulk import/export preview/rollback remain.
- **P384-G002 OPEN:** Server-side assignment notifications/inbox, invitation lifecycle/delivery, workflow orchestration and backend setup prerequisite enforcement remain.
- **P385-G002 OPEN:** Invitation lifecycle and delivery, end-to-end configuration orchestration, server-enforced setup prerequisite rules, multi-campus inheritance/overrides, and bulk configuration import preview/validation/rollback remain.
- **P386-G002 OPEN:** Invitation lifecycle/delivery, full setup orchestration, server-enforced prerequisite rules, multi-campus inheritance/overrides, bulk import preview/validation/rollback remain.
- **P388-G002 OPEN:** Invitation lifecycle/delivery, full setup orchestration, server-enforced prerequisite rules, multi-campus inheritance/overrides, and bulk import preview/validation/rollback remain.
- **P389-G002 CLOSED (source slice):** Duplicate pending invitations for normalized email/role/school scope are rejected; acceptance serializes token attempts and avoids duplicate scoped role assignment. P389 verifier 15/15 PASS.
- **P389-G003 OPEN:** Invitation email delivery/outbox and acceptance deep-link UX remain unimplemented; creation still reports pending delivery.
- **P390-G002 OPEN:** Invitation delivery/outbox and deep-link UX, full setup orchestration, grade/section/subject/room/fee/role configuration dependency orchestration, multi-campus inheritance/overrides, and bulk configuration import preview/validation/rollback remain.
- **P391-G002 OPEN:** Complete dependency-ordered configuration orchestration across academic, grade/section/subject/room/fee/role domains remains.
- **P396-G001 CLOSED (source slice):** Versioned JSON export/import preview/apply added for Profile, Weekly Working Days, and Policies. Scope and selected data validation; RBAC apply guard; best-effort compensating rollback on API write failure. Verifier 15/15 PASS.
- **P397-G002 CLOSED (source slice):** Selected-calendar export/import with preview, validation, permission-guarded additive apply now covers calendar/events. P398 verifier 18/18 PASS. This does not close bulk multi-calendar or cross-domain transfer.
- **P402-G002 OPEN:** Editing helpers are not integrated into campus persistence, CRUD/API, authorization, or admin UI; compiled runtime behavior and full build remain unverified.
- **P408-G001 CLOSED (source slice):** Added permission-filtered Campus Registry navigation and school-admin workspace connected to P407 list/create/update/archive endpoints. UI supports code/name/description, active/inactive status, main-campus designation, edit, archive confirmation, loading/error/success feedback. Verifier 15/15 PASS; syntax scan 251 files/0 errors.
- **P411-G001 OPEN:** Starter board metadata is not official curriculum content. Authoritative board-specific curriculum packs and outcomes/competency mapping with provenance, review, version approval and effective dates remain open.
- **P411-G002 OPEN:** Curriculum planning, lesson planning, curriculum coverage, progression/rollover, complete academic setup UI/import/export and board-policy validation remain open.
- **P412-G002 OPEN:** Official board curriculum content, bulk import/edit/delete, outcome-to-assessment mapping, UI, full Prisma/build/runtime/database/browser/mobile/E2E acceptance remain open. Unit test source is authored but not executed because dependencies are unavailable.
- **P413-G001 CLOSED (source slice):** Added authenticated outcomes administration workspace integrated into Board & Curriculum. Loads versions, grades, subjects and outcome records; supports grade/status filters; creates school-owned outcomes with provenance; exposes review transitions and read-only mode; write controls require `academics.manage`. Focused verifier 22/22 PASS.
- **P415-G002 PARTIALLY CLOSED by P416:** Outcome-to-assessment exam mapping source slice is implemented. Official board content packs and authoritative provenance/review/versioning remain open; runtime acceptance remains deferred. Full build/typecheck, Prisma validation/migration, live API/DB/RLS, browser/mobile/E2E acceptance remain unverified/deferred.
- **P419-G001 CLOSED (source slice):** Added week view (Monday–Sunday), month calendar (42-cell grid), list view, date navigation/Today shortcut, grade and subject filters, scheduled lesson grouping, unscheduled non-archived plans section, card status/duration, and edit action integration. Existing CRUD form and list remain preserved. P419 verifier 23/23 PASS; P411–P418 source regression verifiers pass where executable.
- **P420-G002 OPEN:** Runtime acceptance remains pending: Prisma schema validation/generation, migration execution, live API/database/RLS, permission integration, browser/mobile and E2E. Teacher assignments are not yet exposed in teacher mobile/portal workflows.
- **P422-G002 OPEN:** Full typecheck/build, Prisma schema validation/generation, migration application, live API/database/RLS and permission integration, mobile device/browser and E2E acceptance remain unverified. Reflection review/export and offline reflection queue are not implemented.
- [ ] P423-G002 — Prisma validation/generation, migration apply, live API/database/RLS, full build/typecheck, coordinator authorization integration, UI runtime and E2E acceptance — READY_FOR_VERIFICATION
- [ ] P426-G001 — Validate notification schema/client generation and apply migration in runtime; live API/RLS authorization, full build/typecheck, and mobile E2E acceptance. READY_FOR_VERIFICATION
- [ ] P428-G003 — Full typecheck/build, database migration, authorization integration and E2E acceptance — OPEN
- **P429-G001 CLOSED (source slice):** School Admin policy workspace provides due-soon and overdue switches, frequency selection (12–168 hours), policy save, refresh and reset-to-default. Integrated under Curriculum Outcomes, permission gated with `academics.manage`; P429 verifier 16/16 PASS and TSX syntax checks 0 diagnostics.
- **P430-G002 OPEN:** Live authorization/RLS, low-count privacy disclosure review and runtime acceptance for aggregate endpoint.
- **P431-G003 OPEN:** Privacy stakeholder review of threshold and aggregate disclosure risk; live authorization/RLS and runtime acceptance.
- **P433-G002 OPEN:** Runtime test API filtering, cursor edge cases, CSV download/auth, DB behavior and full build/typecheck.
- **P444-G003 OPEN:** Verify lifecycle history access and transitions with platform-admin/MFA authorization in runtime.
- **P445-G002 OPEN:** Add and run API authorization and SLA endpoint tests for future deadline validation, resolved-alert rejection, and assignment identity validation.
- **P452-G001 OPEN:** Live DB/API and authorization-boundary validation for paging and unread count.
- **P453-G001 OPEN:** TypeScript/Expo build and mobile-device validation of teacher inbox pagination, read-state badge and session-refresh behavior.
- **P456-G003 OPEN:** Full API/workspace typecheck/build and live authorization/RLS tests remain pending.
| P457-G001 | Seed-source role and permission catalogue is inventoried (77 permission keys, 12 role definitions); actual database drift is not checked | READY_FOR_VERIFICATION | Compare seed catalogue with live database using non-owner credentials and report missing/extra grants |
| P457-G002 | Fixed seeded role grants are mapped to permission keys; role-assignment lifecycle and effective-permission evaluation are not integration tested | READY_FOR_VERIFICATION | API integration tests for role assignment, revocation, scope and effective permissions |
| P457-G003 | SCHOOL_ADMIN receives all seeded permissions dynamically; grant breadth needs an explicit policy decision and runtime verification | OPEN | Review least-privilege policy; test dynamic grant behavior after catalogue changes |
- [ ] P458-G002 — Session-bound access checks, logout, and revocation propagation require runtime verification — READY_FOR_VERIFICATION
- [ ] P458-G004 — Token/key rotation, multi-device edge cases, concurrency, and penetration/E2E validation — OPEN
- **P459-G001 READY_FOR_VERIFICATION:** Password reset single-use claim, expiry and replay behavior are source-audited; prove with API/database concurrency tests.
- **P459-G002 OPEN:** Forgot-password token issuance and delivery are disabled pending configured provider; implement provider-backed issuance, secure delivery, and expiry policy.
- **P459-G003 READY_FOR_VERIFICATION:** Generic forgot-password response and configured IP/account rate limits are source-supported; validate behavior and response timing under live requests.
- **P459-G004 OPEN:** Account recovery abuse, enumeration, audit logging, email/phone verification interaction, and session invalidation require runtime/security acceptance tests.
- **P460-G001 READY_FOR_VERIFICATION:** Platform-admin MFA enforcement and bootstrap exemptions are source-inventoried; runtime route coverage and negative authorization tests remain pending.
- **P460-G002 OPEN:** Deployment-specific `MFA_REQUIRED_ROLE_KEYS` policy needs reviewed role selection, configuration validation, and live enforcement tests.
- **P460-G003 READY_FOR_VERIFICATION:** Enrollment, challenge freshness (300 seconds), TOTP replay-step claims, recovery-code one-time claim, and MFA disable/session freshness behavior are source-supported; runtime database/concurrency tests remain pending.
- **P461-G003 OPEN:** Live DB role/grant drift, least-privilege decisions, and effective-permission checks require verification.
- **P461-G004 OPEN:** Session/refresh/reuse/revocation concurrency and logout propagation require integration tests.
- **P461-G005 OPEN:** Provider-backed password recovery is not enabled; delivery, expiry, and abuse controls require runtime acceptance.
- **P462-G001 READY_FOR_VERIFICATION:** Source contract inventory covers 15 authentication route declarations; actual mounted paths and HTTP request/response behavior require runtime API verification.
- **P462-G002 OPEN:** Validate route middleware behavior (authentication, platform-admin authorization, rate limits, token actions) through isolated API/Supertest cases.
- **P464-G001 READY_FOR_VERIFICATION:** Registration/login/refresh/password-reset malformed-input HTTP test cases are authored; runtime execution remains pending dependency installation and test-run confirmation.
- **P464-G002 OPEN:** Live rate-limit behavior, credential lookup avoidance, HTTP timing, and abuse-control responses require runtime tests.
- **P464-G003 OPEN:** Authentication negative-path API suite, full API build/typecheck, database-backed scenarios, web/mobile builds, and E2E remain unexecuted.
- **P465-G001 — Runtime rate-limit integration remains unexecuted:** mocked-Redis HTTP integration tests were authored for limit acceptance, 429/Retry-After, fail-closed 503, and response identity privacy. Vitest runtime execution remains pending dependency installation. **Status: READY_FOR_VERIFICATION**.
- **P466-G001 READY_FOR_VERIFICATION:** Synthetic-fixture tests are authored for exact permissions, missing permissions, module/global wildcard behavior, and platform-admin bypass; runtime test execution awaits dependency installation.
- **P466-G002 OPEN:** Production HTTP route authorization is not exercised by P466; endpoint-level authentication/authorization integration coverage is still required.
- **P467-G002 READY_FOR_VERIFICATION:** Positive and negative permission contracts authored for exact permissions, module wildcard isolation, and school permission matching. Runtime Vitest execution is pending.
- **P467-G003 OPEN:** Role grants in seeded/live DB and HTTP route enforcement are not exercised by synthetic fixtures.
- **P469-G001 READY_FOR_VERIFICATION:** HTTP integration test source authored for school configuration campus-registry GET route membership-denied, permission-denied, authorized request, and route-scope forwarding cases. Vitest execution pending dependency availability.
- **P469-G002 OPEN:** Route-level authorization integration coverage remains partial; other protected routes/modules are not covered by this phase.
- **P470-G001 READY_FOR_VERIFICATION:** Integration test source authored for generic authentication-required 401 responses on missing/invalid bearer tokens, inactive session/account, MFA enrollment-required 403, and stale MFA challenge-required 403. Runtime Vitest execution remains pending.
- **P470-G003 OPEN:** Runtime HTTP auth middleware behavior, role-driven MFA configuration, session/database state and production middleware order remain unverified.
- [ ] P471-G001 — Execute consolidated authentication and authorization Vitest suites in an installed workspace — READY_FOR_VERIFICATION
- [ ] P471-G002 — Validate role/membership enforcement against a live test database — OPEN
- [ ] P471-G004 — Execute API typecheck/build and web/mobile auth smoke tests with evidence — READY_FOR_VERIFICATION
- [ ] P472-G001 — Execute auth/authorization Vitest integration suites and retain logs — READY_FOR_VERIFICATION
- [ ] P472-G002 — Validate membership, role, permission, and protected-route enforcement against live test DB/API — OPEN
- [ ] P472-G005 — Execute API typecheck/build and web/mobile authentication smoke tests — READY_FOR_VERIFICATION
- [ ] P472-G006 — Execute end-to-end authentication/session/MFA/protected navigation and attach CI evidence — READY_FOR_VERIFICATION
- **P473-G001 — Multi-child daily dashboard and secure switching:** Source contains child list/active-child state, but consolidated multi-child dashboard and live authorization validation remain OPEN.
- **P475-G001 — Parent-scoped timetable/calendar/exams APIs:** API routes were implemented in P476 with guardian/consent/child scope, but runtime authorization and database validation remain pending verification. SOURCE_IMPLEMENTED; RUNTIME_OPEN.
- **P476-G002 — Runtime/API/database integration validation:** Backend dependency install, typecheck, DB-backed endpoint validation and authorization negative cases were not run. OPEN.
- **P477-G004 — Finance runtime acceptance:** Invoice/receipt/refund runtime, authorization negative cases, accessibility and device E2E remain OPEN.
- **P479-G003 — Communication lifecycle runtime acceptance:** API connectivity, message create/reply/close, mark-read, notification pagination, server-side authorization and offline/reconnect behavior remain OPEN.
- **P480-G004 — Canteen/health runtime and device acceptance:** API authorization negative cases, real data validation, canteen ordering lifecycle, health privacy/permissions, offline behavior, accessibility and device E2E remain OPEN.
- **P483-G002 — Student Mobile journey breadth:** Existing source currently includes authentication/session, linked school selection, profile/enrollment, inbox/announcements, homework submission and attachments, plus canteen screen. Timetable, attendance, calendar, exams/results/report cards, library, transport, hostel, student finance/document journeys and full offline/deep-link/accessibility remain to be audited/implemented across C2-06. OPEN.
- **P483-G003 — Student Mobile runtime/build/security acceptance:** Expo typecheck/build, API runtime, guardian/student role and cross-school negative authorization tests, device E2E, accessibility, offline cache/sync and push acceptance remain OPEN.
- **P481-G001 — Parent transport portal API:** School transport admin APIs exist, but they are not parent-authorization endpoints. Parent route, allocation, pickup/drop and trip event APIs with guardian scope remain OPEN; the parent UI explicitly reports unavailable rather than calling staff endpoints or displaying fabricated data.
- **P482-G001 — Runtime API integration, typecheck, Expo build and device E2E:** RUNTIME_NOT_VERIFIED. Parent journeys have source foundations across academic planner, finance, academic activity, communication, canteen/health and specialist UI; actual backend connectivity, authorization negative cases, builds and device flows remain open.
- **P484-G002 — Student attendance history:** Implemented linked-student attendance read route across enrollment sessions and bounded dates; real records, status semantics and timezone acceptance OPEN.
- **P484-G005 — Runtime, security and integration acceptance:** API auth-negative tests, cross-school isolation, mobile build, date/timezone, offline behavior, accessibility and E2E remain OPEN.
- [ ] P485-G001 — Student mobile exams/results/report-card APIs and UI are source implemented; runtime integration, enrollment-scope authorization, data-shape validation, typecheck/build and device E2E remain OPEN.
- **P486-G004 — Homework lifecycle runtime and UX acceptance:** Late policy semantics, timezone edge cases, attachment-upload/retry behavior, live authorization, API/DB acceptance, accessibility and device E2E remain OPEN.
- **P487-G002 — Notification lifecycle/delivery parity:** Bulk mark-read, notification preferences, delivery/retry status, push delivery, deep-link navigation, API pagination, and runtime authorization acceptance remain OPEN.
- **P487-G003 — Communication runtime acceptance:** API connectivity, mark-read persistence, cross-school authorization, offline/reconnect behavior, typecheck/build/device/E2E/accessibility acceptance remain OPEN.
- **P488-G002 — Student-scoped Library loans/reservations API:** OPEN. Existing Library APIs require school membership/permission and are not student-self endpoints; this phase intentionally does not expose staff-scoped loan/reservation records to students.
- **P488-G004 — Runtime service acceptance:** API typecheck/build, runtime authorization, mobile build/device validation, offline behavior, accessibility, and end-to-end service testing remain OPEN.
- **P489-G002 — Offline session restoration UX:** Transient restore failures retain the refresh token and now render an offline-only state instead of immediately calling authenticated discovery with an empty access token. A manual reconnect action re-attempts restoration and refreshes the school context. SOURCE_IMPLEMENTED; runtime/device acceptance OPEN.
- **P489-G004 — Session/network/device resilience acceptance:** Refresh/revocation edge cases, app background/foreground, network transitions, retry timing, Expo typecheck/build, screen-reader accessibility and real-device E2E remain OPEN.
- **P490-G006 OPEN:** Validate school/student scope authorization, cross-school negative cases, session expiry/refresh, offline/online recovery, durable cache policy, accessibility, deep links, push, and device E2E.
- **P493-G002 OPEN:** Validate cross-school access boundaries and student-account link authorization with runtime negative cases; static route-contract inspection is not security acceptance.
- **P497-G001 OPEN:** Validate accessibility labels/roles, navigation order, focus behavior, touch target sizing, and announcements with VoiceOver/TalkBack on physical devices or emulators; source assertions are not assistive-technology acceptance.
- **P516-G009 OPEN:** Validate receipt snapshot immutability and print accessibility/permissions in browser acceptance.
- **P517-G001 OPEN:** Validate outstanding-balance totals against a clean live database across gross charges, approved concessions, payments, partial payments, refunds and invoice amount-due semantics; confirm amounts-paid source remains authoritative.
- **P519-G004 OPEN:** Reconcile parent-visible installment/payment allocation totals against authoritative Finance ledger and invoice lifecycle in a clean runtime database.
- **P520-G002 OPEN:** Reconcile consolidated billed, paid, concessions, refunds and outstanding totals against authoritative invoices, student ledger, posted journals and clearing balances in a clean runtime database.
- **P521-G004 OPEN:** Validate reconciliation between server aggregate, authoritative fee ledger and accounting journals; current operational outstanding is charge gross less approved concessions and charge-recorded payments, not full accounting or bank reconciliation.
- **P521-G005 OPEN:** Export browser acceptance, CSV escaping/format behavior, responsive/accessibility and authorization checks.
- [ ] P538-G001 — Health: field-scoped permissions, consent/guardian visibility and authorized health case/incident lifecycle — OPEN
- [ ] P538-G006 — Specialist cross-app mobile journeys, reports, permissions, accessibility, concurrency and runtime/E2E validation — OPEN
- [ ] P539-G001 — Runtime verification of field-scoped health authorization and sensitive-data masking, including cross-school negative access tests — OPEN
- [ ] P541-G001 — Health safety records: structured allergies, conditions and medications; emergency safety profile workflows, field validation, authorized staff visibility and runtime integration — OPEN
- [ ] P542-G001 — Health case API/runtime, triage transition concurrency, assigned-staff authorization, sensitive-note masking and follow-up history integration tests — OPEN
- [ ] P544-G001 — Runtime staff/parent mobile validation, permission-negative checks, accessibility/device/E2E verification and health notification delivery/reconciliation — OPEN
- [ ] P549-G001 — Payment-gateway refunds are not executed; paid preorder cancellations create a manual refund request and require authorized staff status/reference updates — OPEN.
- [ ] P550-G001 — Parent/student self-service wallet payments and top-ups, provider checkout integration, settlement/webhook handling and gateway reconciliation remain OPEN. Current wallet-funded preorder payment endpoint is School Admin permission scoped.
- [ ] P550-G002 — Automatic wallet refund credit on preorder cancellation and authorized refund/adjustment transaction workflows remain OPEN. P549 manual refund statuses are not yet wallet-integrated.
- [ ] P551-G001 — Staff/admin profile changes need explicit audit-log integration and dedicated permission policy review — OPEN.
- [ ] P561-G002 — Student/guardian identity display is ID-only in the current transport allocation data shape; privacy-safe name lookup and role-based mobile display remain OPEN.
- [ ] P561-G003 — Handover recipient identity validation, OTP/guardian authorization and photo/signature proof are not implemented; recipient is free-text only — OPEN.
- [ ] P562-G001 — Native device GPS permission/capture, background tracking, adapter SDKs and vendor integration remain OPEN (mobile is manual-coordinate foundation; no provider SDK wired).
- [ ] P563-G001 — Native GPS capture/background permissions and device location pipeline are not implemented; manual coordinate foundation only — OPEN.
- [ ] P566-G007 — Add concurrency tests for session creation, bulk roll-call, night-check entry upserts and duplicate escalation prevention — OPEN
- [ ] P566-G008 — Add student/guardian privacy-safe roster identity lookup, field masking and audit review — OPEN
- [ ] P567-G003 — Execute API/database integration tests for visitor registration, approval, duplicate authorization, check-in/out, expiry and outpass lifecycle — OPEN
- [ ] P567-G006 — Add gate-staff-specific role/permission granularity and verify deny-by-default (current mutations use hostel.manage) — OPEN
- [ ] P567-G008 — Add visitor photo/document capture only after privacy/legal review; current scope deliberately stores no full identity number or document image — OPEN
- [ ] P568-G007 — Add SMS and push provider adapters only after provider selection, verified phone/device token policy and explicit channel consent — OPEN
- [ ] P569-G009 — Add scheduled offer-expiry worker, automated waitlist offer retries/monitoring and notification delivery observability; current expiry is an authorized API action — OPEN
- [ ] P570-G007 — Prove duty roster staff identity/role eligibility, absence/leave coverage, handover completeness and race-safe exclusion/overlap behavior under concurrent assignments — OPEN
- [ ] P570-G009 — Add safeguarding field-level authorization, access reason/consent where applicable, secure attachment/evidence retention, escalation worker and independent privacy/legal/safeguarding review — OPEN
- [ ] P570-G012 — Run API/database integration, production-role RLS/cross-school denial, dependency-backed semantic builds/typechecks, browser/device E2E, accessibility, concurrency/load and full end-to-end regression — OPEN
- [ ] P571-G009 — Verify payment, email, SMS/push and webhook provider lifecycle using test credentials and observed callbacks — OPEN (provider credentials/callbacks unavailable; no delivery/settlement claim)
- [ ] P571-G012 — Obtain independent privacy/security/legal review for GPS, guardian consent, health, safeguarding, visitor identity and retention controls — OPEN (independent sign-off pending)
- [ ] P574-G001 — Generate the authentic pnpm 9.15.0 lockfile in a registry-enabled or approved mirrored environment and pass `pnpm install --frozen-lockfile` for all 14 packages — OPEN (registry DNS returns EAI_AGAIN; pnpm and lockfile unavailable; no synthetic lockfile created)
- [ ] P574-G007 — Execute representative cross-module API journeys and negative authorization tests with database-backed fixtures — OPEN (no database runtime)
- [ ] P575-G005 — Audit route/resource authorization coverage for all nine apps, exports, websocket, file/object access and worker entry points; add missing deny-by-default tests — OPEN (static helper checks do not prove every endpoint or external resource boundary)
- [ ] P575-G006 — Verify application database role is non-owner, non-superuser and NOBYPASSRLS in production-like deployment; confirm migrations use a separate privileged credential — OPEN (role catalog acceptance SQL added; no live roles/database available)
- [ ] P575-G007 — Complete P573/P574 prerequisites: authentic pnpm 9.15.0 lockfile and frozen install, Prisma validate/generate, all workspace semantic typechecks/builds, clean/upgraded PostgreSQL migrations and API integration — OPEN (registry/toolchain/database blockers persist)
- [ ] P576-G001 — Select and configure approved payment gateway sandbox adapters with provider-owned credentials, documented event contracts and secret rotation — OPEN (no provider credentials or sandbox access supplied; generic adapter boundary remains unconfigured)
- [ ] P576-G005 — Execute signed email provider delivery, bounce, complaint, suppression, retry and dead-letter callbacks with real provider sandbox evidence — OPEN (existing canonical webhook and suppression logic are source-present; no provider credentials/callback evidence)
- [ ] P576-G006 — Integrate SMS/push providers only with approved credentials, verified destination/device state, explicit consent and channel preference enforcement — OPEN (no approved SMS/push provider or credentials configured)
- [ ] P577-G001 — Restore authentic pnpm 9.15.0 lockfile and frozen install; install pinned Playwright/axe dependencies and browser binaries — OPEN (registry/toolchain prerequisite remains blocked; dependencies declared but not installed)
- [ ] P577-G003 — Execute authenticated Playwright journeys across all web modules, including admissions, attendance, finance, library, transport, hostel, parent operations and authorization denials — OPEN (only public-entry smoke-test foundation added; no browser targets/runtime)
- [ ] P577-G005 — Build and execute Parent, Teacher, Student, Driver and Staff mobile journeys on supported iOS/Android devices, including auth/session expiry, deep links and permission paths — OPEN (no Expo build/device/simulator/adb/xcrun/Maestro runtime)
- [ ] P578-G007 — Complete all workspace frozen install, Prisma, migration, build and production-role RLS prerequisites before operational sign-off — OPEN
- [ ] P579-G002 — Complete privacy, data-processing, retention, deletion, cross-border transfer and jurisdiction-specific legal review with authorized sign-off — OPEN (no counsel/DPO review or approved processing inventory supplied)
- [ ] P579-G005 — Execute an independent secrets scan over source, build artifacts, history and deployment configuration; document false-positive disposition — OPEN (scanner and authorized repository-history scan unavailable)
- [ ] P579-G006 — Complete production environment configuration review, least-privilege access review and deployment credential rotation evidence — OPEN (no production environment or authorized access evidence supplied)
- [ ] P579-G008 — Assign named operational ownership, on-call escalation, incident response, support SLAs and post-release monitoring acceptance — OPEN (no authorized operations/support owners or acceptance supplied)
- [ ] SMS OTP provider and phone verification workflow — DEFERRED by user; revisit later.
- [ ] Email OTP provider operational acceptance and school-safe configuration — DEPENDENCY/VERIFICATION.
- [ ] Guardian identity/linking/merge/invitation and duplicate applicant prevention — OPEN.
- [ ] **P280-VAL01** — Run Prisma schema/migration validation, authenticated API/database acceptance and browser/mobile verification for announcement draft/publish. **OPEN**.
- [ ] Email provider send/receipt/opt-out live verification and Push provider/device-token lifecycle remain OPEN.
- [ ] P328-RUNTIME — API-loaded page completeness/count accuracy, runtime authorization and device/E2E validation — OPEN.
- [ ] Secure dashboard-card linking to existing application editing/document/submission workflows remains OPEN (tracking-token flow still required).

### School onboarding, configuration and campuses (51)

- [ ] P06-G003 — Add overlap prevention and concurrency-safe activation for academic years and terms — OPEN
- [ ] P06-G006 — Add board catalogue validation and country/state-specific school profile rules — OPEN
- [ ] P06-G012 — Add end-to-end school setup, academic-year, term and calendar flows — OPEN
- [ ] P06-G013 — Validate academic year/term date boundaries, leap years and school-local date semantics — OPEN
- [ ] P10-G018 — Add substitute teacher, multi-school staff and cross-campus assignment workflows — OPEN
| P14-G003 | Academic year and grade IDs are manual inputs; lookup pickers absent | OPEN | persisted lookup UI and E2E evidence |
| P26-G001 | School profile UI connected to GET/PUT APIs; runtime validation and logo upload remain | READY_FOR_VERIFICATION | API integration, profile validation and upload acceptance |
| P26-G010 | Date-only academic year/term schema now rejects impossible calendar dates; Vitest not executed | READY_FOR_VERIFICATION | run schema unit tests in CI and verify leap-year boundaries |
| P122-G001 | Report-card list, artifact and published-PDF endpoints now restrict active staff users to students enrolled in their currently active teacher-assigned academic year, grade and section | READY_FOR_VERIFICATION | Verify assigned-student allow and non-assigned-student denial for list, artifact metadata and PDF URL issuance; include expired/future assignments and another school using API/database evidence |
- [x] P240-G002 — For selected grade and academic year, configured section choices display computed available seats (capacity minus enrolled and reserved seats); zero-seat sections are disabled.
- P262-G001 — Enrollment workflow source coverage is present (creation, academic year/grade/section selection, configured capacity checks, enrollment history, status transitions); build/runtime/API/browser validation remains OPEN.
- P266-G001 — Runtime/build/API/browser/mobile validation of academic years, terms, grade CRUD, and section-capacity configuration remains OPEN.
- [x] P340-G001 — School Admin admissions dashboard shows capacity/enrolled/reserved/available totals scoped to selected academic year. SOURCE_IMPLEMENTED.
- **P354-G003 OPEN:** Onboarding/offboarding checklist UI/templates and formal staff exit transitions.
- **P370-G001 PARTIAL:** Read-only guided onboarding checklist/readiness dashboard delivered in School Admin. P371 adds sequential step navigation, step selection and next-incomplete guidance. Persisted progress, server-side checklist ownership and guided setup writes remain OPEN.
- **P370-G003 OPEN:** Dependency-ordered setup orchestration, invalid/incomplete configuration prevention, multi-campus inheritance/overrides, and bulk import/export preview/rollback remain OPEN.
- **P372-G001 CLOSED (source slice):** Onboarding setup prerequisites are explicitly modeled. Academic year requires school profile; terms require active academic year; calendar requires profile and academic year; working days require profile; attendance/grading policies require profile and active academic year. Configure actions are gated and unmet prerequisites are explained accessibly. Verifier 14/14 PASS.
- **P373-G004 OPEN:** Multi-campus inheritance/overrides and bulk import/export preview/rollback remain open.
- **P374-G004 OPEN:** Multi-campus inheritance/overrides and bulk import/export preview/rollback.
- **P375-G004 OPEN:** Multi-campus inheritance/overrides and bulk configuration import/export preview/rollback.
- **P376-G004 OPEN:** Multi-campus inheritance/overrides and bulk configuration import/export preview/rollback.
- **P377-G002 CLOSED:** GET/PUT onboarding progress endpoints added; writes require `school.settings.manage` and validate an allowlist of step keys.
- **P378-G004 OPEN:** Multi-campus inheritance/overrides and bulk import/export preview/rollback remain.
- **P379-G001 CLOSED (source cleanup):** Removed duplicate declaration block from `backend/api/prisma/schema.prisma`; verified model/enum declarations are unique and exactly one generator/datasource remains. P379 verifier 6/6 PASS; P377/P378 onboarding models retained.
- **P380-G001 CLOSED (source slice):** Server readiness and guided onboarding now include board affiliation and active grade levels, with remediation and dependency ordering. Progress/task allowlists support nine setup tasks. P380 verifier 13/13 PASS; updated P372/P374/P378 verifiers pass.
- **P381-G002 OPEN:** Setup mutations still require complete server-side prerequisite enforcement and configuration orchestration; multi-campus inheritance/overrides and bulk import/export preview/rollback remain.
- **P382-G002 OPEN:** Export is client-side snapshot only; server-side report/audit and broader onboarding workflow closure remain outstanding.
- **P384-G003 OPEN:** Multi-campus inheritance/overrides and bulk configuration import/export with validation, preview and rollback remain.
- **P385-G001 CLOSED (source slice):** Assignment-save busy/success UI state is tracked per onboarding task, allowing concurrent saves without cross-task status clobbering. Verifier 10/10 PASS.
- **P386-G001 CLOSED (source slice):** Assignment errors are keyed by onboarding task; failed concurrent saves retain task-specific errors and render inline with alert semantics. Retry/success clears only that task’s error. P386 verifier 8/8 PASS.
- **P388-G001 CLOSED (source slice):** Onboarding checklist items, refreshed timestamp, and server recommended-next-step state are cleared at the start of readiness load. Missing active scope exits safely without retaining prior checklist data. P388 verifier 8/8 PASS.
- **P389-G004 OPEN:** Full onboarding orchestration, backend prerequisite enforcement across setup mutation routes, multi-campus inheritance/overrides, bulk import preview/validation/rollback remain.
- **P391-G003 OPEN:** Multi-campus inheritance/override rules and bulk configuration import/export with preview, validation, atomic commit and rollback remain.
- **P392-G002 OPEN:** Full dependency orchestration across configuration domains and mutation endpoints remains; this phase does not establish end-to-end onboarding completion.
- **P392-G003 OPEN:** Multi-campus inheritance/override and bulk configuration import/export preview/validation/atomic commit/rollback remain.
- **P394-G002 OPEN:** Bulk school configuration import/export with preview, validation, atomic commit and rollback is not implemented; this phase only imports task-owner assignments.
- **P394-G003 OPEN:** Multi-campus inheritance/overrides and complete setup orchestration remain.
- **P396-G002 OPEN:** Bulk transfer still excludes academic years/terms, calendars/events and other setup domains; multi-campus inheritance/overrides remain.
- **P397-G001 CLOSED (source slice):** Academic year/term JSON export and additive import preview/apply with validation and school-specific duplicate-year checks. P397 verifier 20/20 PASS.
- **P397-G004 OPEN:** Multi-campus inheritance and overrides.
- **P398-G003 OPEN:** Multi-campus inheritance/overrides, broad dependency orchestration, remaining setup-domain transfer and runtime/API/DB/browser/mobile/E2E acceptance remain. F03 IN_PROGRESS; F04 not started.
- **P404-G002 OPEN:** Campus existence validation, campus UI/CRUD, resolver wiring into real configuration reads/writes, concurrency-safe transaction/locking, atomic transfer/rollback, complete orchestration, and runtime/API/DB/browser/mobile/E2E acceptance remain open. F03 IN_PROGRESS; F04 not started.
- **P405-G002 OPEN:** This endpoint returns effective override documents only; it is not yet integrated into the actual School Profile, Working Days or Policy configuration read/write flows. Campus entity existence remains record-based rather than validated against a campus registry. Transaction/locking, admin UI, transactional imports, runtime/API/DB/browser/mobile/E2E acceptance and remaining onboarding orchestration are open. F03 IN_PROGRESS; F04 blocked.
- **P406-G002 OPEN:** Standard configuration endpoints/screens do not yet consume campus-effective data by default; campus registry validation/UI, transactional concurrency, import/rollback, remaining onboarding orchestration, and runtime/API/DB/browser/mobile/E2E acceptance remain open. F03 IN_PROGRESS; F04 blocked.
- **P407-G002 OPEN:** Campus management UI and mobile-facing campus selection remain open; DB migration/live API execution, full Prisma/build validation and runtime tests remain unverified. Campus operations and inheritance updates are not yet race-proof across concurrent requests; complete onboarding orchestration, transactional imports/rollback and browser/mobile/E2E acceptance remain open. F03 IN_PROGRESS; F04 blocked.
- **P408-G002 OPEN:** Frontend build/typecheck not run (pnpm/dependencies unavailable); live API/database/browser/mobile/E2E validation remains open. Mobile campus selection, effective configuration integration into normal school-config workflows, concurrent inheritance-update safety, transactional transfer/rollback and remaining onboarding orchestration remain open. F03 IN_PROGRESS; F04 blocked.
- **P409-G001 CLOSED (source slice):** School Configuration workspace now fetches active campus registry records, offers campus selection, defaults to main/first active campus, and displays the effective campus configuration plus inheritance chain from the existing read endpoint. Preview is read-only; existing school-level write flows remain unchanged. Verifier 11/11 PASS; modified TSX parses cleanly.
- **P409-G002 OPEN:** Campus overrides are not yet applied to standard configuration edit/save paths; mobile campus selection, concurrency safety, transactional import/rollback, remaining onboarding orchestration, and runtime/API/DB/browser/mobile/E2E acceptance remain open. F03 IN_PROGRESS; F04 blocked.
- **P509-G002 OPEN (partially implemented P515):** P515 now enforces the configured enabled payment-method list in the collection API and populates the Finance collection method selector from school configuration. Remaining: reference requirement is still stricter than the configurable flag (reference required for all recorded methods), and validate configured-method/reference behavior at runtime.
- **P515-G003 OPEN:** Validate configured enabled payment methods and collection UI method list in a live school configuration. P515 API rejects disabled methods; non-cash reference requirement is currently stricter (reference required for all methods), not yet honoring the configuration toggle.
- [ ] P559-G002 — Personnel edit/unassign route UI, user-to-personnel discovery and bulk onboarding workflows — OPEN.

### Academics, boards and curriculum (125)

- [ ] P00-G005 — Board/curriculum rules validation across target jurisdictions — OPEN
- [ ] P04-G009 — Add membership suspension, reactivation and offboarding workflows — OPEN
- [ ] P05-G005 — Implement renewal scheduler, proration, upgrades/downgrades and cancellation lifecycle — OPEN
- [ ] P06-G001 — Validate P06 Prisma models and apply migration on clean and upgraded PostgreSQL databases — READY_FOR_VERIFICATION
- [ ] P07-G001 — Validate P07 Prisma schema and apply migration on clean and upgraded databases — READY_FOR_VERIFICATION
- [ ] P07-G003 — Verify composite database FKs preventing cross-school curriculum subject mappings through negative integration tests — READY_FOR_VERIFICATION
- [ ] P07-G004 — Verify official board catalogue names, codes, jurisdiction rules and grade structures against primary sources — OPEN
- [ ] P07-G005 — Add board-specific curriculum packs with provenance, versioning and review/approval workflow — OPEN
- [ ] P07-G006 — Add curriculum version activation, retirement and effective-date conflict handling — OPEN
- [ ] P07-G007 — Add bulk grade/subject/curriculum import and export with validation and rollback — OPEN
- [ ] P07-G008 — Add learning outcomes, competency standards, textbooks and learning-resource mapping — OPEN
- [ ] P07-G011 — Add board-specific language and multilingual subject configuration rules — OPEN
- [ ] P08-G001 — Validate P08 Prisma schema and apply migration on clean and upgraded databases — READY_FOR_VERIFICATION
- [ ] P08-G006 — Implement student lifecycle transition rules, transfer, withdrawal, graduation and reactivation — OPEN
- [ ] P08-G011 — Add enrollment capacity, section allocation and promotion/rollover workflows — OPEN
- [ ] P09-G002 — Apply P09 migration on clean and upgraded PostgreSQL databases; verify rollback/recovery — READY_FOR_VERIFICATION
- [ ] P09-G007 — Add board/grade age eligibility, required-document checklists and configurable admission rules — OPEN
- [ ] P10-G002 — Apply P10 migration on clean and upgraded PostgreSQL databases; verify rollback/recovery — READY_FOR_VERIFICATION
- [ ] P11-G006 — Add teacher-specific student field scopes, attendance, assessment and grade access boundaries — OPEN
| P12-G002 | P12 SQL migration not applied on clean/upgrade PostgreSQL databases | OPEN | migration logs and schema diff |
| P12-G006 | TeacherAssignment grade/section matching needs schema/runtime validation | OPEN | tests for assigned and unassigned grade/section combinations |
| P13-G001 | P13 migration not applied to PostgreSQL | OPEN | clean and upgrade migration logs |
| P15-G008 | Timetable/day view and subject-period attendance absent | OPEN | timetable integration and period attendance tests |
| P21-G004 | Bell templates store period times/labels but do not encode subject-specific assignment mappings or full day templates | PARTIALLY_IMPLEMENTED | richer template model and acceptance-tested apply workflow |
| P25-G012 | Membership lifecycle, academic-year isolation, room alias drift and audit rollback tests remain pending | OPEN | API/PostgreSQL integration and rollback test evidence |
| P26-G002 | Academic-year list/create UI connected; term management, edit/retire and concurrent current-year enforcement remain | PARTIALLY_IMPLEMENTED | DB constraint/concurrency tests and full academic lifecycle UI |
| P27-G001 | Curriculum board/profile, grade and version UI now calls APIs; subject CRUD and version lifecycle are not exposed | PARTIALLY_IMPLEMENTED | subject mapping UI, activation/retirement workflow and API E2E |
| P28-G001 | Curriculum subject creation and version status workflow implemented; concurrent active-version activation is not database constrained or integration-tested | PARTIALLY_IMPLEMENTED | enforce/confirm active-version business invariant and pass concurrent PostgreSQL tests |
| P29-G006 | Curriculum activation now uses school/year advisory lock and P29 partial unique indexes with duplicate preflight; migration not applied or concurrency-tested | READY_FOR_VERIFICATION | apply migration, test clean rollback/reapply and concurrent activations on PostgreSQL |
| P33-G004 | Report card create/publish and parent view exist; templates, approval workflow, PDF generation and result validation are absent | PARTIALLY_IMPLEMENTED | implement versioned templates, grade/subject validation, approval and generated private PDF |
| P33-G011 | Parent report card resultSummary is JSON with only structural record validation; subject/grade/marks schema not governed by board-specific validation | OPEN | define versioned board/grade assessment schemas and enforce marks/grade boundaries |
| P35-G003 | School Admin Parent Operations UI has Load more and duplicate-ID append guard; browser and accessibility acceptance not run | READY_FOR_VERIFICATION | Playwright test page append, student filter reset, refresh, error/retry and keyboard operation |
| P35-G007 | P38 adds versioned board/grade/year schema, score validation, principal approval and private PDF source workflow; runtime/UI/template acceptance remains open | PARTIALLY_IMPLEMENTED | run database/API/storage acceptance and add schema/approval UI plus branded multi-page PDF |
| P36-G002 | P37 adds bounded rubric-result JSON, append-only grade/reopen history and reasoned reopen; school-managed rubric versions and attempt-level immutable submission revisions remain absent | PARTIALLY_IMPLEMENTED | implement versioned rubric catalogue, weighted criteria and immutable submission revisions |
| P36-G006 | Report cards remain generic JSON with no versioned board/grade schema, approval lifecycle or private PDF | OPEN | implement board/grade schema versions, approval and private PDF generation |
| P37-G001 | Homework attachments use the shared private upload/quarantine/scan/promote/download source pipeline; S3/scanner are not configured or runtime tested | READY_FOR_VERIFICATION | configure providers and test upload metadata, malware verdict, MIME mismatch, clean promotion, rejection and signed download |
| P37-G003 | Teacher list/grade/history/reopen routes enforce active class/year/grade/section assignment for linked staff profiles; subject-level assignment is impossible while homework lacks curriculumSubjectId | PARTIALLY_IMPLEMENTED | add curriculum subject linkage and test subject-specific assignment boundaries |
| P37-G005 | Rubric result JSON has per-criterion bounds and grade history is append-only, but no school-managed versioned rubric catalogue or weighted calculation | PARTIALLY_IMPLEMENTED | add rubric templates/versioning, criteria weights and total-score reconciliation |
| P37-G007 | Grade/reopen events are append-only in migration source; trigger and audit behavior have not been applied/tested | READY_FOR_VERIFICATION | apply migration and prove update/delete rejection plus audit event correctness |
| P38-G001 | Versioned board/grade/year report-card schema, score validation and active-version partial unique index are source implemented; Prisma and PostgreSQL behavior not verified | READY_FOR_VERIFICATION | Prisma validate/generate, migration apply/reapply and concurrent activation tests |
| P38-G005 | P39 adds School Admin schema/approval workspace and parent mobile PDF download action; runtime UI acceptance and ID lookup pickers remain unverified | PARTIALLY_IMPLEMENTED | run browser/device E2E and add searchable academic-year/grade/board pickers |
| P38-G007 | Official board assessment schema packs and regulatory provenance are not bundled; `boardKey` only matches the school's configured board profile | OPEN | publish reviewed board packs with provenance and versioned updates |
| P39-G006 | Official board assessment packs and provenance are not bundled | OPEN | publish reviewed and versioned board packs with explicit provenance and no implied endorsement |
| P40-G007 | Official board assessment packs with source provenance and review/effective-date metadata are not supplied | OPEN | publish curated, reviewed and versioned board packs without implied endorsement |
| P42-G009 | Arabic RTL shaping, PDF accessibility and official board pack provenance remain incomplete | OPEN | add shaping/accessibility acceptance and reviewed, versioned board pack source provenance |
| P43-G009 | Official board assessment packs with source provenance and review/effective-date metadata remain absent | OPEN | publish reviewed, versioned board packs without implied endorsement |
| P44-G001 | School branding UI is source implemented but S3/scanner lifecycle and browser acceptance remain unverified | READY_FOR_VERIFICATION | test real private upload, quarantine, scanner CLEAN promotion, signed retrieval and browser flow |
| P56-G002 | Operational event coverage currently focuses on worker outcomes; queue depth, latency histograms, retry age and dead-letter backlog metrics remain absent | OPEN | Select metrics backend and add bounded-cardinality metrics with operational dashboards/alerts |
| P57-G002 | School Admin load-more UI source implemented; browser accessibility/mobile behavior not run | READY_FOR_VERIFICATION | Run Playwright keyboard/screen-reader/responsive and school-switch pagination tests |
| P73-G004 | Board-specific lifecycle/retention rules and transfer/graduation document requirements are not approved | OPEN | Validate against supported board/jurisdiction policy and approved retention schedule |
| P100-G003 | Board/jurisdiction-specific student lifecycle rules, transfer/graduation documentation and retention policy remain unapproved | OPEN | Approve supported board/jurisdiction transition matrix, required documents and retention policy before enforcing jurisdiction-specific rules |
| P102-G006 | P102 Prisma schema/migration, API, Super Admin and public portal changes have source-level verification only | READY_FOR_VERIFICATION | Prisma validate/generate, apply clean/upgraded migration, semantic typecheck, builds and API/browser runtime acceptance |
| P105-G009 | Production Compose, PostgreSQL migrations, backup/restore, TLS and monitoring runtime have not been executed in this environment | READY_FOR_VERIFICATION | Complete deployment smoke checks, migration upgrade and restore drill on a staging host |
| P107-G004 | Board/jurisdiction evidence is tracked as configurable records only; applicable laws, board circulars, retention periods and evidence sufficiency are not legally validated | OPEN | Obtain jurisdiction-specific legal/compliance review and approved evidence catalogue for each supported board/country |
| P115-G002 | External alert delivery, on-call escalation and operational dashboard are not configured; current implementation only writes a bounded Redis Stream event feed | OPEN | Integrate approved delivery provider, configure routing/ownership/escalation and verify delivery/retry/failure handling |
| P161-G001 | Added durable document-worker heartbeat/status metadata, stale/degraded health indicators in Finance operations, indexed `cleanupNextRetryAt`, capped exponential cleanup retry scheduling and per-record next-retry visibility. | PARTIALLY_IMPLEMENTED | Apply migration and regenerate Prisma client; verify API/admin builds, worker heartbeat and restart behavior, retry backoff, cleanup races and database/storage integration. External email/SMS/incident-management alert delivery is not implemented; dashboard and structured logs provide current alerts. |
| P169 | Evidence Scan And Access Hardening: Integrated terminal scan dispatch failures with dead-letter and operations-alert emission; evidence cleanup failures now generate deduplicated alerts. Existing CLEAN-only signed download and quarantine flow retained. | P169-G001 | OPEN | Scanner callback signature/provider runtime, all evidence types, MIME spoofing, malformed files, clean promotion and access isolation acceptance remain open. |
| P171 | Consolidated Operations Visibility: Reconciled existing School Admin Finance and Platform Superadmin alert consoles, worker heartbeat, cleanup retry metadata, alert history, acknowledgement and retry flows. Added phase-level operations evidence matrix. | P171-G001 | OPEN | Cross-service producer coverage, storage inventory/quota visualization, actionable scanner queue metrics and deployment/runtime dashboards remain partially implemented. |
- P175-G001 — Configurable school/year/grade/board eligibility rule persistence and API implemented. Status: PARTIALLY_IMPLEMENTED; board-specific enforcement waits for board field on application.
- P175-G005 — Staff Mobile checklist and rule awareness, public portal workflow, board-aware eligibility and runtime acceptance remain OPEN.
- P176-G001 — Application boardCode persistence and creation flows implemented for School Admin and Staff Mobile. Status: READY_FOR_VERIFICATION.
- P176-G002 — Submission resolves board-specific rule first, then ANY fallback. Status: READY_FOR_VERIFICATION.
- P176-G003 — Board-code catalog/validation, checklist auto-generation and Parent/Public application UI remain OPEN.
- [x] P196-G001 — Staff submission blocked with explicit 409 code if no enabled board-specific or `ANY` rule exists.
| P230-G002 | Student lifecycle edge workflows (profile completeness, lifecycle transitions, enrollment changes, transfer/withdrawal/graduation/re-admission) require gap-led source review and remaining remediation. | OPEN | Audit source and implement prioritized lifecycle gaps in upcoming phases. |
| P234-G001 | Student enrollment endpoint previously surfaced duplicate student/year and grade/year/roll-number database uniqueness conflicts without friendly conflict responses. | PARTIAL | P234 adds preflight conflict checks and maps race-time unique constraint failures to 409 responses; final DB/runtime acceptance deferred. |
- [ ] P237-G003 — New-year promotion/transfer allocation, approval workflow, UI/mobile integration, and final runtime/API/E2E validation remain OPEN/DEFERRED.
- [x] P238-G001 — School Admin Students workspace can load scoped enrollment history via student detail API and display academic-year/grade/section/roll/status/date fields.
- [ ] P238-G003 — UI status-option filtering, enrollment approval/allocation and new-year promotion/transfer remain OPEN.
- [x] P240-G003 — Changing grade clears the previously selected section to prevent stale grade/section combinations.
- [x] P240-G004 — Legacy manual section entry remains when no configured capacity is available for the selected grade/year.
- [ ] P258-G001 — Academic term list/create UI and scoped read API added; source review only, runtime verification pending — READY_FOR_VERIFICATION
- P262-G002 — Advanced bulk allocation, cross-year promotion/transfer orchestration, approval workflows, and enrollment reporting remain OPEN for Cycle 2.
- P267-G001 — Runtime/build/API/browser/mobile validation of curriculum configuration and mandatory/optional subject mapping remains OPEN.
- P267-G002 — Subject update/archive, advanced elective constraints, official board syllabus alignment, bulk curriculum import and deep refinements remain Cycle 2.
- P269-G002 — Subject picker, assignment edit/deactivation UX, advanced workload rules and deeper assignment lifecycle refinement remain OPEN/Cycle 2.
- **P273-G002** — Basic per-exam calculated results and class summary implemented in P274; persistent report-card aggregation and board-specific grading rules remain OPEN.
- **P274-G001** — Configure board/school grade bands, grade-point systems and pass policy instead of generic hard-coded bands — OPEN.
- **P274-G002** — Aggregate published exam results across terms/subjects into existing report-card resultSummary and governance flow — OPEN.
- **P274-G003** — Add subject-wise/term-wise result aggregation, rank/position policy and configurable absent/exempt student handling — OPEN.
- **P303-G004** — Bulk promotion/transfer automation, approvals and enrollment reports remain OPEN.
- [ ] P317-G001 — Runtime API/database/browser validation of version-specific subject loading, grade filtering and duplicate prevention — READY_FOR_VERIFICATION.
- [ ] P317-G002 — Subject mapping edit/delete lifecycle and advanced board-specific curriculum rules — OPEN (Cycle 2).
- [ ] P330-G001 — Runtime API/database, storage, scan queue and clean-promotion acceptance — READY_FOR_VERIFICATION.
- [x] P332-G003 — Staff Mobile checklist parity with eligibility-rule lookup and board-specific/ANY fallback implemented. Status: SOURCE_IMPLEMENTED.
- [ ] P337-G003 — Applicant-account dashboard withdrawal UX and staff-side withdrawal reason/reporting UX remain OPEN.
- [ ] P340-G004 — API-derived capacity snapshot freshness, staff-mobile dashboard parity, and runtime/E2E validation remain Cycle 2 OPEN.
- **P380-G002 OPEN:** Board-specific catalogue/eligibility rules, bulk grade/subject setup, and runtime verification of the curriculum workspace are still required.
- **P397-G003 OPEN:** Academic import is sequential/non-transactional; partial creation possible. Atomic multi-resource import and rollback remain.
- **P413-G002 OPEN:** Runtime build/typecheck/API/database/browser/mobile/E2E acceptance remains deferred. Outcome edit/delete, bulk import/export, assessment mapping and official board content remain open; P412-G002 is still only partially addressed.
- **P414-G002 OPEN:** Bulk import/export, outcome-to-assessment mapping, official board content packs, and live build/typecheck/migration/API/DB/RLS/browser/mobile/E2E acceptance remain open. P2002 race conflicts are ultimately protected by the database unique constraint; runtime behavior remains unverified.
- **P415-G001 CLOSED (source slice):** Added version-scoped CSV template and export endpoints, optional grade/review filters, preview import, row-level validation report, all-or-nothing commit, duplicate checks, grade/subject scope validation, and admin CSV upload/paste UX. Imported outcomes are DRAFT only. P415 verifier 23/23 PASS; CSV smoke 5/5 PASS; P411/P412/P413/P414 regressions PASS; parser scan 258 files/0 diagnostics.
- **P416-G002 OPEN/BLOCKED:** Granular question/component-level assessment mapping, official board curriculum packs, and comprehensive build/typecheck/Prisma/migration/live API/DB/RLS/browser/mobile/E2E acceptance remain open. Subject matching is based on exam subject text compared to curriculum subject name/code.
- **P418-G002 OPEN:** Runtime acceptance remains pending: Prisma schema validation/generation, migration execution, live API/database/RLS integration, browser/mobile and E2E. Review lifecycle transitions and subject-specific outcome linking with real school data before runtime acceptance.
- [ ] P423-G003 — Replace ID-based teacher/grade/subject filters with searchable selectors; add pagination and follow-up task assignee/due date — OPEN
- [ ] P440-G002 — Add alert routing for export worker heartbeat stale/degraded states — OPEN
- **P473-G002 — Parent academics journey:** Attendance, homework and report-card data source paths are represented; timetable/calendar, exam schedule and complete daily academics journey are not evidenced in the inspected parent app source. OPEN.
- **P474-G002 — Parent academics timetable/calendar/exams:** P475 now adds the parent planner UI foundation (day/week navigation and separate timetable/calendar/exam panels). Parent-scoped API routes and live data integration are still unverified; OPEN.
- **P475-G002 — Live academic planner data integration:** P476 connects the client contract to implemented API handlers; runtime requests/typecheck remain unverified. OPEN.
- **P476-G003 — Academic planner cache/offline freshness:** No planner cache/offline sync added. OPEN.
- **P478-G001 — Unified academic snapshot:** Added parent-facing snapshot of attendance counts, assignment progress, overdue assignments, and published report cards, derived from the selected child’s loaded data. Static verifier 16/16 PASS. SOURCE_IMPLEMENTED; runtime OPEN.
- **P478-G002 — Academic summary data semantics:** Attendance status normalization, submitted/pending assignment classification, overdue date parsing, and latest report-card selection need domain/data edge validation against real API payloads. OPEN.
- **P478-G003 — Parent academic end-to-end acceptance:** Typecheck/build, API data integration, timezone/date edge cases, screen-reader/device E2E and accessibility acceptance remain OPEN.
- **P483-G001 — Student daily activity snapshot:** Added selected-school student overview for pending, overdue, submitted, graded homework and unread announcements. Derived from loaded student-scoped data only. Static source verifier 14/14 PASS; runtime acceptance OPEN.
- **P482-G002 — Academic planner cache/offline freshness and date/time correctness:** OPEN; P476 API source exists, but runtime and timezone/device validation are not evidenced.
- **P486-G001 — Student homework lifecycle clarity:** Added shared lifecycle classification for not submitted, submitted, resubmitted, graded, overdue, due today, upcoming and no/invalid due date. UI displays status and safe due-date label; static verifier evidence only. SOURCE_IMPLEMENTED; runtime/data acceptance OPEN.
- **P486-G002 — Graded submission lock consistency:** UI editor and resubmit controls are suppressed when submission status is GRADED; API already rejects graded resubmission with 409. Runtime validation remains OPEN.
- **P490-G004 OPEN:** Canteen, academic planner, exams/results/report cards, homework, communication, and linked-school context require real API/device acceptance; static assertions are not runtime proof.
- **P517-G006 OPEN:** Finance UI acceptance for aging filters by grade/section/student, paging/export and large school performance; current endpoint supports student filter and bounded 500-row response.
- **P520-G004 OPEN:** Finance readiness checks require full validation of receipt-prefix settings, payment configuration, late-fee policy and other required finance settings; dashboard currently only reports selected loaded/configured indicators.
- **P529-G001 OPEN:** Runtime tests for exact-board precedence, ANY fallback, no matching rules, document lifecycle variants, and submission-readiness summary.
- [ ] P566-G002 — Apply P566 migration on clean and upgraded PostgreSQL databases; verify rollback/recovery and schema drift — OPEN
- [ ] P567-G002 — Apply migration on clean and upgraded PostgreSQL databases; verify rollback/recovery and schema drift — OPEN
- [ ] P568-G002 — Apply P568 migration on clean and upgraded PostgreSQL databases; verify legacy P567 leave/pass data, FK/index drift and rollback/recovery — OPEN
- [ ] P569-G002 — Apply P569 migration on clean and upgraded PostgreSQL databases; verify index compatibility, migration ordering, rollback/recovery and schema drift — OPEN
- [ ] P570-G002 — Apply P570 migration on clean and upgraded PostgreSQL databases; verify index/FK compatibility, migration ordering, rollback/recovery and schema drift — OPEN
- [ ] P571-G003 — Apply all migrations to clean and upgraded PostgreSQL databases; resolve SQL/schema drift — OPEN (Docker/PostgreSQL unavailable; migration file presence is not execution evidence)
- [ ] P572-G004 — Apply migrations on clean and upgraded PostgreSQL databases, capture migration logs and schema-diff evidence, and test rollback/recovery — OPEN (Docker/PostgreSQL unavailable)
- [ ] P573-G005 — Upgrade a supported prior database snapshot through all migrations and verify data preservation, locks and schema drift — OPEN (no PostgreSQL runtime or snapshot available)
- [ ] P577-G004 — Run axe and manual WCAG 2.2 AA review for all web workflows, including keyboard, focus, screen reader, zoom/reflow, contrast and error announcements — OPEN (axe suite declared but not installed/executed; manual audit not performed)
- [ ] P578-G005 — Validate production dashboards, alert routing, traces, queue lag and operational metrics with sanitized data — OPEN
- [ ] Admissions lifecycle/review queue/assignment, transition validation, review decisions and workflow history UX — OPEN; P211 added compare-and-set transition protection and board-code preservation in enquiry conversion (source verified).
- [ ] Applicant portal draft-save/resume/edit/withdraw/correction and direct account-to-application linking remain OPEN; P331 email-verified dashboard discovery implemented (limited scope).
- [ ] Offer/reservation policy, expiry coordination, cancellation/withdrawal seat release, capacity dashboard — OPEN.
- [ ] Staff Web dashboard/search/bulk actions/reviewer assignment/exception monitoring — OPEN.

### Timetable, rooms and scheduling (83)

- [ ] P06-G005 — Add audit events for calendar, event, working-day and policy mutations — OPEN
- [ ] P06-G007 — Implement recurring holidays, calendar import/export and calendar synchronization — OPEN
- [ ] P06-G009 — Add timezone, DST, locale, date-format and week-start integration tests — OPEN
- [ ] P10-G008 — Implement assignment conflict detection, unique class-teacher rules and timetable integration — OPEN
| P12-G010 | AttendancePolicy and calendar/holiday rules are not enforced | OPEN | policy-driven test suite |
| P12-G017 | Date/timezone and daylight-saving edge cases not tested | OPEN | timezone matrix and date boundary tests |
| P13-G008 | Attendance policy, timetable, holidays and timezone behavior not integrated | OPEN | policy-driven date/period test suite |
| P14-G007 | Attendance policy, calendar, timetable periods and timezone integration absent | OPEN | policy/period/date boundary tests |
- [ ] P18-G001 — Run Prisma schema validation and generated-client typecheck for TeacherTimetableSlot.
- [x] P18-G004 — Add school-wide teacher/room collision detection across distinct assignments (P19 preflight source implemented; concurrency-safe DB enforcement and runtime tests remain open).
- [ ] P18-G005 — Add timetable editor, update API, bulk import/export and bell schedule templates (P19 update, JSON bulk validate/import and JSON export APIs implemented; UI, CSV and templates remain open).
- [ ] P18-G006 — Add substitute teacher, holiday and date-specific timetable exception handling.
- [ ] P18-G007 — Add timezone/DST tests and formally define school-local date semantics.
| P19-G001 | Conflict checks now use transaction-scoped advisory locks on timetable API writes; direct SQL bypass and concurrency behavior still need integration proof | PARTIALLY_IMPLEMENTED | concurrent PostgreSQL tests and documented enforcement for every writer |
| P19-G004 | New timetable create/update/bulk/exception/template/CSV writes validate active canonical room codes; historical free-text labels remain | PARTIALLY_IMPLEMENTED | reviewed legacy label mapping and database referential enforcement |
| P19-G009 | Timetable import has no asynchronous job/progress path for large school-wide datasets | OPEN | queued import workflow, idempotency and retry tests |
| P20-G001 | New timetable writes validate active canonical room codes; existing free-text labels are retained for safe staged migration | PARTIALLY_IMPLEMENTED | legacy room mapping report and database-level room FK enforcement |
| P20-G006 | Holiday/closure suppression and date-only semantics need school-timezone, DST and instructional-day acceptance tests | OPEN | timezone matrix tests and calendar policy sign-off |
| P20-G008 | Room inventory lacks edit/reactivation/alias management and room-to-slot usage validation | OPEN | full room lifecycle and referential validation |
| P21-G005 | P22 adds a non-destructive report for historical labels and a DB trigger protecting referenced canonical room codes; historical labels remain free text | PARTIALLY_IMPLEMENTED | reviewed alias mapping workflow and DB-enforced relational migration |
| P21-G008 | P22 adds a seven-day timetable grid and a 14-day bounded SecureStore read-only cache; offline attendance mutation queue and device tests remain | PARTIALLY_IMPLEMENTED | offline sync policy and device acceptance |
| P21-G009 | P22 adds room edit/reactivation, reference-aware deactivation and legacy usage report; alias lifecycle and runtime tests remain | PARTIALLY_IMPLEMENTED | reviewed aliases, usage migration and executed room lifecycle tests |
| P22-G002 | Legacy room usage endpoint reports labels and exact canonical matches without changing data; no alias registry or reviewed migration execution | OPEN | approved alias model, preview/approve migration workflow and audit trail |
| P22-G005 | Cached timetable is read-only; attendance actions are disabled offline and no queued mutation/synchronization exists | OPEN | explicit offline attendance conflict policy and tested sync queue |
| P25-G003 | Trigger source includes school advisory locking and overlap checks; concurrent two-connection behavior not tested | OPEN | automated PostgreSQL tests for teacher, room, effective-date and exception races |
| P25-G004 | Existing timetable overlaps may predate P25; migration does not automatically clean or reject old rows during installation | OPEN | preflight conflict report, approved remediation and production rollout plan |
| P26-G003 | Calendar list/create and event list/create connected; edit/delete, recurrence, import and holiday sync remain | PARTIALLY_IMPLEMENTED | calendar lifecycle and recurring-event acceptance tests |
| P26-G004 | Working-day GET/PUT connected; holiday impact preview and timetable conflict review remain | PARTIALLY_IMPLEMENTED | integration tests and working-day/timetable policy sign-off |
| P105-G011 | Backup cron is an operator-installed example; scheduled backup execution/alerting is not automatically configured | OPEN | Install and monitor host schedule, alert on missed backups and prove retention/offsite copy |
| P124-G003 | Teacher self-timetable remains scoped to active staff assignments and effective timetable slots; substitute-teacher attendance visibility and school policy for historical/substitute access remain incomplete | OPEN | Define and implement approved substitute/cover access for timetable and attendance, verify date boundaries and ensure no unassigned class data is returned |
| P129-G003 | Opening equity account and journal offset are implemented for one-currency opening batches, but zero-net mixed student debit/credit batches cannot post an aggregate journal and require finance review; source document content is operator-referenced, not uploaded/verified | OPEN | Define policy for zero-net and mixed debit/credit opening schedules, source document storage/approval, multi-currency batches and audit retention; verify with finance-approved examples |
| P130-G002 | P131 adds an approved-batch operationalization path that creates linked StudentFeeCharge, StudentFeePayment and settled StudentFeeRefund/event records with explicit charge/payment source references and does not repost existing journals; runtime and signed source reconciliation remain outstanding | PARTIALLY_IMPLEMENTED | Validate transactional rollback, amountPaid/status and refund allocation, duplicate prevention, operational-link RLS/FKs, journal-to-subledger equality and finance-approved source schedules on PostgreSQL; prove no duplicate posting against opening balances |
| P131-G002 | P132 adds optional operator-declared charge/payment/refund source totals with row-level comparison and a student/currency opening-balance overlap review; cryptographic signatures, independent source-document validation, fiscal-year conversion, closed-period adjustment policy and external bank/provider statement matching remain absent | PARTIALLY_IMPLEMENTED | Implement signed source control totals and approved reconciliation against opening balance schedules, historical journals, operational fee balances and external settlement evidence; define finance-approved fiscal-year and closed-period migration policy |
| P132-G002 | Student/currency historical net receivables are compared with approved/posted opening balance rows to flag possible overlap; differing as-of dates and historical coverage windows mean flags are not proof of duplication | READY_FOR_VERIFICATION | Validate report against known legacy schedules, date-window rules, currencies and operational balances; finance reviewer must resolve each flagged pair |
- [x] P200-G001 — Added scheduled recovery worker for submitted applications whose notification creation was missed (30-day lookback, bounded sweep).
- P268-G001 — Weekly overview UI added on top of existing timetable slot CRUD; build/runtime/API/browser/mobile validation remains OPEN.
- P268-G002 — Advanced timetable optimization, comprehensive conflict scenario validation, and deep scheduling refinements remain Cycle 2.
- [ ] **P280-G002** — Draft editing/deletion, scheduled publication, attachment support and delivery/read tracking. **OPEN**.
- [ ] **P284-G002** — Student attendance, timetable, homework, results/report cards and fees portal coverage. **OPEN — follow-on phases**.
- **P316-G002 OPEN** — Class/teacher view UX needs runtime usability validation; filters are client-side on currently loaded timetable slots.
- [ ] P350-G003 — Confirm/implement Hostel basic room/bed/allotment/outpass flow — OPEN (source audit did not identify a dedicated module)
- **P355-G001 OPEN:** Student Mobile attendance history/summary and timetable journey.
- [ ] P357-G004 — Enforce vehicle capacity and route/vehicle schedule collision checks — OPEN
- [ ] P358-G004 — Bed/room occupancy concurrency, capacity checks, student roster validation and allocation transfer lifecycle — OPEN
- **P397-G002 OPEN:** Calendar/events and remaining configuration domains are not covered by transfer import/export.
- **P398-G001 CLOSED (source slice):** Calendar JSON export/import validation includes required name, event array/count cap, event title/type, start/end ordering, optional all-day/instruction-day booleans, audience string, and within-file duplicate title/start detection.
- **P398-G002 OPEN:** Calendar import is sequential and non-transactional; partial calendar/event creation may remain after failure. Atomic commit and cleanup rollback remain.
- **P425-G002 (OPEN):** Use school-configured timezone for overdue/due-today buckets; API presently buckets by UTC, client labels use local device date.
- [ ] P426-G002 — Automatic scheduled reminder worker, provider delivery/push, retry/backoff, receipts, and notification preferences. OPEN
- [ ] P426-G003 — School-timezone-aware due-soon/overdue generation and coordinator reminder UX/observability. OPEN
- [ ] P427-G003 — Validate scheduled reminder policy and notification frequency against school timezone boundaries; full build/typecheck and E2E — OPEN
- [ ] P438-G003 — Run live DB/API and queue-load tests for scheduler behavior — OPEN
- **P445-G003 OPEN:** Add a background scheduler/outbound notification integration for automatic follow-up reminders; current follow-up is a durable manual record.
- **P475-G004 — Calendar/exam accessibility, date correctness and device E2E:** Static checks only; runtime/device validation remains OPEN.
- **P476-G004 — Planner UX/accessibility/date acceptance:** Device E2E, accessibility, timezone/date correctness and API performance remain OPEN.
- **P484-G001 — Student timetable read API:** Implemented student-linked timetable endpoint using active enrollment and assignment scope; live DB/API acceptance OPEN.
- **P484-G003 — Student-facing calendar:** Implemented default-school-calendar events endpoint restricted to ALL/STUDENTS audiences and bounded date windows; calendar configuration/runtime validation OPEN.
- **P484-G004 — Student Mobile planner UX:** Added timetable, attendance and calendar tabs with loading, empty, error/retry and refresh states; Expo typecheck/build/device acceptance OPEN.
- **P490-G007 OPEN:** Validate timetable/attendance/calendar/exam date and timezone semantics against real records, including empty, malformed, and boundary-date payloads.
- **P493-G004 OPEN:** API contract acceptance for attendance, timetable, calendar, exams/results and homework on real school data remains pending.
- [ ] P512-G001 — Run Prisma validation/generation and apply the installment schedule migration against a clean PostgreSQL database — READY_FOR_VERIFICATION
- [ ] P512-G004 — Expose installment schedule/due status in parent and student mobile experiences — OPEN (planned in P519 parent finance integration and consolidated mobile work)
- [ ] P512-G005 — Integrate schedule publication/activation and invoice lifecycle controls — OPEN (planned in P514 billing/invoice lifecycle)
- **P514-G005 CLOSED in P515:** Student fee payments now link to issued invoices; partial/full collection updates invoice amountDue/status and charge balances transactionally. Installment payment allocations are persisted and installment/schedule paid/status values are updated. Focused P515 verifier covers these source contracts and allocation arithmetic; runtime acceptance remains pending.
- **P517-G004 OPEN:** Verify grace-day boundary, future due date, timezone/date boundary and 1/30/31/60/61/90/91-day bucket cases in live API tests.
- **P519-G005 OPEN:** Accessibility and device acceptance for installment schedule, receipts, allocation rows and refund request controls.
- [ ] P549-G002 — Service-time interpretation uses application/server timezone; per-school timezone configuration and timezone-aware boundary validation remain OPEN.
- [ ] P554-G002 — Scheduled background worker for automatic hold expiry (currently Admin-triggered) — OPEN.
- [ ] P558-G001 — Background scheduler integration for due/overdue reminders — OPEN (dispatch remains Admin-triggered).
- [ ] P559-G004 — Offline driver operations/sync, notification scheduler/provider dispatch and expiry reminders — OPEN.
- [ ] P561-G005 — Scheduled notifications to guardians for pickup/drop, absence/missed-stop and handover events are not wired to provider delivery — OPEN.
- [ ] P562-G003 — Scheduled retention purge job, configurable purge metrics and deletion audit remain OPEN (purge currently on ingest/history reads).
- [ ] P563-G004 — Automated parent notifications for approaching vehicle, pickup, drop, geofence, delay and missed stop are not wired to scheduled/provider delivery — OPEN.
- [ ] P564-G005 — Scheduled vehicle/personnel/document expiry and maintenance reminder worker — OPEN
- [ ] P565-G003 — Scheduled monthly/term/annual invoice generation and mid-period proration on allocation changes — OPEN
- [ ] P565-G004 — Installment schedules, late-fee policy integration, taxes and configurable concession approval workflow — OPEN
- [ ] P566-G004 — Add scheduled curfew evaluation, automatic late-return detection, escalation timers and reliable guardian email/SMS/push delivery — OPEN
- [ ] P570-G005 — Add scheduled invoice generation by monthly/term/annual frequency, effective-dated fee change proration, approved concessions/waivers, late-fee calculation and billing retry/monitoring — OPEN
- [ ] P578-G006 — Validate scheduled jobs, timezone/DST boundaries and duplicate execution under runtime concurrency — OPEN
- [ ] Scheduler invocation and web/mobile reservation management UI — OPEN.
- [ ] Scheduled automatic expiry processing — OPEN.
- [ ] **P283-VAL01** — Teacher mobile typecheck/runtime/device acceptance across announcements, attendance, timetable, homework and grading. **OPEN**.
- [ ] **P286-VAL01** — Teacher mobile typecheck/runtime/device acceptance for messaging alongside attendance, timetable, homework and announcements. **OPEN**.

### Admissions and applicant lifecycle (163)

- [ ] P01-G005 — Build all four web applications — READY_FOR_VERIFICATION
- [ ] P08-G005 — Add duplicate detection, candidate matching, safe merge and admission-number allocation — OPEN
- [ ] P09-G004 — Add application detail endpoint and complete paginated/filterable application/enquiry APIs — OPEN
- [ ] P09-G005 — Implement admission document binary upload, malware scanning, verification/rejection endpoint and signed access — OPEN
- [ ] P09-G006 — Implement concurrency-safe seat reservation, section assignment and release on decline/withdrawal — OPEN
- [ ] P09-G010 — Implement admission fee handoff integration with student fee ledger, invoice/payment reconciliation — OPEN
- [ ] P09-G011 — Add notification templates and reliable email/SMS/WhatsApp delivery for stages and offers — OPEN
- [ ] P09-G012 — Add duplicate candidate detection, safe merge and admission number generation/sequence — OPEN
- [ ] P09-G013 — Connect admissions UI to API and add applicant review, document checklist, capacity and offer screens — OPEN
- [ ] P09-G014 — Add API integration, browser E2E, concurrency and complete accepted-application conversion tests — OPEN
- [ ] P09-G018 — Add automatic enquiry-to-application conversion and follow-up task/communication workflows — OPEN
| P23-G002 | Alias application transaction updates normalized exact legacy labels in slots and exceptions using the shared school lock; no dry-run preview or dual-control approval | PARTIALLY_IMPLEMENTED | dry-run counts, optional second-person approval and concurrent PostgreSQL tests |
| P24-G004 | Alias preview reports normalized-label source counts and target validity; no reservation is held between preview and apply | PARTIALLY_IMPLEMENTED | concurrency integration tests and user confirmation of expected drift behavior |
| P28-G012 | Student and staff PII audit events are application-level; protected external retention and DBA privilege separation remain | PARTIALLY_IMPLEMENTED | deploy separate audit sink, least-privilege DBA controls and retention policy |
| P42-G003 | New descending recipient index is source/migration defined but migration application and query plans are unverified | READY_FOR_VERIFICATION | apply/revert/reapply migration and capture EXPLAIN ANALYZE for representative inbox cardinalities |
| P60-G001 | Webhook route now enforces application/json and 64 KB raw payload cap; route tests added but Vitest not run | READY_FOR_VERIFICATION | Run route tests for content-type, 64 KB boundary, malformed JSON and body-parser 1 MB cap |
| P66-G004 | Provider-native adapter, RTL/tagged PDF, legal retention/hold and full application E2E remain unresolved | OPEN | Carry forward unresolved P00–P65 gaps |
| P68-G004 | Data retention, legal hold, provider callback horizon and safe outbox/hash-alias cleanup policy are not approved | OPEN | Obtain legal/product policy, define retention classes/holds and test non-destructive expiry and audit preservation |
All unresolved P00–P109 gap IDs remain carried forward. P110 does not close P79-G003 or P109-G002 until device/runtime evidence is retained for both mobile applications.
- [ ] P148-G001 — Refund reconciliation drill-down and reviewer resolution notes backed by durable API/audit workflow — OPEN
| P173-G004 | Enquiry conversion prevents repeat conversion at source; enrollment conversion blocks already-converted applications and atomically increments a configured section's enrolled-seat counter before student/guardian/enrollment creation. | IN_PROGRESS | P174 now reuses guardians by same-school phone or case-insensitive email, generates admission numbers under a school advisory lock when omitted, and creates pending AdmissionFeeHandoff records from fee-bearing offers. Still open: safe merge/account linking, reservation-on-offer behavior, fee-ledger/payment reconciliation, and concurrency/runtime acceptance. |
| P173-G006 | Enquiry-to-application, offers and capacity-aware enrollment are implemented for staff web/mobile, but no prospective-parent application/enquiry self-service screen is delivered in Parent Mobile/Public Portal. | OPEN | OPEN: implement applicant-facing mobile/web self-service enquiry/application form with public-safe validation, spam/rate limiting, secure document upload, status access, and API routes that do not require staff membership. P174 did not implement this. |
- P174-G001 — Enrollment API accepts optional admission number; server generates `ADM-YYYY-00001` style sequence under a school-scoped PostgreSQL advisory lock. OPEN for migration/build/runtime and collision tests.
- P174-G003 — Fee-bearing offers can create idempotent pending admission-fee handoff records; web and staff mobile include the action. OPEN for actual fee-ledger/invoice/payment/reconciliation integration.
- P174-G004 — Parent/public applicant self-service, age/document rules, offer-time reservation/expiry release and runtime acceptance remain OPEN.
- P175-G003 — Required document checklist configured and submission requires verified + scanner-clean matching documents. Status: PARTIALLY_IMPLEMENTED; document codes need manual alignment and checklist-to-application UI automation remains open.
- P177-G001 — Anonymous school-scoped public enquiry intake endpoint implemented. Status: READY_FOR_VERIFICATION.
- P182-G003 — Admissions candidate resolution UI, staff account-link verification, normalization policy, concurrency guarantees, and runtime acceptance remain OPEN.
- [x] P188-G003 — Capacity reserved-seat decrement and still-OFFERED offer expiry update are part of worker release transaction.
- [x] P190-G001 — Public application submission now resolves same-school active staff with `admissions.manage` and creates deduplicated in-app outbox entries.
- [x] P190-G003 — Notification generation is best-effort and idempotent by application batch/recipient/channel.
- [x] P190-G004 — Staff admissions inbox baseline API/UI to list recipient-scoped admissions notifications and mark individual items read (P199); bulk actions, delivery management and mobile parity remain OPEN.
- [ ] P190-G005 — Admission event notification delivery via email/SMS provider/templates — OPEN.
- **P191-G001 (PARTIALLY_IMPLEMENTED):** Added plain-text default templates for application submission, missing documents, offer issuance and offer acceptance with deterministic `{{variable}}` substitution and missing-variable validation. Remaining: persisted school-level template configuration, admin editor/preview, locale packs, branding, approval/versioning, provider dispatch integration and runtime acceptance.
- [x] P192-G001 — Parent notification preference API now accepts `ADMISSIONS` category for channel-specific settings.
- [ ] P192-G004 — Verify all admission producer/worker paths respect preferences; build/API/runtime acceptance DEFERRED.
- [x] P193-G001 — Finance-gated manual payment recording for approved/published admission fee charges.
- [x] P196-G002 — Public applicant submission blocked with explicit 409 code if no enabled rule exists.
- [x] P197-G001 — Reservation capacity claim uses exact enrolled/reserved snapshot and capacity bound.
- [ ] P197-G004 — Reservation worker deployment/supervision verification — OPEN.
- [x] P198-G001 — Staff Mobile loads and displays school-scoped seat reservations with application/offer, section, status, and expiry.
- [x] P198-G002 — Staff Mobile manual reservation release requires a reason and refreshes data after release.
- [x] P198-G003 — Staff Mobile can trigger the expired-reservation sweep and display released count.
- [ ] P198-G004 — Mobile eligibility configuration, enquiry intake, guardian collision review, notifications, and payment/receipt parity — OPEN.
- [x] P199-G003 — School Admin Admissions workspace displays notifications and unread state and allows mark-read.
- [ ] P199-G004 — Inbox pagination, bulk mark-read, deep-link navigation to application, mobile inbox parity, provider delivery visibility/retry UI — OPEN.
- [ ] P200-G005 — Mobile inbox, pagination, bulk read and application deep links — OPEN.
- [x] P202-G001 — Added persisted admission contact-verification challenge storage with hashed target/code, expiry, attempt count, verification and consumption timestamps.
- [x] P202-G002 — Added guardian phone/email verified timestamp fields to admission applications.
- [x] P203-G005 — Optional submission gate controlled by `ADMISSIONS_REQUIRE_VERIFIED_CONTACT=true` (phone required; email required when supplied).
- [ ] P203-G007 — Applicant portal verification UI, resend UX, policy/configuration UI, build/typecheck/API/security/runtime acceptance — OPEN/DEFERRED.
- [x] P204-G001 — Added applicant tracking UI contact-verification controls for SMS/phone and email channels.
- [x] P205-G002 — Applicant tracking UI renders persisted phone/email verification state and timestamps after status lookup/refresh.
- [x] P206-G002 — Phone and email verification requirements persisted in schoolPolicy and enforced by public applicant submission.
- [x] P208-G003 — Existing attempt cap, challenge expiry, target/application binding, resend cooldown, and one-time consumption preserved.
- [x] P210-G005 — Phone verification status in applicant tracking reflects deferral rather than unverified state. (source implemented; static check)
- [x] P214-G001 — Admissions application list searchable by application number, student name, guardian name, phone and email in School Admin Web.
- [x] P214-G002 — Application status filter dynamically offers statuses present in the loaded collection, with All and Clear options.
- [ ] P214-G004 — Reviewer assignment, review workload/queue, decision/comment workflow and history UX — OPEN.
- [x] P215-G001 — School Admin admissions overview now shows total active review queue, submitted, under-review, and documents-pending counts with one-click status filtering.
- [ ] P215-G003 — Reviewer assignment/workload, review SLA aging/priority, decisions/comments and full review audit UX — OPEN.
- [x] P216-G001 — Assign/unassign a reviewer to an admission application in School Admin Web; candidates restricted to active school memberships.
- [ ] P215-G003 — Review decisions/comments/history UX and workload/SLA/priority remain OPEN; reviewer assignment foundation delivered in P216.
- [x] P217-G001 — School Admin displays assigned and unassigned active-review queue counts and per-reviewer workload counts (source implementation).
- [x] P217-G002 — Reviewer workload cards and queue selector filter applications by reviewer or unassigned state.
- [x] P218-G001 — Assignment changes persist previous reviewer, new reviewer, actor, timestamp, and optional reason in a dedicated school-scoped audit table.
- [x] P218-G002 — Reviewer assignment history API validates application school scope and limits history to that application, ordered newest first.
- [x] P218-G003 — School Admin application detail view loads and displays reviewer assignment history.
- [x] P219-G001 — Added school-scoped review note records with reviewer actor, type, text, recommendation, timestamp and indexed application/reviewer queries.
- [x] P219-G002 — Added scoped GET/POST review-notes APIs; posting requires admissions.manage and validates note types, text lengths and structured recommendation for decision notes.
- [x] P219-G003 — School Admin application detail UI supports reviewer comments, structured recommendations and information requests, and displays the saved review-note history.
- [ ] P221-G004 — Applicant correction acceptance, reviewer follow-up, email delivery, document lifecycle, builds/typechecks/API/DB/mobile/E2E/security validation remain OPEN/DEFERRED.
- [x] P222-G001 — Applicant response text and responded timestamp stored on the school information-request note.
- [x] P222-G004 — Applicant portal can submit a response and display status/response details.
- [x] P222-G005 — Staff resolve endpoint requires admissions.manage and conditionally resolves scoped OPEN/RESPONDED requests.
- [x] P223-G001 — School Admin application details display correction-request state, applicant response text, response timestamp, and resolution timestamp.
- [x] P223-G002 — Staff resolve action is wired to the existing admissions.manage scoped resolve API and is shown only for OPEN/RESPONDED information requests.
- [ ] P223-G003 — Reopen/follow-up request UI, applicant response notifications/inbox, builds/typechecks/API/DB/runtime/mobile/E2E/security validation remain OPEN/DEFERRED.
- [ ] P224-G004 — Applicant notifications/inbox, reopening same request, full correction-document lifecycle, builds/typechecks, migration execution, API/runtime/mobile/E2E/security validation remain OPEN/DEFERRED.
- [x] P225-G001 — Public applicant request listing returns follow-up linkage (`followUpToId`) for timeline grouping/reference.
- [x] P225-G002 — Applicant portal displays correction requests chronologically and distinguishes original vs follow-up requests.
- [x] P225-G003 — Timeline displays request status, applicant response and response timestamp, plus resolution timestamp where available.
- [x] P226-G003 — Applicant portal and Admin UI expose a replacement selector for rejected documents.
- [ ] P227-G003 — Exact immutable scan-state event history, applicant-facing timeline, staff mobile parity, and build/typecheck/migration/runtime/API/E2E/security validation remain OPEN/DEFERRED.
- [ ] P228-G002 — Applicant notification/inbox for scan and review status changes — OPEN
- [ ] P228-G004 — Runtime end-to-end validation of upload, scanning, review, replacement, and applicant timeline — READY_FOR_VERIFICATION
- [x] P229-G004 — Source event creation wired for applicant submission, application status transition, document review result, and school information request.
P229 source implementation only; runtime validation deferred. P228-G002 applicant notification/inbox gap is addressed at source level by P229.
| P230-G003 | Advanced Admissions gaps intentionally parked while priority shifts to other required modules. | DEFERRED | Retain existing Admissions gaps and revisit after broader core modules. |
| P235-G002 | Applicant-to-student conversion runtime validation, UI acceptance, guardian-match resolution behavior, and final API/E2E verification remain outstanding. | OPEN | Validate during final validation stage; do not run tests/builds during implementation phases. |
- [x] P239-G001 — Student Admin status selector filters allowed next states based on the selected enrollment status; invalid options are not offered.
- [x] P240-G001 — Students workspace fetches section-capacity configuration through the scoped admissions capacity API, without failing the student list load if admissions capacity retrieval is unavailable.
| P261-G001 | Admissions core workflows (enquiry, application draft, review, document review, offers, seat reservations, notifications, and student conversion) exist at source level; runtime/build/API/browser validation remains outstanding | READY_FOR_VERIFICATION | Validate public enquiry/application creation, school-admin workflows, status transitions, required-document checks, offer response, capacity reservation and student conversion end-to-end |
| P261-G002 | School Admin application draft creation did not expose optional applicant date of birth despite API support; date-of-birth control and payload binding added | IMPLEMENTED_SOURCE_ONLY | Runtime-verify date persistence and age-rule enforcement; confirm blank DOB is accepted when no configured age rule requires it |
| P261-G003 | Advanced admissions policy, distributed operations, integrations, analytics and edge-case refinements remain Cycle 2 scope | CYCLE_2_PENDING | Revisit during Cycle 2 deep completion |
- **P303-G003** — Preview capacity values are advisory; race-safe seat reservation/transaction acceptance remains OPEN.
- **P307-G001 OPEN** — Capacity snapshot completeness and API-side atomic seat reservation/revalidation are unverified; advisory preflight does not eliminate concurrent allocation races.
- **P307-G001 PARTIAL** — Fresh client-side capacity preflight is now used before submission; server-side atomic seat reservation remains OPEN.
- [ ] P310-G001 — Runtime API/UI acceptance for exact admission-number directory lookup and rollover flow — READY_FOR_VERIFICATION; static assertions pass but runtime not executed.
- [x] P332-G001 — Public applicant checklist state UX (missing/upload pending/scanning/review/rejected/verified) and completion count implemented; verified-clean rule retained. Status: SOURCE_IMPLEMENTED.
- [x] P333-G003 — Possible duplicate application candidates shown before conversion when child name and guardian contact normalize to a match.
- [x] P334-G002 — School Admin UI action loads personal queue from the API and filters the workspace by the returned application IDs.
- [x] P335-G001 — School-scoped server workload aggregate across all active review applications, not limited to loaded client rows. SOURCE_IMPLEMENTED.
- [x] P335-G002 — Reviewer active-count, overdue-count and oldest-case aging summaries. SOURCE_IMPLEMENTED.
- [x] P335-G004 — School Admin overview, status metrics, reviewer workload and overdue list with refresh. SOURCE_IMPLEMENTED.
- [x] P336-G001 — School Admin application detail combines persisted stage transitions and structured DECISION review notes in a chronological timeline, displaying type, status/recommendation, rationale, timestamp and actor/reviewer (display name when available; ID fallback). Status: SOURCE_IMPLEMENTED.
- [x] P337-G002 — Active seat reservations released and offered offer records withdrawn during applicant withdrawal. SOURCE_IMPLEMENTED.
- [ ] P337-G004 — Paid admission finance/refund reconciliation for withdrawn applications remains OPEN and is tracked under P344.
- [x] P338-G002 — Applicant can accept/decline an open offer from the public portal; response is lock-protected, scoped to application/offer, and writes stage history + applicant notification. SOURCE_IMPLEMENTED.
- [x] P338-G003 — Expired offer response is rejected and expiration/seat release is persisted transactionally. SOURCE_IMPLEMENTED.
- [ ] P338-G004 — Applicant-facing portal UI to list/respond to offers remains OPEN.
- [x] P339-G001 — School-scoped API extends active, unexpired reservations with validated expiry bounds. SOURCE_IMPLEMENTED.
- [x] P339-G002 — Reservation and open-offer expiry synchronized; capacity counters unchanged. SOURCE_IMPLEMENTED.
- [x] P339-G003 — School Admin reservation list includes extend action, validation, API error handling, and refresh. SOURCE_IMPLEMENTED.
- [ ] P339-G004 — Staff-mobile extension UI and immutable reservation history remain OPEN.
- [x] P341-G001 — Applicant document checklist status and required-document completion indicators confirmed in existing public portal. SOURCE_AUDITED.
- [x] P343-G002 — Admission payment receipts list and post-payment refresh in workspace. SOURCE_IMPLEMENTED.
- [x] P343-G003 — Duplicate payment reference for the same admission charge returns controlled conflict before payment creation. SOURCE_IMPLEMENTED.
- [x] **P344-G001 SOURCE_IMPLEMENTED** — Printable admission receipt view from existing receipt records, with receipt metadata and HTML escaping.
- [ ] **P344-G002 OPEN** — Admission-specific refund linkage/status UX in Admissions workspace; existing general Finance refund workflow is reused.
- [x] **P345-G001 SOURCE_IMPLEMENTED** — Staff in-app notification for reviewer assignment updates.
- [x] **P345-G002 SOURCE_IMPLEMENTED** — Staff in-app notification for application status transitions.
- [ ] **P345-G003 OPEN** — Additional admission event coverage (enquiry conversion, offers, payments/refunds) requires Cycle 2 review.
- **P346-G001 (PARTIAL):** Admissions preference explanatory UI integrated; dedicated admissions consent record/version history and explicit withdrawal UI/API remain OPEN.
- **P346-G002 (OPEN):** Audit every admissions notification producer for per-channel preference enforcement; runtime API/database, mobile build/device, and E2E validation remain OPEN.
- **P347-G001 PARTIAL/OPEN:** Exception feed does not yet cover notification delivery failures, fee-handoff anomalies, capacity overbooking, or withdrawn-application cleanup signals.
- **P354-G001 PARTIAL:** Vacancy and candidate intake, leave requests/approval, performance review records, interview/checklist APIs, and linked staff mobile leave self-service source-implemented; interview/checklist workflows lack full Admin UI.
- **P354-G002 OPEN:** Recruitment pipeline stage management, offer/acceptance, candidate-to-staff conversion, and full interview workflow UI.
- **P356-G002 OPEN:** Reservation fulfillment queue, cancellation, expiry, hold notifications and queue ordering.
- **P356-G004 OPEN:** Parent/Student Mobile catalogue and reservation flows; staff scan/barcode/QR intake and circulation.
- **P394-G001 CLOSED (source slice):** Assignment CSV template, preview validation, active roster email checks, unknown/duplicate rejection, blank-email unassignment, guarded sequential application and partial-result summary. Verifier 11/11 PASS.
- **P481-G002 — Parent library portal API:** Library admin/catalogue/loan APIs exist, but guardian-scoped loan/due-date/reservation endpoints remain OPEN. Parent UI explicitly reports unavailable. OPEN.
- **P490-G001 OPEN:** Student library loan/reservation APIs and runtime integration remain missing; the Student Services Hub transparently marks Library as NOT_CONNECTED.
- **P513-G005 OPEN:** Add school-level scholarship eligibility criteria and cohort/student scope application; P513 is charge-specific only.
- **P523-G005 OPEN:** Full application build/typecheck, browser accessibility, mobile regression and E2E acceptance. Source parsing and focused structural verifiers are not runtime acceptance.
- **P529-G002 OPEN:** Wire the new checklist endpoint into applicant and Admin checklist UI surfaces; confirm checklist behavior for replacements and multiple uploads in live fixtures.
- **P531-G002 OPEN:** Confirm applicant portal correction-message clarity and replacement lifecycle with actual upload/scan fixtures, including duplicate replacement chains.
- **P532-G001 OPEN:** PostgreSQL integration tests for concurrent conversion/retry, unique admission-number behavior, transaction rollback, and seat capacity contention.
- [ ] P536-G001 — Server-side pagination and report filters for admissions and communications APIs — OPEN
- **P537-G001 OPEN:** Full runtime cycle acceptance remains pending: complete builds/typecheck, API/database integration, browser/mobile workflow validation and E2E across admissions, enrollment, communications and notification preferences.
- [ ] P538-G003 — Library: policy-driven circulation, reservation queue, renewal/fines and lost/damaged lifecycle — PARTIAL (P552 source implemented barcode metadata/search and bulk accession; scanner/labels and circulation subfeatures remain open)
- [ ] P546-G004 — PostgreSQL migration execution, Prisma validation, runtime API tests and full application/device/E2E acceptance — OPEN.
- [ ] P546-G004 — PostgreSQL migration execution, Prisma validation, runtime API tests and full application/device/E2E acceptance — OPEN.
- [ ] P554-G001 — Database concurrency/race acceptance for reservation queue assignment and copy holds — OPEN.
- [ ] P554-G003 — Parent/student self-service reservation creation, cancellation and visibility — OPEN.
- [ ] P554-G005 — Reservation notifications and pickup reminders — OPEN.
- [ ] P558-G003 — Parent/student self-service renewals, reservation creation/cancellation and fine settlement — OPEN (P558 views are read-only).
- [ ] P558-G004 — Queue position scalable beyond the current 5,000 active reservation query cap — OPEN.
- [ ] P558-G006 — Reservation CSV exports and richer catalogue/fine reconciliation reports — OPEN.
- [ ] P569-G003 — Execute API/database integration tests for capacity counts, bed transfer, waitlist offer/accept/decline/expiry, checkout clearance and settlement approval — OPEN
- [ ] P569-G006 — Add Parent Mobile waitlist offer/acceptance and checkout/settlement status visibility with consent-safe guardian access — OPEN
- [ ] P569-G007 — Add guardian notification delivery for waitlist offers, acceptance and checkout/refund status; respect explicit consent and channel preferences — OPEN
- [ ] P569-G010 — Run browser/device E2E, accessibility, eligibility policy review beyond gender/hostel-type matching, transfer/waitlist/checkout concurrency and load tests, and independent privacy/security review — OPEN
- [ ] P571-G004 — Run dependency-backed semantic typechecks and production builds for all nine application packages, shared packages and API — OPEN (workspace dependencies absent)
- [ ] P571-G008 — Execute transaction/concurrency/load tests for reservation queues, seat/bed allocation, waitlist, invoices, refunds, duty shifts and worker idempotency — OPEN (no DB/runtime test harness)
- [ ] P572-G005 — Run dependency-backed semantic typechecks and production builds for API, four shared packages and all nine applications — OPEN (workspace dependency installation is blocked)
- [ ] P574-G004 — Run production builds for all nine applications, API and shared packages; resolve real bundler/native/module errors — OPEN (dependencies and generated Prisma client unavailable)
- [ ] P579-G001 — Obtain independent application security review, threat-model sign-off and remediation evidence for critical/high findings — OPEN (no independent reviewer or signed assessment supplied)
- [ ] Full admissions fee payment, receipt and reconciliation acceptance — OPEN.
- [ ] Payment/receipt workflow for admission fees and reconciliation acceptance — OPEN.
- [ ] Applicant portal edit/resume UI and saved-draft discovery remain OPEN.
- [ ] Admission finance configuration, discounts/waivers, payment gateway/webhooks, installments, receipts, refunds and reconciliation — OPEN/DEPENDENCY.
- [ ] Staff Mobile Admissions feature parity — OPEN.

### Student records and lifecycle (87)

- [ ] P00-G017 — Student/driver app scope decision and safeguarding requirements — OPEN
- [ ] P08-G008 — Add student/guardian data retention, deletion, export and child privacy/legal review — OPEN
- [ ] P08-G009 — Add bulk student import with preview, validation, duplicate report and rollback — OPEN
- [ ] P08-G012 — Add API, browser and mobile E2E tests for student and guardian journeys — OPEN
- [ ] P08-G014 — Ensure student and guardian PII is redacted from logs, traces and support tools — OPEN
- [ ] P08-G015 — Add field-level privacy controls and verified access scopes for student health/medical records — OPEN
- [ ] P10-G009 — Add teacher assignment scope enforcement to attendance, exams, grading and student APIs — OPEN
| P14-G004 | Roster pagination above 500 students is not implemented | OPEN | cursor/page API and large-class tests |
| P15-G006 | Teacher roster pagination above 500 students absent | OPEN | cursor pagination and large-class tests |
| P29-G001 | Guardian list/link/create/update source and School Admin forms added; possible duplicate contacts return a review conflict, but no reviewed merge workflow exists | PARTIALLY_IMPLEMENTED | design and test a reviewed merge with all student links, consent/account references and audit reconciliation |
| P29-G004 | Student/staff document endpoints still register metadata only; no private object upload/download, signed URL or malware scanning | OPEN | configure private storage, short-lived signed access, quarantine/scanning, signature validation, retention and access audit |
| P73-G002 | Student lifecycle API and School Admin UI source are now connected in P100; browser/API runtime acceptance is pending | READY_FOR_VERIFICATION | Run local API/database and School Admin workflow validation for allowed/blocked transitions, reason/effective-date persistence and history timeline |
| P100-G002 | Parent Mobile displays current student status and supports refresh from the consent-scoped API; Expo device/runtime acceptance is deferred | READY_FOR_VERIFICATION | Run Parent Mobile on supported iOS/Android targets and verify status refresh, school switching and revoked-consent behavior |
| P123-G001 | Student detail now uses an explicit field allowlist; demographic, contact, address and internal-note fields require `students.pii.read`, and enrollment fields are explicitly selected | READY_FOR_VERIFICATION | Verify responses for users with and without `students.pii.read`, including API serialization, guardian relations, audit events and cross-school identifiers |
| P129-G002 | P130 adds approved staged historical charge/payment/settled-refund imports and P131 adds operational fee-table backfill with source-to-charge/payment/refund links; cross-batch allocation, fiscal-year conversion and signed control-total migration remain outstanding | PARTIALLY_IMPLEMENTED | Implement operational fee-table linking/backfill and fiscal-year conversion; reconcile historical charges, payments, refunds, receivables and clearing by student/currency to signed source records without double counting |
- [x] P197-G002 — Direct enrollment capacity increment uses exact enrolled/reserved snapshot and capacity bound.
| P230-G001 | Master cross-module checklist is now persisted, but many items have not yet been source-audited against current implementation. | OPEN | Progressively verify and update checklist through future phases; prioritize Student Lifecycle next. |
- [x] P236-G001 — Direct student enrollment checks configured section capacity and atomically increments `enrolledSeats` only when `capacity >= enrolledSeats + reservedSeats + 1`; optimistic counter conditions protect concurrent claims.
- [x] P237-G001 — Guarded enrollment status transitions from ENROLLED/PROMOTED to PROMOTED/TRANSFERRED/WITHDRAWN/COMPLETED with 409 for invalid or concurrent changes.
- [x] P239-G002 — Selected enrollment current state is displayed, terminal records expose no next-status choices, and submit is disabled unless the selected next state is allowed.
| P259-G002 | Student Records basic flows are covered by existing API and web UI but teacher/parent/student mobile integration and basic end-to-end data continuity require a consolidated verification pass | OPEN | Validate the same student data through permitted web/mobile/API flows; fix only verified basic integration gaps |
- P264-G001 — Student document record list and CLEAN-only secure download UI implemented at source level; runtime/build/API/browser validation remains open.
- P265-G001 — Student list supports server-side search and first-page pagination (up to 50); added local status filter and CSV export for the currently loaded page. Full-school export, bulk selection/actions, and CSV import with preview/validation/duplicate reporting/rollback remain OPEN.
- **P273-G001** — Roster-driven student picker and row-based marks UX — source implemented in P274; READY_FOR_VERIFICATION (runtime remains deferred).
- [ ] **P281-G001** — In-app inbox UI, unread badge and read state across parent, teacher/staff and student portals/apps. **OPEN**.
- [ ] **P281-G003** — Direct student account linkage for true student-targeted notifications. **OPEN**; STUDENTS currently uses guardian proxy.
- [ ] **P283-G002** — Student direct account/inbox support; STUDENTS broadcast currently uses parent/guardian proxy. **OPEN**.
- [ ] **P284-G001** — Student-link UI needs student search/lookup and review queue; current UI accepts student ID. **OPEN**.
- [ ] **P284-G003** — Alternative linking and multi-student account policy needs security/product review. **OPEN**.
- [x] **P281-G001** — Parent, teacher and student in-app inbox surfaces, unread indicators and read actions delivered across P282–P284.
- [x] **P281-G003** — Direct student-account link and student notification targeting delivered in P284; student audiences now use direct student links when available and parent proxy for unlinked students. Runtime validation remains open under P284-VAL01.
- **P303-G001** — Bulk student lookup is limited to currently loaded/search-result page (up to 50); full-directory lookup/import is OPEN.
- **P304-G002** — Atomic rollover transaction or compensation/reconciliation across old enrollment status, new enrollment, capacity counts, and audit records remains OPEN.
- **P305-G002** — Controlled rollover execution, transactional source/target enrollment updates, rollback/compensation, audit remain OPEN.
- **P306-G001 OPEN** — Full-directory/server-side student lookup and large roster execution remain open.
- **P306-G002 PARTIAL** — Interrupted-run duplicate reconciliation is added client-side, but server transaction, rollback/compensation, source-enrollment transition and concurrency-safe idempotency remain OPEN.
- **P308-G001 OPEN** — Server-side atomic capacity claims and concurrency-safe enrollment idempotency/transaction semantics are unverified.
- **P308-G002 OPEN** — Full-directory/server-side student lookup and large roster execution remain open.
- **P313-G003 DEFERRED** — Optional fee component opt-in, student-level overrides, discounts/installments, and fee structure version/clone lifecycle remain Cycle 2.
- [ ] P327-G001 — Verify student answer submission and resubmission live against API/database — READY_FOR_VERIFICATION
- [x] P327-G002 — Student homework attachment upload now source-implemented in P330 Cycle 1; moved to READY_FOR_VERIFICATION pending API/storage/scanner/device acceptance.
- [ ] P330-G002 — Multi-file queue, retry/resume, progress, preview and secure student-side file opening — OPEN for Cycle 2.
- [ ] P350-G002 — Runtime verification of P357 Transport vehicle/route/stop/student allocation flow — READY_FOR_VERIFICATION (source implementation added; runtime validation pending)
- [ ] P350-G008 — Audit full parent/student/teacher mobile journeys against API/UI/persistence and identify missing links — IN_PROGRESS
- **P352-G006 OPEN (Cycle 2):** Meal plan allocation expiry/cancellation, meal serving reconciliation, parent/student receipt/payment UX and richer reporting remain future enhancements.
- **P350-G005:** Canteen basic flow now source-implemented in P352 (menu, meal plans/allocation, orders, serving, payment status, stock, admin/staff/parent/student mobile); runtime validation remains open under P352-G001/G005.
- **P353-G004 OPEN:** Accounting posting, bank transfer integration/export, payment reconciliation/idempotency and payment failure handling.
- **P355-G002 OPEN:** Student fees/balance/payment and report-card/results journeys.
- **P355-G003 OPEN:** Student communications, health view/privacy/access policy, and offline continuity.
- [ ] P357-G001 — Parent/Student mobile transport view and verified guardian-child route data — OPEN
- [ ] P357-G002 — Driver/attendant mobile trip operations and student roster — OPEN
- [ ] P357-G003 — Validate trip event stop belongs to trip route and student belongs to active allocation — OPEN
- [ ] P358-G001 — Parent/Student hostel mobile views and verified guardian access — OPEN
- **P487-G001 — Student inbox usability:** Dedicated student communication center implemented with all/read/unread filters, search across title/body/category/priority, unread count, newest-first ordering, empty/filter-empty messaging, refresh and individual mark-read action. SOURCE_IMPLEMENTED; static verification only.
- **P488-G001 — Student Services navigation overview:** Library, Transport, and Canteen hub source implemented and integrated in Student Mobile. Canteen links to existing canteen experience. SOURCE_IMPLEMENTED; static verification only.
- **P488-G003 — Student-scoped Transport route/allocation/trip API:** OPEN. Existing transport APIs are operational/admin-oriented; student-self allocation and trip-status contract remains outstanding.
- **P489-G001 — Safe transient retry for reads:** Student Mobile GET/HEAD requests retry bounded transient HTTP statuses and network TypeErrors with capped backoff; write requests are deliberately not retried to avoid duplicate submissions. SOURCE_IMPLEMENTED; runtime network behavior OPEN.
- **P489-G003 — Offline cache and stale-data guarantee:** No durable student data cache is implemented or asserted by this phase. The banner warns that previously loaded in-memory data may be stale; secure cache lifecycle, encryption, freshness policy and offline access acceptance remain OPEN.
- **P490-G002 OPEN:** Student transport allocation/route/stop/trip APIs and runtime integration remain missing; the Hub transparently marks Transport as NOT_CONNECTED.
- **P490-G003 OPEN:** Student hostel journey and student finance/documents journey are not delivered in the student app source; assess priority and implement in a later cycle.
- **P491-G002 OPEN:** Run typechecks and Expo exports/builds for Student, Parent, Teacher and Staff mobile apps; P491 did not execute these runtime build steps.
- **P493-G001 OPEN:** Validate Student Mobile API payloads against live backend/database records; P493 adds runtime response guards, but live endpoint acceptance remains pending.
- **P493-G003 OPEN:** Student mobile API typecheck/build/device validation remains pending dependency installation and device environment.
- **P494-G004 OPEN:** Complete Student Mobile typecheck/build and real-device acceptance after workspace dependencies are installed.
- **P496-G005 OPEN:** Run Student Mobile Expo typecheck/build and device acceptance after dependencies are installed; existing unrelated TypeScript parse blockers remain.
- **P497-G002 OPEN:** Run responsive layout, deep-link, app-background/foreground, and screen navigation/back behavior acceptance across Student, Parent, Teacher and Staff apps.
- **P498-G003 OPEN:** Complete physical-device/emulator acceptance for Student, Parent, Teacher and Staff apps, including navigation, lifecycle, deep links, screen readers, accessibility, and offline/online transitions.
- **P499-G003 OPEN:** Start PostgreSQL, Redis and API; validate health/readiness and Student service endpoints with live data.
- **P499-G004 OPEN:** Run mobile emulator/device acceptance across Student, Parent, Teacher and Staff, including screen readers, navigation, lifecycle, deep links, and offline/online transitions.
- **P500-G003 OPEN:** Run web/API typecheck and builds, plus Expo exports for Student, Parent, Teacher and Staff apps after dependencies are installed.
- **P505-G003 OPEN:** Complete emulator/device acceptance for Parent, Student, Teacher, and Staff mobile apps, including navigation, lifecycle, deep links, accessibility, offline/online, and runtime API flows.
- **P508-G003 OPEN:** Complete typechecks, lint and production builds for all web/API workspaces and Expo exports/builds for Parent, Student, Teacher and Staff.
- **P511-G002 READY_FOR_VERIFICATION:** Enrollment selection is capped at 5,000 records; verify legitimate large cohorts and section narrowing with local runtime data, and assess pagination/batch assignment if schools exceed the safety cap.
- **P514-G006 OPEN:** Parent/student mobile portal invoice presentation and download integration (planned P519).
- **P515-G004 OPEN:** Parent and Student mobile payment/invoice visibility, payment status, and installment allocation presentation (planned P519).
- **P516-G008 OPEN:** Parent/student receipt and ledger access/download integration (planned P519).
- **P517-G007 OPEN:** Reconcile aging bucket sums and currency totals to the P516 student ledger; establish date-window/opening-balance behavior and historical ledger reconciliation.
- **P518-G003 OPEN:** Reconcile settled refunds to journals/clearing and P516 student ledger in clean runtime DB.
- **P519-G002 OPEN:** Parent finance history is bounded (up to 100 fee charges); add cursor pagination and history export for larger student records.
- **P519-G006 OPEN:** Parent portal integration parity and student-portal read-only financial history/receipt access remain to be reviewed and delivered where applicable.
- **P535-G002 OPEN:** Student Mobile offline preference intent persistence/reconciliation is not implemented; only Parent Mobile has the existing offline queue.
- **P535-G003 OPEN:** Student preference controls currently support IN_APP only. Email/push preferences require channel readiness and provider integration.
- [ ] P558-G005 — Parent portal loan rows show child name rather than only borrower/student identifiers — OPEN.
- [ ] P560-G002 — Bulk student allocation, allocation transfer/removal UI and allocation lifecycle audit remain OPEN.
- [ ] P566-G005 — Add consent-scoped parent/student hostel attendance, curfew and safety status views; preserve restricted internal incident details — OPEN
- [ ] P571-G010 — Complete browser/device E2E and offline recovery for parent, staff, teacher, student, driver and school admin journeys — OPEN (browser/device execution unavailable)
- [ ] P328-UX — Student names in teacher submission review, late classification, and rubric review UX — OPEN.

### Parent, guardian and family portal (103)

- [ ] P00-G007 — Teacher/parent mobile offline synchronization strategy — OPEN
- [ ] P00-G011 — Transport GPS provider, consent and retention model — OPEN
- [ ] P09-G015 — Add audit, retention, consent, export/deletion and child privacy/legal controls — OPEN
| P12-G013 | Notification outbox and delivery are absent | OPEN | queued delivery, retry and consent tests |
| P15-G007 | Guardian attendance app/read-only access and consent absent | OPEN | guardian privacy/access tests |
| P29-G007 | Guardian contact duplicate review uses normalized email/phone keys but does not merge records or guarantee discovery of every legacy formatting variant | PARTIALLY_IMPLEMENTED | legacy contact normalization report and reviewed merge/alias process |
| P30-G007 | Guardian merge preview and explicit transactional merge added; cross-connection concurrency, rollback and complex primary-link cases not run | READY_FOR_VERIFICATION | DB integration tests for link consolidation, account conflict, rollback and concurrent merge attempts |
| P30-G010 | P31 adds parent portal and scanner dispatch source; S3, PostgreSQL, scanner and browser runtime tests remain unrun | PARTIALLY_IMPLEMENTED | end-to-end storage and non-owner RLS integration suite |
| P31-G010 | P33 adds parent fee/payment history, homework, report cards and in-app notifications at source level; messaging, transport, submission/interaction workflows and runtime verification remain | PARTIALLY_IMPLEMENTED | complete remaining parent workflows and verify each with API/RLS/mobile tests |
| P31-G011 | Consent notice text is versioned and displayed; legal review, notice localization, notice history and withdrawal/re-consent policy are not approved | OPEN | approve jurisdiction-specific notice, translations, retention and re-consent lifecycle with legal/privacy review |
| P32-G001 | Parent attendance cursor pagination is source implemented; PostgreSQL/API boundary, invalid cursor, duplicate timestamp and race tests not run | READY_FOR_VERIFICATION | integration tests for first/next page, foreign/stale cursor, date bounds, corrections and consent withdrawal |
| P32-G003 | Parent app Load more source integrated; Expo typecheck/build and iOS/Android device acceptance not run | READY_FOR_VERIFICATION | Expo build and device E2E for multi-page attendance, school/child switching and sign-out reset |
| P33-G003 | Homework create/publish and parent read view exist; submission, attachments, grading and teacher feedback are not implemented | PARTIALLY_IMPLEMENTED | implement submission lifecycle, private upload/scan, rubric/feedback and parent visibility |
| P33-G005 | Parent notifications are in-app database records; push/email provider delivery, preferences, receipts and retries are not implemented | PARTIALLY_IMPLEMENTED | select providers, implement consent-aware delivery/outbox, receipts, retries and opt-out |
| P33-G007 | Parent mobile displays fees, homework, report cards and notifications at source level; Expo typecheck/build/device tests not run | READY_FOR_VERIFICATION | iOS/Android builds and E2E for child/school switch, refresh, empty/loading/error and consent withdrawal |
| P33-G013 | New fee/homework/report/notification tables and endpoints have no runtime performance/load evidence | READY_FOR_VERIFICATION | add query plans, indexes review and k6 parent traffic tests |
| P34-G008 | Fee/homework/report-card publish routes implement DRAFT-to-PUBLISHED source transition and audit, but concurrency and lifecycle tests were not run | READY_FOR_VERIFICATION | PostgreSQL concurrent publish, idempotent conflict and parent visibility tests |
| P34-G009 | Notification operator list now omits recipient user IDs and UI shows a generic linked-parent-account label; runtime response contract not verified | READY_FOR_VERIFICATION | API integration test confirms no recipient account identifier is serialized and notification counts/visibility are correct |
| P34-G012 | Parent-facing notifications remain latest-100; unread count, cursor pagination, retention and delivery preference APIs remain outstanding | OPEN | define and test notification inbox pagination, unread counters, retention and preference controls |
| P35-G004 | Notification operator response omits recipient account IDs; P36 adds a consent-scoped parent unread count, but records remain one row per recipient and no batch summary exists | PARTIALLY_IMPLEMENTED | implement batch aggregation and test privacy/consent filtering |
| P35-G009 | Notification delivery preferences, provider outbox, receipts, retries and dead-letter operations remain incomplete | OPEN | implement consent-aware delivery lifecycle and provider acceptance tests |
| P36-G004 | Parent text submission uses active linked-child consent and published homework checks; concurrency and portal/API tests not run | READY_FOR_VERIFICATION | run concurrent submission, consent withdrawal, cross-child and lifecycle API tests |
| P36-G005 | Parent notification unread-count endpoint is source implemented; batch aggregation, preference controls, delivery outbox, receipts/retries/dead-letter and parent inbox pagination remain absent | PARTIALLY_IMPLEMENTED | implement consent-aware notification batches and provider delivery lifecycle |
| P37-G006 | Submission attachment metadata is returned to parent portal but parent mobile attachment preview/download/status UI is absent | OPEN | implement parent app attachment status and secure signed-download flow |
| P37-G008 | P38 adds versioned schema, principal approval and private PDF generation at source level; runtime and UI remain unverified | PARTIALLY_IMPLEMENTED | verify Prisma/PostgreSQL/S3 and build admin/parent UI |
| P37-G009 | Notification batches, preferences, transactional outbox, delivery receipts, retry/dead-letter and parent inbox pagination/retention remain incomplete | OPEN | implement consent-aware notification delivery lifecycle and provider acceptance tests |
| P38-G008 | Report-card publish/approval notifications are not emitted; P35–P37 notification batch/outbox/preferences/receipts/retries remain incomplete | OPEN | implement consent-aware transactional notification outbox and delivery workers |
| P39-G002 | Parent mobile app can request and open a consent-checked signed PDF; iOS/Android download, expiry and consent-withdrawal behavior untested | READY_FOR_VERIFICATION | Expo device E2E for signed URL opening, expiry, revoked consent and school switching |
| P40-G003 | Notification batch, outbox, preference models and consent-aware in-app fanout are source implemented; DB migration/RLS/concurrency are not runtime verified | READY_FOR_VERIFICATION | Prisma validate, migration apply/reapply and non-owner PostgreSQL tests |
| P40-G004 | P41 adds EMAIL provider worker with delivery-time consent/preference checks, HTTPS, idempotency, retries and dead-letter; receipts/bounces and PUSH delivery remain absent | PARTIALLY_IMPLEMENTED | run provider contract tests and add receipts/bounces; decide push provider/device registration |
| P40-G005 | P42 adds parent mobile preference-adjacent inbox UX, cursor pagination, unread count and individual/bulk read-state; browser/device/API runtime acceptance remains pending | PARTIALLY_IMPLEMENTED | verify parent inbox pagination/read-state with PostgreSQL RLS and Expo E2E; complete preference UI |
| P41-G003 | EMAIL outbox worker rechecks consent, guardian link, verified email and current preference; BullMQ retry/dead-letter source exists but provider sandbox and worker runtime are untested | READY_FOR_VERIFICATION | test provider acceptance, timeout/429/5xx, retries, duplicate delivery, crash recovery and dead-letter |
| P42-G001 | Parent inbox now uses bounded keyset pages and first-page watermark; PostgreSQL query semantics, concurrent inserts and cursor behavior are not integration tested | READY_FOR_VERIFICATION | seed >100 notices and run API tests for stable order, no duplicates, watermark, concurrent inserts and invalid/deleted anchors |
| P63-G002 | Historical outbox rows without recipient hash cannot be automatically suppressed from later provider bounce/complaint events | OPEN | Define safe backfill/recovery policy; do not infer email from recipient user when multiple guardians may exist |
| P64-G003 | Historical outbox records without recipient hash remain unsupported for automatic provider suppression | OPEN | Define safe historical remediation without guessing guardian email |
| P74-G003 | Parent data backup/restore, retention and device-compromise policy not approved | OPEN | Approve mobile data-at-rest/backup/retention policy and verify platform configuration |
| P101-G005 | Parent consent acceptance/withdrawal now writes versioned consent history events; runtime verification and privileged tamper-resistance remain outstanding | READY_FOR_VERIFICATION | Verify transactional event creation, withdrawal behavior, history retrieval, RLS and immutable retention controls |
| P103-G005 | Parent attendance/notification page cache supports paginated offline reads; other parent actions remain online-only | PARTIALLY_IMPLEMENTED | Verify offline page/cursor restoration and decide/implement any additional safe read/write offline workflows |
| P105-G007 | W3C traceparent/request-ID propagation and structured log correlation added; OpenTelemetry spans/exporter/backend not implemented | PARTIALLY_IMPLEMENTED | Add OTel SDK/instrumentation/exporter and verify end-to-end trace correlation across API, workers and providers |
- [ ] P146-G001 — Refund settlement reconciliation visibility across Finance and parent status views — READY_FOR_VERIFICATION (source integration delivered; runtime ledger reconciliation pending)
- P182-G001 — Conversion now detects multiple same-school guardian matches and aborts safely with `GUARDIAN_MATCH_AMBIGUOUS` candidate response rather than selecting first match. Status: READY_FOR_VERIFICATION.
- [ ] P192-G003 — Dedicated UI, explicit consent record/version, audit trail and withdrawal semantics remain OPEN.
- [ ] P193-G005 — Refund flow, receipt PDF/print, parent payment UI and reconciliation exception workflow — OPEN.
- [ ] P194-G004 — Shared Redis rate limiter, CAPTCHA, guardian email/phone verification and penetration/runtime validation — OPEN.
- [ ] P195-G004 — Guardian collision resolution UI/account-linking workflow remains OPEN.
- [ ] P200-G004 — Email/SMS provider dispatch, channel preference/consent integration, provider receipts and retry/dead-letter UI — OPEN.
| P260-G002 | Guardian edit UI previously exposed only limited profile and relationship fields; expanded controls now cover additional fields supported by existing PATCH API | IMPLEMENTED_SOURCE_ONLY | Runtime-validate edits and verify all flags/nullable contact fields behave as expected |
- [ ] **P282-G002** — Runtime acceptance for general-announcement read synchronization with parent inbox. **OPEN**.
- [x] **P287-G002 (partial)** — Parent Mobile notification preference controls now include accessibility labels/hints/state and Push is explicitly disabled until a provider/worker exists; dynamic channel readiness and mandatory-message semantics remain OPEN.
- **P311-G004 OPEN** — Advanced import field mapping, guardian import, and richer validation/reporting are deferred to Cycle 2.
- **P314-G003 DEFERRED** — Cycle 2 branded receipt numbering/PDF lifecycle, parent receipt enhancements, and advanced reporting.
- [ ] P326-G001 — Confirm live parent homework API payload fields (submission timestamp, status semantics, score/max score, feedback, attachment metadata) — READY_FOR_VERIFICATION
- [ ] P326-G002 — Runtime parent-child scope, overdue state, and school/child switching acceptance — READY_FOR_VERIFICATION
- [ ] P326-G003 — Parent homework attachment download/view workflow — OPEN
- [x] P333-G002 — Staff mobile supports candidate review and selection; server conversion validates selected guardian is a valid normalized-contact match in the scoped school.
- [x] P341-G004 — Chronological document-version timeline and replacement parent reference confirmed in source. SOURCE_AUDITED.
- **P355-G004 OPEN:** Parent/Teacher offline mutation queue conflict recovery and synchronization runtime validation.
- [ ] P357-G007 — Notifications, GPS/live tracking, geofencing and consent/retention controls — OPEN
- [ ] P358-G002 — Leave request creation/warden approval/parent notifications — OPEN
- [ ] P358-G006 — Incident lifecycle/escalation/audit and safeguarding/consent controls — OPEN
- **P473-G004 — Specialist parent journeys:** Canteen and health screens exist; transport, library and hostel parent journeys are not evidenced in inspected parent-mobile source. OPEN.
- **P474-G004 — Specialist parent journeys:** Transport, library and hostel remain OPEN.
- **P474-G005 — Offline/push/deep links/accessibility/device E2E:** Parent offline cache foundations remain; device/runtime acceptance is OPEN.
- **P477-G001 — Parent finance overview:** Added a child-context scoped finance summary showing billed, paid, outstanding and overdue totals, grouped by currency. Static source verifier 12/12 PASS. SOURCE_IMPLEMENTED; runtime OPEN.
- **P477-G003 — Gateway payment initiation:** Not implemented or claimed. Parent app remains read-only for payment initiation; gateway readiness and transaction flow remain OPEN.
- **P479-G002 — Open conversation and latest activity snapshot:** Parent-facing summary counts open threads and shows latest loaded notice/message activity. Backend ordering, completeness and runtime acceptance remain OPEN.
- **P480-G001 — Parent canteen active-child order scope and context freshness:** Parent canteen order history is filtered to the currently active child; menu/order fetches guard against stale context, loading/retry/empty states are added, and ordering is guarded against repeated taps. SOURCE_IMPLEMENTED; runtime/device acceptance OPEN.
- **P480-G002 — Parent health screen context/error resilience:** Health screen resets data on child/school context changes, cancels stale responses, supports retry, filters profiles/events to active child, and renders safe dates and empty states. SOURCE_IMPLEMENTED; runtime OPEN.
- **P481-G003 — Parent hostel portal API:** Hostel admin/building/allocation/incident APIs exist, but guardian-safe allocation and parent-visible incident APIs remain OPEN. Internal/staff incident details must not be exposed. OPEN.
- **P481-G004 — Specialist parent mobile UI:** Added selected-child scoped specialist journey tabs and honest availability/contract descriptions. Static source verifier 16/16 PASS; UI runtime/typecheck/device acceptance OPEN.
- **P481-G005 — Specialist data integration & offline/accessibility acceptance:** No parent specialist APIs were connected in this phase; transport tracking, library records, hostel updates, offline cache and device E2E remain OPEN.
- **P482-G003 — Finance gateway transaction lifecycle:** OPEN; parent finance summary and payment/refund source foundations exist, but payment initiation and live transaction lifecycle are not validated.
- **P482-G004 — Specialist parent API integration:** OPEN; transport/library/hostel are parent-facing UI contract foundations; guardian-scoped API endpoints and live data remain outstanding.
- **P519-G001 OPEN:** Formal receipt details and download/print capability in parent mobile/portal; currently parent sees receipt number and snapshot metadata, not a dedicated receipt-view/download experience.
- [ ] P538-G004 — Transport: verified driver/attendant, conflict-safe capacity allocation, pickup/drop safety, provider-ready GPS, parent tracking, incidents/fees — OPEN
- [ ] P538-G005 — Hostel: roll-call/curfew, visitor/gate passes, leave/guardian workflow, capacity-safe occupancy lifecycle, fees/maintenance/safeguarding — OPEN
- [x] P539-G002 — Health data consent and guardian visibility policy enforcement (P540) — CLOSED with P540 granular guardian health-consent implementation; runtime validation remains separately tracked
- [ ] P540-G001 — Runtime/API integration and guardian consent grant/revoke negative tests — OPEN
- [ ] P540-G002 — Parent mobile consent controls and status presentation — OPEN (planned P544 integration)
- [ ] P543-G001 — Runtime/database/API tests, actual guardian notification delivery integration, escalation policy configuration, UI/mobile incident handling and delivery reconciliation — OPEN
- [ ] P551-G004 — Consent, guardian visibility, retention and privacy review for dietary/health-adjacent profile data remains OPEN.
- [ ] P551-G005 — Parent mobile profile visibility/editing flow remains intentionally restricted pending consent/privacy model — OPEN.
- [ ] P554-G006 — Print/email pickup slips and operational reporting — OPEN.
- [ ] P559-G003 — Driver mobile native sign-in, GPS/navigation, trip start/end and pickup/drop/handover workflows — OPEN.
- [ ] P562-G002 — Consent UI and consent lifecycle self-service in Driver Mobile, guardian consent policy and evidence/audit trail remain OPEN (grant/revoke is School Admin API-backed).
- [ ] P563-G002 — Map visualization/provider, route replay and map interaction remain OPEN; Parent UI displays coordinates/status only.
- [ ] P564-G002 — Incident photo/video evidence attachments and guardian notification workflow — OPEN
- [ ] P565-G006 — Parent payment initiation/provider UX and end-to-end payment status synchronization — OPEN
- [ ] P566-G010 — Add configurable escalation contacts, guardian consent/communication preference checks, notification templates and delivery audit — OPEN
- [ ] P567-G007 — Add guardian communication/consent workflow and native parent/warden mobile visitor/outpass views in P568+ — OPEN
- [ ] P568-G001 — Run Prisma format/validate/generate and confirm generated-client compatibility for HostelLeaveRequest, HostelGuardianConsent and HostelLeaveNotificationEvent — OPEN
- [ ] P568-G003 — Execute API/database integration tests for parent create/edit/cancel, warden approve/deny, overlap conflicts, pass issuance, late-return and return check-in — OPEN
- [ ] P568-G005 — Run dependency-backed API, School Admin and Parent Mobile builds/typechecks — OPEN
- [ ] P568-G008 — Test multiple linked guardians, independent guardian consent/revocation, shared user identities and channel preference races — OPEN
- [ ] P568-G012 — Independent safeguarding/privacy/legal review of guardian consent wording, destination/contact retention and leave escalation policy — OPEN
- [ ] P570-G006 — Add Parent Mobile payment initiation/provider status, guardian invoice receipt/print/export, and parent fee views across multiple linked children — OPEN (current parent mobile shows one selected child's invoices and recorded payments only)
- [ ] P576-G008 — Run finance/parent/admin payment and refund journeys plus provider webhook forgery/replay, retry and concurrency E2E; archive balanced reconciliation evidence — OPEN (browser/device, database and provider sandbox acceptance not run)
- [ ] Notifications event coverage, email/SMS dispatch, consent/preferences, retries/dead-letter/provider receipts, mobile inbox/deep links — OPEN/DEPENDENCY.
- [ ] **P281-VAL01** — Validate audience selection, consent filtering, opt-outs, outbox and inbox state with database fixtures and full API/web/mobile runtime tests. **OPEN**.
- [ ] **P282-VAL01** — Full parent portal typecheck, runtime/device acceptance and API integration verification. **OPEN**.
- [ ] **P285-VAL01** — Verify parent/staff thread access, consent withdrawal, reply/close lifecycle and notification fan-out with database/API fixtures and E2E. **OPEN**.
- [ ] **P287-VAL01** — Parent Mobile typecheck/runtime/device acceptance for all portal workflows and preferences. **OPEN**.
- [ ] **P288-VAL01** — Parent Mobile full typecheck/build/runtime/device validation. **OPEN**.

### Attendance and daily operations (21)

- [ ] P06-G008 — Connect attendance and exam modules to school policy configuration — OPEN
- [ ] P10-G011 — Add staff/teacher self-service profile, leave, attendance, payroll and HR workflows — OPEN
| P12-G009 | Attendance correction review concurrency needs locking/idempotency tests | OPEN | parallel approval/rejection test |
| P12-G014 | Attendance import/export, period attendance and analytics absent | OPEN | approved module scope and end-to-end flows |
| P13-G006 | Bulk attendance transaction rollback/race behavior unverified | OPEN | transaction rollback and concurrent batch tests |
| P14-G005 | Teacher mobile attendance UI and assignment-scoped roster endpoint absent | OPEN | teacher mobile E2E and assignment isolation tests |
| P15-G005 | Offline attendance capture and conflict reconciliation absent | OPEN | offline/online device E2E |
| P26-G005 | Attendance/grading policies connected; broader policy catalogue and version history UI remain | PARTIALLY_IMPLEMENTED | policy catalogue, audit/history and validation acceptance |
| P56-G001 | Allowlisted structured notification operational events and worker outcome logs source implemented; runtime logger output not inspected | READY_FOR_VERIFICATION | Run log serialization tests and inspect production-like collector output for PII/secret absence |
| P106-G003 | Staff/employment/teacher-assignment metrics are available, but no payroll run, payslip or payroll ledger models exist in the P105 schema | OPEN | Implement staff attendance/leave inputs, payroll calculation, approval, payslip, statutory export and accounting posting |
- P270-G001 — Build/typecheck/runtime/API/browser/mobile validation of the attendance workflow and correction request/review UI remains OPEN.
- P270-G002 — Attendance analytics, export refinement, offline sync conflict resolution and deep policy scenarios remain OPEN/Cycle 2.
- [ ] P271-G001 — Attendance report runtime/build/API/browser/mobile validation remains OPEN.
- **P315-G003 DEFERRED** — Cycle 2 bulk attendance marking, offline reconciliation, advanced reports and automation.
- **P353-G003 OPEN:** Attendance/leave proration, overtime, unpaid leave, arrears, advances and adjustment workflows.
- **P354-G004 OPEN:** Leave balances/accrual, holiday-aware day calculation, overlapping leave validation, and attendance/payroll integration.
- [ ] P358-G003 — Hostel roll-call, curfew, visitor/gate pass and emergency response workflows — OPEN
- **P496-G002 OPEN:** Extend durable caching beyond Library/Transport to profile, attendance, planner, assessments, homework and communication data with explicit per-resource cache policies.
- [ ] P561-G001 — Driver mobile attendance still requires network; offline queue and reconciliation remain OPEN.
- [ ] P561-G004 — Attendance corrections, dispute resolution, audit-history UI and reversal policy remain OPEN.
- [ ] P574-G003 — Run semantic TypeScript typechecks for all 14 workspace packages with strict project compiler settings — OPEN (dependencies are not installed; syntax parsing is not semantic typechecking)

### Homework, teaching, assessments and report cards (26)

- [ ] P10-G012 — Connect School Admin staff UI to APIs and add full CRUD, filters, assignment and document screens — OPEN
- [ ] P10-G017 — Add audit coverage for profile edits, document access, assignment changes and privileged support access — OPEN
| P17-G005 | Membership endpoint does not pre-filter teacher assignments by effective date | OPEN | date-aware assignment summary tests and UX behavior |
| P28-G006 | Access member picker, assignment list/revoke and latest-100 audit view added; large member search, audit pagination/export/retention remain | PARTIALLY_IMPLEMENTED | paginated search, durable audit retention and browser acceptance |
| P33-G010 | Fee charge/manual payment, homework and report-card publishing routes have source validation but no full API/Vitest run | READY_FOR_VERIFICATION | run API tests and verify idempotency, duplicate codes, overpayment, date boundaries and publish states |
| P35-G001 | Fees, homework, report-card and notification operator lists use bounded cursor pagination at source; database/API behavior not tested | READY_FOR_VERIFICATION | run PostgreSQL/API integration for first/next page, equal timestamps, invalid/stale/foreign cursor, changed filter and deleted anchor |
- [ ] P218-G004 — Assignment audit runtime/migration/API acceptance; builds/typechecks; DB, mobile, E2E and security validation — DEFERRED to final validation.
- P269-G001 — Runtime/build/API/browser/mobile validation of teacher assignment creation and effective dates remains OPEN.
- [ ] **P272-G002** — Homework creation persists drafts, but an end-to-end homework approval/submission-for-approval UI/API workflow is not present in the audited routes; publishing requires approvalStatus=APPROVED, so publish-from-draft is blocked without that workflow.
- **P273-G003** — Build/typecheck, Prisma migration/client generation, API, browser, mobile and E2E validation of exams/marks/publishing remain OPEN (deferred final validation).
- [ ] **P285-G001** — Thread assignment/ownership, SLA, escalation and reopen lifecycle. **OPEN**.
- [ ] **P286-G001** — Message pagination and staff thread assignment/ownership queue. **OPEN**.
- **P321-G001 — READY_FOR_VERIFICATION:** Roster marks-entry safeguards implemented at source; runtime/API/browser/mobile acceptance remains pending.
- **P321-G004 — OPEN:** Exam marks-write teacher assignment scope enforcement and full build/typecheck/runtime validation remain pending.
- [ ] P335-G005 — SLA threshold configuration, assignment balancing automation, runtime/build/API/DB/browser/E2E validation remain OPEN/Cycle 2.
- **P353-G001 PARTIAL:** Payroll source implementation is present (structures, assignments, monthly calculation, run approval/payment status, Admin UI, Staff Mobile self-payslip). Runtime/schema/build validation not run.
- **P384-G001 CLOSED (source slice):** Assignment controls now expose pending and successful save feedback through accessible live status messages; stale success feedback clears on subsequent attempts and errors. P384 verifier 10/10 PASS.
- [ ] P424-G002 — UX refinements: assignment reassignment controls, task completion notes, overdue task reminders and task history — OPEN
- **P444-G001 RESOLVED (P445):** Assignment now validates against an active platform-admin user record; P445 focused verifier covers this source-side guard. Live DB/API validation remains tracked under P445-G002.
- **P444-G002 OPEN:** Run live DB migration and API tests for acknowledgement, assignment, resolution and lifecycle history atomicity.
- **P444-G005 OPEN:** Test concurrent acknowledge/resolve/assignment requests and lifecycle audit ordering under DB contention.
- [ ] P485-G002 — Marks/results JSON compatibility and score display correctness require database-backed test evidence.
- [ ] P485-G003 — Report-card approval/publishing lifecycle must be validated against live data; only published, approved, and dated report cards are exposed by source filter.
- **P509-G001 OPEN:** Integrate configured fee-category codes into charge creation, fee-structure components and assignment validation; preserve historical category values.
- **P511-G003 READY_FOR_VERIFICATION:** Confirm component-level preview expected/existing/new charge totals match actual created/skipped charge records after assignment.
- **P517-G003 OPEN:** Late-fee policy is configuration + preview only. Assessment lifecycle (period uniqueness, approval, posting to charge/ledger, reversal and idempotency) remains intentionally unimplemented; no automatic late fee posting.

### Staff, HR, leave and payroll (42)

- [ ] P10-G007 — Add department/designation lifecycle, hierarchy and validation rules — OPEN
- [ ] P10-G014 — Add staff PII redaction, retention, export/deletion and privacy/legal review — OPEN
- [ ] P10-G016 — Add duplicate staff detection, employee-number generation and safe rehire/merge process — OPEN
| P12-G011 | School Admin preview is not API-connected or mounted; teacher UI absent | OPEN | browser E2E against persisted APIs |
| P13-G007 | UI remains local-only; teacher UI/navigation integration absent | OPEN | persisted browser E2E flows |
| P15-G001 | Teacher Expo app has not been typechecked or built | OPEN | passing Expo/TypeScript build |
| P16-G005 | Manual IDs are replaced by P17 source implementation; membership discovery and picker still need runtime/RLS/device verification | PARTIALLY_IMPLEMENTED | PostgreSQL-backed membership tests and teacher-app picker E2E |
| P16-G008 | Expo typecheck/build, API tests and teacher mobile E2E remain unexecuted | OPEN | passing CI/build/test artifacts |
| P17-G002 | Teacher membership discovery response and school picker not API/device E2E tested | OPEN | automated API and simulator/device E2E reports |
- [ ] P18-G008 — Add teacher mobile week navigation, offline cache and device E2E coverage.
| P19-G005 | Date-specific cancel/substitute/override models, APIs and teacher daily projection implemented; runtime tests and notification workflows remain | PARTIALLY_IMPLEMENTED | PostgreSQL/API/device tests and notification delivery |
| P20-G007 | Previous/next day and week navigation added in P21; offline cache and substitute notifications remain | PARTIALLY_IMPLEMENTED | offline synchronization and notification delivery tests |
| P22-G004 | Teacher seven-day grid and SecureStore cache implemented; only up to 40 slots/day and 14 dates retained, stale cache expires after 14 days | PARTIALLY_IMPLEMENTED | device acceptance, retention/size testing and accessibility review |
| P28-G005 | Staff PII fields gated by `staff.pii.read` and list/detail access logged; other staff endpoints and export surfaces need review | PARTIALLY_IMPLEMENTED | complete staff PII endpoint inventory and non-owner API tests |
| P29-G005 | Staff employment-history list/append and separation-close workflows added; no DB exclusion constraint for arbitrary legacy overlaps | PARTIALLY_IMPLEMENTED | preflight legacy overlaps and implement/test safe database-level non-overlap invariant |
| P30-G008 | Staff employment-history GiST exclusion constraint and fail-fast overlap preflight added; migration not applied and btree_gist privilege not verified | READY_FOR_VERIFICATION | run migration on clean and overlap-fixture databases, prove abort/repair/reapply and overlap rejection |
- **P152-G001 (PARTIAL):** P153 dispatches refund evidence through the malware scanner, persists QUARANTINED/CLEAN/REJECTED state, promotes clean objects and blocks downloads until approval. P154 adds the School Admin browser upload/list/download workflow. Runtime scanner/storage/browser acceptance remains open; native staff-mobile support is tracked as P154-G001.
- P179-G004 — Public portal document checklist and upload UI added; staff review notes are excluded from public API payloads. Status: READY_FOR_VERIFICATION.
- [ ] P222-G006 — Admin resolution UI, staff notification/inbox, migration/runtime/build/typecheck/API/mobile/E2E/security acceptance remain OPEN/DEFERRED.
- [x] P224-G001 — Staff can issue a follow-up information request linked to a prior responded/resolved request without overwriting its original response or resolution history.
- [ ] P226-G004 — Document-version timeline polish, staff mobile parity, scanner/re-upload runtime acceptance, and build/typecheck/migration/API/E2E/security validation remain OPEN/DEFERRED.
- [ ] P228-G003 — Staff Mobile document review/replacement parity — OPEN
| P255-G001 | Staff profile editing is now connected in School Admin to a school-scoped PATCH API; source validation only, no runtime/API/browser acceptance yet | READY_FOR_VERIFICATION | validate allowed profile updates, null-clearing, invalid department/designation rejection, cross-school denial, `staff.update`/`staff.pii.read` enforcement, audit event and UI error/success handling |
| P255-G003 | Private staff document UX and full qualifications/experience record UI remain incomplete; storage/scanning foundations exist | PARTIALLY_IMPLEMENTED | deliver required basic document listing/upload UX and qualifications/experience workflow, with private storage and security integration acceptance |
- [ ] **P283-G001** — Push/email and deep-link routing for teacher announcements. **OPEN**.
- [ ] **P285-G003** — Read receipts, deep links and teacher-mobile messaging. **OPEN**.
- [ ] P341-G005 — Runtime private-storage/scanner integration, interrupted-upload recovery, staff/mobile and browser E2E validation remain OPEN.
- **P348-G001 OPEN:** Staff mobile runtime/build and physical-device validation are deferred to Cycle 2.
- [ ] P350-G006 — Confirm/implement Payroll salary/run/payslip/payment flow — IN_PROGRESS (P353 source implementation; runtime validation pending)
- [ ] P350-G007 — Audit and complete basic HR leave/recruitment/performance workflows beyond staff records — IN_PROGRESS
- **P353-G002 OPEN:** Statutory India payroll rules (PF/ESI/PT/TDS/gratuity/bonus/state rules) require implementation and professional validation.
- [ ] P358-G007 — Staff scheduling, maintenance, meal/transport integration and reports/exports — OPEN
- **P429-G002 OPEN:** Coordinator roster-wide/aggregate teacher individual-preference visibility is not available; API does not expose it. Requires a privacy-conscious API design.
- **P430-G001 OPEN:** Confirm active staff cohort is the intended reporting population; endpoint currently aggregates active staff with linked user accounts, not a teacher-only designation.
- **P453-G003 OPEN:** Teacher inbox category UX needs decision/validation for pages that contain only non-GENERAL notifications while the client currently displays GENERAL only.
- **P503-G003 OPEN:** Run semantic TypeScript typechecks, lint, Vite production builds for four web apps, and Expo exports for four mobile apps; P503 parser checks are not a substitute.
- [ ] P542-G002 — Health staff case UI/mobile workflow, case timeline and follow-up scheduling integration — OPEN (planned P544)
- [ ] P551-G002 — Allergen label completeness depends on school staff entry; supplier/menu import validation and quality assurance remain OPEN.
- [ ] P566-G006 — Add native warden/hostel staff mobile workflow, offline queue/reconciliation and push notification handling — OPEN
- [ ] P568-G009 — Run browser/device E2E, accessibility, offline behavior, concurrent leave/pass creation and late-return worker overlap/load tests — OPEN
- [ ] P568-G010 — Verify production deployment and monitoring/alerting of `worker-hostel-leave-monitor` and notification delivery worker — OPEN
- [ ] P570-G011 — Add dedicated warden/hostel staff mobile/offline workflows for roster, maintenance and restricted safeguarding response — OPEN

### Fees, finance, accounting and procurement (183)

- [ ] P00-G008 — Accounting model and financial reconciliation specification — OPEN
- [ ] P00-G009 — Payment gateway and refund workflow specification — OPEN
- [ ] P00-G019 — Reporting definitions and reconciliation rules — OPEN
- [ ] P03-G009 — Add idempotency keys and concurrency-safe lifecycle operations — OPEN
- [ ] P05-G002 — Configure real payment gateway adapter and hosted checkout sandbox — OPEN
- [ ] P05-G003 — Implement provider-specific webhook signature/reconciliation, event ordering and retries — OPEN
- [ ] P05-G004 — Generate invoices automatically with GST/tax rules, credit notes and downloadable PDFs — OPEN
- [ ] P05-G006 — Implement dunning, failed-payment retries, grace periods and suspension policy — OPEN
- [ ] P05-G009 — Add billing address, legal entity, tax registration and invoice numbering per jurisdiction — OPEN
- [ ] P05-G010 — Add refund/partial refund and payment reconciliation ledger — OPEN
- [ ] P05-G015 — Add multi-currency rounding, FX and tax-inclusive/exclusive price semantics — OPEN
| P12-G008 | Bulk mark transaction/concurrency behavior needs integration tests | OPEN | concurrent duplicate and partial failure tests |
| P29-G008 | New P29 API/UI workflows have syntax transpilation only; Prisma, API integration, Vitest, full builds and browser E2E not run | OPEN | reproducible green CI with DB-backed integration and Playwright evidence |
| P30-G011 | P31 adds isolated worker decryption and outbox reconciliation; key rotation and worker key lifecycle remain | PARTIALLY_IMPLEMENTED | key management/rotation, worker decryption boundary and secure deletion tests |
| P33-G002 | Fee payment endpoint is manual reconciliation with transaction advisory lock, unique reference and overpayment check; concurrency not tested | READY_FOR_VERIFICATION | PostgreSQL concurrent payment, duplicate reference, rollback and exact-decimal tests |
| P34-G001 | School Admin fees workspace and bounded operator list APIs are source implemented; no gateway collection, refund, receipt PDF or accounting reconciliation | PARTIALLY_IMPLEMENTED | select provider and implement verified checkout, signed webhooks, idempotency, refunds, settlement and accounting reconciliation |
| P34-G002 | Manual payment reconciliation UI calls P33 transaction-locked API; concurrent database behavior and exact-decimal persistence not runtime tested | READY_FOR_VERIFICATION | PostgreSQL concurrent payment, duplicate reference, overpayment, rollback and decimal precision tests |
| P34-G010 | P34 changed School Admin/API files have syntax and static checks only; Prisma, Vitest, typecheck, builds and browser E2E not run | OPEN | reproducible CI with Prisma/PostgreSQL, Redis, Vitest, full builds and Playwright evidence |
| P35-G008 | Payment gateway provider not selected; manual payment is reconciliation only | OPEN | obtain provider/commercial decision before checkout, webhook, refund and accounting implementation |
| P36-G007 | Payment gateway provider remains unselected; no checkout, signed webhook, refund or settlement integration | OPEN | obtain commercial/provider decision before implementation |
| P37-G010 | Payment provider remains unselected; no checkout, signed webhook, refund or settlement integration | OPEN | obtain explicit commercial/provider decision before implementation |
| P39-G007 | New report-card list API and UI have no PostgreSQL/RLS/API concurrency tests; full Prisma/build/browser/mobile acceptance not run | OPEN | run Prisma validate/generate, migrations, non-owner RLS/API tests, full builds and E2E |
| P39-G008 | Payment provider remains unselected; checkout, signed webhooks, refunds and settlement integration absent | OPEN | obtain explicit commercial/provider decision before implementation |
| P40-G006 | P41 adds EMAIL PENDING outbox fanout and BullMQ reconciliation/worker; database lease/claim semantics and provider receipts are not implemented | PARTIALLY_IMPLEMENTED | add atomic DB claim/lease semantics, receipt reconciliation and crash/concurrency tests |
| P40-G011 | Payment provider remains unselected; no checkout, signed webhook, refund or settlement integration | OPEN | obtain explicit commercial/provider decision before implementation |
| P41-G008 | Payment provider remains unselected; no checkout, signed webhook, refunds or settlement integration | OPEN | obtain explicit commercial/provider decision before implementation |
| P42-G006 | P43 adds random-owner 90-second atomic outbox leases and conditional settlement; provider receipts, bounces/complaints and PUSH device lifecycle remain absent | PARTIALLY_IMPLEMENTED | add provider webhook contract/receipts and decide PUSH provider/device registration |
| P42-G010 | Payment provider remains unselected; checkout, signed webhooks, refunds and settlement integration absent | OPEN | obtain explicit commercial/provider decision before implementation |
| P43-G003 | Notification outbox uses random-owner leases, conditional claim/settlement and expired-lease reconciliation; crash/concurrency/provider idempotency tests not run | READY_FOR_VERIFICATION | run concurrent worker and crash-recovery tests with provider idempotency sandbox |
| P43-G006 | Provider receipts, bounces/complaints and PUSH device registration/delivery remain absent | OPEN | select provider capabilities, verify webhook signatures and implement receipt reconciliation; decide PUSH provider/device lifecycle |
| P43-G010 | Payment provider remains unselected; checkout, signed webhooks, refunds and settlement integration absent | OPEN | obtain explicit commercial/provider decision before implementation |
| P44-G004 | Email provider receipts, bounce/complaint ingestion and PUSH lifecycle remain absent | OPEN | confirm provider webhook contract and decide PUSH provider before implementation |
| P52-G001 | Monotonic event reconciliation helper and unit test source added; Vitest not executed | READY_FOR_VERIFICATION | Run notification reconciliation Vitest tests in CI |
| P53-G003 | Worker lease-loss races, retry exhaustion, dead-letter queue persistence and no-send terminal states remain untested in runtime | OPEN | Run worker/Redis/PostgreSQL concurrency and crash-recovery tests |
| P54-G002 | Atomic lease claims, multi-worker races, crash recovery, duplicate queue jobs and dead-letter queue behavior remain unverified | OPEN | Execute Redis/BullMQ/PostgreSQL multi-worker concurrency and crash-recovery tests |
| P68-G002 | Provider-native email adapter and provider-specific webhook/signature/retry/bounce semantics remain unselected | BLOCKED_EXTERNAL | Select provider, implement official adapter, configure sandbox and verify end-to-end send/receipt/bounce/complaint/replay |
| P72-G001 | Payment webhook ID/raw-payload hash integrity implemented in source; Vitest and DB race tests not executed | READY_FOR_VERIFICATION | Run helper/route tests and concurrent PostgreSQL duplicate/payload-conflict tests |
| P72-G002 | Payment provider is not selected; no official adapter or sandbox reconciliation exists | BLOCKED_EXTERNAL | Select provider and implement verified event mapping for success/failure/cancel/refund/chargeback |
| P72-G004 | GST tax invoice/credit note, refund, settlement reconciliation and accounting integration remain incomplete | OPEN | Approve tax/accounting requirements and implement tested invoice/refund/ledger workflows |
| P73-G003 | Concurrency-safe status transition source added; concurrent PostgreSQL behavior not tested | READY_FOR_VERIFICATION | Run concurrent transition tests and prove one status change/history/audit record |
| P103-G007 | Mobile mutation receipt retention/cleanup policy is not automated | OPEN | Define retention duration, cleanup job and audit/forensic requirements |
| P106-G002 | Fee→payment operational metrics are available, but no accounting journal/ledger models or posting workflow exist in the P105 schema | OPEN | Implement fee/payment posting to balanced accounting journals, reconciliation, reversals and audit evidence |
| P125-G003 | P126 adds an immutable request/approval/rejection/externally evidenced settlement lifecycle; P127 now posts balanced immutable journals for fee charges, payments and settled refunds. Provider payout integration, credit notes, bank settlement reconciliation and opening-balance migration remain unimplemented | PARTIALLY_IMPLEMENTED | Verify migration and RLS on PostgreSQL; exercise concurrent refund requests/settlements, approval separation, charge/payment balance recalculation and cross-school denial; then implement provider refund/webhook reconciliation, credit notes and balanced accounting journal posting |
| P126-G003 | P127 adds balanced immutable journals for fee charges, recorded payments and settled refunds; provider payout/refund adapters, provider refund webhooks, credit-note documents, bank settlement reconciliation and legacy opening balances remain unimplemented | PARTIALLY_IMPLEMENTED | Implement provider-specific refund initiation and verified webhook reconciliation, generate credit notes, reconcile bank/provider settlements, migrate opening balances and validate all journal postings at runtime |
| P127-G002 | P129 adds approved opening-balance imports, P130 adds staged historical charge/payment/settled-refund journals, and P131 adds approved operational fee-table materialization with explicit allocations; fiscal-year conversion, opening-balance overlap and signed legacy control-total reconciliation remain outstanding | PARTIALLY_IMPLEMENTED | Define and implement approved historical transaction migration and fiscal-year conversion; reconcile opening receivables, cash/bank clearing and revenue to signed source records without silently inventing prior journals; validate the P129 opening-balance import on PostgreSQL |
| P127-G003 | P127 records manual payment/refund journal effects in cash/bank clearing; P128 adds an internal comparison of recorded payments less settled refunds against the clearing-ledger balance, but this is not bank-statement reconciliation. Real payment gateway payouts, bank reconciliation, credit notes, provider refund webhooks and settlement matching remain absent | OPEN | Implement provider-specific verified settlement feeds, refund APIs/webhooks, credit notes and bank reconciliation with external reference and amount matching evidence |
| P128-G002 | Internal clearing reconciliation compares recorded payments less settled refunds to the cash/bank clearing ledger, but does not ingest bank statements or provider settlement files and cannot prove external cash settlement | OPEN | Implement verified bank/provider statement import, transaction matching, unmatched/partial/duplicate handling, reconciliation approval and immutable reconciliation evidence; validate totals against source statements |
| P130-G003 | Import currency is batch-scoped and posting requires the original date's accounting period to be open; fiscal-year conversion, closed-period adjustment policy, signed source control totals and bank/provider settlement matching remain outstanding | OPEN | Approve fiscal-year and closed-period migration policy; implement signed control totals and multi-currency batch governance; reconcile cash/bank/provider statements and opening balances with independent finance sign-off |
| P133-G002 | P134 integrates full-value, single-target P133 cross-batch allocations into operationalization; external target batches must already be operationalized, while split/partial multi-target allocations remain unsupported | PARTIALLY_IMPLEMENTED | Support split allocations with one-to-many operational linkage, process dependency graphs safely, and reconcile cross-batch journals, operational balances and opening balances on PostgreSQL |
| P133-G003 | Exception queue and finance resolution audit are implemented; signed source evidence, full multi-currency reporting, fiscal-year policy and external bank/provider evidence remain incomplete | OPEN | Add signed source-document evidence, multi-currency control totals, finance-approved fiscal-year/closed-period policy and external statement integration |
| P134-G003 | P136 added one-to-many allocation-link persistence; operational materialization of split/partial allocations remains incomplete | PARTIALLY_IMPLEMENTED | Materialize every split allocation into operational payments/refunds, reconcile source/target remainders, and verify rounding/concurrency on PostgreSQL |
- [ ] P147-G001 — Refund settlement vs ledger discrepancy review — READY_FOR_VERIFICATION (Finance UI review indicator delivered; runtime ledger evidence pending)
- [ ] P149-G001 — Durable refund discrepancy notes and status history runtime verification — READY_FOR_VERIFICATION (schema/API/UI source added; runtime acceptance pending)
- [ ] P150-G001 — Reconciliation note history and status-change runtime verification — READY_FOR_VERIFICATION (schema/API/UI source delivered; runtime acceptance pending)
- [ ] P151-G001 — Binary evidence upload/storage integration and runtime verification for reconciliation evidence — OPEN (P151 delivers durable references only; no binary upload is claimed)
- **P164-G001 (OPEN):** Ensure all relevant worker/service alert producers are wired into `OperationsAlertOutbox` and standardize event taxonomy.
| P165 | Alert Producer Coverage: Implemented a canonical operations-alert taxonomy and stable bounded deduplication keys. Document scanner terminal failures are emitted to the durable operations outbox after dead-lettering; evidence cleanup failures emit structured alerts. | P165-G001 | OPEN | Remaining alert producers across other services are not yet comprehensively wired; provider/runtime verification is pending. |
| P166 | Alert Lifecycle Hardening: Preserved durable outbox, delivery retries, acknowledgement, and recovery semantics; standardized event severity and dedupe key policy for new producers. Added operational guidance to prevent payloads from containing secrets/PII. | P166-G001 | OPEN | Validate event transitions, concurrent delivery, recovery/dedupe behavior and external webhook idempotency at runtime; existing legacy producers may still use local taxonomy. |
| P172 | Subsystem Gap Reconciliation: Created final P165–P172 reconciliation and explicit closure criteria. The code archive is updated cumulatively; unresolved runtime and missing feature gaps are carried forward rather than marked complete without evidence. | P172-G001 | OPEN | Source implementation is advanced but subsystem is not 100% verified; deployment, integration, security, storage provider and mobile acceptance are still required. |
- [ ] P188-G004 — Worker deployment/supervision, concurrency and runtime acceptance — OPEN/DEFERRED.
- [ ] P190-G006 — Durable event retry/reconciliation when notification enqueue fails — OPEN.
- [x] P193-G002 — Payment entry, charge balance update and receipt record are transactionally created; overpayment rejected.
- [x] P193-G003 — School-scoped receipt listing API and receipt/payment reference uniqueness constraints.
- [ ] P193-G004 — Payment gateway checkout/provider adapter and verified signed webhooks — OPEN.
- [ ] P193-G006 — Build/typecheck/API/security/concurrency/runtime acceptance — DEFERRED.
- [ ] P195-G005 — Build/typecheck/API tests/concurrency/runtime acceptance DEFERRED.
- [ ] P197-G003 — Database concurrency/load tests and runtime acceptance — DEFERRED.
- [x] P220-G002 — Validation executes within the scoped transition transaction; existing status allow-list, conditional update concurrency guard, and stage-history recording retained.
- [ ] P257-G003 — Payment gateway checkout and provider-specific invoice reconciliation — OPEN (Cycle 2 / provider configuration required)
- [ ] P257-G005 — Invoice detail, PDF/export, tax-compliance and payment actions — OPEN (Cycle 2)
- [ ] **P278-G001** — Approved expense ledger posting with balanced journal, accounting period validation and idempotency. **OPEN — P279 scope**.
- [ ] **P278-G002** — Secure invoice/receipt evidence attachment lifecycle for expenses (upload validation, scanning, quarantine and access controls). **OPEN**.
- [ ] **P278-G003** — Expense edit/history rules after submission, void/reversal lifecycle and closed-period protections. **OPEN**.
- [ ] **P279-G002** — Budget-vs-actual, cash-flow, tax and fiscal-period configurable reporting coverage. **OPEN**.
- [ ] **P279-G003** — Approved expense ledger posting integration remains unimplemented and is tracked for the next accounting phase. **OPEN**.
- [ ] **P281-G002** — Email/push delivery, retries, provider receipts and delivery operations. **OPEN**.
- [ ] **P286-G002** — Push/deep links, attachments and read receipts. **OPEN**.
- P289-G002 — Email provider send/receipt/opt-out runtime validation remains OPEN.
- **P303-G002** — Bulk import is sequential and non-transactional; rollback/reconciliation for partial failures remains OPEN.
- **P306-G002 OPEN** — Transactional rollover, rollback/compensation and reconciliation remain open; this execution is sequential/non-transactional.
- **P311-G003 OPEN** — Runtime API/browser acceptance and full dependency-backed build/typecheck remain unverified. Existing baseline JSX syntax errors in OperationalModulesWorkspace.tsx were reproduced in P310 source before P311; P311 did not resolve them.
- **P312-G003 DEFERRED** — Cycle 2 fee structure edit history, bulk operations, deeper security/transaction tests.
- [ ] P336-G002 — Dedicated immutable final-decision ledger/finalization event beyond existing structured decision notes and stage history remains OPEN for a future refinement.
- [ ] P337-G005 — Runtime DB/API/concurrency, browser, mobile and E2E acceptance deferred to Cycle 2.
- [ ] P338-G005 — Full build/typecheck, API/DB runtime, concurrency, browser/mobile and E2E acceptance remains Cycle 2.
- [x] P343-G001 — School Admin payment recording form for amount, method, reference, and payment date wired to existing API. SOURCE_IMPLEMENTED.
- [ ] P343-G004 — Runtime database/API, duplicate-reference concurrency, browser/mobile and E2E validation remain OPEN for Cycle 2.
- [ ] **P344-G003 OPEN** — Refund credit-note/receipt print template.
- **P352-G002 OPEN (Cycle 2):** Full order status lifecycle, payment recording idempotency, duplicate-order protection and edge-case validation require deeper workflow tests.
- **P352-G004 OPEN (Cycle 2):** Payment recording is manual status capture; gateway integration and financial-ledger reconciliation remain deferred.
- [ ] P357-G006 — Transport fee ledger integration — OPEN
- [ ] P358-G005 — Hostel fee ledger, deposits, refunds and arrears integration — OPEN
- **P361-G001 CLOSED:** Dependency-free source validation is independently gated in CI; local evidence: 4/4 checks pass (syntax scan, package manifest audit, domain invariants, P80–P108 source contracts).
- **P362-G001 CLOSED:** Reconciled root, docs, and docs/phases active/open gap registers; restored byte-for-byte parity. This corrected a drift that caused 48 historical verifier failures.
- **P377-G004 OPEN:** Runtime database migration/API integration and multi-admin concurrency acceptance remain pending.
- [ ] P427-G002 — Provider/push delivery, retries, receipts and user preferences — OPEN
- **P429-G004 OPEN:** Push/email channels, provider delivery retries/receipts and observability.
- **P430-G004 OPEN:** Push/email provider integration, retry/backoff, delivery receipts and observability.
- **P431-G005 OPEN:** Push/email delivery, retries/backoff, receipts and observability.
- [ ] P432-G004 — Push/email delivery, retries, receipts and observability — OPEN
- **P433-G005 OPEN:** Push/email provider delivery, retry/backoff, receipts and observability.
- **P434-G003 OPEN:** Verify multi-worker claim concurrency, job failures/recovery, retention/cleanup under runtime load.
- **P434-G005 OPEN:** External push/email delivery, retries/backoff, receipts and observability.
- [ ] P438-G002 — Implement configurable worker concurrency/batch processing and validate multi-worker claiming — OPEN
- **P446-G006 OPEN:** Make reminder/escalation marker claim and event outbox insert atomic or add reconciliation for a marker claimed without a corresponding event.
- **P448-G003 OPEN:** Browser test Super Admin policy view/editor/refresh and error feedback.
- **P448-G005 OPEN:** Add reconciliation/recovery for persisted policy changes across multiple workers and verify concurrency behavior.
- **P451-G004 OPEN:** Reconcile/cancel queued deliveries when preferences change; test preference updates racing with enqueue.
- **P461-G001 OPEN:** Cross-phase route inventory completeness and reconciliation with actual runtime mounts require automated/runtime verification.
- **P473-G003 — Finance lifecycle:** Fees/refund activity source exists; full invoice/payment/receipt and refund lifecycle runtime validation remains OPEN.
- **P474-G003 — Fees/payment/receipt/refund runtime lifecycle:** Existing screens and API foundations remain; full runtime lifecycle validation is OPEN.
- **P479-G001 — Notification unread-category snapshot:** Source implementation provides a consolidated unread count, category breakdown from loaded notices, and server unread-count reconciliation. Runtime and pagination semantics remain OPEN.
- **P480-G003 — Canteen menu dietary/allergen disclosure:** Dietary tags are displayed as school-supplied dietary/allergen information and missing data is explicitly disclosed. Schema does not establish an allergen taxonomy or guarantee completeness; verified allergen accuracy remains OPEN.
- **P509-G003 OPEN:** Apply migration and validate finance configuration persistence/RLS on a clean PostgreSQL environment.
- **P509-G005 OPEN:** Confirm all finance configuration fields are used by invoice/receipt generation and downstream workflows.
- [ ] P510-G001 — Run finance configuration and fee-structure category validation against a live API/database; local runtime acceptance — READY_FOR_VERIFICATION
- [ ] P510-G002 — Validate existing legacy fee structures without categoryCode and define/execute any required data backfill — OPEN
- [ ] P510-G003 — Confirm category label rendering and school-configured currency behavior across all fee structure workflows — READY_FOR_VERIFICATION
- [ ] P512-G003 — Link recorded fee payments to installment allocation and update installment paid/status balances — OPEN (planned in P515 fee collection integration)
- **P513-G003 CLOSED across P514–P515:** Approved concessions are snapshotted into invoice net totals (P514); P515 collection caps payments to invoice net outstanding and allocates net installment line amounts. Gross charges remain preserved.
- **P513-G004 READY_FOR_VERIFICATION:** Verify Finance UI workflow, percent/fixed amounts, rounding, 100% waivers, zero-rounding rejection, and over-concession blocking in browser.
- **P514-G003 OPEN:** Add school-configurable invoice prefix/sequence numbering. P514 uses unique generated invoice numbers scoped to school; prefix and sequential numbering are not yet configurable.
- **P514-G004 OPEN:** Add invoice PDF/print template, school branding, tax/GST configuration and compliant tax breakdown where applicable.
- **P514-G007 READY_FOR_VERIFICATION:** Browser acceptance for invoice list, gross/concession/net display, installment line-item snapshots, issue and void controls; verify issued invoice immutability.
- **P514-G008 OPEN:** Verify invoice voiding against live ledger accounting and define reversal/credit-note treatment for issued invoices before production use.
- **P515-G001 OPEN:** Validate Prisma schema and generate client; apply P515 migration to a clean PostgreSQL environment and verify invoice FK and allocation table constraints/RLS.
- **P515-G005 OPEN:** Integrate a real payment gateway only with provider configuration, verified callback/webhook and reconciliation; P515 intentionally records manual reconciliation only and does not simulate gateway success.
- **P515-G006 OPEN:** Verify payment journals and invoice balances against runtime accounting, including refund settlement effects (P518).
- **P515-G007 OPEN:** Browser acceptance of configured payment method selection, invoice outstanding cap, payment history allocation breakdown, and invoice-numbered receipt printing.
- **P516-G003 OPEN:** Verify concurrent receipt issue/sequence numbering and duplicate-payment idempotency in live DB; ensure no duplicate formal receipts or sequence collisions.
- **P516-G004 OPEN:** Expose and validate school receipt-prefix configuration in Finance settings UI; P516 currently reads `feeReceiptPrefix` from configuration with `FEE` fallback.
- **P516-G005 OPEN:** Validate branded printable receipt/browser print layout; add formal PDF download if required.
- **P516-G006 OPEN:** Runtime reconciliation of ledger debit/credit/running balance against operational charges, approved concessions, payments and settled refunds; validate date-window edge cases and historical transaction-date policy.
- **P516-G007 OPEN:** Ledger cursor pagination/export for large schools; P516 currently uses a bounded `limit` and returns the selected tail of the calculated events.
- **P518-G001 OPEN:** Summary is bounded to latest 5,000 refunds; implement paging or database-level aggregation for large schools.
- **P518-G004 OPEN:** Concurrent refund request/settlement tests; summary detection does not replace transactional validation.
- **P518-G005 OPEN:** Finance UI browser acceptance, date filtering/export, accessibility and large-school performance.
- **P520-G001 OPEN:** Consolidated finance summaries need server-side aggregation/pagination for full-school completeness and scalability.
- **P520-G003 OPEN:** Validate data relationships/status handling (voided, draft, partial/refund/reversed) and currency-safe accounting rules through live DB/API tests.
- **P521-G003 OPEN:** Runtime lifecycle fixtures for charge/invoice/payment/refund statuses, including partial payments, void/draft exclusions and reversed payment exclusion.
- **P522-G001 OPEN:** Validate aggregate SQL and journal-line sums against seeded PostgreSQL fixtures, including exact decimal/currency behavior.
- **P522-G002 OPEN:** Verify journal semantics for partial refunds/reversals and non-standard payment/refund lifecycle states; source comparison currently uses recorded payments excluding REVERSED and SETTLED refunds only.
- **P522-G006 OPEN:** Validate accounting debit/credit conventions for FEE_PAYMENT and FEE_REFUND across configured account mappings; variance convention assumes net journal debit is the compared source amount.
- **P523-G001 OPEN:** Runtime PostgreSQL fixture validation for date boundaries, payment/refund lifecycle statuses, exact minor-unit totals and posting-date comparisons.
- **P523-G002 OPEN:** Validate whether source transaction dates and journal posting dates intentionally differ; evaluate accounting cutoff/timing behavior with finance owners.
- **P524-G001 OPEN:** Validate lifecycle aggregation against PostgreSQL fixtures covering partial/full refunds, reversals, rejected refunds and pending settlements.
- **P524-G001 OPEN (partially addressed):** Scenario expectations documented; PostgreSQL runtime fixtures covering partial/full refunds, reversals, rejected refunds and pending settlements are still required.
- [ ] P538-G002 — Canteen: recipe/ingredient consumption, procurement lots/expiry, production/wastage and payment reconciliation — OPEN
- [ ] P546-G001 — Existing stock balance historical ledger backfill and reconciliation — OPEN. P546 starts ledger tracking for new opening balances/receipts/adjustments/consumption; legacy stock rows are not backfilled.
- [ ] P546-G003 — Automatic serving/order reconciliation and lot-aware production consumption, plus production-to-serving integration acceptance — OPEN. P548 adds production batch planning, batch-linked ingredient ledger consumption, wastage and served quantities; direct order/serving auto-reconciliation and FEFO lot deduction remain pending.
- [ ] P546-G001 — Existing stock balance historical ledger backfill and reconciliation — OPEN. New opening/receipt/adjustment/consumption movements are ledgered; existing legacy stock is not automatically backfilled.
- [ ] P547-G001 — Purchase-order editing, cancellation/approval lifecycle, vendor deactivation/reactivation workflow, pricing history and invoice/payment reconciliation — OPEN.
- [ ] P547-G002 — Lot balance decrement and lot-to-stock reconciliation during recipe consumption; lot-aware production and FEFO enforcement — OPEN.
- [ ] P548-G002 — Lot-level decrement, FEFO selection and stock-lot reconciliation for batch consumption — OPEN (also tracked in P547).
- [ ] P548-G003 — Automatic integration between serving/orders and production batch served quantities; avoid manual reconciliation — OPEN.
- [ ] P548-G004 — Production runtime/API/database migration, concurrency, UI/device, accessibility and E2E acceptance — OPEN.
- [ ] P550-G004 — Concurrent idempotency, balance/ledger reconciliation, DB constraints and payment failure behavior require live database validation.
- [ ] P558-G007 — Full Prisma, DB/runtime, dependency-backed build/typecheck, browser/mobile/accessibility/concurrency/E2E acceptance — OPEN.
- [ ] P561-G006 — Prisma validation/generation, migration execution, runtime API/database, full build/typecheck, device/browser, accessibility, concurrency and E2E acceptance remain OPEN.
- [ ] P562-G005 — Full Prisma validation/generation, DB migration/runtime, dependency build/typecheck, browser/device, accessibility, security/privacy, concurrency and E2E acceptance remain OPEN.
- [ ] P563-G005 — Full Prisma validate/generate, DB migration/runtime, dependency build/typecheck, native device GPS, browser/mobile accessibility, privacy/security audit, concurrency and E2E acceptance remain OPEN.
- [ ] P564-G003 — Maintenance invoice/vendor attachment and transport cost-ledger integration — OPEN
- [ ] P564-G006 — Prisma validation, live DB migration, runtime/build, device/browser, accessibility, security, concurrency and E2E acceptance — OPEN
- [ ] P565-G002 — Transport payment refunds, chargebacks, printable/PDF receipts and accounting journal integration — OPEN
- [ ] P565-G005 — CSV exports, period analytics and bank/payment reconciliation — OPEN
- [ ] P565-G007 — Prisma validation, live migration/runtime, dependency build/typecheck, security, accessibility, load/concurrency and E2E acceptance — OPEN
- [ ] P568-G006 — Run real email provider delivery, suppression, retries, bounce/complaint webhook and notification-event reconciliation E2E — OPEN
- [ ] P569-G008 — Implement configurable monthly/prorated hostel fee calculation, dues integration, deposit accounting postings, refund execution and reconciliation; current P569 settlement lines are manually entered and approval-only — OPEN
- [ ] P570-G003 — Integrate hostel invoices/payments/deposits with the canonical school fee/accounting journal; verify balanced postings, reversals, reconciliation and financial-period controls — OPEN
- [ ] P570-G004 — Add payment gateway checkout, signed webhook verification, idempotent settlement, bank reconciliation, chargebacks and actual refund execution; current payment/deposit events are manually recorded — OPEN
- [ ] P570-G008 — Add maintenance SLA timers/escalations, vendor/technician directory, parts procurement/attachments, cost approval and maintenance analytics/export — OPEN
- [ ] P570-G010 — Add hostel operational reports and exports for occupancy/utilization, fee arrears/deposits, duty coverage, maintenance backlog and safeguarding metrics with restricted data masking — OPEN
- [ ] P576-G002 — Validate provider-specific payment webhook signatures, timestamp/replay rules and raw-body handling against official sandbox fixtures; migrate any legacy unsigned-timestamp integration safely — OPEN (generic timestamped HMAC helper added; provider-specific contract and live fixtures not available)
- [ ] P576-G003 — Reconcile verified payment events to payment attempts, invoices, fee allocations and accounting journals with exact amount/currency/reference checks and atomic state transitions — OPEN (current route stores verified event evidence but intentionally does not simulate provider reconciliation)
- [ ] P576-G004 — Exercise duplicate/out-of-order events, payload conflicts, partial refunds, chargebacks, failed settlement and refund-ledger balance under PostgreSQL concurrency — OPEN (database runtime and provider sandbox unavailable)
- [ ] Concurrency/runtime verification — READY_FOR_VERIFICATION (build/runtime acceptance deferred).
- [ ] Finance publish/payment/receipt and reconciliation acceptance — OPEN.
- [ ] API/UI build, tests, concurrency and runtime acceptance — DEFERRED.
- [ ] Deferred comprehensive builds, API integration, browser/mobile E2E, security, concurrency and runtime acceptance — DEFERRED.
- [ ] **P278-VAL01** — Prisma schema/migration validation, API typecheck/build/runtime and browser/mobile verification of the school expense workflow in a dependency-equipped environment. **OPEN**.
- [ ] **P279-VAL01** — Validate expense report date boundaries, currency aggregation and API response against database fixtures; run full runtime/build/browser/mobile integration in an equipped environment. **OPEN**.
- [ ] P557-G03 — Replacement charges/payment reconciliation and receipt settlement — OPEN (charge ledger only; payment-provider integration remains).
- [ ] P557-G04 — Live database migration/runtime, concurrency and end-to-end acceptance for copy lifecycle — OPEN.

### Communications, notifications and messaging (78)

- [ ] P00-G010 — Notification provider strategy, templates and delivery observability — OPEN
- [ ] P05-G011 — Add webhook replay protection, signature tests, idempotency race tests and gateway sandbox E2E — OPEN
- [ ] P05-G013 — Add platform-level access/RLS policy for webhook event processing with least privilege — OPEN
| P13-G010 | Notification outbox and delivery/retry absent | OPEN | delivery and retry test evidence |
| P33-G012 | Notifications are stored per recipient and fetched in latest 100; pagination, retention, deduplication and unread counters absent | OPEN | add cursor pagination, retention policy, idempotency and unread count contract |
| P38-G006 | P40/P41 add branded multi-page PDF, embedded Noto fonts and QR verification source; RTL shaping, logo, tagged accessibility and visual validation remain open | PARTIALLY_IMPLEMENTED | implement configurable multi-page templates and validation/verification features |
| P40-G008 | P43 adds private scanned school logo lifecycle and named immutable template versions; RTL/localized layout and signature images remain absent | PARTIALLY_IMPLEMENTED | implement RTL shaping, accessible localized layouts and signature asset lifecycle |
| P41-G006 | P43 adds quarantined private school logo upload and named template versions; Arabic RTL shaping, tagged/accessibility PDF and QR scan device E2E remain absent | PARTIALLY_IMPLEMENTED | implement shaping/accessibility and QR browser/device acceptance |
| P42-G004 | No notification retention/archival policy or legal-hold model is defined; no destructive cleanup job is enabled | OPEN | obtain legal/product retention decision and implement auditable archive/delete workflow with legal holds |
| P45-G001 | Canonical signed email delivery event ingestion is source implemented; native provider webhook verification and event mapping are not implemented because no vendor is selected | PARTIALLY_IMPLEMENTED | select provider, implement native signature/event adapter, verify vendor sandbox events and replay protection |
| P46-G002 | School Admin suppression UI is not implemented; APIs only | OPEN | add UI for list/add/release with reason and no email/hash disclosure |
| P46-G003 | Provider-global complaint suppression and provider-native webhook adapter remain unavailable pending vendor decision | OPEN | select provider and define legally compliant provider-global suppression and native event mapping |
| P47-G005 | Provider-global suppression and provider-native webhook adapter remain blocked by provider selection | BLOCKED_EXTERNAL | Record explicit provider decision, implement native signature/event mapping and test provider sandbox and global complaint policy |
| P48-G004 | Provider-native webhook adapter/global complaint suppression remains blocked by provider selection; retention/legal-hold policy remains undefined | BLOCKED_EXTERNAL | Select provider and approve provider-global complaint and retention/legal-hold policies before implementation |
| P49-G001 | Notification key-overlap helper regression cases added to Vitest source; Vitest execution unavailable in this workspace | READY_FOR_VERIFICATION | Run API Vitest suite and retain test output in CI |
| P49-G003 | Provider-neutral webhook route is implemented, but native provider signature/event adapter and sandbox acceptance remain blocked by provider selection | BLOCKED_EXTERNAL | Select provider and implement/test its native adapter and replay behavior |
| P50-G001 | Webhook signature parser hardened and contract unit tests added; Vitest execution remains unverified | READY_FOR_VERIFICATION | Run webhook signature/contract Vitest tests and retain CI output |
| P50-G002 | Webhook route integration, concurrent replay idempotency, transaction rollback and out-of-order PostgreSQL behavior remain untested | OPEN | Execute route tests against disposable PostgreSQL with signed raw requests and concurrent duplicate delivery |
| P51-G001 | Route-level webhook test source now covers configuration, provider allowlist, signature rejection, successful event, duplicate replay, missing outbox and out-of-order events; Vitest not run | READY_FOR_VERIFICATION | Run route test suite in CI and retain output |
| P57-G003 | Notification event/outbox query performance and retention remain unbenchmarked; destructive cleanup remains disabled | OPEN | Benchmark with production-like data and approve retention/legal-hold policy before cleanup |
| P59-G001 | Redis-backed notification webhook provider/IP and suppression user/school mutation limits source implemented; Redis runtime/outage tests not run | READY_FOR_VERIFICATION | Run Redis integration tests for atomic counters, expiry, multi-replica consistency and outage fail-closed behavior |
| P61-G001 | Canonical webhook contract now defaults/persists v1; schema/migration/Vitest runtime validation not executed | READY_FOR_VERIFICATION | Run Prisma validate/generate/migration and contract tests against PostgreSQL |
| P62-G001 | Webhook replay now compares stored raw-payload SHA-256; same ID/different payload returns conflict, including concurrent unique-race path; Vitest/PostgreSQL not run | READY_FOR_VERIFICATION | Run duplicate/concurrent webhook route tests and PostgreSQL uniqueness/transaction tests |
| P63-G003 | Different HMAC versions can represent the same email as different hashes; overlapping key-version duplicate suppression race needs explicit alias strategy | OPEN | Design normalized-email alias/index strategy without storing plaintext and test key rollover with active suppression rows |
| P64-G002 | Same-email active suppressions across HMAC key versions can still coexist because the database uniqueness key is version-agnostic only on hash bytes | OPEN | Design safe hash-alias/rotation strategy and test current/previous-key concurrent creation |
| P65-G001 | Versioned suppression hash-alias table, backfill, API alias writes/releases, worker alias lookup and webhook alias insertion implemented; migration/Prisma/runtime not run | READY_FOR_VERIFICATION | Apply migration, validate schema and test current/previous key create/release/send/bounce paths in PostgreSQL |
| P65-G002 | Historical outbox rows without recipient hashes remain unable to create automatic bounce/complaint suppression | OPEN | Define safe historical remediation without guessing recipient email |
| P67-G002 | Cross-layer tests are pure/helper-level; real API→PostgreSQL→worker→provider webhook→UI end-to-end scenario remains unexecuted | OPEN | Run P67 regression matrix against disposable PostgreSQL/Redis and browser E2E with provider sandbox/mock |
| P104-G004 | STANDARD, COMPACT and LARGE_PRINT layouts plus BCP 47 language settings and versioned template UI added | READY_FOR_VERIFICATION | Verify template draft/activation, per-school language selection, page breaks and responsive admin workflows |
- [ ] P202-G004 — SMS/email provider delivery integration and operational secret configuration — OPEN.
- [ ] P204-G005 — Production SMS/email provider delivery configuration, CAPTCHA, full security/build/typecheck/API/E2E/runtime acceptance — OPEN/DEFERRED.
- [ ] P205-G003 — School policy configuration UI/API and production provider delivery remain OPEN.
- [x] P206-G003 — School Admin Web workspace controls for requiring phone/email verification added.
- [ ] P206-G004 — Policy change audit history, mobile policy UI, production provider delivery and operational secrets — OPEN.
- [x] P209-G002 — Dedicated template, challenge idempotency key, provider timeout, and expiry metadata included.
- [ ] P209-G004 — SMS provider integration, template/provider contract tests, provider delivery telemetry, build/typecheck/API/security/runtime acceptance — OPEN/DEFERRED.
- [ ] P225-G004 — Full notifications/inbox, document re-upload lifecycle, mobile parity, and build/typecheck/migration/runtime/API/E2E/security validation remain OPEN/DEFERRED.
- [x] P229-G003 — Public Portal inbox UI shows unread count, updates and mark-read controls.
- [ ] P229-G005 — Email/SMS delivery, mobile parity, additional lifecycle events, notification preferences/retention, and final build/typecheck/migration/runtime/API/security/E2E verification remain OPEN/DEFERRED.
- [ ] **P280-G001** — Recipient resolution and delivery fan-out/notification integration for published communications. **OPEN — P281**.
- [ ] **P285-G002** — Message attachments with secure upload, malware scanning and access policy. **OPEN**.
- [ ] **P287-G001** — Validate email/push channel delivery, provider configuration and opt-out behavior; preferences currently persist only. **OPEN**.
- [ ] **P287-G002** — Refine accessibility/channel availability and mandatory-message category semantics. **OPEN**.
- [ ] **P288-G002** — Expose email/provider readiness to preference UI and verify email delivery/opt-out end-to-end. **OPEN**.
- [ ] **P345-G004 OPEN** — Runtime transaction, concurrent duplicate-delivery, build, browser/mobile/E2E, and live email/push provider validation remains OPEN.
- **P353-G005 OPEN:** Segregation-of-duties controls, immutable approval snapshots, correction/reversal workflow, payslip PDFs and notifications.
- **P354-G005 OPEN:** Performance review cycles, approvals, goals tracking, notifications, and analytics.
- **P391-G004 OPEN/BLOCKED:** Runtime API, database, provider delivery, browser/mobile and E2E acceptance are not executed. F03 remains IN_PROGRESS; F04 remains blocked.
- **P392-G004 OPEN/BLOCKED:** API runtime/build, Prisma validation, DB migration/runtime, provider-delivery integration, browser/mobile/E2E acceptance remain unverified.
- **P425-G003 (OPEN):** Reminder/escalation delivery for upcoming/overdue tasks.
- [ ] P428-G004 — Push/email channel preferences and provider delivery remain outside in-app alert preference scope — OPEN
- **P431-G002 CLOSED (source slice):** Aggregate results suppressed for cohorts smaller than 5; UI shows suppression message instead of metrics.
- **P446-G002 OPEN:** Validate webhook delivery, retry, recipient routing and provider-side deduplication for reminder/escalation events.
- **P447-G005 OPEN:** Verify provider delivery, retry, and end-to-end SLA reminder/escalation recipients in a live environment.
- **P449-G001** — Verify recipient IDs are routed and honored by the actual notification provider/consumer, including channel fan-out.
- **P450-G001 OPEN:** Live webhook/provider validation of recipient-specific outbox deliveries and independent retry behavior.
- **P450-G002 OPEN:** Implement direct in-app/email delivery channels and channel-specific provider adapters.
- **P450-G003 OPEN:** Add user notification preferences/opt-out handling for platform alert channels.
- **P450-G004 OPEN:** Validate fan-out and delivery behavior under concurrent workers with a live database.
- **P451-G001 OPEN:** Implement actual in-app notification persistence/consumption and user-facing notification inbox.
- **P451-G002 OPEN:** Implement email provider adapter, templating, provider configuration, and delivery status.
- **P451-G003 OPEN:** Validate channel preferences and WEBHOOK opt-out filtering with live API/database and provider tests.
- **P451-G005 OPEN:** Multi-worker delivery tests, full API build/typecheck, and browser/mobile E2E.
- **P453-G002 OPEN:** API runtime validation for pagination envelope, cursor boundaries, unread-count freshness, and cross-page duplicate prevention under concurrent notifications.
- **P473-G005 — Offline, push, deep links, accessibility and device E2E:** Source foundations exist for cache and notification preferences, but runtime/device acceptance remains OPEN.
- **P479-G004 — Push/deep-link/accessibility/device E2E:** Push provider delivery, deep links, screen-reader/device E2E and accessibility acceptance remain OPEN.
- **P482-G005 — Push delivery, deep links, accessibility and offline/reconnect acceptance:** OPEN; source foundations exist, but real provider/device/screen-reader and reconnect acceptance are not verified.
- **P494-G002 OPEN:** Validate account-link creation/unlink and verified-email matching against real database records, including concurrent link conflict behavior and audit-log evidence.
- **P507-G004 OPEN:** Validate configured API/web/mobile URLs, provider endpoints, CORS, callbacks, and notification/document-scan integrations against a real deployment with secret values redacted.
- **P534-G002 OPEN:** Recipient-level delivery details, retries/failure actions and provider email/push delivery tracking remain future work.
- [ ] P536-G002 — Extend communication delivery reporting beyond the latest 30 records and add external email/push transport status when providers are integrated — OPEN
- **P537-G003 OPEN:** C2-09 is source-phase complete, but runtime acceptance closure is blocked by carried-forward P534–P536 delivery, pagination/report scale and provider integration gaps.
- [ ] P547-G003 — Expiry alerts/notifications, quarantine/disposal, and expired-stock usage blocking — OPEN.
- [ ] P558-G002 — Email and push provider delivery for LIBRARY notification category — OPEN (in-app outbox only).
- [ ] P564-G001 — Emergency contact directory and automatic call/SMS/push escalation — OPEN
- [ ] P564-G004 — Inspection checklist templates, defect immobilization automation and approval workflow — OPEN
- [ ] P565-G001 — Online gateway checkout, webhook signature verification, event idempotency and automated settlement — OPEN
- [ ] Runtime/email-provider/Prisma generation/full build/device/E2E validation remains OPEN for Cycle 2.

### Documents, privacy and governance (142)

- [ ] P00-G006 — Country-specific legal and privacy compliance review — OPEN
- [ ] P00-G013 — Legal terms, privacy notice and data-processing agreement review — OPEN
- [ ] P00-G020 — Data export, retention and deletion lifecycle — OPEN
- [ ] P01-G001 — Run pnpm install and resolve/commit workspace lockfile — READY_FOR_VERIFICATION
- [ ] P01-G013 — Pin dependencies and commit pnpm lockfile — OPEN
- [ ] P01-G014 — Add API/web Dockerfiles and production deployment profiles — OPEN
- [ ] P06-G010 — Add object-storage logo upload, private access and lifecycle cleanup — OPEN
- [ ] P08-G007 — Implement private document upload, malware scanning, encryption, signed downloads and access audit — OPEN
- [ ] P10-G010 — Implement private binary upload, malware scanning, encryption, signed downloads and document verification — OPEN
- [ ] P11-G018 — Complete privacy/security threat model and independent access-control review — OPEN
| P12-G016 | Audit retention, privacy export and correction SLA are undefined | OPEN | retention policy, export and SLA evidence |
| P14-G008 | Dependency installation, lockfile, Prisma validation, migrations and automated test runs remain pending | OPEN | reproducible CI run and artifacts |
| P15-G009 | Dependency installation, lockfile, Prisma and full test suite remain pending | OPEN | reproducible CI logs and test reports |
| P16-G004 | SecureStore persistence and deletion not verified on physical iOS and Android devices | OPEN | device test evidence for restart, rotation, logout and reinstall behavior |
| P19-G002 | CSV parser, preview/import/export source added in P21; runtime validation and async large-file handling remain | PARTIALLY_IMPLEMENTED | Vitest/API evidence and queued import for large datasets |
| P20-G002 | Strict CSV parser, preview, transactional import and export source implemented in P21; runtime tests and downloadable error artifact remain | PARTIALLY_IMPLEMENTED | executed tests and downloadable row-error report |
| P24-G005 | Alias maker-checker audit events remain transactional; P25 adds database UPDATE/DELETE rejection triggers for AuditLog, not yet applied or tested | PARTIALLY_IMPLEMENTED | apply trigger migration, test non-owner writes and document privileged DBA controls/external retention |
| P24-G006 | Full pnpm install, lockfile, Prisma validation/client generation, API/web typecheck, builds and Vitest not run | OPEN | reproducible CI logs with exact tool versions |
| P26-G008 | Full typecheck/build/Vitest/Playwright and dependency lockfile remain pending | OPEN | green CI with exact tool versions and browser E2E evidence |
| P27-G007 | Full dependency install, lockfile, typecheck, Vite build, lint and Vitest not run | READY_FOR_VERIFICATION | reproducible CI with pinned dependencies and retained logs |
| P30-G005 | P31 adds BullMQ scanner dispatch worker and HTTPS provider adapter; actual malware engine/provider remains external | PARTIALLY_IMPLEMENTED | configure real scanner engine/provider, validate magic bytes/malware, callback retries and scanner integration |
| P30-G006 | Scanner detected MIME is checked against declaration, but actual file-signature/magic-byte inspection is delegated to scanner | OPEN | scanner must prove PDF/JPEG/PNG signatures and reject polyglots, malformed and malicious files |
| P31-G007 | Scanner dispatch worker sends 120-second signed URL and required scan checks to configured provider; actual malware engine and provider are external | PARTIALLY_IMPLEMENTED | configure scanner engine and prove malware, PDF/JPEG/PNG magic bytes, malformed/polyglot, timeout and retry cases |
| P31-G008 | Scanner callback now uses timestamped HMAC and five-minute skew; unit source added but no callback replay integration test run | READY_FOR_VERIFICATION | execute valid, altered body, stale/future timestamp, replay and QUARANTINED state-transition tests |
| P37-G012 | P37 Prisma schema/migration, forced RLS, API, worker, scanner and storage integration are not runtime verified | OPEN | Prisma validate/generate, migration apply/rollback/reapply, PostgreSQL RLS/API/worker tests as non-owner |
| P37-G013 | Vitest, full typecheck/build, Playwright, Expo E2E and provider tests not run | OPEN | provide reproducible CI evidence with isolated PostgreSQL/Redis/S3/scanner and device/browser suites |
| P38-G003 | Private PDF generator, S3 upload and signed-download source are implemented; PDF parser and storage security/integration not tested | READY_FOR_VERIFICATION | parse generated PDFs; verify private bucket, SSE, IAM, signed URL expiry, checksum and failure cleanup |
| P42-G007 | QR verification distributed rate limiting and device E2E remain unverified | OPEN | add shared rate-limit/WAF controls and QR scan/browser/mobile abuse tests |
| P43-G001 | Private school logo upload and School Admin management UI are source implemented; S3/scanner/RLS integration and browser acceptance not run | READY_FOR_VERIFICATION | run object-store and malware-scanner contract tests, prove rejected/mismatched objects cannot activate, verify non-owner RLS and browser UI |
| P43-G005 | Superseded school logos are retained indefinitely; retention policy and legal holds are not defined; no destructive cleanup job enabled | OPEN | approve retention/legal-hold policy and implement audited archival/deletion workflow |
| P44-G005 | Logo retention, superseded asset archival and legal-hold policy remain unresolved; destructive cleanup disabled | OPEN | approve retention and legal-hold policy before implementing cleanup |
| P49-G004 | RTL shaping/tagged accessible PDF and retention/legal-hold policy remain unresolved | OPEN | Select/test maintained shaping stack and approve retention/legal-hold policy before cleanup |
| P52-G004 | RTL/tagged PDF, retention/legal hold, worker runtime and full app acceptance remain unresolved | OPEN | Carry forward evidence requirements from P00–P51 and close only after execution |
| P55-G001 | Shared Pino redaction paths and safe worker error summaries source implemented; runtime logger redaction behavior not executed | READY_FOR_VERIFICATION | Run Pino redaction tests with nested headers/body and inspect captured serialized logs for sentinel PII/secrets |
| P56-G003 | Worker/Redis/PostgreSQL and provider runtime acceptance remain unverified | OPEN | Execute P53–P55 worker and log privacy acceptance plans |
| P58-G004 | Retention/legal-hold, provider-native integration, RTL/tagged PDF and full app E2E remain unresolved | OPEN | Carry forward unresolved P00–P57 gaps |
| P59-G004 | Provider-native adapter, RTL/tagged PDF, retention/legal hold and full app E2E remain unresolved | OPEN | Carry forward unresolved P00–P58 gaps |
| P61-G004 | RLS, rate-limit, worker, RTL/tagged PDF, retention/legal hold and full app E2E remain unresolved | OPEN | Carry forward unresolved P00–P60 gaps |
| P63-G005 | Provider-native adapter, PostgreSQL/RLS, worker runtime, RTL/tagged PDF, retention/legal hold and full E2E remain unresolved | OPEN | Carry forward unresolved P00–P62 gaps |
| P64-G004 | Provider-native integration, runtime RLS/worker/rate-limit, RTL/tagged PDF, retention/legal hold and full app E2E remain unresolved | OPEN | Carry forward unresolved P00–P63 gaps |
| P66-G002 | Key retirement is documented but not automated; outbox references require provider callback retention decision | OPEN | Approve retention/callback horizon and operationally verify zero previous-version references before retirement |
| P67-G004 | Provider-native adapter, RTL/tagged PDF, retention/legal hold and full platform E2E remain unresolved | OPEN | Carry forward unresolved P00–P66 gaps |
| P68-G005 | HMAC previous-key retirement is documented but not approved; active alias/outbox counts and callback horizon must be verified in production-like environment | OPEN | Execute P66 runbook and retain zero-reference/callback-window evidence before removing previous key |
| P69-G001 | P68 baseline has no pnpm-lock.yaml although packageManager pins pnpm 9.15.0 | OPEN | Generate lockfile with pinned pnpm in network-enabled CI, review it and prove `pnpm install --frozen-lockfile` succeeds |
| P69-G002 | Dependencies are not installed and Corepack bootstrap could not reach npm registry in this execution environment | READY_FOR_VERIFICATION | Install from committed lockfile in CI and retain install output |
| P75-G003 | Hard-shutdown deadline and orchestrator grace period are not configured/documented | OPEN | Set a bounded shutdown deadline and align Docker/Kubernetes/process supervisor settings |
| P77-G004 | Distributed tracing and API-to-worker correlation remain incomplete | OPEN | Implement trace propagation and verify end-to-end correlation without PII leakage |
| P78-G003 | Release/security/legal/product sign-offs, backup/DR and operational readiness are not complete | OPEN | Complete approved governance, security, privacy, DR and release sign-off checklist |
| P101-G003 | Document legal hold and retention policy/preview source added; no destructive deletion is enabled | READY_FOR_VERIFICATION | Verify legal hold precedence, policy boundaries, document type handling and preview accuracy against PostgreSQL |
| P105-G005 | Offsite backup replication, WAL archiving/PITR, Redis queue snapshot/replay, multi-region DR and measured RPO/RTO are not implemented | OPEN | Add independent offsite copies, WAL/PITR and Redis queue recovery, then perform documented disaster-recovery exercises |
| P105-G010 | API runtime image copies workspace/build dependencies; production dependency pruning/minimal runtime image is deferred | OPEN | Use verified pnpm deploy/prune strategy after lockfile restoration and validate Prisma runtime engines |
| P105-G013 | Redis AOF persistence is configured but no independent Redis backup/queue replay drill exists | OPEN | Implement an encrypted Redis snapshot or documented queue reconstruction procedure and verify worker recovery |
| P107-G003 | Threat-model, incident-response, privacy and recovery operating procedures are documented as guidance; incident escalation integrations, forensic evidence controls and tested runbooks remain incomplete | OPEN | Approve threat model and incident severity matrix; integrate alerting/on-call/forensics, conduct tabletop and retain signed evidence |
| P107-G005 | RPO/RTO and recovery evidence can be recorded, but no backup restore, regional failover, disaster-recovery exercise or achieved RPO/RTO has been verified | OPEN | Execute and document backup restore and DR exercises; measure achieved RPO/RTO and obtain operational sign-off |
| P115-G001 | Progressive account+source-IP cooldown and threshold-deduplicated privacy-safe alert event generation are implemented; Redis runtime and abuse-resistance behavior are unverified | READY_FOR_VERIFICATION | Verify threshold windows, cooldown durations, success reset, concurrent requests, Redis expiry, generic responses and account/IP key privacy with Redis/API integration evidence |
| P132-G003 | P133 implements append-only cross-batch allocation records and an auditable exception queue/resolution workflow; declared source totals are not cryptographically signed, and fiscal-year conversion, closed-period migration policy and bank/provider evidence remain incomplete | PARTIALLY_IMPLEMENTED | Add signed source-document evidence, approved fiscal-year/closed-period policy and external bank/provider statement integration; complete runtime verification |
- P179-G003 — Private presigned upload, metadata validation, quarantine and scan queue completion flow implemented. Status: READY_FOR_VERIFICATION.
- P180-G002 — Configured mandatory checklist documents must be VERIFIED and CLEAN before public submission. Status: READY_FOR_VERIFICATION.
- [ ] P201-G003 — CAPTCHA, contact verification, secure recovery UX, proxy trust review, public document security review — OPEN.
- [x] P221-G003 — Public portal displays school correction requests and correction form for DOCUMENTS_PENDING; draft editing remains supported.
- [x] P226-G002 — Replacement uploads create new document records; rejected versions remain preserved.
- [x] P227-G001 — School Admin document history timeline shows upload, scan-request/security state, review outcome/comment, and replacement lineage events using current scoped document records.
- [ ] P228-G001 — Persisted historical document scan/security-state events with exact timestamps — OPEN
- P264-G002 — Advanced document governance, retention, scan operations monitoring, compliance refinements remain Cycle 2.
- P265-G002 — Runtime/build/API/browser validation of search, status filter and CSV export remains OPEN.
- [ ] P271-G002 — Historical date-range trends, report export, and additional analytics remain OPEN (Cycle 2).
- [ ] **P279-G001** — Add financial report CSV exports, saved report snapshots and period locking. **OPEN**.
- [ ] P310-G002 — Cycle 2 rollover hardening (atomic capacity claims, rollback/compensation, durable audit/approvals/retention/reporting) — OPEN.
- **P316-G003 DEFERRED** — Cycle 2 automated scheduling, conflict-resolution optimization, workload constraints and advanced print/export views.
P326-G003 updated to READY_FOR_VERIFICATION based on P329 source implementation; runtime verification is still required. P327 attachment-upload and P328 review-runtime gaps remain open.
- [x] P332-G002 — Public submission error displays API-provided missing document names. Status: SOURCE_IMPLEMENTED.
- [x] P335-G003 — SLA due/overdue calculations based on stage-entry history when available, with documented fallback timestamps. SOURCE_IMPLEMENTED.
- [x] P341-G002 — Rejected-document replacement upload and replacement linkage confirmed in existing public portal. SOURCE_AUDITED.
- **P356-G005 OPEN:** Reports/exports, overdue communications, analytics, full UI enhancements.
- [ ] P357-G008 — Driver licensing/vehicle document expiry alerts and maintenance workflow — OPEN
- [ ] P357-G009 — Transport reporting/export/analytics — OPEN
- [ ] P359-G001 — Generate and commit the pnpm 9.15.0 lockfile after dependency resolution succeeds — OPEN
- [ ] P359-G005 — Establish CI install/check/build gates after lockfile is available — OPEN
- **P359-G001 lockfile generation — OPEN / BLOCKED:** registry connectivity returns `EAI_AGAIN`; pnpm unavailable. No generated lockfile.
- **P359-G004 legacy verifier remediation — CLOSED:** 143 legacy verifier scripts pass; combined C2-01 static suite is 143/144 due lockfile gate.
- **P359-G001 OPEN/BLOCKED:** Lockfile still missing; registry/network access required.
- **P359-G005 PARTIAL:** Source-only CI gate added; reproducible install/build workflow still blocked by lockfile/dependency setup.
- **P359-G006 OPEN/BLOCKED:** Expo export/native/device validation remains unverified.
- **P362-G002 CLOSED:** Added `scripts/verify-c2-01-register-mirrors.mjs` and `verify:c2-01:mirrors`; CI source gate now enforces 6 document/register mirror pairs.
- **P362-G003 OPEN:** Full install/build/runtime acceptance remains blocked by missing pnpm lockfile and dependency registry access.
- **P363-G001 CLOSED:** Added dependency-free verifier `scripts/verify-c2-01-ci-workflow.mjs` to audit required CI jobs and gates (source-only job, lockfile/frozen install, Prisma generation, API/web builds, production Compose validation, Trivy scan).
- **P363-G003 OPEN/BLOCKED:** Lockfile, dependency install, build and runtime validation remain blocked by package registry/network environment.
- **P364-G002 OPEN/BLOCKED:** Diagnostic findings confirm the lockfile is missing and pnpm is unavailable; reproducible install, dependency builds, runtime/mobile/E2E and production validation remain blocked.
- **P365-G003 OPEN/BLOCKED:** Lockfile, dependency install, actual container builds and runtime/mobile/E2E/production acceptance remain unresolved.
- **P359-G001 OPEN/BLOCKED:** Lockfile cannot be generated in this environment; Corepack pnpm 9.15.0 acquisition failed with registry DNS `EAI_AGAIN registry.npmjs.org`. No synthetic lockfile created.
- **P370-G004 OPEN/BLOCKED:** Build/typecheck/runtime/API/mobile/E2E acceptance remains unverified due inherited dependency bootstrap/lockfile blocker.
- **P372-G004 OPEN/BLOCKED:** Dependency-based build/typecheck/runtime/API/mobile/E2E acceptance remains unverified due inherited lockfile/bootstrap blocker.
- **P373-G005 OPEN/BLOCKED:** Build/typecheck/runtime/API/mobile/E2E acceptance remains unverified due inherited lockfile/bootstrap blocker.
- **P382-G001 CLOSED (source slice):** School-admin readiness CSV export now includes checklist status, descriptions, remediation, prerequisite labels, and assigned owner; CSV escaping/BOM/date-stamped filename/object URL cleanup verified. P382 verifier 11/11 PASS.
- **P396-G003 OPEN:** Multi-resource atomicity is not provided; compensating rollback can fail. Full import/export transaction with atomic commit/rollback remains.
- [ ] P432-G002 — Resolve actor user IDs to safe display names in history UI (optional, privacy-reviewed) — OPEN
- **P433-G001 CLOSED (source slice):** History endpoint supports date range, action and actor-ID filters, bounded cursor pagination and filtered CSV export (1,000 record cap); School Admin UI added controls. P433 verifier 17/17 PASS.
- **P433-G004 OPEN:** CSV export remains capped at 1,000 records; no background export job or export audit event yet.
- **P433-G004 CLOSED (source slice):** Background export job creation/status/download endpoints and worker are implemented; exports are filter-snapshotted, requester scoped, capped at 50,000 rows, stored temporarily and purged after 24 hours. P434 verifier 26/26 PASS.
- **P434-G002 OPEN:** Full build/typecheck and browser E2E; actual queued export/download flow not exercised against live services.
- **P434-G004 OPEN:** Export row cap 50,000; large datasets beyond this cap require chunking or streamed/background file storage.
- **P435-G003 OPEN:** Full build/typecheck and browser E2E for export-job management UI.
- **P435-G005 OPEN:** Export files currently stored in DB text; verify storage pressure/limits and evaluate object storage/streaming beyond 50k rows.
- **P436-G002 OPEN:** Full build/typecheck and browser E2E for export-health UI.
- **P436-G004 OPEN:** Validate metric query performance at production-scale export-job volume and add indexes/rollups if needed.
- [ ] P440-G001 — Persist export worker cycle/job metrics as historical telemetry; current outcome counters and cycle duration are process-local/log-only — OPEN
- **P447-G002 OPEN:** Validate policy environment values in deployed worker configuration and deployment documentation/operations.
- **P452-G003 OPEN:** Implement/validate retention and pruning for delivered in-app outbox records.
- **P490-G005 OPEN:** Expo typecheck/build and runtime API/database tests could not be executed in this environment; install dependencies and run the documented workspace validation.
- **P491-G001 OPEN:** Install the workspace dependencies in a clean environment and validate pnpm lockfile/install reproducibility; this phase's static contract verifier passes but install was not run.
- **P496-G001 OPEN:** Install and validate AsyncStorage dependency in a full workspace package installation; package manager is unavailable in this execution environment and lockfile regeneration could not be performed.
- **P497-G003 OPEN:** Install workspace dependencies and complete Expo typecheck/export/build and mobile runtime acceptance; P497 only adds source-level accessibility improvements and focused assertions.
- **P498-G001 OPEN:** Install dependencies and complete workspace/API/web/mobile typecheck, build, and Expo export; static source verifiers are not build evidence.
- **P499-G001 OPEN:** Install workspace dependencies with pnpm and confirm lockfile reproducibility; P499 preflight only reports prerequisites.
- **P499-G002 OPEN:** Complete web/API and four mobile-app typecheck/build/export validation.
- **P500-G002 OPEN:** Execute frozen dependency installation after lockfile creation; dependency install and build/typecheck remain blocked until P500-G001 is resolved.
- **P501-G003 OPEN:** Perform a clean frozen dependency install and verify install reproducibility (second frozen install with no lockfile changes).
- **P502-G002 OPEN:** Complete clean frozen dependency installation and verify lockfile reproducibility after P502-G001.
- **P505-G002 OPEN:** Complete frozen dependency installation and dependency-backed typecheck/build/export for all four Expo mobile apps.
- **P507-G001 OPEN:** Populate and validate the production environment and secret files for a real deployment; sample values remain intentionally placeholders and no deployment environment was available to validate.
- **P520-G005 OPEN:** Browser accessibility, responsive workspace, navigation consistency and export acceptance remain pending.
- **P523-G004 OPEN:** Performance/query plan validation for date-filtered detail loads; UI detail is bounded but API aggregate scans still require profiling and index validation.
- **P525-G001 OPEN:** Execute the documented matrix against PostgreSQL fixtures and record observed/expected results.
- **P530-G001 OPEN:** Runtime storage provider integration and upload-expiry behavior require environment-backed validation.
- [ ] P552-G001 — Generate scannable barcode/QR image assets and printable copy-label sheets — OPEN
- [ ] P552-G002 — Validate scanner hardware/mobile camera integration and barcode scan lookup — OPEN
- [ ] P559-G001 — Secure file upload/storage and access control for driver/attendant documents (currently optional URL metadata only) — OPEN.
- [ ] P571-G001 — Restore reproducible pnpm workspace install and commit/verify pnpm-lock.yaml — OPEN (pnpm unavailable in P571 environment; baseline archive has no lockfile)
- [ ] P571-G005 — Resolve and rerun the failing repository static verifiers; retain approved contract changes and evidence — OPEN (P572 corrected six stale historical assertions; current suite is 356/357, with the workspace lockfile gate still failing)
- [ ] P572-G001 — Generate and commit the exact pnpm 9.15.0 lockfile from the complete workspace using registry-resolved package metadata; verify `pnpm install --frozen-lockfile` — OPEN (Corepack registry fetch is blocked in this execution environment; no synthetic lockfile created)
- [ ] P572-G002 — Complete C2-01 workspace audit and CI install verification after lockfile generation, including all 14 workspace package manifests and script targets — OPEN (manifest audit passes; workspace gate remains blocked only by missing lockfile)
- [ ] P572-G007 — Resolve the remaining static verifier blocker and achieve 357/357; retain all 356 passing verifier results and evidence — OPEN (current 356/357; only `verify-c2-01-workspace.mjs` fails because the lockfile is absent)
- [ ] P573-G002 — Complete `pnpm install --frozen-lockfile` for all 14 workspace packages and archive the reproducible install log — OPEN (pnpm is not installed and registry access is unavailable)
- [ ] P573-G007 — Exercise failed-migration recovery/forward-fix procedure and document rollback limitations for already-applied DDL — OPEN (database runtime unavailable)
- [ ] P573-G008 — Add and execute CI migration smoke tests that fail closed on missing lockfile, schema drift and migration artifact gaps — OPEN (workflow execution and dependency/database environment unavailable)
- [ ] P574-G008 — Complete the full repository static verifier suite without timeout and resolve all remaining failures; preserve every historical verifier — OPEN (partial run reached 298 PASS and 3 FAIL before timeout; targeted P501/P502 failures were fixed by restoring missing historical register mirrors; C2-01 lockfile gate remains)
- [ ] P577-G006 — Verify mobile offline queue, reconnect, exactly-once effects, duplicate submission, process restart and stale-version conflict recovery — OPEN (journey contract documented; no API/database runtime)
- [ ] P577-G008 — Add CI browser/device execution with sanitized traces/screenshots, reproducible test data setup/cleanup and complete pass/fail evidence — OPEN (CI workflow and runtime execution deferred until lockfile, browser and device prerequisites are available)
- [ ] P578-G001 — Execute representative API load, stress, burst and soak tests against approved workload profiles and SLOs — OPEN
- [ ] P579-G003 — Complete child safeguarding and accessibility reviews, including manual assistive-technology evidence and approved remediation — OPEN (no safeguarding/accessibility sign-off or device evidence supplied)
- [ ] Eligibility rules catalog, checklist lifecycle, document rejection/re-upload/versioning, scan recovery — OPEN.
- [ ] Scanner/storage/provider/worker deployment configuration and operational acceptance — DEPENDENCY/VERIFICATION.

### Health, wellbeing and medical records (9)

- [ ] P01-G002 — Start PostgreSQL and Redis through Docker Compose and verify health — READY_FOR_VERIFICATION
- [ ] P01-G004 — Run API and smoke-test health and versioned endpoints — READY_FOR_VERIFICATION
| P67-G001 | Cross-layer current/previous key alias test source and UI key-health aggregation tests added; Vitest not executed | READY_FOR_VERIFICATION | Run API and School Admin Vitest suites and retain CI output |
| P105-G014 | Worker health checks only confirm the process exists; queue connectivity, heartbeat and dependency readiness are not checked | OPEN | Add worker-specific readiness/heartbeat probes and alert on stalled queues |
| P105-G015 | Deployment health failure stops rollout but automatic image rollback and migration rollback are not implemented | OPEN | Add staged rollout/rollback strategy, backward-compatible migration policy and tested recovery playbook |
- [ ] P350-G004 — Confirm/implement Health/Wellbeing restricted medical/emergency/incident flow — IN_PROGRESS (P351 source implementation; runtime verification pending)
- [ ] P440-G003 — Validate heartbeat persistence, API health response, and stale-state behavior with live DB/API — OPEN
- **P492-G003 OPEN:** API boot, `/health/live`, and `/health/ready` HTTP acceptance require dependency installation and service startup; not executed here.
- **P507-G003 OPEN:** Run Docker Compose configuration validation and service startup/health checks in an environment with Docker and required secrets; production runtime remains unverified.

### Canteen, meals and nutrition (8)

- [ ] P350-G005 — Confirm/implement Canteen menu/meal/order tracking flow — IN_PROGRESS (P352 source implementation; runtime verification pending)
- **P352-G003 OPEN (Cycle 2):** Stock/ingredient consumption is manual; recipe linking, stock decrement and waste adjustments are not implemented.
- [ ] P545-G001 — Recipe nutrition completeness, multi-ingredient admin composition UX, allergen provenance and serving-scaled nutrition calculations — OPEN
- [ ] P545-G002 — Recipe-to-menu/production linkage, validation of units across ingredients, and recipe runtime/API acceptance — OPEN
- [ ] P546-G002 — Canteen ingredient/stock unit normalization and conversion rules — OPEN. Recipe and linked stock units must match exactly; no conversion system is present.
- [ ] P546-G002 — Canteen ingredient/stock unit normalization and conversion rules — OPEN. Recipe and linked stock units must match exactly; conversion is not implemented.
- [ ] P546-G003 — Automatic production/serving/order integration for recipe consumption and wastage capture — OPEN. Recipe consumption is manually triggered; serving/order production integration and wastage capture remain pending.
- [ ] P551-G003 — Automatic allergen propagation ingredient→recipe→menu and immutable recipe/menu revision snapshots remain OPEN.

### Library and learning resources (13)

| P35-G011 | Keyset pagination is not a snapshot; concurrent inserts/deletes can change page membership | OPEN | define watermark/snapshot semantics and test concurrent list mutations |
| P37-G011 | P35/P36 cursor snapshot semantics, EXPLAIN query plans and k6 evidence remain absent | OPEN | define watermark/snapshot contract, capture query plans and run k6 |
| P61-G002 | Future v2 event schema and provider adapter compatibility are not implemented; unsupported versions correctly reject | OPEN | Define reviewed v2 schema and migration before introducing new event fields/types |
| P63-G004 | Late provider events after a manual release may re-create suppression; policy for event-time versus release-time precedence is not finalized | OPEN | Define event/release precedence and test delayed/out-of-order bounce/complaint events |
| P69-G003 | Lint scripts reference ESLint but no ESLint config or ESLint dependency is defined in workspace manifests | OPEN | Add a reviewed flat ESLint config and dependencies, then run lint across all applicable packages |
| P74-G004 | Offline cache is read-only; offline mutation queue/sync conflict resolution is not implemented | OPEN | Define product scope and conflict-safe sync protocol before adding offline writes |
- [ ] P258-G003 — Advanced configuration lifecycle and policy refinements — OPEN (Cycle 2)
- P265-G003 — Advanced bulk operations and import workflow refinements remain Cycle 2 pending.
- P266-G002 — Dedicated class/section entity management, cross-year rollover tooling, and deep structure refinements remain Cycle 2 pending.
| P329-G002 | Inline preview, robust MIME-specific viewer UX and metadata completeness are not implemented | OPEN | add preview/viewer behavior and runtime UX review as Cycle 2 refinement |
- [ ] P350-G001 — Confirm/implement Library basic catalogue, inventory, issue/return/renew/reserve flow — OPEN (source audit did not identify a dedicated module)
- **P356-G003 OPEN:** Fine policy calculation/settlement, lost/damaged copy lifecycle, copy condition/status management and audit controls.
- [ ] P557-G01 — Separate dual-approval workflow for book/copy write-off — OPEN (write-off currently single library.manage action).

### Transport, drivers and vehicles (15)

- [ ] P03-G013 — Validate Prisma schema/migration and route runtime on clean database — READY_FOR_VERIFICATION
| P51-G002 | Route tests use mocked persistence; PostgreSQL transaction atomicity, concurrent replay and unique-conflict behavior remain unverified | OPEN | Run integration tests against disposable PostgreSQL and verify transaction rollback and concurrent duplicates |
| P64-G001 | Added provider-event/manual-release precedence so delayed events older than a recorded release do not recreate suppression; Vitest/PostgreSQL not run | READY_FOR_VERIFICATION | Run policy and route tests plus PostgreSQL transaction cases for release/event race |
| P71-G001 | PostgreSQL/Redis readiness probes implemented in source; live dependency failure/recovery behavior not run | READY_FOR_VERIFICATION | Execute dependency stop/recovery tests and retain HTTP status/log evidence |
- **P313-G002 PARTIAL** — Section dropdown uses configured section capacity records only; sections without capacity configuration are not selectable by name, while leaving section blank targets all sections.
- **P419-G002 OPEN:** Drag-and-drop rescheduling was not implemented; use the edit form to change dates. Full typecheck/build, Prisma validation/migration, live API/DB/RLS, browser/mobile and E2E acceptance remain pending. P415 CSV runtime smoke blocked by missing TS runtime loader/dependencies.
- **P454-G001 PARTIALLY_IMPLEMENTED:** API route modules are inventoried and classified for review; classification and completeness are static, not handler-level security evidence.
- **P455-G003 OPEN:** Full API typecheck/build and route-level integration/E2E security testing remains pending.
- **P456-G001 OPEN:** Router-local middleware and nested router mount order are not comprehensively traced.
- [ ] P458-G003 — Web HttpOnly cookie/native secure storage transport and client lifecycle validation — OPEN
- **P528-G002 OPEN:** Validate UI can consume server transition metadata and present blockers consistently; existing Admin transition dropdown still uses local transition map.
- [ ] P560-G001 — Capacity enforcement currently uses route allocation count and is not protected by serializable/locking semantics; concurrent allocation race remains OPEN.
- [ ] P560-G003 — Stop-level capacity/vehicle multi-route planning, route optimization and capacity overrides with approval remain OPEN.
- [ ] P562-G004 — GPS streaming throttling, offline queue/retry, map visualization, geofencing and alerts remain OPEN.
- [ ] P563-G003 — Geofence arrival/departure events are not persisted, deduplicated or connected to trip state — OPEN (Haversine helper foundation exists).

### Hostel and residential operations (2)

- [ ] P567-G001 — Run Prisma format/validate/generate and confirm generated-client compatibility for HostelVisitorVisit and HostelGatePass — OPEN
- [ ] P568-G011 — Add dedicated warden mobile workflows; current warden/hostel review is School Admin web only — OPEN

### Mobile apps and offline synchronization (119)

- [ ] P01-G006 — Run Expo apps on simulator/device and verify navigation — READY_FOR_VERIFICATION
- [ ] P01-G011 — Add mobile CI workflows — OPEN
| P16-G001 | Expo SecureStore dependency has not been installed or validated against the Expo SDK/native projects | OPEN | reproducible install, prebuild and iOS/Android build logs |
| P17-G006 | Backend/Expo dependency installation, Prisma validation, typecheck and builds remain pending | OPEN | reproducible install, Prisma, API and Expo CI artifacts |
| P19-G008 | Previous/next day and week date navigation added in P21; week grid, offline cache and device E2E remain | PARTIALLY_IMPLEMENTED | week-grid UX, offline sync and Maestro/Detox evidence |
| P20-G009 | Prisma validation/client generation, migration deployment, Vitest, API integration, Expo build and device E2E remain unexecuted | OPEN | reproducible green CI and environment test reports |
| P21-G002 | CSV import is synchronous and capped at 500 rows | OPEN | queued import, progress, idempotency and retry tests |
| P21-G007 | Prisma validation, migration deployment, Vitest, API integration, browser E2E and device E2E not executed | OPEN | reproducible green CI evidence |
| P22-G007 | Prisma validation, migration execution, full typecheck, Vitest, API/RLS integration, Expo build and device tests remain unexecuted | OPEN | reproducible green CI and environment/device evidence |
| P24-G008 | Browser E2E and accessibility/device acceptance not executed | OPEN | Playwright and mobile acceptance evidence |
| P25-G011 | Prisma validation/client generation, complete typecheck, builds, API tests, Expo builds and device E2E not run | OPEN | CI logs with exact dependency/runtime versions |
| P28-G010 | Prisma validation, migrations, PostgreSQL/RLS, API integration, full typecheck/build, Playwright and device tests remain unexecuted | OPEN | reproducible green CI and runtime acceptance evidence |
| P31-G016 | Typecheck/build, Vitest, API integration, Redis/S3/provider, Expo and Playwright E2E not run | OPEN | reproducible CI with pinned dependencies, service containers, mobile builds and browser/device test evidence |
| P36-G009 | Vitest, full typecheck/build, Playwright, Expo E2E, query plans and k6 not run | OPEN | provide reproducible CI and load-test evidence |
| P38-G010 | Vitest, full typecheck/build, Playwright, Expo E2E, PDF parser and k6 evidence are not run | OPEN | CI evidence for all required suites and representative performance workloads |
| P40-G010 | Vitest, full typecheck/build, Playwright, Expo E2E, external provider contract tests and k6 not run | OPEN | provide complete CI and performance evidence |
| P46-G005 | Prisma, migration, PostgreSQL/RLS, worker, Vitest, browser/mobile and provider sandbox tests not run | OPEN | execute full runtime acceptance and retain evidence |
| P47-G007 | P46/P47 Prisma, PostgreSQL/RLS, API, worker, Vitest, full build, browser/mobile and provider sandbox acceptance not run | OPEN | Execute complete CI and runtime acceptance with disposable services and retain reproducible evidence |
| P48-G005 | Prisma validation, migration apply, PostgreSQL/RLS, worker, Vitest, full builds and browser/mobile E2E not run | OPEN | Execute reproducible CI/runtime acceptance with disposable services and retain logs/artifacts |
| P49-G005 | Full builds, Prisma validation/generation, browser/mobile E2E and k6 acceptance remain unrun | OPEN | Run full CI and runtime acceptance with reproducible artifacts |
| P50-G005 | Full API build, Prisma validation, browser/mobile E2E and k6 acceptance remain unrun | OPEN | Run full CI/runtime acceptance and preserve evidence |
| P74-G001 | SecureStore scoped read-only cache and offline fallbacks added; Expo build/device tests not run | READY_FOR_VERIFICATION | Build and test on supported iOS/Android versions and retain results |
| P78-G002 | Consolidated static gate is not a runtime acceptance suite; dependency install, semantic checks, DB/Redis and E2E are not executed | READY_FOR_VERIFICATION | Run the complete CI/runtime/browser/mobile acceptance sequence and retain evidence |
| P103-G008 | P103 source checks completed; Prisma validation/migration, Expo builds and iOS/Android device acceptance are pending | READY_FOR_VERIFICATION | Run Prisma validate/generate/migrate, Expo builds and device network-loss/account-switch/recovery acceptance |
All unresolved P00–P108 gap IDs remain carried forward. P109 does not close P79-G003 because the web and both mobile clients are not yet fully integrated.
- [ ] P196-G004 — Eligibility rule configuration UI, public-facing error UX, and mobile checklist parity — OPEN.
- [ ] P214-G005 — Builds/typechecks/API/mobile/runtime/local deployment/E2E/security validation — DEFERRED to final validation as requested.
- [ ] P215-G004 — Builds/typechecks/API/mobile/runtime/local deployment/E2E/security validation — DEFERRED to final validation as requested.
- [ ] P217-G004 — Runtime/build/typecheck/database/API/mobile/deployment/E2E/security acceptance remains DEFERRED until final validation phase.
- [ ] P236-G003 — Database/runtime/API/mobile/E2E validation remains deferred.
- [ ] P240-G005 — Full build/typecheck/API/browser/security/mobile/E2E validation deferred.
- [ ] P241-G002 — Build/typecheck/API/browser/security/mobile/E2E validation deferred.
- **P274-G004** — Runtime/build/typecheck/API/browser/mobile/E2E validation remains OPEN and deferred.
- [ ] **P291-G001** — API/mobile runtime, full typecheck/build and device acceptance for readiness refresh/preferences remains OPEN.
- **P312-G002 OPEN** — Dependency-backed build/typecheck, API runtime, browser and mobile validation not executed.
- **P314-G002 OPEN** — Dependency-backed build/typecheck, API runtime, browser/print acceptance and mobile validation not executed.
- [ ] P332-G004 — Device/runtime/build/E2E acceptance and rich checklist builder UX remain OPEN for Cycle 2.
- [ ] P333-G005 — Runtime, full build, database, device and E2E acceptance deferred to Cycle 2.
- [ ] P336-G003 — Runtime database/API, full build/typecheck, browser, device and E2E validation remains deferred to Cycle 2.
- [ ] P339-G005 — Runtime/build/browser/mobile/E2E validation deferred to Cycle 2.
- [ ] **P344-G004 OPEN** — Runtime DB/API, browser print, mobile and E2E acceptance deferred to Cycle 2.
- **P348-G002 OPEN:** Mobile exception monitor is read-only; direct remediation actions/deep links are deferred.
- **P349-G003 OPEN:** API/build/browser/mobile/E2E regression validation and external penetration testing/security review remain outstanding.
- **P352-G005 OPEN (Cycle 2):** Web/mobile builds, device testing, offline behavior, full E2E/regression and security testing remain outstanding.
- **P355-G005 OPEN (Cycle 2):** Full API/mobile build, E2E/regression, security, accessibility and device/OS matrix validation.
- [ ] P358-G008 — Runtime Prisma/API/DB/typecheck/build/E2E/security/device verification — READY_FOR_VERIFICATION
- [ ] P359-G002 — Clean install and dependency-based typecheck/lint/build across API, web and mobile workspaces — READY_FOR_VERIFICATION
- [ ] P359-G006 — Expo bundle/native/device and mobile E2E matrix — READY_FOR_VERIFICATION
- **P359-G006 Expo bundle/native/device verification — OPEN / BLOCKED.**
- **P359-G006 OPEN/BLOCKED:** Expo bundle/native/device validation unavailable without dependencies.
- **P371-G004 OPEN/BLOCKED:** Dependency-based build/typecheck, API/runtime, DB/Redis, mobile and E2E acceptance remains unverified.
- **P374-G005 OPEN/BLOCKED:** Live API/DB integration, build/typecheck, runtime, mobile, and E2E acceptance not yet verified.
- **P375-G001 CLOSED (source slice):** Readiness API checks now expose titles, descriptions, completion, and remediation; School Admin renders server-derived remediation for incomplete items in guided and all-steps views. Verifier 10/10 PASS.
- **P375-G005 OPEN/BLOCKED:** Build/typecheck, live API/database, runtime, mobile and E2E acceptance remains unverified.
- **P376-G001 CLOSED (source slice):** Readiness checks expose server-owned prerequisite metadata and a recommended next incomplete key; School Admin consumes both and retains compatibility fallback. Configure actions remain dependency-gated. Verifier 10/10 PASS.
- **P376-G005 OPEN/BLOCKED:** Build/typecheck, live API/DB, runtime, mobile and E2E acceptance remain unverified.
- **P388-G003 OPEN/BLOCKED:** DB migration/runtime, API build/runtime, and browser/device/E2E acceptance remain unverified.
- **P389-G005 OPEN/BLOCKED:** Prisma/DB/API runtime and browser/device/E2E acceptance remain unverified. F03 is not closed.
- **P390-G003 OPEN/BLOCKED:** API typecheck/build/runtime, Prisma validation/client generation, DB migration/runtime, browser/device and E2E acceptance remain unverified.
- **P392-G001 CLOSED (source slice):** Server readiness exposes per-check `blockedBy`, status (`COMPLETE`/`BLOCKED`/`ACTIONABLE`), actionable boolean, overall workflow state and blocked/actionable counts. Recommended-next-step prioritizes an actionable check. Admin UI now labels blocked and ready-to-configure steps. P392 verifier 11/11 PASS.
- **P394-G004 OPEN/BLOCKED:** TypeScript build, API/DB/browser/mobile/E2E acceptance not run. F03 remains IN_PROGRESS; F04 remains blocked.
- **P396-G004 OPEN/BLOCKED:** Full build/typecheck, API/DB/runtime, browser/mobile and E2E acceptance not run. F03 remains IN_PROGRESS; F04 remains blocked.
- **P397-G005 OPEN/BLOCKED:** Full build/typecheck, API/DB/runtime, browser/mobile/E2E acceptance not run. F03 IN_PROGRESS; F04 not started.
- **P411-G003 OPEN/DEFERRED:** Full build/typecheck, Prisma validation/migration, live API/DB/RLS, browser/mobile and E2E acceptance remain deferred and unverified.
- **P421-G002 OPEN:** Full typecheck/build, Prisma validation/generation/migration, live API/DB/RLS, device runtime and browser/mobile E2E acceptance remain unverified. P415 runtime smoke remains blocked by Node `.ts` loader limitation (static verifier passes).
- **P425-G001 (READY_FOR_VERIFICATION):** Runtime acceptance of due-bucket API and monitoring UI: live DB/API/RLS, date boundary and full build/browser/mobile E2E.
- **P429-G003 OPEN:** Live DB/API/RLS/runtime acceptance, dependency-backed build/typecheck and browser/device E2E.
- **P430-G003 OPEN:** Full dependency-backed build/typecheck, DB migration/runtime, browser/mobile E2E.
- **P431-G004 OPEN:** Full build/typecheck, DB/migration/runtime and browser/mobile E2E.
- [ ] P432-G003 — Prisma validate/generate, full build/typecheck and browser/device E2E acceptance — OPEN
- **P437-G002 OPEN:** Full workspace build/typecheck and browser/mobile E2E.
- [ ] P439-G004 — Full workspace build/typecheck and browser/mobile E2E — OPEN
- [ ] P440-G004 — Full workspace build/typecheck and browser/mobile E2E — OPEN
- **P444-G004 OPEN:** Full workspace build/typecheck and browser/mobile E2E for lifecycle controls.
- **P445-G004 OPEN:** Run full workspace build/typecheck and browser/mobile E2E for SLA/workload controls.
- **P446-G005 OPEN:** Full workspace build/typecheck and browser/mobile E2E for the new alert automation visibility.
- **P447-G004 OPEN:** Full workspace build/typecheck and browser/mobile E2E for alert lifecycle automation.
- **P448-G004 OPEN:** Full workspace build/typecheck and browser/mobile E2E.
- **P449-G004** — Full API build/typecheck and browser/mobile E2E validation.
- **P450-G005 OPEN:** Full workspace build/typecheck and browser/mobile E2E validation.
- **P452-G004 OPEN:** Full typecheck/build and browser/mobile E2E remains pending.
- **P453-G004 OPEN:** Full browser/mobile E2E and school-switch regression validation remain pending.
- **P462-G004 OPEN:** Full API build/typecheck, unit suite, integration suite, web/mobile builds and E2E remain unexecuted in this phase.
- **P466-G004 OPEN:** Build/typecheck, web/mobile builds, E2E, and security penetration validation remain unexecuted.
- **P469-G004 OPEN:** API typecheck/build, web/mobile builds, full E2E, and security validation remain unexecuted.
- **P470-G004 OPEN:** Full API typecheck/build, web/mobile builds, DB-backed integration, E2E, and security acceptance remain unexecuted.
- **P475-G003 — Planner caching/offline acceptance:** Offline mode remains explicit; child-scoped cache and freshness strategy are not implemented. OPEN.
- [ ] P485-G004 — Accessibility, offline cache, retry/reconnect, and screen-reader acceptance remain open.
- **P486-G003 — Answer length enforcement:** Client input now caps answer text at 10,000 characters (matching server validation). Device/input behavior and endpoint acceptance remain OPEN.
- **P492-G004 OPEN:** API and mobile runtime/typecheck/build acceptance remains pending dependency installation (`pnpm` unavailable).
- **P496-G003 OPEN:** Implement mutation queue/replay, idempotency keys, sync conflict resolution and durable write synchronization; P496 is read-cache only and does not queue writes.
- **P496-G004 OPEN:** Verify cache behavior with real device offline/online transitions, account switching/sign-out cache cleanup, storage-pressure, and corruption scenarios.
- **P500-G005 OPEN:** Run mobile device/emulator acceptance, screen-reader accessibility, navigation, deep-link, lifecycle and offline/online tests.
- **P501-G002 OPEN:** Generate and commit `pnpm-lock.yaml` from the complete workspace manifest graph; generation requires registry access and was not completed offline.
- **P501-G004 OPEN:** Execute web/API/mobile build and typecheck checks after dependency installation; P501 does not claim compilation.
- **P502-G003 OPEN:** Run full web, backend/API, and all four Expo mobile app typechecks/builds; only dependency-free targeted source parsing was possible in P502.
- **P503-G004 OPEN:** Complete frontend runtime/device, accessibility, navigation, offline/online, and E2E acceptance after builds become possible.
- **P505-G004 OPEN:** Continue source/config compilation remediation after real Expo/TypeScript builds expose dependency-aware errors; P505 static configuration checks are not build evidence.
- [ ] P506-G001 OPEN — Integrate `@school-saas/api-client` into eligible web/mobile/API consumers with contract validation and runtime evidence.
- [ ] P506-G006 OPEN — Verify shared-package consumer integration in Vite, Node/TypeScript and Expo/Metro runtimes.
- **P508-G007 OPEN:** Complete device/emulator accessibility, navigation, lifecycle, deep-link, offline/online and E2E acceptance.
- **P525-G003 OPEN:** Complete full build/typecheck, browser accessibility, mobile and E2E acceptance.
- **P526-G003 OPEN:** Full API/admin build and typecheck, browser accessibility, mobile, and E2E acceptance.
- **P527-G003 OPEN:** API/public-portal build/typecheck, browser accessibility, mobile compatibility and E2E acceptance.
- **P528-G003 OPEN:** Full API/admin build and typecheck, PostgreSQL fixtures, browser accessibility, mobile and E2E acceptance.
- **P530-G003 OPEN:** Full API/Admin build, typecheck, browser/mobile/accessibility and E2E acceptance remain pending.
- **P532-G003 OPEN:** full API/Admin/mobile build and typecheck, browser accessibility, and end-to-end acceptance remain outstanding.
- **P534-G003 OPEN:** Full API/web build, typecheck, browser/mobile, accessibility and end-to-end acceptance remain pending.
- **P535-G004 OPEN:** Full API/mobile build, database integration, browser/device, accessibility and E2E acceptance remain pending.
- [ ] P547-G004 — Legacy-stock lot backfill, DB foreign-key validation, Prisma validation and live migration/runtime/API/UI/device/E2E acceptance — OPEN.
- [ ] P549-G003 — Runtime acceptance, Prisma validation/generation, migration execution, API/UI builds, mobile/browser/device and E2E validation remain OPEN.
- [ ] P550-G005 — Prisma validation/generation, migration execution, full API/Admin build, browser/mobile/device, accessibility and E2E acceptance remain OPEN.
- [ ] P551-G006 — Prisma validation/generation, migration execution, full build/typecheck, runtime, browser/device, accessibility and E2E acceptance remain OPEN.
- [ ] P559-G005 — Full Prisma validation/generation, DB migration/runtime, dependency-backed build/typecheck, device/browser, accessibility and E2E acceptance — OPEN.
- [ ] P560-G004 — Runtime DB/API, full typecheck/build, browser/mobile, accessibility and E2E verification remain OPEN.
- [ ] P566-G009 — Add browser/device E2E, accessibility, API runtime integration, dependency-backed build/typecheck and full regression acceptance — OPEN
- [ ] P567-G009 — Browser/device E2E, accessibility, concurrent duplicate-pass race tests, load tests and independent security review — OPEN
- [ ] P571-G011 — Complete automated and manual accessibility audits across web and mobile workflows — OPEN (no browser/device audit evidence)
- [ ] P577-G007 — Complete Kannada/English localization, responsive layout and VoiceOver/TalkBack accessibility review across all five mobile apps — OPEN (static source inventory only; no device or assistive-technology evidence)

### Reporting, analytics and exports (5)

| P12-G018 | No TypeScript build, automated tests, API integration or browser E2E executed | OPEN | successful CI run with reports |
| P13-G011 | Prisma/build/unit/API/E2E checks remain unexecuted | OPEN | passing CI reports |
| P104-G006 | Formal PDF/UA validator and manual assistive-technology acceptance not performed | OPEN | Run veraPDF/PAC, screen-reader checks and manual Matterhorn checkpoint review; retain reports |
| P104-G007 | Existing report-card PDF tests still assert PDF 1.3 and reject all RTL; they are stale after P104 | READY_FOR_VERIFICATION | Update existing tests during the later validation phase and verify PDF 1.7 tagged/RTL behavior |
- **P309-G002 OPEN** — Consolidated multi-run audit reports, filters and date-range search remain open.

### Integrations and external providers (36)

- [ ] P01-G012 — Add full API integration tests and isolated DB lifecycle — OPEN
- [ ] P03-G007 — Add encrypted secret settings and external secret manager integration — OPEN
- [ ] P10-G013 — Add API integration, browser E2E, RLS and lifecycle transition tests — OPEN
| P23-G007 | Prisma validation/client generation, migration deployment, PostgreSQL RLS/trigger tests, API integration, full typecheck and browser E2E remain unexecuted | OPEN | reproducible green CI and environment test evidence |
| P23-G010 | P24 adds read-only exact-count alias preview with target validation and UI gating; preview/apply drift and runtime behavior need integration tests | PARTIALLY_IMPLEMENTED | API tests for exact counts, no writes, changed-source behavior and apply revalidation |
| P26-G007 | P26 frontend/API integration has not been run against a live backend or PostgreSQL | OPEN | reproducible API integration and PostgreSQL/RLS test logs |
| P38-G009 | P38 migration has no destructive down migration; Prisma validation, migration execution, RLS/API and storage tests are not run | OPEN | validate migration in disposable DB, backup-preserving rollback plan, reapply and non-owner RLS tests |
| P44-G002 | QR verification limiter now uses Redis atomic counters and fails closed; multi-replica, proxy trust and Redis outage tests not run | READY_FOR_VERIFICATION | execute Redis integration tests behind production-equivalent reverse proxy |
| P45-G004 | P45 HMAC helper tests added but Vitest, Prisma, migration, API and provider sandbox tests not run | OPEN | run full CI and provider contract suite against disposable services |
| P46-G001 | School-scoped HMAC suppression and worker pre-send enforcement are source implemented; Prisma/RLS/worker behavior untested | READY_FOR_VERIFICATION | apply migration and run two-school isolation, worker and duplicate-race integration tests |
| P47-G003 | Concurrent duplicate create and release behavior remains unverified | OPEN | Run concurrent PostgreSQL integration tests and confirm unique active record plus atomic audit history |
| P50-G003 | Provider-native signature adapter and sandbox acceptance remain blocked by provider selection | BLOCKED_EXTERNAL | Select provider and implement its official signature/event adapter and sandbox tests |
| P51-G003 | Provider-native signature/event mapping remains blocked by provider selection | BLOCKED_EXTERNAL | Select provider and implement official adapter plus provider sandbox tests |
| P52-G003 | Provider-native adapter and sandbox event ordering remain blocked by provider selection | BLOCKED_EXTERNAL | Select provider and validate its actual event ordering/signature semantics in sandbox |
| P53-G001 | Provider HTTP retry classifier and immediate permanent-response dead-letter source implemented; Vitest/worker execution not run | READY_FOR_VERIFICATION | Run unit tests and worker tests with mocked provider responses and BullMQ/Redis |
| P53-G002 | Real provider semantics for retryable/permanent HTTP responses remain unverified without a selected provider | BLOCKED_EXTERNAL | Select provider and verify retry/rate-limit/error contract in sandbox |
| P54-G003 | Provider-specific retry policy and dead-letter replay semantics remain unverified pending provider selection | BLOCKED_EXTERNAL | Select provider and validate official idempotency/retry contract before enabling replay |
| P55-G003 | Worker retry/lease/terminal runtime behavior remains untested against Redis/PostgreSQL/provider | OPEN | Execute P53/P54 worker acceptance plans with runtime services |
| P57-G004 | Prisma migration/RLS, provider, worker, RTL/tagged PDF and full system runtime acceptance remain unresolved | OPEN | Carry forward unresolved P00–P56 gaps and require runtime evidence |
| P60-G003 | Redis rate-limit, proxy trust and provider burst behavior remain unverified | OPEN | Execute P59 Redis/proxy acceptance plan |
| P61-G003 | Provider-native mapping and sandbox version negotiation remain blocked by provider selection | BLOCKED_EXTERNAL | Select provider and map provider payloads to canonical v1/v2 contract with sandbox tests |
| P62-G002 | Payload hash conflict policy is byte-exact; provider serialization stability and legitimate re-serialization behavior are unverified | OPEN | Validate selected provider retry payload consistency; consider canonicalized contract hash only with reviewed signature/audit semantics |
| P71-G002 | Graceful HTTP/Prisma/Redis shutdown source added; process signal and in-flight request behavior not tested | READY_FOR_VERIFICATION | Run SIGTERM/SIGINT integration tests under active requests and assert bounded clean exit |
| P75-G002 | Active BullMQ job drain and provider/DB in-flight shutdown behavior not tested | READY_FOR_VERIFICATION | Execute process-level SIGTERM/SIGINT tests with active jobs and assert safe settlement |
- [x] P209-G003 — Provider unconfigured/failure paths return controlled service-unavailable errors and failed challenge is consumed.
- P290-G001 — Provider readiness changes without app refresh and user-visible reactivation flow — OPEN.
- **P290-G001 (PARTIAL)** — Channel readiness refresh is implemented, but provider configuration change/lifecycle runtime validation remains OPEN.
- **P304-G001** — Rollover planner UI/API integration and controlled execution remain OPEN.
- [ ] P458-G001 — Refresh rotation/reuse/concurrent refresh source logic requires runtime integration verification — READY_FOR_VERIFICATION
- **P465-G002 — Real Redis behavior remains unverified:** atomic counter/TTL semantics, Redis outage handling, and rate-limit boundaries require integration testing against the configured Redis service. **Status: OPEN**.
- **P500-G004 OPEN:** Start PostgreSQL, Redis and API; validate live readiness and integration flows.
- **P508-G006 OPEN:** Validate production environment/secrets, Docker Compose deployment, TLS, provider integrations and observability with real environment values (redacted).
- [ ] P571-G006 — Execute API/database integration tests with isolated PostgreSQL lifecycle and representative cross-module journeys — OPEN (no database runtime)
- [ ] P572-G006 — Establish and execute repeatable database-backed API integration tests with isolated setup/teardown — OPEN (no PostgreSQL runtime)
- [ ] API integration, build/typecheck/runtime/E2E/security validation — DEFERRED to final validation per user instruction.
- [ ] API build/runtime/integration/E2E verification remains DEFERRED.

### Database, migrations and data integrity (77)

- [ ] P00-G001 — Detailed ERD constraints and referential integrity review — OPEN
- [ ] P00-G002 — PostgreSQL RLS policy implementation and connection-pool safety verification — OPEN
- [ ] P01-G003 — Run Prisma generate, migrate and seed against a clean database — READY_FOR_VERIFICATION
- [ ] P01-G008 — Add database/Redis readiness probes and graceful shutdown — OPEN
- [ ] P02-G001 — Validate Prisma schema and migration against clean PostgreSQL; resolve any drift — READY_FOR_VERIFICATION
- [ ] P02-G002 — Run pnpm install, generate Prisma client, typecheck and execute unit/API tests — READY_FOR_VERIFICATION
- [ ] P02-G018 — Validate migration SQL, Prisma model defaults and timestamp conventions — READY_FOR_VERIFICATION
- [ ] P03-G008 — Add settings schema validation, versioning, rollback and change approval — OPEN
- [ ] P04-G001 — Apply P04 migration on clean PostgreSQL and validate all Prisma models/migrations — READY_FOR_VERIFICATION
- [ ] P04-G011 — Verify P03 PlatformControlSetting model/migration mapping and preserve P01 settings seed behavior — READY_FOR_VERIFICATION
- [ ] P05-G001 — Validate Prisma schema/migration and run billing migration against clean PostgreSQL — READY_FOR_VERIFICATION
- [ ] P05-G008 — Add platform-admin plan CRUD, versioning and safe plan-change migration — OPEN
- [ ] P05-G012 — Validate seed plan prices and commercial packaging with customer research — OPEN
- [ ] P06-G014 — Ensure plan seed migration updates existing plan JSON without overwriting operator-customized commercial settings — OPEN
- [ ] P09-G001 — Run Prisma format/validate/generate and resolve any schema/client mismatches — READY_FOR_VERIFICATION
- [ ] P09-G017 — Validate capacity constraints (reserved + enrolled <= capacity) and prevent reducing capacity below allocations — OPEN
- [ ] P10-G001 — Run Prisma format/validate/generate and resolve any schema/client mismatches — READY_FOR_VERIFICATION
- [ ] P11-G001 — Run Prisma format/validate/generate and resolve relation/schema mismatches — READY_FOR_VERIFICATION
| P12-G001 | Prisma schema validation and generated-client compatibility not run | OPEN | `prisma validate` and `prisma generate` logs |
| P13-G003 | Correction review claim and partial unique index not race-tested | OPEN | parallel approve/reject and duplicate-request tests |
- [ ] P18-G002 — Apply migration on clean PostgreSQL and verify rollback/recovery procedure.
| P19-G007 | Prisma validation, full TypeScript typecheck and Vitest suite not run | OPEN | reproducible CI logs |
| P25-G002 | P25 recurring slot and date-specific exception overlap triggers added; migration not applied | OPEN | apply migration to disposable PostgreSQL and verify clean rollback/reapply |
| P30-G012 | Prisma validation, migration execution, API/Vitest, full typecheck/build and Playwright remain unexecuted | OPEN | reproducible CI logs with dependencies, PostgreSQL and browser runtime |
| P34-G006 | School Admin operator list APIs were fixed-cap at 100; P35 adds bounded cursor pagination and same-scope anchor checks, but runtime tests remain pending | PARTIALLY_IMPLEMENTED | run API/PostgreSQL tests for first/next page, invalid/foreign/stale cursors and filters |
| P34-G011 | P35 adds cursor pagination and composite indexes; advanced search/date/status filters, query plans and k6 evidence remain absent | PARTIALLY_IMPLEMENTED | add indexed filters and capture EXPLAIN/query-plan and k6 evidence |
| P35-G002 | Composite pagination indexes are in Prisma schema and additive SQL migration; migration and query plans not verified | READY_FOR_VERIFICATION | Prisma validate/generate, apply/rollback/reapply, inspect EXPLAIN plans on representative data |
| P36-G008 | P36 Prisma schema/migration, RLS and API behavior have not been runtime verified | OPEN | Prisma validate/generate, migration apply/rollback, non-owner RLS/API tests |
| P46-G004 | Hash secret rotation requires controlled rehash; no rotation tool exists | OPEN | implement audited key-versioned dual-hash migration/rotation workflow before rotating secret |
| P47-G006 | P46 hash-secret rotation still has no key-versioned dual-hash migration/rotation tool | OPEN | Implement audited dual-hash lookup and rotation, then test worker continuity during key rollover |
| P58-G002 | Concurrent create uniqueness and duplicate re-read behavior remain source-only; no PostgreSQL race tests executed | READY_FOR_VERIFICATION | Run parallel create tests under actual partial unique index across current/previous key lookup |
| P137-G003 | P139 adds dependency-ordered multi-batch execution, per-batch advisory locks, audit progress and retry/resume | PARTIALLY_IMPLEMENTED | Validate concurrent execution, cycles, dependency failure isolation and retry/resume on PostgreSQL |
- [ ] P200-G006 — Worker DB/RLS privilege review, build/typecheck/API/security/runtime acceptance — DEFERRED.
- [x] P222-G002 — Request lifecycle status OPEN/RESPONDED/RESOLVED and resolution timestamp modeled; migration/index added.
- [ ] P258-G002 — Runtime/build/API/browser/database verification of school settings flows — READY_FOR_VERIFICATION
- [ ] P357-G010 — Run Prisma validation/generation/migration, API/runtime, typecheck/build, security and E2E tests — READY_FOR_VERIFICATION
- [ ] P359-G003 — Prisma validate/generate/deploy, PostgreSQL and Redis runtime startup and API smoke acceptance — READY_FOR_VERIFICATION
- **P359-G003 Prisma/database/Redis/API runtime — OPEN / BLOCKED:** not run.
- **P359-G003 OPEN/BLOCKED:** Prisma/DB/Redis/API runtime acceptance remains unverified.
- **P359-G003 OPEN/BLOCKED:** Prisma, PostgreSQL, Redis, and API runtime acceptance remain unverified.
- **P378-G005 OPEN/BLOCKED:** Prisma generation/schema validation, database migration, typecheck/build, runtime, browser and E2E acceptance not run.
- **P379-G002 OPEN/BLOCKED:** Prisma CLI validation/client generation, migration execution, API typecheck/build/runtime and database/E2E acceptance remain unverified because dependency bootstrap is unavailable.
- **P380-G004 OPEN/BLOCKED:** Prisma CLI validation, database migration, API typecheck/build/runtime and browser/E2E acceptance remain unverified.
- **P381-G004 OPEN/BLOCKED:** Prisma CLI validation, DB migration, API typecheck/build/runtime and browser/E2E acceptance remain unverified.
- **P382-G004 OPEN/BLOCKED:** Prisma CLI validation, DB migration, API typecheck/build/runtime and browser/E2E acceptance remain unverified.
- **P384-G004 OPEN/BLOCKED:** Prisma CLI validation, DB migration, API typecheck/build/runtime and browser/E2E acceptance remain unverified.
- **P385-G003 OPEN/BLOCKED:** Prisma validation/client generation, DB migrations, API build/runtime, and browser/E2E acceptance remain unverified.
- **P386-G003 OPEN/BLOCKED:** Prisma validation/client generation, DB migration, API build/runtime, and browser/E2E acceptance remain unverified.
- **P436-G003 OPEN:** Metrics currently derive from database samples; implement worker heartbeat, exact large-volume failure totals and external monitoring/alerting as a future operational phase.
- **P445-G001 OPEN:** Execute the P445 migration against a real PostgreSQL environment and validate query/endpoint behavior.
- **P445-G005 OPEN:** Validate SLA workload queries and concurrent follow-up writes under realistic database contention.
- **P446-G001 OPEN:** Run migration and automated SLA sweeps against live PostgreSQL and verify query/locking behavior.
- **P447-G001 OPEN:** Live PostgreSQL test for transaction rollback, row-lock behavior, and concurrent worker sweeps.
- **P448-G002 OPEN:** Verify policy GET/PUT with live API and database, including malformed payloads, recipient validation, and audit persistence.
- **P449-G002** — Live PostgreSQL validation of policy retrieval, JSON normalization, reminder eligibility, escalation timing, and outbox payloads.
- **P491-G003 OPEN:** Validate workspace startup and runtime configuration against live API, PostgreSQL and Redis services; no services were started or tested in this phase.
- **P492-G001 OPEN:** Live PostgreSQL connectivity and migration deployment were not executed because Docker is unavailable in the current execution environment.
- [ ] P506-G004 OPEN — Integrate `@school-saas/validation` into consumers where validation schemas are duplicated; validate package boundaries and runtime compatibility.
- **P521-G001 OPEN:** Prisma raw aggregation query validation/runtime against a clean PostgreSQL database; verify actual table/column mapping and RLS context.
- **P522-G004 OPEN:** Large-school performance and query-plan/index validation; bounded exception output/UI load behavior.
- **P527-G001 OPEN:** Static contract metadata and schema descriptors require future source-level alignment automation and/or persisted school-specific form configuration; P527 is not a form-builder release.
- **P531-G001 OPEN:** PostgreSQL runtime verification of state-conflict/rejection-note validation, concurrent review attempts, and audit timestamps remains required.
- [ ] P552-G004 — Execute Prisma validation, database migration and runtime/API acceptance — OPEN
- [ ] P554-G007 — Prisma validation/generation, migration execution, full typecheck/build and runtime acceptance — OPEN.
- [ ] P566-G001 — Run Prisma format/validate/generate and verify generated client compatibility for all seven P566 models — OPEN
- [ ] P569-G001 — Run Prisma format/validate/generate and confirm generated-client compatibility for all four P569 models and composite unique keys — OPEN
- [ ] P569-G005 — Run dependency-backed API and School Admin build/typechecks and validate Prisma-generated delegate/selector names — OPEN
- [ ] P570-G001 — Run Prisma format/validate/generate and verify generated-client compatibility for all eight P570 models and relation/composite selector names — OPEN
- [ ] P571-G002 — Run Prisma format, validate and generate against the complete schema; resolve generated-client/type errors — OPEN (Prisma CLI and dependencies unavailable)
- [ ] P572-G003 — Run Prisma format, validate and client generation with the pinned dependencies; resolve all generated-client/schema drift — OPEN (Prisma CLI and dependencies unavailable)
- [ ] P573-G003 — Run Prisma format, validate and client generation against `backend/api/prisma/schema.prisma`; resolve all schema/generated-client issues — OPEN (Prisma CLI and installed workspace dependencies unavailable)
- [ ] P573-G004 — Apply all 158 migrations to a clean PostgreSQL database, run seed and verify schema state — OPEN (PostgreSQL client/server and Docker are unavailable)
- [ ] P573-G006 — Review 20 repeated 14-digit migration timestamp prefixes for dependency-sensitive ordering; rename only through an approved migration-history-safe procedure — OPEN (static inventory found repeated prefixes; no live migration engine available to establish execution safety)
- [ ] P574-G002 — Run Prisma format, validate and client generation with the installed pinned workspace dependencies — OPEN (Prisma CLI and generated client unavailable)
- [ ] P578-G002 — Verify worker drain, timeout, lease expiry, retry, dead-letter replay and idempotency under live Redis/PostgreSQL runtime — OPEN
- [ ] P578-G003 — Execute PostgreSQL/Redis outage, connection exhaustion, dependency timeout and recovery drills — OPEN
- [ ] API build, tests, migration and runtime acceptance — DEFERRED by current instruction.

### Build, dependencies and developer tooling (44)

| P14-G001 | School Admin UI has not been built or browser-tested with installed dependencies | OPEN | successful typecheck/build and Playwright run |
| P23-G006 | Alias normalization helper unit test source added but Vitest has not been executed | OPEN | install dependencies and execute tests in CI |
| P48-G003 | Arabic RTL shaping and tagged/accessibility PDF stack remains unselected; no PDF changes made without an evaluated maintained dependency | OPEN | Select maintained shaping/tagging libraries and verify Arabic joining, mixed RTL/LTR, extraction, reading order and visual regression |
| P71-G004 | Dependency install/typecheck/build/Vitest remain blocked by P69 workspace prerequisites | OPEN | Close P69-G001/G003 and run all CI gates |
| P76-G002 | Arabic/Hebrew bidi shaping and mixed-direction layout remain unsupported | OPEN | Implement tested shaping/bidi pipeline and verify all supported mixed-script cases |
- P181-G003 — Runtime custom-domain validation, build and deployment acceptance remain OPEN.
- [ ] P196-G005 — Build/typecheck/API/E2E/runtime acceptance — DEFERRED.
- [ ] P198-G005 — Build/typecheck/API/E2E/runtime acceptance — DEFERRED.
- [ ] P201-G004 — Build/typecheck/API/E2E/security/runtime acceptance — DEFERRED.
- [ ] P202-G005 — Build/typecheck/API/E2E/security/runtime acceptance — DEFERRED.
- [ ] P205-G004 — Build/typecheck/API/E2E/security/runtime acceptance — DEFERRED.
- [ ] P206-G005 — Build/typecheck/API/E2E/security/runtime acceptance — DEFERRED.
- [ ] P207-G003 — Build/typecheck/security tests and runtime acceptance — DEFERRED.
- [ ] P208-G004 — Build/typecheck/API/security/runtime acceptance — DEFERRED.
- [ ] P210-G006 — Full install/build/typecheck/API/E2E/runtime acceptance — DEFERRED.
- [ ] P238-G004 — Build/typecheck/browser/API/security/E2E verification deferred.
- [ ] P239-G003 — UI runtime/build/API/browser/security/E2E verification deferred.
- **P315-G002 OPEN** — Dependency-backed TypeScript/Vite build and typecheck not executed because workspace dependencies are unavailable in this extracted release.
- [ ] P334-G003 — Full runtime, browser, typecheck/build and E2E acceptance deferred to Cycle 2.
- **P359-G002 dependency-based typecheck/lint/build — OPEN / BLOCKED:** requires installed dependencies.
- **P360-G001 workspace package manifest integrity — CLOSED:** 13 manifests audited; unique names, dependency version declarations, workspace references and script targets passed with 0 errors.
- **P359-G002 OPEN/BLOCKED:** Dependency-based typecheck, lint, builds remain unverified.
- **P364-G001 CLOSED:** Added safe dependency-free bootstrap diagnostics and contract verifier; the C2-01 source gate now includes it (7/7 checks pass).
- **P365-G001 CLOSED:** Node 22 and pnpm 9.15.0 container/root runtime contract audit added (8/8 checks).
- **P366-G001 CLOSED:** Final stabilization closure contract verifier added; confirms source gate, CI install/build contracts, blocker transparency, and C2-02 boundary.
- **P366-G002 CLOSED:** Verifier self-contract added and integrated into the dependency-free CI source gate.
- **P359-G002 OPEN/BLOCKED:** Typecheck/lint/build remain unverified until dependencies can be installed.
- **P359-G005 PARTIAL:** Source-only CI is contract-verified; frozen install and build jobs are not locally executable.
- **P368-G002 CLOSED:** Self-contract verifier added and integrated into dependency-free source gate.
- **P376-G003 OPEN:** Backend enforced configuration prerequisites and full dependency-ordered setup writes.
- **P492-G002 OPEN:** Live Redis connectivity and queue-dependent service acceptance were not executed because Docker is unavailable.
- **P502-G004 OPEN:** Continue compile remediation for additional TypeScript type/module errors surfaced after dependencies are installed; no full typecheck or build pass is claimed.
- **P503-G002 OPEN:** Complete frozen dependency installation after P503-G001.
- **P504-G002 OPEN:** Complete frozen dependency installation and reproducibility checks after P504-G001.
- **P504-G003 OPEN:** Run backend API TypeScript typecheck, lint, build and Vitest suite against installed dependencies. P504 parser checks are source diagnostics only.
- **P504-G005 OPEN:** Continue remediation for additional compiler/type/module issues that are only surfaced by full dependency-aware checks.
- [ ] P506-G003 OPEN — Establish real source-level usage for `@school-saas/shared-types`; current backend dependency declaration exists but no source import was found in the audited source tree.
- **P507-G005 OPEN:** Complete environment-specific builds and runtime acceptance after dependency bootstrap; P507 static configuration checks are not build evidence.
- **P508-G002 OPEN:** Run clean frozen install and reproducibility checks after P508-G001.
- **P508-G004 OPEN:** Integrate the four shared packages into real consumers with package-boundary and runtime evidence; P506 found no source consumers.
- **P517-G002 OPEN:** Installment-level aging is not yet computed; current aging is charge-level using charge due date. Implement installment-aware aggregation and balance allocation.
- **P522-G005 OPEN:** Full TypeScript build, browser acceptance, accessibility and E2E validation. Source verifier/parser checks are not runtime acceptance.
- [ ] P567-G005 — Run dependency-backed API and School Admin builds/typechecks — OPEN
- [ ] Runtime/build/API acceptance — DEFERRED.

### Security, audit and compliance (13)

- [ ] P00-G016 — Break-glass support access with approval and audit controls — OPEN
- [ ] P01-G009 — Add rate limiting and production proxy/CORS configuration — OPEN
- [ ] P02-G016 — Review JWT key management, rotation, revocation strategy and production secrets — OPEN
| P48-G001 | Versioned current/previous HMAC lookup and current-key writes are source implemented; key rollover continuity and retirement conditions are not runtime verified | READY_FOR_VERIFICATION | Run two-key API/worker tests across v1→v2, prove legacy rows remain suppressed, remove previous key only after no active rows reference it, and retain audit/change evidence |
| P76-G003 | Tagged PDF/UA semantics and screen-reader reading order are not implemented | OPEN | Implement tagged structure and complete PDF accessibility audit with assistive technology |
| P108-G001 | Final acceptance gate remains blocked by unresolved implementation/verification gaps and external decisions; static audit is not runtime acceptance | OPEN | Complete every remaining gap with reproducible evidence; obtain signed owner/decision/evidence/release disposition for each external blocker; complete required runtime, security, accessibility, operational and release approvals |
- [x] P201-G002 — Public rate limit returns HTTP 429 with `Retry-After` on threshold and fails closed with 503 on Redis outage.
- **P363-G002 CLOSED:** Added `verify:c2-01:workflow` and integrated CI workflow contract audit into the C2-01 source gate.
- **P365-G002 CLOSED:** Audit verifier and its contract test integrated into source-only CI gate (9/9 checks pass).
- **P367-G002 CLOSED:** Added C2-02 audit self-contract and integrated into source-only CI gate.
- **P449-G005** — Runtime verification of policy update audit/version consistency and malformed-policy fallback.
- **P498-G004 OPEN:** Complete end-to-end journey and negative security testing; no full E2E run is claimed by P498.
- **P507-G002 OPEN:** Execute the production environment checker against a secure, populated `.env.prod`, secrets directory, TLS certificates, and actual deployment values; P507 only verified the checker/config contracts statically.

### Testing, acceptance and quality assurance (43)

- [ ] P00-G015 — Scale model and load-test targets — OPEN
- [ ] P01-G007 — Execute GitHub Actions CI and retain evidence — READY_FOR_VERIFICATION
| P17-G003 | Maximum 100 school memberships with no pagination | OPEN | cursor pagination and large-membership tests |
| P32-G002 | Pagination uses deterministic markedAt/id order but is not a snapshot; concurrent corrections can change page membership | OPEN | decide snapshot/watermark semantics and test correction races across pages |
| P40-G002 | P41 adds embedded Noto fonts for Latin/major Indian scripts, QR code and random-code verification endpoint; RTL shaping, logo, tagged accessibility and visual validation remain open | PARTIALLY_IMPLEMENTED | validate complex scripts, implement RTL/logo and accessible PDF tests |
| P41-G001 | PDFKit embeds Noto fonts for Latin and major Indian scripts and generates a QR symbol; complex-script shaping/Arabic RTL and visual regression have not been runtime verified | PARTIALLY_IMPLEMENTED | render representative Kannada, Devanagari, Bengali, Gujarati, Gurmukhi, Tamil, Telugu, Malayalam and Arabic samples; verify shaping, extraction and pagination |
| P43-G004 | Arabic RTL shaping, complex-script visual regression and tagged/accessibility PDF remain incomplete | OPEN | add shaping engine and tagged accessible PDF with script-specific visual/extraction tests |
| P44-G003 | Arabic RTL shaping and tagged/accessibility PDF remain absent | OPEN | select and validate shaping/accessibility stack with visual and extraction regression |
| P45-G005 | Arabic RTL shaping, tagged/accessibility PDF and visual regression remain absent | OPEN | implement shaping/accessibility and script-specific PDF visual/extraction acceptance |
| P47-G004 | Arabic RTL shaping and tagged/accessibility PDF remain incomplete; P47 did not add a verified shaping engine | OPEN | Select a maintained bidi/shaping and tagged-PDF stack; verify Arabic joining, mixed RTL/LTR, extraction, reading order and visual regression |
| P54-G001 | Centralized worker terminal-state and lease-claim helpers with unit test source; Vitest not run | READY_FOR_VERIFICATION | Run lease helper and worker Vitest suites |
| P60-G002 | Global body parser 1 MB behavior and reverse-proxy request-size limits not verified in deployment | OPEN | Run API ingress tests and configure matching reverse-proxy limits/timeouts |
| P71-G003 | Dedicated worker shutdown was not consolidated across worker processes; P75 now adds a shared drain helper, but process-level acceptance remains pending | READY_FOR_VERIFICATION | Run P75 worker shutdown tests with active jobs, SIGTERM/SIGINT and Redis fault injection |
| P75-G001 | Shared idempotent worker drain helper applied to three workers; Vitest not executed | READY_FOR_VERIFICATION | Run unit tests and retain CI output |
| P75-G004 | Redis outage and stalled worker shutdown behavior remains unverified | OPEN | Run Redis fault-injection tests and confirm no unsafe job acknowledgement or DB disconnect |
| P76-G004 | PDF extraction and cross-viewer visual validation remain unexecuted | READY_FOR_VERIFICATION | Run text extraction, visual regression and supported PDF viewer tests for each bundled Indic script |
| P78-G001 | P69–P77 remediation source is delivered, but the full School SaaS product remains materially incomplete across carried-forward modules | OPEN | Complete all carried-forward P00–P77 implementation gaps and obtain module-owner acceptance |
| P104-G002 | Arabic/Hebrew bidi shaping and logical ActualText added using DejaVu Sans; rendering/extraction not validated | READY_FOR_VERIFICATION | Validate Arabic/Hebrew, mixed Latin/RTL, niqqud/diacritics, copy/paste and screen-reader output |
- P175-G002 — Age range in months with cutoff date validation on submission for `ANY` rule implemented. Status: READY_FOR_VERIFICATION.
- P175-G004 — School Admin web rule configuration/list UI implemented. Status: READY_FOR_VERIFICATION.
- P178-G003 — Public tracking UI integrated with tracking endpoint. Status: READY_FOR_VERIFICATION.
- P180-G003 — Configured min/max age checks with cutoff date enforced during public submission. Status: READY_FOR_VERIFICATION.
- P180-G004 — Status transition to SUBMITTED and stage history recorded. Status: READY_FOR_VERIFICATION.
- [x] P203-G003 — Verification endpoint enforces max 5 attempts via conditional atomic increment and one-time verified/consumed state.
- [ ] P204-G004 — Persisted verified-contact status display on portal refresh and school verification policy UI/API — OPEN.
- [x] P208-G002 — Malformed persisted digests fail closed; helper unit tests cover equal, mismatch, malformed, and wrong-length hashes.
- [x] P210-G004 — School Admin phone verification policy removed from UI and API forces legacy phone requirement false. (source implemented; static check)
- **P290-G001 (PARTIAL)** — Foreground refresh implemented; config-change lifecycle readiness and runtime acceptance remain OPEN.
- **P312-G001 PARTIAL** — Draft edit form currently does not pre-populate effective dates; runtime acceptance remains pending.
- **P321-G003 — OPEN:** Publishing can occur without complete roster coverage; enforce policy and test in a later phase.
- **P348-G003 OPEN:** Runtime cross-school isolation and full E2E/regression validation remain deferred.
- **P359-G007 OPEN:** Production environment and deployment acceptance remain pending.
- **P366-G003 ACCEPTANCE BLOCKER:** C2-01 source stabilization scope is complete to the extent possible without registry access; environment-dependent acceptance remains OPEN. Per user direction, C2-02 may begin next, but C2-01 acceptance risks must remain tracked and must not be represented as closed.
- **P435-G002 OPEN:** Runtime test cancel/retry status transitions, concurrent worker claims, stale processing recovery and three-attempt ceiling.
- **P435-G004 OPEN:** Consider dedicated `CANCELLED` status instead of `EXPIRED` + cancellation code; verify API clients tolerate status semantics.
- **P437-G003 OPEN:** Multi-school fairness remains global FIFO; evaluate round-robin fairness and worker scaling.
- [ ] P439-G001 — Run live DB race/load tests to prove concurrent conditional claims prevent duplicate processing across worker instances — OPEN
- **P446-G004:** Source-level configurable reminder window and escalation level implemented in P447; deployment/runtime validation remains tracked under P447-G002.
- **P449-G003** — Multi-worker contention tests for severity-specific alert claims and idempotency.
- **P456-G002 OPEN:** Validate Express runtime registration and effective middleware behavior; static source order is not runtime proof.
- **P477-G002 — Financial summary calculation resilience:** Invalid/negative numbers are normalized; paid totals are capped at billed totals; outstanding is never negative. Static source verifier PASS. Runtime data edge validation OPEN.
- [ ] P506-G002 OPEN — Integrate `@school-saas/domain-rules` into consumers where domain invariants are duplicated; confirm ownership and tests.
- **P524-G002 OPEN:** Runtime validation for null settlement dates and source/posting date differences remains required.

### Operations, observability and disaster recovery (17)

- [ ] P00-G014 — Backup, disaster recovery, RPO and RTO validation — OPEN
- [ ] P01-G010 — Add metrics, tracing and structured operational observability — OPEN
- [x] P200-G002 — Deterministic batch/outbox IDs and skip-duplicate insertion make recovery idempotent.
- [x] P236-G002 — Capacity conflicts return a meaningful HTTP 409 response; unconfigured sections preserve legacy behavior.
- **P311-G001 PARTIAL** — CSV import does not yet support rollback/transactional batch semantics; successful rows remain committed when later rows fail.
- **P311-G002 PARTIAL** — Bulk selection is limited to currently loaded filtered page; bulk lifecycle/status actions and server-side selection are not implemented.
- [x] P340-G002 — Section-level capacity, utilization percentage, and OPEN/FULL/OVER CAPACITY status table with utilization sorting. SOURCE_IMPLEMENTED.
- [x] P340-G003 — Over-capacity warning summarizes excess enrolled+reserved seats; zero-capacity/empty-year safe handling. SOURCE_IMPLEMENTED.
- **P359-G007 OPEN:** Production environment and deployment validation not performed.
- **P437-G004 OPEN:** Validate caps against real workload and query performance; DB-level atomic enforcement is not implemented.
- [ ] P439-G002 — Validate worker throughput, failure isolation, and backpressure under representative load — OPEN
- **P446-G006:** Atomic marker-plus-outbox source implementation delivered in P447; live transaction/rollback validation remains tracked under P447-G001.
- **P465-G003 — Distributed proxy/IP behavior remains unverified:** client IP trust/proxy configuration and limiter behavior across API replicas require deployment-level validation. **Status: OPEN**.
- [ ] P552-G003 — Support CSV/XLSX import, deduplication/grouping by ISBN, and import preview/rollback — OPEN
- [ ] P578-G004 — Execute encrypted backup, isolated restore and point-in-time recovery; measure approved RPO/RTO — OPEN
- [ ] P578-G008 — Obtain approved workload envelope, capacity recommendations, recovery evidence and independent operations review — OPEN
- [ ] P579-G007 — Execute and evidence production-like deployment, rollback and data-compatible recovery rehearsal with approved change window — OPEN (no deployment target or rehearsal evidence supplied)

### Cross-cutting / needs manual classification (50)

- [ ] P00-G018 — Pricing and willingness-to-pay validation — OPEN
- [ ] P10-G006 — Implement employment history update API, contract lifecycle, rehire approval and separation checklist — OPEN
| P77-G002 | Metrics are in-memory per process and are not aggregated across replicas | OPEN | Deploy central metrics backend and configure replica-aware scraping/aggregation |
- P180-G005 — Schools without configured eligibility rules currently fall through to unrestricted submission; policy decision and default-block option remain OPEN.
- [x] P188-G001 — Dedicated background worker performs initial and periodic expiry sweeps (default 60s; configurable interval).
- [x] P188-G002 — Conditional ACTIVE + due-expiry claim in transaction prevents duplicate release across concurrent worker instances.
- [x] P192-G002 — Existing GET/PUT settings retain school/user scoping and deterministic upsert behavior.
- [x] P195-G002 — Existing ambiguous-match 409 conflict/manual resolution guard retained; no automatic merge introduced.
- [x] P196-G003 — Existing configured age and CLEAN+VERIFIED checklist checks retained.
- [x] P203-G002 — Challenge target and code are hashed; challenge expires after 10 minutes; resend cooldown is 60 seconds.
- [x] P204-G003 — Added resend cooldown UI and six-digit code input validation.
- [x] P207-G002 — Maintained six-digit zero-padding and cryptographic challenge IDs.
- [x] P214-G003 — Filtered/total counts and no-match state shown.
- [x] P215-G002 — Queue cards clear text search and apply the matching status filter for focused review.
- [x] P220-G001 — APPROVED transition requires a structured DECISION note recommending APPROVE; REJECT transition requires a structured DECISION note recommending REJECT. Missing match returns 409 and blocks the transition.
- [x] P224-G002 — Follow-up linkage is stored on review notes, returned by the existing scoped review-note API, and displayed in School Admin details.
- [x] P227-G002 — Replacement ancestry is used to label version numbers; events are chronologically sorted.
- [x] P238-G002 — UI status-change control is connected to the P237 guarded endpoint and refreshes history after success; errors are surfaced.
- [ ] **P282-G001** — School announcement paging/deep links and rich attachment handling. **OPEN**.
- [ ] **P285-G004** — Duplicate-submit idempotency and unread-thread counters. **OPEN**.
### P285-G003 follow-up closure (P286)
- [ ] **P290-G001 (PARTIAL)** — Manual refresh/reactivation delivered; automatic app lifecycle/config-change refresh remains OPEN.
- **P305-G001** — Full-directory/server-side roster lookup and preview remain OPEN.
- **P307-G002 OPEN** — Full-directory/server-side roster lookup and large roster execution remain open.
- **P321-G002 — OPEN:** Explicit clear/delete of a previously saved mark is unsupported by the current API.
- [ ] P327-G003 — Late-submission policy enforcement and UX validation — OPEN
- **P347-G002 OPEN:** Exception remediation actions and direct links into the relevant workflow are deferred; this phase surfaces the signal only.
- [ ] P357-G005 — Allocation lifecycle edit/terminate and roster validation — OPEN
- [x] P359-G004 — Triage and repair remaining legacy static verifier failures — CLOSED (all 143 non-C2 workspace verifiers pass under Node 22 type-stripping runner)
- **P359-G005 CI reproducibility — OPEN.**
- **P359-G007 production environment checks — OPEN.**
- **P371-G001 CLOSED (source slice):** Sequential guided checklist navigation with accessible step labels, current-step semantics, boundary-safe previous/next controls and all-steps list implemented. Completion remains derived from existing school-scoped APIs; navigation does not mark steps complete. Verifier 13/13 PASS.
- **P373-G002 OPEN:** Server-side progress/checklist ownership and multi-user resumption remain unimplemented.
- **P374-G002 OPEN:** Server-persisted progress, checklist ownership, and multi-user resumption.
- **P377-G003 CLOSED:** Admin wizard fetches and saves server progress; browser-local progress remains as fallback.
- **P402-G001 CLOSED (source slice):** Added reusable draft creation, inherited-scope toggles, whole-scope override set/remove, nested override path editing and summary helpers with defensive cloning and unsafe-path rejection. P402 source verifier 16/16 PASS.
- **P425-G004 (OPEN):** Server-side aggregate counts and pagination beyond current 500 coordinator-task retrieval cap.
- [ ] P428-G002 — Coordinator-facing UI for school reminder defaults and frequency controls — OPEN
- [ ] P438-G001 — Fairness cursor is process-local; persist scheduling state for multi-instance/restart-safe fairness — OPEN
- [ ] P439-G003 — Persist fairness cursor or otherwise prove restart-safe/multi-instance fairness — OPEN
- **P446-G003 OPEN:** Validate multiple worker instances, timer drift/restarts, and race conditions in a live environment.
- **P446-G004 OPEN:** Replace fixed 60-minute reminder and current critical escalation behavior with configurable SLA policies if product requirements demand policy-level customization.
- **P448-G001 OPEN:** Connect persisted severity policy to automated SLA reminder/escalation worker execution; policy currently configures/stores but does not affect worker routing.
- **P452-G002 OPEN:** Client validation for category grouping and cross-page UX.
- **P470-G002 OPEN:** Cross-module error contract consistency and protected endpoint denial responses remain only partially covered.
- [ ] P472-G004 — Validate real Redis rate-limit counters, TTLs, outage behavior, and proxy/IP handling — OPEN
- **P524-G002 OPEN:** Confirm date-window behavior for lifecycle records with null `settledAt` and differing source/posting dates.
- [ ] P548-G001 — Separate actual-produced quantity entry from planned quantity; currently batch start uses planned quantity as produced quantity — OPEN.
- [ ] P554-G004 — Configurable queue priority beyond FIFO — OPEN.
- [ ] P557-G02 — Replacement accession automatically linked to lost/damaged original copy — OPEN (replacement copy uses existing accession process).

### Documentation and Docker follow-up gaps — P580 (8)

- [ ] P580-G001 — Reconcile the consolidated feature catalogue against every current app/API/worker source area and obtain domain-owner confirmation — OPEN
- [ ] P580-G002 — Semantically deduplicate the missed-functionality backlog and assign owners, priority and acceptance criteria — OPEN
- [ ] P580-G003 — Execute Docker Compose config/build/up and retain service health/log evidence on a supported host — OPEN
- [ ] P580-G004 — Complete clean pnpm dependency install and Prisma Client generation inside the Docker image using a reproducible committed lockfile — OPEN
- [ ] P580-G005 — Execute clean and upgrade PostgreSQL migrations in Docker; verify schema, seed and rollback/restore — OPEN
- [ ] P580-G006 — Validate API liveness/readiness and all four web apps through the local Docker network and browser — OPEN
- [ ] P580-G007 — Validate Expo Metro container networking and real iOS/Android device connectivity for all five mobile apps — OPEN
- [ ] P580-G008 — Complete production Docker image build, secrets, TLS, reverse proxy, worker, monitoring and rollback acceptance — OPEN

## Historical phase index (IDs and states only)

This index preserves the original phase titles and phase-oriented lookup for historical scripts without repeating full gap descriptions. Full gap descriptions appear only once in the functional categories above.

## P00 carried-forward gaps

- P00-G001 OPEN — see functional category above
- P00-G002 OPEN — see functional category above
- P00-G003 OPEN — see functional category above
- P00-G004 OPEN — see functional category above
- P00-G005 OPEN — see functional category above
- P00-G006 OPEN — see functional category above
- P00-G007 OPEN — see functional category above
- P00-G008 OPEN — see functional category above
- P00-G009 OPEN — see functional category above
- P00-G010 OPEN — see functional category above
- P00-G011 OPEN — see functional category above
- P00-G012 OPEN — see functional category above
- P00-G013 OPEN — see functional category above
- P00-G014 OPEN — see functional category above
- P00-G015 OPEN — see functional category above
- P00-G016 OPEN — see functional category above
- P00-G017 OPEN — see functional category above
- P00-G018 OPEN — see functional category above
- P00-G019 OPEN — see functional category above
- P00-G020 OPEN — see functional category above

## P01 gaps carried-forward

- P01-G001 READY_FOR_VERIFICATION — see functional category above
- P01-G002 READY_FOR_VERIFICATION — see functional category above
- P01-G003 READY_FOR_VERIFICATION — see functional category above
- P01-G004 READY_FOR_VERIFICATION — see functional category above
- P01-G005 READY_FOR_VERIFICATION — see functional category above
- P01-G006 READY_FOR_VERIFICATION — see functional category above
- P01-G007 READY_FOR_VERIFICATION — see functional category above
- P01-G008 OPEN — see functional category above
- P01-G009 OPEN — see functional category above
- P01-G010 OPEN — see functional category above
- P01-G011 OPEN — see functional category above
- P01-G012 OPEN — see functional category above
- P01-G013 OPEN — see functional category above
- P01-G014 OPEN — see functional category above

## P02 gaps

- P02-G001 READY_FOR_VERIFICATION — see functional category above
- P02-G002 READY_FOR_VERIFICATION — see functional category above
- P02-G003 OPEN — see functional category above
- P02-G004 OPEN — see functional category above
- P02-G005 OPEN — see functional category above
- P02-G006 OPEN — see functional category above
- P02-G007 IN_PROGRESS — see functional category above
- P02-G008 OPEN — see functional category above
- P02-G009 OPEN — see functional category above
- P02-G010 OPEN — see functional category above
- P02-G011 OPEN — see functional category above
- P02-G012 OPEN — see functional category above
- P02-G013 OPEN — see functional category above
- P02-G014 OPEN — see functional category above
- P02-G015 OPEN — see functional category above
- P02-G016 OPEN — see functional category above
- P02-G017 READY_FOR_VERIFICATION — see functional category above
- P02-G018 READY_FOR_VERIFICATION — see functional category above

## P03 gaps

- P03-G001 IN_PROGRESS — see functional category above
- P03-G002 OPEN — see functional category above
- P03-G003 OPEN — see functional category above
- P03-G004 OPEN — see functional category above
- P03-G005 OPEN — see functional category above
- P03-G006 OPEN — see functional category above
- P03-G007 OPEN — see functional category above
- P03-G008 OPEN — see functional category above
- P03-G009 OPEN — see functional category above
- P03-G010 OPEN — see functional category above
- P03-G011 OPEN — see functional category above
- P03-G012 READY_FOR_VERIFICATION — see functional category above
- P03-G013 READY_FOR_VERIFICATION — see functional category above

## P04 gaps

- P04-G001 READY_FOR_VERIFICATION — see functional category above
- P04-G002 READY_FOR_VERIFICATION — see functional category above
- P04-G003 OPEN — see functional category above
- P04-G004 OPEN — see functional category above
- P04-G005 OPEN — see functional category above
- P04-G006 OPEN — see functional category above
- P04-G007 OPEN — see functional category above
- P04-G008 OPEN — see functional category above
- P04-G009 OPEN — see functional category above
- P04-G010 OPEN — see functional category above
- P04-G011 READY_FOR_VERIFICATION — see functional category above
- P04-G012 OPEN — see functional category above

## P05 gaps

- P05-G001 READY_FOR_VERIFICATION — see functional category above
- P05-G002 OPEN — see functional category above
- P05-G003 OPEN — see functional category above
- P05-G004 OPEN — see functional category above
- P05-G005 OPEN — see functional category above
- P05-G006 OPEN — see functional category above
- P05-G007 OPEN — see functional category above
- P05-G008 OPEN — see functional category above
- P05-G009 OPEN — see functional category above
- P05-G010 OPEN — see functional category above
- P05-G011 OPEN — see functional category above
- P05-G012 OPEN — see functional category above
- P05-G013 OPEN — see functional category above
- P05-G014 READY_FOR_VERIFICATION — see functional category above
- P05-G015 OPEN — see functional category above

## P06 gaps

- P06-G001 READY_FOR_VERIFICATION — see functional category above
- P06-G002 READY_FOR_VERIFICATION — see functional category above
- P06-G003 OPEN — see functional category above
- P06-G004 OPEN — see functional category above
- P06-G005 OPEN — see functional category above
- P06-G006 OPEN — see functional category above
- P06-G007 OPEN — see functional category above
- P06-G008 OPEN — see functional category above
- P06-G009 OPEN — see functional category above
- P06-G010 OPEN — see functional category above
- P06-G011 OPEN — see functional category above
- P06-G012 OPEN — see functional category above
- P06-G013 OPEN — see functional category above
- P06-G014 OPEN — see functional category above

## P07 gaps

- P07-G001 READY_FOR_VERIFICATION — see functional category above
- P07-G002 READY_FOR_VERIFICATION — see functional category above
- P07-G003 READY_FOR_VERIFICATION — see functional category above
- P07-G004 OPEN — see functional category above
- P07-G005 OPEN — see functional category above
- P07-G006 OPEN — see functional category above
- P07-G007 OPEN — see functional category above
- P07-G008 OPEN — see functional category above
- P07-G009 OPEN — see functional category above
- P07-G010 OPEN — see functional category above
- P07-G011 OPEN — see functional category above
- P07-G012 OPEN — see functional category above
- P07-G013 OPEN — see functional category above

## P08 gaps

- P08-G001 READY_FOR_VERIFICATION — see functional category above
- P08-G002 READY_FOR_VERIFICATION — see functional category above
- P08-G003 OPEN — see functional category above
- P08-G004 OPEN — see functional category above
- P08-G005 OPEN — see functional category above
- P08-G006 OPEN — see functional category above
- P08-G007 OPEN — see functional category above
- P08-G008 OPEN — see functional category above
- P08-G009 OPEN — see functional category above
- P08-G010 OPEN — see functional category above
- P08-G011 OPEN — see functional category above
- P08-G012 OPEN — see functional category above
- P08-G013 OPEN — see functional category above
- P08-G014 OPEN — see functional category above
- P08-G015 OPEN — see functional category above
- P08-G010 TRACKED — see functional category above

## P09 gaps

- P09-G001 READY_FOR_VERIFICATION — see functional category above
- P09-G002 READY_FOR_VERIFICATION — see functional category above
- P09-G003 READY_FOR_VERIFICATION — see functional category above
- P09-G004 OPEN — see functional category above
- P09-G005 OPEN — see functional category above
- P09-G006 OPEN — see functional category above
- P09-G007 OPEN — see functional category above
- P09-G008 OPEN — see functional category above
- P09-G009 OPEN — see functional category above
- P09-G010 OPEN — see functional category above
- P09-G011 OPEN — see functional category above
- P09-G012 OPEN — see functional category above
- P09-G013 OPEN — see functional category above
- P09-G014 OPEN — see functional category above
- P09-G015 OPEN — see functional category above
- P09-G016 OPEN — see functional category above
- P09-G017 OPEN — see functional category above
- P09-G018 OPEN — see functional category above

## P10 gaps

- P10-G001 READY_FOR_VERIFICATION — see functional category above
- P10-G002 READY_FOR_VERIFICATION — see functional category above
- P10-G003 READY_FOR_VERIFICATION — see functional category above
- P10-G004 OPEN — see functional category above
- P10-G005 OPEN — see functional category above
- P10-G006 OPEN — see functional category above
- P10-G007 OPEN — see functional category above
- P10-G008 OPEN — see functional category above
- P10-G009 OPEN — see functional category above
- P10-G010 OPEN — see functional category above
- P10-G011 OPEN — see functional category above
- P10-G012 OPEN — see functional category above
- P10-G013 OPEN — see functional category above
- P10-G014 OPEN — see functional category above
- P10-G015 OPEN — see functional category above
- P10-G016 OPEN — see functional category above
- P10-G017 OPEN — see functional category above
- P10-G018 OPEN — see functional category above

## P11 gaps

- P11-G001 READY_FOR_VERIFICATION — see functional category above
- P11-G002 READY_FOR_VERIFICATION — see functional category above
- P11-G003 READY_FOR_VERIFICATION — see functional category above
- P11-G004 OPEN — see functional category above
- P11-G005 OPEN — see functional category above
- P11-G006 OPEN — see functional category above
- P11-G007 OPEN — see functional category above
- P11-G008 OPEN — see functional category above
- P11-G009 OPEN — see functional category above
- P11-G010 OPEN — see functional category above
- P11-G011 OPEN — see functional category above
- P11-G012 OPEN — see functional category above
- P11-G013 OPEN — see functional category above
- P11-G014 OPEN — see functional category above
- P11-G015 OPEN — see functional category above
- P11-G016 OPEN — see functional category above
- P11-G017 OPEN — see functional category above
- P11-G018 OPEN — see functional category above

## P12 — Student Attendance Foundation (2026-11-16)

- P12-G001 OPEN — see functional category above
- P12-G002 OPEN — see functional category above
- P12-G003 OPEN — see functional category above
- P12-G004 OPEN — see functional category above
- P12-G005 OPEN — see functional category above
- P12-G006 OPEN — see functional category above
- P12-G007 OPEN — see functional category above
- P12-G008 OPEN — see functional category above
- P12-G009 OPEN — see functional category above
- P12-G010 OPEN — see functional category above
- P12-G011 OPEN — see functional category above
- P12-G012 OPEN — see functional category above
- P12-G013 OPEN — see functional category above
- P12-G014 OPEN — see functional category above
- P12-G015 OPEN — see functional category above
- P12-G016 OPEN — see functional category above
- P12-G017 OPEN — see functional category above
- P12-G018 OPEN — see functional category above

## P13 — Attendance Hardening (2026-11-16)

- P13-G001 OPEN — see functional category above
- P13-G002 OPEN — see functional category above
- P13-G003 OPEN — see functional category above
- P13-G004 OPEN — see functional category above
- P13-G005 OPEN — see functional category above
- P13-G006 OPEN — see functional category above
- P13-G007 OPEN — see functional category above
- P13-G008 OPEN — see functional category above
- P13-G009 OPEN — see functional category above
- P13-G010 OPEN — see functional category above
- P13-G011 OPEN — see functional category above

## P14 — Attendance UI Integration (2026-11-16)

- P14-G001 OPEN — see functional category above
- P14-G002 OPEN — see functional category above
- P14-G003 OPEN — see functional category above
- P14-G004 OPEN — see functional category above
- P14-G005 OPEN — see functional category above
- P14-G006 OPEN — see functional category above
- P14-G007 OPEN — see functional category above
- P14-G008 OPEN — see functional category above

## P15 — Teacher Attendance Mobile (2026-11-16)

- P15-G001 OPEN — see functional category above
- P15-G002 OPEN — see functional category above
- P15-G003 OPEN — see functional category above
- P15-G004 OPEN — see functional category above
- P15-G005 OPEN — see functional category above
- P15-G006 OPEN — see functional category above
- P15-G007 OPEN — see functional category above
- P15-G008 OPEN — see functional category above
- P15-G009 OPEN — see functional category above

## P16 — Teacher Mobile Authentication & Secure Sessions (2026-11-16)

- P16-G001 OPEN — see functional category above
- P16-G002 OPEN — see functional category above
- P16-G003 OPEN — see functional category above
- P16-G004 OPEN — see functional category above
- P16-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P16-G006 PARTIALLY_IMPLEMENTED — see functional category above
- P16-G007 OPEN — see functional category above
- P16-G008 OPEN — see functional category above
- P16-G006 TRACKED — see functional category above

## P17 — Teacher Membership Discovery & School Selection (2026-11-16)

- P17-G001 OPEN — see functional category above
- P17-G002 OPEN — see functional category above
- P17-G003 OPEN — see functional category above
- P17-G004 OPEN — see functional category above
- P17-G005 OPEN — see functional category above
- P17-G006 OPEN — see functional category above
- P17-G007 OPEN — see functional category above
- P17-G008 OPEN — see functional category above

## P18 — Teacher timetable and daily workspace

- P18-G001 TRACKED — see functional category above
- P18-G002 TRACKED — see functional category above
- P18-G003 TRACKED — see functional category above
- P18-G004 TRACKED — see functional category above
- P18-G005 TRACKED — see functional category above
- P18-G006 TRACKED — see functional category above
- P18-G007 TRACKED — see functional category above
- P18-G008 TRACKED — see functional category above
- P18-G009 TRACKED — see functional category above

## P19 — Timetable Management & Conflict Resolution (2026-11-16)

- P19-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P19-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P19-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P19-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P19-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P19-G006 OPEN — see functional category above
- P19-G007 OPEN — see functional category above
- P19-G008 PARTIALLY_IMPLEMENTED — see functional category above
- P19-G009 OPEN — see functional category above

## P20 — Academic Calendar & Timetable Exceptions (2026-11-16)

- P20-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P20-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P20-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P20-G004 OPEN — see functional category above
- P20-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P20-G006 OPEN — see functional category above
- P20-G007 PARTIALLY_IMPLEMENTED — see functional category above
- P20-G008 OPEN — see functional category above
- P20-G009 OPEN — see functional category above

## P21 — Timetable CSV, Templates & School Admin Editor (2026-11-16)

- P21-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P21-G002 OPEN — see functional category above
- P21-G003 OPEN — see functional category above
- P21-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P21-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P21-G006 PARTIALLY_IMPLEMENTED — see functional category above
- P21-G007 OPEN — see functional category above
- P21-G008 PARTIALLY_IMPLEMENTED — see functional category above
- P21-G009 PARTIALLY_IMPLEMENTED — see functional category above

## P22 — Timetable Quality, Room Migration & Teacher Week Grid (2026-11-16)

- P22-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P22-G002 OPEN — see functional category above
- P22-G003 OPEN — see functional category above
- P22-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P22-G005 OPEN — see functional category above
- P22-G006 OPEN — see functional category above
- P22-G007 OPEN — see functional category above

## P23 — Room Mapping, Authentication Integration & Timetable Acceptance (2026-11-17)

- P23-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P23-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P23-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P23-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P23-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P23-G006 OPEN — see functional category above
- P23-G007 OPEN — see functional category above
- P23-G008 PARTIALLY_IMPLEMENTED — see functional category above
- P23-G009 PARTIALLY_IMPLEMENTED — see functional category above
- P23-G010 PARTIALLY_IMPLEMENTED — see functional category above

## P24 — School Admin Authenticated Tenant Workspace (2026-11-17)

- P24-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P24-G002 READY_FOR_VERIFICATION — see functional category above
- P24-G003 READY_FOR_VERIFICATION — see functional category above
- P24-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P24-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P24-G006 OPEN — see functional category above
- P24-G007 OPEN — see functional category above
- P24-G008 OPEN — see functional category above

## P25 — School Admin Permission Guards & Timetable Database Acceptance (2026-11-17)

- P25-G001 READY_FOR_VERIFICATION — see functional category above
- P25-G002 OPEN — see functional category above
- P25-G003 OPEN — see functional category above
- P25-G004 OPEN — see functional category above
- P25-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P25-G006 OPEN — see functional category above
- P25-G007 READY_FOR_VERIFICATION — see functional category above
- P25-G008 OPEN — see functional category above
- P25-G009 OPEN — see functional category above
- P25-G010 OPEN — see functional category above
- P25-G011 OPEN — see functional category above
- P25-G012 OPEN — see functional category above

## P26 — School Configuration Persistence (2026-11-17)

- P26-G001 READY_FOR_VERIFICATION — see functional category above
- P26-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P26-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P26-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P26-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P26-G006 OPEN — see functional category above
- P26-G007 OPEN — see functional category above
- P26-G008 OPEN — see functional category above
- P26-G009 READY_FOR_VERIFICATION — see functional category above
- P26-G010 READY_FOR_VERIFICATION — see functional category above

## P27 — Operational Modules API Integration (2026-11-17)

- P27-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P27-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P27-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P27-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P27-G005 OPEN — see functional category above
- P27-G006 READY_FOR_VERIFICATION — see functional category above
- P27-G007 READY_FOR_VERIFICATION — see functional category above
- P27-G008 READY_FOR_VERIFICATION — see functional category above
- P27-G009 PARTIALLY_IMPLEMENTED — see functional category above
- P27-G010 OPEN — see functional category above

## P28 — Operational Workflows & Authorization Hardening (2026-11-17)

- P28-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P28-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P28-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P28-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P28-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P28-G006 PARTIALLY_IMPLEMENTED — see functional category above
- P28-G007 READY_FOR_VERIFICATION — see functional category above
- P28-G008 READY_FOR_VERIFICATION — see functional category above
- P28-G009 READY_FOR_VERIFICATION — see functional category above
- P28-G010 OPEN — see functional category above
- P28-G011 OPEN — see functional category above
- P28-G012 PARTIALLY_IMPLEMENTED — see functional category above

## P29 — Guardian, Staff Lifecycle & Curriculum Guard (2026-11-17)

- P29-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P29-G002 READY_FOR_VERIFICATION — see functional category above
- P29-G003 OPEN — see functional category above
- P29-G004 OPEN — see functional category above
- P29-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P29-G006 READY_FOR_VERIFICATION — see functional category above
- P29-G007 PARTIALLY_IMPLEMENTED — see functional category above
- P29-G008 OPEN — see functional category above
- P29-G009 OPEN — see functional category above
- P29-G010 OPEN — see functional category above

## P30 — Parent Identity, Private Documents & Integrity (2026-11-17)

- P30-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P30-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P30-G003 READY_FOR_VERIFICATION — see functional category above
- P30-G004 READY_FOR_VERIFICATION — see functional category above
- P30-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P30-G006 OPEN — see functional category above
- P30-G007 READY_FOR_VERIFICATION — see functional category above
- P30-G008 READY_FOR_VERIFICATION — see functional category above
- P30-G009 PARTIALLY_IMPLEMENTED — see functional category above
- P30-G010 PARTIALLY_IMPLEMENTED — see functional category above
- P30-G011 PARTIALLY_IMPLEMENTED — see functional category above
- P30-G012 OPEN — see functional category above

## P31 — Parent Portal, Delivery Workers & Consent Controls (2026-11-17)

- P31-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P31-G002 OPEN — see functional category above
- P31-G003 READY_FOR_VERIFICATION — see functional category above
- P31-G004 READY_FOR_VERIFICATION — see functional category above
- P31-G005 READY_FOR_VERIFICATION — see functional category above
- P31-G006 READY_FOR_VERIFICATION — see functional category above
- P31-G007 PARTIALLY_IMPLEMENTED — see functional category above
- P31-G008 READY_FOR_VERIFICATION — see functional category above
- P31-G009 PARTIALLY_IMPLEMENTED — see functional category above
- P31-G010 PARTIALLY_IMPLEMENTED — see functional category above
- P31-G011 OPEN — see functional category above
- P31-G012 OPEN — see functional category above
- P31-G013 OPEN — see functional category above
- P31-G014 OPEN — see functional category above
- P31-G015 OPEN — see functional category above
- P31-G016 OPEN — see functional category above
- P31-G017 OPEN — see functional category above
- P31-G018 READY_FOR_VERIFICATION — see functional category above

## P32 — Parent Attendance Pagination & Portal Hardening (2026-11-17)

- P32-G001 READY_FOR_VERIFICATION — see functional category above
- P32-G002 OPEN — see functional category above
- P32-G003 READY_FOR_VERIFICATION — see functional category above
- P32-G004 OPEN — see functional category above
- P32-G005 OPEN — see functional category above

## P33 — Parent Fees, Homework, Report Cards & Notifications

- P33-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P33-G002 READY_FOR_VERIFICATION — see functional category above
- P33-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P33-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P33-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P33-G006 OPEN — see functional category above
- P33-G007 READY_FOR_VERIFICATION — see functional category above
- P33-G008 READY_FOR_VERIFICATION — see functional category above
- P33-G009 READY_FOR_VERIFICATION — see functional category above
- P33-G010 READY_FOR_VERIFICATION — see functional category above
- P33-G011 OPEN — see functional category above
- P33-G012 OPEN — see functional category above
- P33-G013 READY_FOR_VERIFICATION — see functional category above
- P33-G014 OPEN — see functional category above

## P34 — School Admin Parent Operations (2026-11-17)

- P34-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P34-G002 READY_FOR_VERIFICATION — see functional category above
- P34-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P34-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P34-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P34-G006 PARTIALLY_IMPLEMENTED — see functional category above
- P34-G007 READY_FOR_VERIFICATION — see functional category above
- P34-G008 READY_FOR_VERIFICATION — see functional category above
- P34-G009 READY_FOR_VERIFICATION — see functional category above
- P34-G010 OPEN — see functional category above
- P34-G011 PARTIALLY_IMPLEMENTED — see functional category above
- P34-G012 OPEN — see functional category above

## P35 — School Operations Pagination & Privacy (2026-11-17)

- P35-G001 READY_FOR_VERIFICATION — see functional category above
- P35-G002 READY_FOR_VERIFICATION — see functional category above
- P35-G003 READY_FOR_VERIFICATION — see functional category above
- P35-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P35-G005 OPEN — see functional category above
- P35-G006 PARTIALLY_IMPLEMENTED — see functional category above
- P35-G007 PARTIALLY_IMPLEMENTED — see functional category above
- P35-G008 OPEN — see functional category above
- P35-G009 OPEN — see functional category above
- P35-G010 OPEN — see functional category above
- P35-G011 OPEN — see functional category above

## P36 — Homework Submissions & Parent Inbox Count (2026-11-17)

- P36-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P36-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P36-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P36-G004 READY_FOR_VERIFICATION — see functional category above
- P36-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P36-G006 OPEN — see functional category above
- P36-G007 OPEN — see functional category above
- P36-G008 OPEN — see functional category above
- P36-G009 OPEN — see functional category above

## P37 — Homework Attachments & Teacher Grading (2026-11-17)

- P37-G001 READY_FOR_VERIFICATION — see functional category above
- P37-G002 READY_FOR_VERIFICATION — see functional category above
- P37-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P37-G004 READY_FOR_VERIFICATION — see functional category above
- P37-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P37-G006 OPEN — see functional category above
- P37-G007 READY_FOR_VERIFICATION — see functional category above
- P37-G008 PARTIALLY_IMPLEMENTED — see functional category above
- P37-G009 OPEN — see functional category above
- P37-G010 OPEN — see functional category above
- P37-G011 OPEN — see functional category above
- P37-G012 OPEN — see functional category above
- P37-G013 OPEN — see functional category above

## P38 — Report Card Governance (2026-11-17)

- P38-G001 READY_FOR_VERIFICATION — see functional category above
- P38-G002 READY_FOR_VERIFICATION — see functional category above
- P38-G003 READY_FOR_VERIFICATION — see functional category above
- P38-G004 READY_FOR_VERIFICATION — see functional category above
- P38-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P38-G006 PARTIALLY_IMPLEMENTED — see functional category above
- P38-G007 OPEN — see functional category above
- P38-G008 OPEN — see functional category above
- P38-G009 OPEN — see functional category above
- P38-G010 OPEN — see functional category above

## P39 — Report-card Operations UI (2026-11-17)

- P39-G001 READY_FOR_VERIFICATION — see functional category above
- P39-G002 READY_FOR_VERIFICATION — see functional category above
- P39-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P39-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P39-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P39-G006 OPEN — see functional category above
- P39-G007 OPEN — see functional category above
- P39-G008 OPEN — see functional category above

## P40 — Report-card Designer, PDF Templates & Notification Outbox (2026-11-17)

- P40-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P40-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P40-G003 READY_FOR_VERIFICATION — see functional category above
- P40-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P40-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P40-G006 PARTIALLY_IMPLEMENTED — see functional category above
- P40-G007 OPEN — see functional category above
- P40-G008 PARTIALLY_IMPLEMENTED — see functional category above
- P40-G009 OPEN — see functional category above
- P40-G010 OPEN — see functional category above
- P40-G011 OPEN — see functional category above

## P41 — Report-card Verification, Multilingual PDFs & Notification Delivery (2026-11-17)

- P41-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P41-G002 READY_FOR_VERIFICATION — see functional category above
- P41-G003 READY_FOR_VERIFICATION — see functional category above
- P41-G004 READY_FOR_VERIFICATION — see functional category above
- P41-G005 OPEN — see functional category above
- P41-G006 PARTIALLY_IMPLEMENTED — see functional category above
- P41-G007 OPEN — see functional category above
- P41-G008 OPEN — see functional category above

## P42 — Parent Notification Inbox Lifecycle (2026-11-17)

- P42-G001 READY_FOR_VERIFICATION — see functional category above
- P42-G002 READY_FOR_VERIFICATION — see functional category above
- P42-G003 READY_FOR_VERIFICATION — see functional category above
- P42-G004 OPEN — see functional category above
- P42-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P42-G006 PARTIALLY_IMPLEMENTED — see functional category above
- P42-G007 OPEN — see functional category above
- P42-G008 OPEN — see functional category above
- P42-G009 OPEN — see functional category above
- P42-G010 OPEN — see functional category above

## P43 — School Branding, Named Templates & Outbox Leases (2026-11-17)

- P43-G001 READY_FOR_VERIFICATION — see functional category above
- P43-G002 READY_FOR_VERIFICATION — see functional category above
- P43-G003 READY_FOR_VERIFICATION — see functional category above
- P43-G004 OPEN — see functional category above
- P43-G005 OPEN — see functional category above
- P43-G006 OPEN — see functional category above
- P43-G007 READY_FOR_VERIFICATION — see functional category above
- P43-G008 OPEN — see functional category above
- P43-G009 OPEN — see functional category above
- P43-G010 OPEN — see functional category above

## P44 newly tracked gaps

- P44-G001 READY_FOR_VERIFICATION — see functional category above
- P44-G002 READY_FOR_VERIFICATION — see functional category above
- P44-G003 OPEN — see functional category above
- P44-G004 OPEN — see functional category above
- P44-G005 OPEN — see functional category above

## P45 newly tracked gaps

- P45-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P45-G002 READY_FOR_VERIFICATION — see functional category above
- P45-G003 OPEN — see functional category above
- P45-G004 OPEN — see functional category above
- P45-G005 OPEN — see functional category above
- P45-G006 OPEN — see functional category above

## P46 newly tracked gaps

- P46-G001 READY_FOR_VERIFICATION — see functional category above
- P46-G002 OPEN — see functional category above
- P46-G003 OPEN — see functional category above
- P46-G004 OPEN — see functional category above
- P46-G005 OPEN — see functional category above

## P47 newly tracked gaps

- P47-G001 READY_FOR_VERIFICATION — see functional category above
- P47-G002 READY_FOR_VERIFICATION — see functional category above
- P47-G003 OPEN — see functional category above
- P47-G004 OPEN — see functional category above
- P47-G005 BLOCKED_EXTERNAL — see functional category above
- P47-G006 OPEN — see functional category above
- P47-G007 OPEN — see functional category above

## P48 newly tracked gaps

- P48-G001 READY_FOR_VERIFICATION — see functional category above
- P48-G002 OPEN — see functional category above
- P48-G003 OPEN — see functional category above
- P48-G004 BLOCKED_EXTERNAL — see functional category above
- P48-G005 OPEN — see functional category above

## P49 newly tracked gaps

- P49-G001 READY_FOR_VERIFICATION — see functional category above
- P49-G002 OPEN — see functional category above
- P49-G003 BLOCKED_EXTERNAL — see functional category above
- P49-G004 OPEN — see functional category above
- P49-G005 OPEN — see functional category above

## P50 newly tracked gaps

- P50-G001 READY_FOR_VERIFICATION — see functional category above
- P50-G002 OPEN — see functional category above
- P50-G003 BLOCKED_EXTERNAL — see functional category above
- P50-G004 OPEN — see functional category above
- P50-G005 OPEN — see functional category above

## P51 newly tracked gaps

- P51-G001 READY_FOR_VERIFICATION — see functional category above
- P51-G002 OPEN — see functional category above
- P51-G003 BLOCKED_EXTERNAL — see functional category above
- P51-G004 OPEN — see functional category above

## P52 newly tracked gaps

- P52-G001 READY_FOR_VERIFICATION — see functional category above
- P52-G002 OPEN — see functional category above
- P52-G003 BLOCKED_EXTERNAL — see functional category above
- P52-G004 OPEN — see functional category above

## P53 newly tracked gaps

- P53-G001 READY_FOR_VERIFICATION — see functional category above
- P53-G002 BLOCKED_EXTERNAL — see functional category above
- P53-G003 OPEN — see functional category above
- P53-G004 OPEN — see functional category above

## P54 newly tracked gaps

- P54-G001 READY_FOR_VERIFICATION — see functional category above
- P54-G002 OPEN — see functional category above
- P54-G003 BLOCKED_EXTERNAL — see functional category above
- P54-G004 OPEN — see functional category above

## P55 newly tracked gaps

- P55-G001 READY_FOR_VERIFICATION — see functional category above
- P55-G002 OPEN — see functional category above
- P55-G003 OPEN — see functional category above
- P55-G004 OPEN — see functional category above

## P56 newly tracked gaps

- P56-G001 READY_FOR_VERIFICATION — see functional category above
- P56-G002 OPEN — see functional category above
- P56-G003 OPEN — see functional category above
- P56-G004 OPEN — see functional category above

## P57 newly tracked gaps

- P57-G001 READY_FOR_VERIFICATION — see functional category above
- P57-G002 READY_FOR_VERIFICATION — see functional category above
- P57-G003 OPEN — see functional category above
- P57-G004 OPEN — see functional category above

## P58 newly tracked gaps

- P58-G001 READY_FOR_VERIFICATION — see functional category above
- P58-G002 READY_FOR_VERIFICATION — see functional category above
- P58-G003 OPEN — see functional category above
- P58-G004 OPEN — see functional category above

## P59 newly tracked gaps

- P59-G001 READY_FOR_VERIFICATION — see functional category above
- P59-G002 OPEN — see functional category above
- P59-G003 OPEN — see functional category above
- P59-G004 OPEN — see functional category above

## P60 newly tracked gaps

- P60-G001 READY_FOR_VERIFICATION — see functional category above
- P60-G002 OPEN — see functional category above
- P60-G003 OPEN — see functional category above
- P60-G004 OPEN — see functional category above

## P61 newly tracked gaps

- P61-G001 READY_FOR_VERIFICATION — see functional category above
- P61-G002 OPEN — see functional category above
- P61-G003 BLOCKED_EXTERNAL — see functional category above
- P61-G004 OPEN — see functional category above

## P62 newly tracked gaps

- P62-G001 READY_FOR_VERIFICATION — see functional category above
- P62-G002 OPEN — see functional category above
- P62-G003 OPEN — see functional category above
- P62-G004 OPEN — see functional category above

## P63 newly tracked gaps

- P63-G001 READY_FOR_VERIFICATION — see functional category above
- P63-G002 OPEN — see functional category above
- P63-G003 OPEN — see functional category above
- P63-G004 OPEN — see functional category above
- P63-G005 OPEN — see functional category above

## P64 newly tracked gaps

- P64-G001 READY_FOR_VERIFICATION — see functional category above
- P64-G002 OPEN — see functional category above
- P64-G003 OPEN — see functional category above
- P64-G004 OPEN — see functional category above

## P65 newly tracked gaps

- P65-G001 READY_FOR_VERIFICATION — see functional category above
- P65-G002 OPEN — see functional category above
- P65-G003 OPEN — see functional category above
- P65-G004 OPEN — see functional category above

## P66 newly tracked gaps

- P66-G001 READY_FOR_VERIFICATION — see functional category above
- P66-G002 OPEN — see functional category above
- P66-G003 OPEN — see functional category above
- P66-G004 OPEN — see functional category above

## P67 newly tracked gaps

- P67-G001 READY_FOR_VERIFICATION — see functional category above
- P67-G002 OPEN — see functional category above
- P67-G003 OPEN — see functional category above
- P67-G004 OPEN — see functional category above

## P68 consolidated final readiness gaps

- P68-G001 OPEN — see functional category above
- P68-G002 BLOCKED_EXTERNAL — see functional category above
- P68-G003 OPEN — see functional category above
- P68-G004 OPEN — see functional category above
- P68-G005 OPEN — see functional category above

## P69 newly tracked workspace/build baseline gaps

- P69-G001 OPEN — see functional category above
- P69-G002 READY_FOR_VERIFICATION — see functional category above
- P69-G003 OPEN — see functional category above
- P69-G004 READY_FOR_VERIFICATION — see functional category above

## P70 newly tracked tenant-isolation acceptance gaps

- P70-G001 READY_FOR_VERIFICATION — see functional category above
- P70-G002 OPEN — see functional category above
- P70-G003 READY_FOR_VERIFICATION — see functional category above
- P70-G004 OPEN — see functional category above

## P71 newly tracked runtime readiness gaps

- P71-G001 READY_FOR_VERIFICATION — see functional category above
- P71-G002 READY_FOR_VERIFICATION — see functional category above
- P71-G003 READY_FOR_VERIFICATION — see functional category above
- P71-G004 OPEN — see functional category above

## P72 newly tracked payment webhook gaps

- P72-G001 READY_FOR_VERIFICATION — see functional category above
- P72-G002 BLOCKED_EXTERNAL — see functional category above
- P72-G003 OPEN — see functional category above
- P72-G004 OPEN — see functional category above

## P73 newly tracked student lifecycle gaps

- P73-G001 READY_FOR_VERIFICATION — see functional category above
- P73-G002 READY_FOR_VERIFICATION — see functional category above
- P73-G003 READY_FOR_VERIFICATION — see functional category above
- P73-G004 OPEN — see functional category above

## P74 newly tracked parent mobile offline gaps

- P74-G001 READY_FOR_VERIFICATION — see functional category above
- P74-G002 READY_FOR_VERIFICATION — see functional category above
- P74-G003 OPEN — see functional category above
- P74-G004 OPEN — see functional category above

## P75 newly tracked worker lifecycle gaps

- P75-G001 READY_FOR_VERIFICATION — see functional category above
- P75-G002 READY_FOR_VERIFICATION — see functional category above
- P75-G003 OPEN — see functional category above
- P75-G004 OPEN — see functional category above

## P76 newly tracked multilingual PDF gaps

- P76-G001 READY_FOR_VERIFICATION — see functional category above
- P76-G002 OPEN — see functional category above
- P76-G003 OPEN — see functional category above
- P76-G004 READY_FOR_VERIFICATION — see functional category above

## P77 newly tracked observability gaps

- P77-G001 READY_FOR_VERIFICATION — see functional category above
- P77-G002 OPEN — see functional category above
- P77-G003 OPEN — see functional category above
- P77-G004 OPEN — see functional category above

## P78 consolidated readiness gaps

- P78-G001 OPEN — see functional category above
- P78-G002 READY_FOR_VERIFICATION — see functional category above
- P78-G003 OPEN — see functional category above
- P78-G004 BLOCKED_EXTERNAL — see functional category above

## P79 gaps — identity context and authenticated profile

- P79-G001 READY_FOR_VERIFICATION — see functional category above
- P79-G002 READY_FOR_VERIFICATION — see functional category above
- P79-G003 OPEN — see functional category above
- P79-G003 TRACKED — see functional category above

## P100 newly tracked functional integration gaps

- P100-G001 READY_FOR_VERIFICATION — see functional category above
- P100-G002 READY_FOR_VERIFICATION — see functional category above
- P100-G003 OPEN — see functional category above

## P101 — Document and Data Governance (2026-11-17)

- P101-G001 READY_FOR_VERIFICATION — see functional category above
- P101-G002 READY_FOR_VERIFICATION — see functional category above
- P101-G003 READY_FOR_VERIFICATION — see functional category above
- P101-G004 OPEN — see functional category above
- P101-G005 READY_FOR_VERIFICATION — see functional category above

## P102 — White-label and Platform Operations (2026-11-17)

- P102-G001 READY_FOR_VERIFICATION — see functional category above
- P102-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P102-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P102-G004 OPEN — see functional category above
- P102-G005 BLOCKED_EXTERNAL — see functional category above
- P102-G006 READY_FOR_VERIFICATION — see functional category above

## P103 — Mobile Offline-first Completion (2026-11-17)

- P103-G001 READY_FOR_VERIFICATION — see functional category above
- P103-G002 READY_FOR_VERIFICATION — see functional category above
- P103-G003 READY_FOR_VERIFICATION — see functional category above
- P103-G004 READY_FOR_VERIFICATION — see functional category above
- P103-G005 PARTIALLY_IMPLEMENTED — see functional category above
- P103-G006 OPEN — see functional category above
- P103-G007 OPEN — see functional category above
- P103-G008 READY_FOR_VERIFICATION — see functional category above
- P103-G009 OPEN — see functional category above

## P104 — PDF Accessibility and Multilingual Layouts (2026-11-17)

- P104-G001 READY_FOR_VERIFICATION — see functional category above
- P104-G002 READY_FOR_VERIFICATION — see functional category above
- P104-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P104-G004 READY_FOR_VERIFICATION — see functional category above
- P104-G005 READY_FOR_VERIFICATION — see functional category above
- P104-G006 OPEN — see functional category above
- P104-G007 READY_FOR_VERIFICATION — see functional category above

## P105 — Production Infrastructure, Backup/Restore and Observability (2026-11-17)

- P105-G001 OPEN — see functional category above
- P105-G002 READY_FOR_VERIFICATION — see functional category above
- P105-G003 READY_FOR_VERIFICATION — see functional category above
- P105-G004 READY_FOR_VERIFICATION — see functional category above
- P105-G005 OPEN — see functional category above
- P105-G006 READY_FOR_VERIFICATION — see functional category above
- P105-G007 PARTIALLY_IMPLEMENTED — see functional category above
- P105-G008 OPEN — see functional category above
- P105-G009 READY_FOR_VERIFICATION — see functional category above
- P105-G010 OPEN — see functional category above
- P105-G011 OPEN — see functional category above
- P105-G012 BLOCKED_EXTERNAL — see functional category above
- P105-G013 OPEN — see functional category above
- P105-G014 OPEN — see functional category above
- P105-G015 OPEN — see functional category above

## P106 — Cross-module End-to-End Journey Foundations (2026-11-18)

- P106-G001 READY_FOR_VERIFICATION — see functional category above
- P106-G002 OPEN — see functional category above
- P106-G003 OPEN — see functional category above
- P106-G004 READY_FOR_VERIFICATION — see functional category above

## P107 — Security, Privacy, Board/Jurisdiction and Operational Closure (2026-11-18)

- P107-G001 READY_FOR_VERIFICATION — see functional category above
- P107-G002 READY_FOR_VERIFICATION — see functional category above
- P107-G003 OPEN — see functional category above
- P107-G004 OPEN — see functional category above
- P107-G005 OPEN — see functional category above

## P108 — Final Acceptance and Zero-Gap Reconciliation (2026-11-18)

- P108-G001 OPEN — see functional category above

## P109 — Authenticated School Admin Identity Bootstrap (2026-11-18)

- P109-G001 READY_FOR_VERIFICATION — see functional category above
- P109-G002 OPEN — see functional category above
- P109-G002 TRACKED — see functional category above

## P110 — Cross-Application Identity and Session Bootstrap (2026-11-18)

- P110-G001 READY_FOR_VERIFICATION — see functional category above
- P110-G002 READY_FOR_VERIFICATION — see functional category above
- P110-G003 OPEN — see functional category above

## P111 — Multi-Device Session and Account Isolation (2026-11-18)

- P111-G001 READY_FOR_VERIFICATION — see functional category above
- P111-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P111-G003 READY_FOR_VERIFICATION — see functional category above

## P112 — Backend Refresh Token Families and Session Revocation (2026-11-18)

- P112-G001 READY_FOR_VERIFICATION — see functional category above
- P112-G002 READY_FOR_VERIFICATION — see functional category above
- P112-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P112-G002 TRACKED — see functional category above

## P113 — Authentication Abuse Protection and Rate Limiting (2026-11-18)

- P113-G001 READY_FOR_VERIFICATION — see functional category above
- P113-G002 PARTIALLY_IMPLEMENTED — see functional category above

## P114 — Account Protection and Abuse Monitoring (2026-11-18)

- P114-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P114-G002 READY_FOR_VERIFICATION — see functional category above
- P114-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P115 — Progressive Account Protection and Security Alerts (2026-11-18)

- P115-G001 READY_FOR_VERIFICATION — see functional category above
- P115-G002 OPEN — see functional category above
- P115-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P116 — MFA Enrollment, Verification and Recovery Foundation (2026-11-18)

- P116-G001 READY_FOR_VERIFICATION — see functional category above
- P116-G002 READY_FOR_VERIFICATION — see functional category above
- P116-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P117 — MFA Policy Enforcement Across Web and Mobile (2026-11-18)

- P117-G001 READY_FOR_VERIFICATION — see functional category above
- P117-G002 READY_FOR_VERIFICATION — see functional category above
- P117-G003 READY_FOR_VERIFICATION — see functional category above
- P117-G002 OPEN — see functional category above

## P118 — Central server-side MFA enforcement

- P118-G001 READY_FOR_VERIFICATION — see functional category above
- P118-G002 READY_FOR_VERIFICATION — see functional category above
- P118-G003 READY_FOR_VERIFICATION — see functional category above

## P119 — API Authentication and Authorization Coverage Audit (2026-11-18)

- P119-G001 READY_FOR_VERIFICATION — see functional category above
- P119-G002 OPEN — see functional category above
- P119-G003 READY_FOR_VERIFICATION — see functional category above

## P120 — Resource-Level Authorization and Tenant Isolation Remediation (2026-11-18)

- P120-G001 READY_FOR_VERIFICATION — see functional category above
- P120-G002 READY_FOR_VERIFICATION — see functional category above
- P120-G003 OPEN — see functional category above

## P121 — phase gap index

- P121-G001 READY_FOR_VERIFICATION — see functional category above
- P121-G002 READY_FOR_VERIFICATION — see functional category above
- P121-G003 OPEN — see functional category above

## P122 — Teacher-to-Student Resource Authorization (2026-11-18)

- P122-G001 READY_FOR_VERIFICATION — see functional category above
- P122-G002 OPEN — see functional category above
- P122-G003 OPEN — see functional category above

## P123 — Student PII, Guardian and Fee Authorization (2026-11-18)

- P123-G001 READY_FOR_VERIFICATION — see functional category above
- P123-G002 READY_FOR_VERIFICATION — see functional category above
- P123-G003 READY_FOR_VERIFICATION — see functional category above

## P124 — Attendance, Timetable and Academic Resource Authorization (2026-11-18)

- P124-G001 READY_FOR_VERIFICATION — see functional category above
- P124-G002 READY_FOR_VERIFICATION — see functional category above
- P124-G003 OPEN — see functional category above

## P125 — Fees, Payments and Financial Resource Authorization (2026-11-18)

- P125-G001 READY_FOR_VERIFICATION — see functional category above
- P125-G002 READY_FOR_VERIFICATION — see functional category above
- P125-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P126 — Refund, Reversal and Payment Adjustment Foundation (2026-11-18)

- P126-G001 READY_FOR_VERIFICATION — see functional category above
- P126-G002 READY_FOR_VERIFICATION — see functional category above
- P126-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P127 — Accounting Ledger and Double-Entry Financial Posting (2026-11-18)

- P127-G001 READY_FOR_VERIFICATION — see functional category above
- P127-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P127-G003 OPEN — see functional category above

## P128 — Accounting Reports, Reconciliation and Financial Workflows (2026-11-18)

- P128-G001 READY_FOR_VERIFICATION — see functional category above
- P128-G002 OPEN — see functional category above
- P128-G003 READY_FOR_VERIFICATION — see functional category above

## P129 — Historical Accounting Migration and Opening Balances (2026-11-18)

- P129-G001 READY_FOR_VERIFICATION — see functional category above
- P129-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P129-G003 OPEN — see functional category above

## P130 — Historical Fee Transaction Migration and Financial Reconciliation (2026-11-18)

- P130-G001 READY_FOR_VERIFICATION — see functional category above
- P130-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P130-G003 OPEN — see functional category above

## P131 — Historical Fee Subledger Integration and Migration Completion (2026-11-18)

- P131-G001 READY_FOR_VERIFICATION — see functional category above
- P131-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P131-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P132 — Historical Financial Control Totals and Opening Balance Reconciliation (2026-11-18)

- P132-G001 READY_FOR_VERIFICATION — see functional category above
- P132-G002 READY_FOR_VERIFICATION — see functional category above
- P132-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P133 — Historical Financial Exception Management and Cross-Batch Allocation (2026-11-18)

- P133-G001 READY_FOR_VERIFICATION — see functional category above
- P133-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P133-G003 OPEN — see functional category above

## P134 — Cross-Batch Operationalization and Historical Subledger Reconciliation (2026-11-18)

- P134-G001 READY_FOR_VERIFICATION — see functional category above
- P134-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P134-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P135 — Historical Batch Dependency Planning and Allocation Readiness (2026-11-18)

- P135-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P135-G002 PARTIALLY_IMPLEMENTED — see functional category above

## P136 — One-to-Many Historical Operational Allocation Link Foundation (2026-11-18)

- P136-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P136-G002 PARTIALLY_IMPLEMENTED — see functional category above

## P137 — Historical Allocation Coverage Preview (2026-11-18)

- P137-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P137-G002 OPEN — see functional category above
- P137-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P138 — Historical Split Allocation Operationalization (2026-11-18)

- P138-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P138-G002 PARTIALLY_IMPLEMENTED — see functional category above
- P138-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P139 — Dependency-Ordered Historical Batch Execution (2026-11-18)

- P139-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P140 gaps

- P140-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P141 — Searchable Refund Payment-Slice Selection (2026-11-18)

- P141-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P142 — Refund Payment-Slice Reservation and Reconciliation (2026-11-18)

- P142-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P143 — Parent-Visible Refund Status Timeline (2026-11-18)

- P143-G001 READY_FOR_VERIFICATION — see functional category above

## P144 — Parent-initiated refund request (2026-11-18)

- P144-G001 READY_FOR_VERIFICATION — see functional category above

## P145 — School-side parent refund review workflow (2026-11-18)

- P145-G001 READY_FOR_VERIFICATION — see functional category above

## P146 gaps

- P146-G001 READY_FOR_VERIFICATION — see functional category above

## P147 gaps

- P147-G001 READY_FOR_VERIFICATION — see functional category above

## P148 gaps

- P148-G001 OPEN — see functional category above

## P149 gaps

- P149-G001 READY_FOR_VERIFICATION — see functional category above

## P150 gaps

- P150-G001 READY_FOR_VERIFICATION — see functional category above

## P151 gaps

- P151-G001 OPEN — see functional category above

## P152 — Secure refund reconciliation evidence upload

- P152-G001 PARTIAL — see functional category above

## P154 — Refund Evidence Web Workflow

- P154-G001 PARTIAL — see functional category above
- P154-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P155 — Staff Mobile Refund Evidence Workflow

- P155-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P156 — Staff Mobile Evidence Upload Reliability

- P156-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P157 — Staff Mobile Evidence Upload Recovery

- P157-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P158 — Durable Staff Mobile Evidence Recovery

- P158-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P159 — Abandoned Refund Evidence Expiry and Cleanup

- P159-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P160 — Refund Evidence Operations Dashboard

- P160-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P161 — Refund Evidence Worker Health and Retry Operations

- P161-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P162 — Operational Alert Delivery

- P162-G001 PARTIALLY_IMPLEMENTED — see functional category above

## P163 — Operations alert console

- P163-G001 TRACKED — see functional category above
- P163-G002 OPEN — see functional category above

## P164 — Platform Superadmin Operations Console

- P164-G001 OPEN — see functional category above
- P164-G002 OPEN — see functional category above

## P165–P172 Alert, Storage, Evidence and Operations Closure Block

- P165-G001 OPEN — see functional category above

## P166 — phase gap index

- P166-G001 OPEN — see functional category above

## P167 — phase gap index

- P167-G001 OPEN — see functional category above

## P168 — phase gap index

- P168-G001 OPEN — see functional category above

## P169 — phase gap index

- P169-G001 OPEN — see functional category above

## P170 — phase gap index

- P170-G001 OPEN — see functional category above

## P171 — phase gap index

- P171-G001 OPEN — see functional category above

## P172 — phase gap index

- P172-G001 OPEN — see functional category above

## P173 — Admissions & Student Enrollment End-to-End Completion (source implementation)

- P173-G001 READY_FOR_VERIFICATION — see functional category above
- P173-G002 IN_PROGRESS — see functional category above
- P173-G003 READY_FOR_VERIFICATION — see functional category above
- P173-G004 IN_PROGRESS — see functional category above
- P173-G005 READY_FOR_VERIFICATION — see functional category above
- P173-G006 OPEN — see functional category above

## P174 — phase gap index

- P174-G001 OPEN — see functional category above
- P174-G002 OPEN — see functional category above
- P174-G003 OPEN — see functional category above
- P174-G004 OPEN — see functional category above

## P175 — Admission eligibility and checklist rules (source implementation)

- P175-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P175-G002 READY_FOR_VERIFICATION — see functional category above
- P175-G003 PARTIALLY_IMPLEMENTED — see functional category above
- P175-G004 READY_FOR_VERIFICATION — see functional category above
- P175-G005 OPEN — see functional category above

## P176 — Board-aware eligibility

- P176-G001 READY_FOR_VERIFICATION — see functional category above
- P176-G002 READY_FOR_VERIFICATION — see functional category above
- P176-G003 OPEN — see functional category above

## P177 — Parent/Public Admissions API foundation

- P177-G001 READY_FOR_VERIFICATION — see functional category above
- P177-G002 READY_FOR_VERIFICATION — see functional category above
- P177-G003 READY_FOR_VERIFICATION — see functional category above
- P177-G004 PARTIALLY_IMPLEMENTED — see functional category above
- P177-G005 OPEN — see functional category above

## P178 — Public Admissions Portal UI

- P178-G001 READY_FOR_VERIFICATION — see functional category above
- P178-G002 READY_FOR_VERIFICATION — see functional category above
- P178-G003 READY_FOR_VERIFICATION — see functional category above
- P178-G004 OPEN — see functional category above
- P178-G005 OPEN — see functional category above

## P179 — Token-authorized applicant document workflow

- P179-G001 READY_FOR_VERIFICATION — see functional category above
- P179-G002 READY_FOR_VERIFICATION — see functional category above
- P179-G003 READY_FOR_VERIFICATION — see functional category above
- P179-G004 READY_FOR_VERIFICATION — see functional category above
- P179-G005 OPEN — see functional category above

## P180 — Public application submission & eligibility enforcement

- P180-G001 READY_FOR_VERIFICATION — see functional category above
- P180-G002 READY_FOR_VERIFICATION — see functional category above
- P180-G003 READY_FOR_VERIFICATION — see functional category above
- P180-G004 READY_FOR_VERIFICATION — see functional category above
- P180-G005 OPEN — see functional category above
- P180-G006 OPEN — see functional category above

## P181 — Public tenant-to-school context resolution

- P181-G001 READY_FOR_VERIFICATION — see functional category above
- P181-G002 READY_FOR_VERIFICATION — see functional category above
- P181-G003 OPEN — see functional category above

## P182 — Guardian identity safety in admissions conversion

- P182-G001 READY_FOR_VERIFICATION — see functional category above
- P182-G002 READY_FOR_VERIFICATION — see functional category above
- P182-G003 OPEN — see functional category above

## P188 — Automatic Admission Seat Reservation Expiry

- P188-G001 TRACKED — see functional category above
- P188-G002 TRACKED — see functional category above
- P188-G003 TRACKED — see functional category above
- P188-G004 DEFERRED — see functional category above

## P190 — Admissions submission notifications (source implementation; verification deferred)

- P190-G001 TRACKED — see functional category above
- P190-G002 TRACKED — see functional category above
- P190-G003 TRACKED — see functional category above
- P190-G004 OPEN — see functional category above
- P190-G005 OPEN — see functional category above
- P190-G006 OPEN — see functional category above
- P190-G007 DEFERRED — see functional category above

## P191 — Admission Notification Template Foundation

- P191-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P191-G002 OPEN — see functional category above

## P192 — Admissions Parent Notification Preferences & Consent Controls

- P192-G001 TRACKED — see functional category above
- P192-G002 TRACKED — see functional category above
- P192-G003 OPEN — see functional category above
- P192-G004 DEFERRED — see functional category above

## P193 — Admissions payment receipt foundation

- P193-G001 TRACKED — see functional category above
- P193-G002 TRACKED — see functional category above
- P193-G003 TRACKED — see functional category above
- P193-G004 OPEN — see functional category above
- P193-G005 OPEN — see functional category above
- P193-G006 DEFERRED — see functional category above

## P194 — Public admissions tracking token lifecycle

- P194-G001 TRACKED — see functional category above
- P194-G002 TRACKED — see functional category above
- P194-G003 TRACKED — see functional category above
- P194-G004 OPEN — see functional category above
- P194-G005 OPEN — see functional category above

## P195 — Guardian identity normalized matching

- P195-G001 TRACKED — see functional category above
- P195-G002 TRACKED — see functional category above
- P195-G003 TRACKED — see functional category above
- P195-G004 OPEN — see functional category above
- P195-G005 DEFERRED — see functional category above

## P196 — Admission eligibility fail-closed enforcement

- P196-G001 TRACKED — see functional category above
- P196-G002 TRACKED — see functional category above
- P196-G003 TRACKED — see functional category above
- P196-G004 OPEN — see functional category above
- P196-G005 DEFERRED — see functional category above

## P197 — Admission seat reservation concurrency hardening

- P197-G001 TRACKED — see functional category above
- P197-G002 TRACKED — see functional category above
- P197-G003 DEFERRED — see functional category above
- P197-G004 OPEN — see functional category above

## P198 — Admissions Web & Mobile Workflow Gap Closure

- P198-G001 TRACKED — see functional category above
- P198-G002 TRACKED — see functional category above
- P198-G003 TRACKED — see functional category above
- P198-G004 OPEN — see functional category above
- P198-G005 DEFERRED — see functional category above

## P199 — Admissions notification inbox baseline

- P199-G001 TRACKED — see functional category above
- P199-G002 TRACKED — see functional category above
- P199-G003 TRACKED — see functional category above
- P199-G004 OPEN — see functional category above
- P199-G005 DEFERRED — see functional category above

## P200 — Admissions notification reconciliation

- P200-G001 TRACKED — see functional category above
- P200-G002 TRACKED — see functional category above
- P200-G003 TRACKED — see functional category above
- P200-G004 OPEN — see functional category above
- P200-G005 OPEN — see functional category above
- P200-G006 DEFERRED — see functional category above

## P201 — Public Admissions distributed rate limiting

- P201-G001 TRACKED — see functional category above
- P201-G002 TRACKED — see functional category above
- P201-G003 OPEN — see functional category above
- P201-G004 DEFERRED — see functional category above

## P202 — Public guardian contact verification foundation

- P202-G001 TRACKED — see functional category above
- P202-G002 TRACKED — see functional category above
- P202-G003 OPEN — see functional category above
- P202-G004 OPEN — see functional category above
- P202-G005 DEFERRED — see functional category above

## P203 — Admission contact verification endpoints & submission enforcement

- P203-G001 TRACKED — see functional category above
- P203-G002 TRACKED — see functional category above
- P203-G003 TRACKED — see functional category above
- P203-G004 TRACKED — see functional category above
- P203-G005 TRACKED — see functional category above
- P203-G006 OPEN — see functional category above
- P203-G007 DEFERRED — see functional category above

## P204 — Applicant contact verification UI integration

- P204-G001 TRACKED — see functional category above
- P204-G002 TRACKED — see functional category above
- P204-G003 TRACKED — see functional category above
- P204-G004 OPEN — see functional category above
- P204-G005 DEFERRED — see functional category above

## P205 — Persisted applicant contact verification status

- P205-G001 TRACKED — see functional category above
- P205-G002 TRACKED — see functional category above
- P205-G003 OPEN — see functional category above
- P205-G004 DEFERRED — see functional category above

## P206 — School-level contact verification policy controls

- P206-G001 TRACKED — see functional category above
- P206-G002 TRACKED — see functional category above
- P206-G003 TRACKED — see functional category above
- P206-G004 OPEN — see functional category above
- P206-G005 DEFERRED — see functional category above

## P207 — Admissions OTP random source hardening

- P207-G001 TRACKED — see functional category above
- P207-G002 TRACKED — see functional category above
- P207-G003 DEFERRED — see functional category above

## P208 — Admissions OTP timing-safe verification

- P208-G001 TRACKED — see functional category above
- P208-G002 TRACKED — see functional category above
- P208-G003 TRACKED — see functional category above
- P208-G004 DEFERRED — see functional category above

## P209 — Admissions email OTP provider integration

- P209-G001 TRACKED — see functional category above
- P209-G002 TRACKED — see functional category above
- P209-G003 TRACKED — see functional category above
- P209-G004 DEFERRED — see functional category above

## P210 — Admissions SMS/Phone OTP deferral

- P210-G001 TRACKED — see functional category above
- P210-G002 TRACKED — see functional category above
- P210-G003 TRACKED — see functional category above
- P210-G004 TRACKED — see functional category above
- P210-G005 TRACKED — see functional category above
- P210-G006 DEFERRED — see functional category above

## P214 — Admissions Workspace application filtering (source implemented)

- P214-G001 TRACKED — see functional category above
- P214-G002 TRACKED — see functional category above
- P214-G003 TRACKED — see functional category above
- P214-G004 OPEN — see functional category above
- P214-G005 DEFERRED — see functional category above

## P215 — Admissions review queue overview (source implemented)

- P215-G001 TRACKED — see functional category above
- P215-G002 TRACKED — see functional category above
- P215-G003 OPEN — see functional category above
- P215-G004 DEFERRED — see functional category above

## P216 — Admissions reviewer assignment foundation (source implemented; runtime validation deferred)

- P216-G001 TRACKED — see functional category above
- P216-G002 TRACKED — see functional category above
- P216-G003 OPEN — see functional category above

## P217 — Admissions reviewer workload and queue filters

- P217-G001 TRACKED — see functional category above
- P217-G002 TRACKED — see functional category above
- P217-G003 OPEN — see functional category above
- P217-G004 DEFERRED — see functional category above

## P218 — Admissions reviewer assignment audit trail (source implemented)

- P218-G001 TRACKED — see functional category above
- P218-G002 TRACKED — see functional category above
- P218-G003 TRACKED — see functional category above
- P218-G004 DEFERRED — see functional category above
- P218-G005 OPEN — see functional category above

## P219 — Admissions review notes and structured recommendations (source implementation)

- P219-G001 TRACKED — see functional category above
- P219-G002 TRACKED — see functional category above
- P219-G003 TRACKED — see functional category above
- P219-G004 DEFERRED — see functional category above

## P220 — Admissions decision transition guard (source implemented)

- P220-G001 TRACKED — see functional category above
- P220-G002 TRACKED — see functional category above
- P220-G003 DEFERRED — see functional category above

## P221 — Admissions applicant correction workflow (source implemented)

- P221-G001 TRACKED — see functional category above
- P221-G002 TRACKED — see functional category above
- P221-G003 TRACKED — see functional category above
- P221-G004 DEFERRED — see functional category above

## P222 — Admissions information-request response lifecycle (source implemented)

- P222-G001 TRACKED — see functional category above
- P222-G002 OPEN — see functional category above
- P222-G003 OPEN — see functional category above
- P222-G004 TRACKED — see functional category above
- P222-G005 OPEN — see functional category above
- P222-G006 DEFERRED — see functional category above

## P223 — Admissions correction request management UI (source implemented)

- P223-G001 TRACKED — see functional category above
- P223-G002 OPEN — see functional category above
- P223-G003 DEFERRED — see functional category above

## P224 — Admissions follow-up information requests (source implemented)

- P224-G001 TRACKED — see functional category above
- P224-G002 TRACKED — see functional category above
- P224-G003 TRACKED — see functional category above
- P224-G004 DEFERRED — see functional category above

## P225 — Applicant Portal correction follow-up timeline (source implemented)

- P225-G001 TRACKED — see functional category above
- P225-G002 TRACKED — see functional category above
- P225-G003 TRACKED — see functional category above
- P225-G004 DEFERRED — see functional category above

## P226 — Admissions document replacement lineage (source implemented)

- P226-G001 TRACKED — see functional category above
- P226-G002 TRACKED — see functional category above
- P226-G003 TRACKED — see functional category above
- P226-G004 DEFERRED — see functional category above

## P227 — Admissions document timeline (source implemented)

- P227-G001 TRACKED — see functional category above
- P227-G002 TRACKED — see functional category above
- P227-G003 DEFERRED — see functional category above

## P228 — Applicant document history timeline (source implemented)

- P228-G001 OPEN — see functional category above
- P228-G002 OPEN — see functional category above
- P228-G003 OPEN — see functional category above
- P228-G004 READY_FOR_VERIFICATION — see functional category above
- P228-G002 TRACKED — see functional category above

## P229 — Admissions applicant notifications/inbox (source implemented)

- P229-G001 TRACKED — see functional category above
- P229-G002 TRACKED — see functional category above
- P229-G003 TRACKED — see functional category above
- P229-G004 TRACKED — see functional category above
- P229-G005 DEFERRED — see functional category above

## P230 — Master Feature Checklist & Priority Reset

- P230-G001 OPEN — see functional category above
- P230-G002 OPEN — see functional category above
- P230-G003 DEFERRED — see functional category above

## P234 — phase gap index

- P234-G001 PARTIAL — see functional category above

## P235 — phase gap index

- P235-G002 OPEN — see functional category above

## P236 — Direct enrollment configured-section capacity enforcement

- P236-G001 TRACKED — see functional category above
- P236-G002 TRACKED — see functional category above
- P236-G003 TRACKED — see functional category above

## P237 — Enrollment status lifecycle API

- P237-G001 TRACKED — see functional category above
- P237-G002 TRACKED — see functional category above
- P237-G003 DEFERRED — see functional category above

## P238 — Student enrollment history and status controls (source implemented)

- P238-G001 TRACKED — see functional category above
- P238-G002 TRACKED — see functional category above
- P238-G003 OPEN — see functional category above
- P238-G004 TRACKED — see functional category above

## P239 — Enrollment status transition UI guardrails (2026-11-19)

- P239-G001 TRACKED — see functional category above
- P239-G002 TRACKED — see functional category above
- P239-G003 TRACKED — see functional category above

## P240 — Capacity-aware student enrollment allocation UI (source implemented)

- P240-G001 TRACKED — see functional category above
- P240-G002 TRACKED — see functional category above
- P240-G003 TRACKED — see functional category above
- P240-G004 TRACKED — see functional category above
- P240-G005 TRACKED — see functional category above

## P241 — Configured-section enrollment preflight guard

- P241-G001 TRACKED — see functional category above
- P241-G002 TRACKED — see functional category above

## P255 — User & Staff Management

- P255-G001 READY_FOR_VERIFICATION — see functional category above
- P255-G002 OPEN — see functional category above
- P255-G003 PARTIALLY_IMPLEMENTED — see functional category above

## P256 — SaaS Super Admin

- P256-G001 READY_FOR_VERIFICATION — see functional category above
- P256-G002 OPEN — see functional category above

## P257 — Subscription & Billing Basic Workspace

- P257-G001 READY_FOR_VERIFICATION — see functional category above
- P257-G002 READY_FOR_VERIFICATION — see functional category above
- P257-G003 OPEN — see functional category above
- P257-G004 OPEN — see functional category above
- P257-G005 OPEN — see functional category above

## P258 — School Settings & Configuration

- P258-G001 READY_FOR_VERIFICATION — see functional category above
- P258-G002 READY_FOR_VERIFICATION — see functional category above
- P258-G003 OPEN — see functional category above

## P259 — Student Records Core

- P259-G001 READY_FOR_VERIFICATION — see functional category above
- P259-G002 OPEN — see functional category above

## P260 — Guardian & Family

- P260-G001 READY_FOR_VERIFICATION — see functional category above
- P260-G002 TRACKED — see functional category above
- P260-G003 TRACKED — see functional category above

## P261 — Admissions

- P261-G001 READY_FOR_VERIFICATION — see functional category above
- P261-G002 TRACKED — see functional category above
- P261-G003 TRACKED — see functional category above

## P262 — Enrollment coverage audit (2026-11-19)

- P262-G001 OPEN — see functional category above
- P262-G002 OPEN — see functional category above

## P264 — Student Documents

- P264-G001 TRACKED — see functional category above
- P264-G002 TRACKED — see functional category above

## P265 — Student Operations

- P265-G001 OPEN — see functional category above
- P265-G002 OPEN — see functional category above
- P265-G003 TRACKED — see functional category above

## P266 — Academic Structure

- P266-G001 OPEN — see functional category above
- P266-G002 TRACKED — see functional category above

## P267 — Subjects & Curriculum

- P267-G001 OPEN — see functional category above
- P267-G002 TRACKED — see functional category above

## P268 — Timetable

- P268-G001 OPEN — see functional category above
- P268-G002 TRACKED — see functional category above

## P269 — Teacher Academic Assignment

- P269-G001 OPEN — see functional category above
- P269-G002 OPEN — see functional category above

## P270 — Attendance

- P270-G001 OPEN — see functional category above
- P270-G002 OPEN — see functional category above

## P271 carried-forward / newly recorded gaps

- P271-G001 OPEN — see functional category above
- P271-G002 OPEN — see functional category above

## P272 — Homework & Assignments

- P272-G001 OPEN — see functional category above
- P272-G002 TRACKED — see functional category above
- P272-G003 OPEN — see functional category above

## P273 — Exams & Assessment (OPEN)

- P273-G001 READY_FOR_VERIFICATION — see functional category above
- P273-G002 OPEN — see functional category above
- P273-G003 OPEN — see functional category above

## P274 — Results & Grades (OPEN)

- P274-G001 OPEN — see functional category above
- P274-G002 OPEN — see functional category above
- P274-G003 OPEN — see functional category above
- P274-G004 OPEN — see functional category above

## P278 — Finance & Expenses

- P278-G001 OPEN — see functional category above
- P278-G002 OPEN — see functional category above
- P278-G003 OPEN — see functional category above

## P279 — Financial Reports

- P279-G001 OPEN — see functional category above
- P279-G002 OPEN — see functional category above
- P279-G003 OPEN — see functional category above

## P280 — Communication Center

- P280-G001 OPEN — see functional category above
- P280-G002 OPEN — see functional category above
- P280-G001 TRACKED — see functional category above

## P281 — Notifications

- P281-G001 OPEN — see functional category above
- P281-G002 OPEN — see functional category above
- P281-G003 OPEN — see functional category above
- P281-G001 TRACKED — see functional category above
- P281-G003 TRACKED — see functional category above

## P282 — Parent Portal

- P282-G001 OPEN — see functional category above
- P282-G002 OPEN — see functional category above

## P283 — Teacher Portal

- P283-G001 OPEN — see functional category above
- P283-G002 OPEN — see functional category above

## P284 — Student Portal

- P284-G001 OPEN — see functional category above
- P284-G002 OPEN — see functional category above
- P284-G003 OPEN — see functional category above

## P285 — Messaging

- P285-G001 OPEN — see functional category above
- P285-G002 OPEN — see functional category above
- P285-G003 OPEN — see functional category above
- P285-G004 OPEN — see functional category above
- P285-G003 TRACKED — see functional category above

## P286 — Teacher Mobile App

- P286-G001 OPEN — see functional category above
- P286-G002 OPEN — see functional category above

## P287 — Parent Mobile App

- P287-G001 OPEN — see functional category above
- P287-G002 OPEN — see functional category above

## P288 — Parent Notification Preference Accessibility & Channel Availability

- P288-G001 OPEN — see functional category above
- P288-G002 OPEN — see functional category above

## P289 — Notification Channel Readiness API

- P289-G001 OPEN — see functional category above
- P289-G002 OPEN — see functional category above

## P290 — Parent Email Preference Availability Guard

- P290-G001 OPEN — see functional category above
- P290-G001 PARTIAL — see functional category above

## P291 — Parent Notification Channel Readiness Refresh

- P291-G001 OPEN — see functional category above

## P303 — Enrollment CSV Preview & Controlled Bulk Allocation

- P303-G001 OPEN — see functional category above
- P303-G002 OPEN — see functional category above
- P303-G003 OPEN — see functional category above
- P303-G004 OPEN — see functional category above

## P304 — Enrollment Rollover Validation Core

- P304-G001 OPEN — see functional category above
- P304-G002 OPEN — see functional category above
- P304-G003 OPEN — see functional category above

## P305 — Academic-Year Rollover Preview UI

- P305-G001 OPEN — see functional category above
- P305-G002 OPEN — see functional category above
- P305-G003 OPEN — see functional category above

## P306 — Academic-Year Rollover Execution Foundation

- P306-G001 OPEN — see functional category above
- P306-G002 OPEN — see functional category above
- P306-G003 OPEN — see functional category above
- P306-G002 PARTIAL — see functional category above

## P307 — Rollover Capacity Validation & Conflict Prevention

- P307-G001 OPEN — see functional category above
- P307-G002 OPEN — see functional category above
- P307-G001 PARTIAL — see functional category above

## P308 — Rollover Execution Revalidation & Recovery

- P308-G001 OPEN — see functional category above
- P308-G002 OPEN — see functional category above

## P309 — Rollover Audit Trail & Execution Report

- P309-G001 OPEN — see functional category above
- P309-G002 OPEN — see functional category above

## P310 rollover directory lookup

- P310-G001 READY_FOR_VERIFICATION — see functional category above
- P310-G002 OPEN — see functional category above

## P311 — Student Operations Cycle 1

- P311-G001 PARTIAL — see functional category above
- P311-G002 PARTIAL — see functional category above
- P311-G003 OPEN — see functional category above
- P311-G004 OPEN — see functional category above

## P312 — Fee Structure Draft Editing

- P312-G001 PARTIAL — see functional category above
- P312-G002 OPEN — see functional category above
- P312-G003 DEFERRED — see functional category above

## P313 — Fee Assignment Catalog Selectors (Cycle 1)

- P313-G001 OPEN — see functional category above
- P313-G002 PARTIAL — see functional category above
- P313-G003 DEFERRED — see functional category above

## P314 — Fee Collection Payment History & Receipt

- P314-G001 PARTIAL — see functional category above
- P314-G002 OPEN — see functional category above
- P314-G003 DEFERRED — see functional category above

## P315 — Attendance Grade/Section Catalog Selection

- P315-G001 PARTIAL — see functional category above
- P315-G002 OPEN — see functional category above
- P315-G003 DEFERRED — see functional category above

## P316 — Timetable Filters & Class/Teacher Views (Cycle 1)

- P316-G001 PARTIAL — see functional category above
- P316-G002 OPEN — see functional category above
- P316-G003 DEFERRED — see functional category above

## P317 gaps

- P317-G001 READY_FOR_VERIFICATION — see functional category above
- P317-G002 OPEN — see functional category above

## P321 — Exam Marks Entry Save-State Safeguards

- P321-G001 READY_FOR_VERIFICATION — see functional category above
- P321-G002 OPEN — see functional category above
- P321-G003 OPEN — see functional category above
- P321-G004 OPEN — see functional category above

## P326 Parent homework details

- P326-G001 READY_FOR_VERIFICATION — see functional category above
- P326-G002 READY_FOR_VERIFICATION — see functional category above
- P326-G003 OPEN — see functional category above
- P326-G003 READY_FOR_VERIFICATION — see functional category above

## P327 Student Homework Submission

- P327-G001 READY_FOR_VERIFICATION — see functional category above
- P327-G002 READY_FOR_VERIFICATION — see functional category above
- P327-G003 OPEN — see functional category above

## P329 — Parent Homework Attachment Access

- P329-G001 READY_FOR_VERIFICATION — see functional category above
- P329-G002 OPEN — see functional category above

## P330 — Student Homework Attachment Submission (Cycle 1)

- P330-G001 READY_FOR_VERIFICATION — see functional category above
- P330-G002 OPEN — see functional category above

## P332 — Admission eligibility & checklist UX completion

- P332-G001 TRACKED — see functional category above
- P332-G002 TRACKED — see functional category above
- P332-G003 TRACKED — see functional category above
- P332-G004 OPEN — see functional category above

## P333 — Guardian Identity & Duplicate Applicant Review

- P333-G001 TRACKED — see functional category above
- P333-G002 TRACKED — see functional category above
- P333-G003 TRACKED — see functional category above
- P333-G004 OPEN — see functional category above
- P333-G005 TRACKED — see functional category above

## P334 — Admission Reviewer Personal Queue

- P334-G001 TRACKED — see functional category above
- P334-G002 TRACKED — see functional category above
- P334-G003 TRACKED — see functional category above

## P335 — Reviewer Workload & SLA

- P335-G001 TRACKED — see functional category above
- P335-G002 TRACKED — see functional category above
- P335-G003 TRACKED — see functional category above
- P335-G004 TRACKED — see functional category above
- P335-G005 OPEN — see functional category above

## P336 — Admission Decision & Review History Completion

- P336-G001 TRACKED — see functional category above
- P336-G002 OPEN — see functional category above
- P336-G003 TRACKED — see functional category above

## P337 — Applicant Withdrawal Lifecycle

- P337-G001 TRACKED — see functional category above
- P337-G002 TRACKED — see functional category above
- P337-G003 OPEN — see functional category above
- P337-G004 OPEN — see functional category above
- P337-G005 TRACKED — see functional category above

## P338 — Admission Offer Lifecycle (Applicant Portal)

- P338-G001 TRACKED — see functional category above
- P338-G002 TRACKED — see functional category above
- P338-G003 TRACKED — see functional category above
- P338-G004 OPEN — see functional category above
- P338-G005 TRACKED — see functional category above

## P339 — Seat Reservation Lifecycle Completion

- P339-G001 TRACKED — see functional category above
- P339-G002 TRACKED — see functional category above
- P339-G003 TRACKED — see functional category above
- P339-G004 OPEN — see functional category above
- P339-G005 TRACKED — see functional category above

## P340 — Admissions Capacity Dashboard

- P340-G001 TRACKED — see functional category above
- P340-G002 OPEN — see functional category above
- P340-G003 TRACKED — see functional category above
- P340-G004 OPEN — see functional category above

## P341 — Admission Document Recovery

- P341-G001 TRACKED — see functional category above
- P341-G002 TRACKED — see functional category above
- P341-G003 TRACKED — see functional category above
- P341-G004 TRACKED — see functional category above
- P341-G005 OPEN — see functional category above

## P343 — Admission Payment Lifecycle

- P343-G001 TRACKED — see functional category above
- P343-G002 TRACKED — see functional category above
- P343-G003 TRACKED — see functional category above
- P343-G004 OPEN — see functional category above

## P344 — Admission Receipts & Refunds

- P344-G001 TRACKED — see functional category above
- P344-G002 OPEN — see functional category above
- P344-G003 OPEN — see functional category above
- P344-G004 OPEN — see functional category above

## P345 — Admissions Notification Completion

- P345-G001 TRACKED — see functional category above
- P345-G002 TRACKED — see functional category above
- P345-G003 OPEN — see functional category above
- P345-G004 OPEN — see functional category above

## P346 — Admissions Consent & Preference Integration

- P346-G001 PARTIAL — see functional category above
- P346-G002 OPEN — see functional category above

## P347 — Admissions Exception Monitoring

- P347-G001 PARTIAL — see functional category above
- P347-G002 OPEN — see functional category above
- P347-G003 OPEN — see functional category above

## P348 — Admissions Staff Mobile Exception Monitor

- P348-G001 OPEN — see functional category above
- P348-G002 OPEN — see functional category above
- P348-G003 OPEN — see functional category above

## P349 — Admissions Public Security Completion

- P349-G001 OPEN — see functional category above
- P349-G002 OPEN — see functional category above
- P349-G003 OPEN — see functional category above

## P350 major-functionality inventory follow-up gaps

- P350-G001 OPEN — see functional category above
- P350-G002 READY_FOR_VERIFICATION — see functional category above
- P350-G003 OPEN — see functional category above
- P350-G004 IN_PROGRESS — see functional category above
- P350-G005 IN_PROGRESS — see functional category above
- P350-G006 IN_PROGRESS — see functional category above
- P350-G007 IN_PROGRESS — see functional category above
- P350-G008 IN_PROGRESS — see functional category above
- P350-G005 TRACKED — see functional category above

## P352 — Canteen & Meals

- P352-G001 OPEN — see functional category above
- P352-G002 OPEN — see functional category above
- P352-G003 OPEN — see functional category above
- P352-G004 OPEN — see functional category above
- P352-G005 OPEN — see functional category above
- P352-G006 OPEN — see functional category above
- P352-G001 TRACKED — see functional category above

## P353 — Payroll

- P353-G001 PARTIAL — see functional category above
- P353-G002 OPEN — see functional category above
- P353-G003 OPEN — see functional category above
- P353-G004 OPEN — see functional category above
- P353-G005 OPEN — see functional category above
- P353-G006 OPEN — see functional category above

## P354 — HR Lifecycle

- P354-G001 PARTIAL — see functional category above
- P354-G002 OPEN — see functional category above
- P354-G003 OPEN — see functional category above
- P354-G004 OPEN — see functional category above
- P354-G005 OPEN — see functional category above
- P354-G006 OPEN — see functional category above

## P355 — Parent/Student/Teacher Mobile Coverage

- P355-G001 OPEN — see functional category above
- P355-G002 OPEN — see functional category above
- P355-G003 OPEN — see functional category above
- P355-G004 OPEN — see functional category above
- P355-G005 OPEN — see functional category above

## P356 — Library Management

- P356-G001 PARTIAL — see functional category above
- P356-G002 OPEN — see functional category above
- P356-G003 OPEN — see functional category above
- P356-G004 OPEN — see functional category above
- P356-G005 OPEN — see functional category above
- P356-G006 OPEN — see functional category above

## P357 transport gaps carried forward

- P357-G001 OPEN — see functional category above
- P357-G002 OPEN — see functional category above
- P357-G003 OPEN — see functional category above
- P357-G004 OPEN — see functional category above
- P357-G005 OPEN — see functional category above
- P357-G006 OPEN — see functional category above
- P357-G007 OPEN — see functional category above
- P357-G008 OPEN — see functional category above
- P357-G009 OPEN — see functional category above
- P357-G010 READY_FOR_VERIFICATION — see functional category above

## P358 hostel gaps carried forward

- P358-G001 OPEN — see functional category above
- P358-G002 OPEN — see functional category above
- P358-G003 OPEN — see functional category above
- P358-G004 OPEN — see functional category above
- P358-G005 OPEN — see functional category above
- P358-G006 OPEN — see functional category above
- P358-G007 OPEN — see functional category above
- P358-G008 READY_FOR_VERIFICATION — see functional category above

## P359 — C2-01 Workspace Stabilization

- P359-G001 OPEN — see functional category above
- P359-G002 READY_FOR_VERIFICATION — see functional category above
- P359-G003 READY_FOR_VERIFICATION — see functional category above
- P359-G004 CLOSED — see functional category above
- P359-G005 OPEN — see functional category above
- P359-G006 READY_FOR_VERIFICATION — see functional category above
- P359-G007 READY_FOR_VERIFICATION — see functional category above
- P359-G002 OPEN — see functional category above
- P359-G003 OPEN — see functional category above
- P359-G006 OPEN — see functional category above
- P359-G007 OPEN — see functional category above
- P359-G005 PARTIAL — see functional category above

## P360 — phase gap index

- P360-G001 CLOSED — see functional category above

## P361 — C2-01 CI source gate improvement

- P361-G001 CLOSED — see functional category above

## P362 — C2-01 Register Mirror Integrity

- P362-G001 CLOSED — see functional category above
- P362-G002 CLOSED — see functional category above
- P362-G003 OPEN — see functional category above

## P363 — CI Workflow Contract Audit

- P363-G001 CLOSED — see functional category above
- P363-G002 CLOSED — see functional category above
- P363-G003 OPEN — see functional category above

## P364 — C2-01 Bootstrap Diagnostics

- P364-G001 CLOSED — see functional category above
- P364-G002 OPEN — see functional category above

## P365 — Container Runtime Contract Audit

- P365-G001 CLOSED — see functional category above
- P365-G002 CLOSED — see functional category above
- P365-G003 OPEN — see functional category above

## P366 — C2-01 Stabilization Closure Audit

- P366-G001 CLOSED — see functional category above
- P366-G002 CLOSED — see functional category above
- P366-G003 OPEN — see functional category above

## P367 — C2-02 Database & Tenant Isolation Source Audit

- P367-G001 CLOSED — see functional category above
- P367-G002 CLOSED — see functional category above
- P367-G003 CLOSED — see functional category above
- P367-G004 OPEN — see functional category above

## P368 — C2-03 Authentication & Security Source Audit

- P368-G001 CLOSED — see functional category above
- P368-G002 CLOSED — see functional category above
- P368-G003 OPEN — see functional category above

## P370 — Guided School Onboarding Readiness (C2-04 / F03)

- P370-G001 PARTIAL — see functional category above
- P370-G002 OPEN — see functional category above
- P370-G003 OPEN — see functional category above
- P370-G004 OPEN — see functional category above

## P371 — Guided Onboarding Step Navigation (C2-04 / F03)

- P371-G001 CLOSED — see functional category above
- P371-G002 OPEN — see functional category above
- P371-G003 OPEN — see functional category above
- P371-G004 OPEN — see functional category above

## P372 — Onboarding Dependency Gates (C2-04 / F03)

- P372-G001 CLOSED — see functional category above
- P372-G002 OPEN — see functional category above
- P372-G003 OPEN — see functional category above
- P372-G004 OPEN — see functional category above

## P373 — Onboarding Progress Persistence (C2-04 / F03)

- P373-G001 CLOSED — see functional category above
- P373-G002 OPEN — see functional category above
- P373-G003 OPEN — see functional category above
- P373-G004 OPEN — see functional category above
- P373-G005 OPEN — see functional category above

## P374 — Server-derived onboarding readiness (C2-04 / F03)

- P374-G001 CLOSED — see functional category above
- P374-G002 OPEN — see functional category above
- P374-G003 OPEN — see functional category above
- P374-G004 OPEN — see functional category above
- P374-G005 OPEN — see functional category above

## P375 — Actionable onboarding readiness details (C2-04 / F03)

- P375-G001 CLOSED — see functional category above
- P375-G002 OPEN — see functional category above
- P375-G003 OPEN — see functional category above
- P375-G004 OPEN — see functional category above
- P375-G005 OPEN — see functional category above

## P376 — Server-owned onboarding dependencies and next-step recommendation (C2-04/F03)

- P376-G001 CLOSED — see functional category above
- P376-G002 OPEN — see functional category above
- P376-G003 OPEN — see functional category above
- P376-G004 OPEN — see functional category above
- P376-G005 OPEN — see functional category above

## P377 update — Server-persisted onboarding resume

- P377-G001 CLOSED — see functional category above
- P377-G002 CLOSED — see functional category above
- P377-G003 CLOSED — see functional category above
- P377-G004 OPEN — see functional category above
- P377-G005 OPEN — see functional category above

## P378 — F03 Onboarding Task Ownership

- P378-G001 CLOSED — see functional category above
- P378-G002 OPEN — see functional category above
- P378-G003 OPEN — see functional category above
- P378-G004 OPEN — see functional category above
- P378-G005 OPEN — see functional category above

## P379 — Prisma schema declaration deduplication

- P379-G001 CLOSED — see functional category above
- P379-G002 OPEN — see functional category above

## P380 — F03 Board and grade readiness

- P380-G001 CLOSED — see functional category above
- P380-G002 OPEN — see functional category above
- P380-G003 OPEN — see functional category above
- P380-G004 OPEN — see functional category above

## P381 — F03 Room and fee readiness

- P381-G001 CLOSED — see functional category above
- P381-G002 OPEN — see functional category above
- P381-G003 OPEN — see functional category above
- P381-G004 OPEN — see functional category above

## P382 — F03 Onboarding readiness export

- P382-G001 CLOSED — see functional category above
- P382-G002 OPEN — see functional category above
- P382-G003 OPEN — see functional category above
- P382-G004 OPEN — see functional category above

## P384 — F03 Assignment save feedback

- P384-G001 CLOSED — see functional category above
- P384-G002 OPEN — see functional category above
- P384-G003 OPEN — see functional category above
- P384-G004 OPEN — see functional category above

## P385 — F03 Concurrent task assignment saves

- P385-G001 CLOSED — see functional category above
- P385-G002 OPEN — see functional category above
- P385-G003 OPEN — see functional category above

## P386 — F03 Onboarding assignment error isolation

- P386-G001 CLOSED — see functional category above
- P386-G002 OPEN — see functional category above
- P386-G003 OPEN — see functional category above

## P388 — F03 school-scope readiness reset

- P388-G001 CLOSED — see functional category above
- P388-G002 OPEN — see functional category above
- P388-G003 OPEN — see functional category above

## P389 — F03 Invitation Management Lifecycle

- P389-G001 CLOSED — see functional category above
- P389-G002 CLOSED — see functional category above
- P389-G003 OPEN — see functional category above
- P389-G004 OPEN — see functional category above
- P389-G005 OPEN — see functional category above

## P390 — F03 backend prerequisite enforcement

- P390-G001 CLOSED — see functional category above
- P390-G002 OPEN — see functional category above
- P390-G003 OPEN — see functional category above

## P391 update — F03 invitation delivery slice

- P391-G001 CLOSED — see functional category above
- P391-G002 OPEN — see functional category above
- P391-G003 OPEN — see functional category above
- P391-G004 IN_PROGRESS — see functional category above

## P392 — F03 dependency-aware orchestration

- P392-G001 CLOSED — see functional category above
- P392-G002 OPEN — see functional category above
- P392-G003 OPEN — see functional category above
- P392-G004 OPEN — see functional category above

## P394 — F03 onboarding task assignment CSV import

- P394-G001 CLOSED — see functional category above
- P394-G002 OPEN — see functional category above
- P394-G003 OPEN — see functional category above
- P394-G004 IN_PROGRESS — see functional category above

## P396 — School configuration JSON transfer (limited scope)

- P396-G001 CLOSED — see functional category above
- P396-G002 OPEN — see functional category above
- P396-G003 OPEN — see functional category above
- P396-G004 IN_PROGRESS — see functional category above

## P397 F03 configuration-transfer update

- P397-G001 CLOSED — see functional category above
- P397-G002 OPEN — see functional category above
- P397-G003 OPEN — see functional category above
- P397-G004 OPEN — see functional category above
- P397-G005 IN_PROGRESS — see functional category above
- P397-G002 CLOSED — see functional category above

## P398 update — Calendar/event configuration transfer

- P398-G001 CLOSED — see functional category above
- P398-G002 OPEN — see functional category above
- P398-G003 IN_PROGRESS — see functional category above

## P402 update — campus inheritance override editing utilities

- P402-G001 CLOSED — see functional category above
- P402-G002 OPEN — see functional category above

## P404 — persisted inheritance cycle guard

- P404-G001 CLOSED — see functional category above
- P404-G002 IN_PROGRESS — see functional category above

## P405 — Effective persisted campus inheritance resolution

- P405-G001 CLOSED — see functional category above
- P405-G002 IN_PROGRESS — see functional category above

## P406 update — Campus effective configuration view

- P406-G001 CLOSED — see functional category above
- P406-G002 IN_PROGRESS — see functional category above

## P407 update — Campus registry foundation

- P407-G001 CLOSED — see functional category above
- P407-G002 IN_PROGRESS — see functional category above

## P408 — Campus Registry Administration UI

- P408-G001 CLOSED — see functional category above
- P408-G002 IN_PROGRESS — see functional category above

## P409 — Campus-effective configuration context

- P409-G001 CLOSED — see functional category above
- P409-G002 IN_PROGRESS — see functional category above

## P411 — F04 started

- P411-G001 OPEN — see functional category above
- P411-G002 OPEN — see functional category above
- P411-G003 DEFERRED — see functional category above

## P412 — Curriculum outcome/competency mapping foundation

- P412-G001 CLOSED — see functional category above
- P412-G002 OPEN — see functional category above

## P413 — Curriculum outcomes administration UI

- P413-G001 CLOSED — see functional category above
- P413-G002 OPEN — see functional category above

## P414 — Curriculum outcome editing and draft deletion

- P414-G001 CLOSED — see functional category above
- P414-G002 OPEN — see functional category above

## P415 — Curriculum outcomes CSV bulk import/export

- P415-G001 CLOSED — see functional category above
- P415-G002 PARTIAL — see functional category above

## P416 — Curriculum outcome ↔ assessment alignment

- P416-G001 CLOSED — see functional category above
- P416-G002 OPEN — see functional category above

## P418 — Curriculum lesson planning and outcome integration

- P418-G001 CLOSED — see functional category above
- P418-G002 OPEN — see functional category above

## P419 — Curriculum Lesson Planning Weekly Planner & Calendar

- P419-G001 CLOSED — see functional category above
- P419-G002 OPEN — see functional category above

## P420 — Lesson Plan Teacher Assignment

- P420-G001 CLOSED — see functional category above
- P420-G002 OPEN — see functional category above

## P421 — Teacher Lesson Workspace

- P421-G001 CLOSED — see functional category above
- P421-G002 OPEN — see functional category above

## P422 — Teacher Lesson Reflection & Notes

- P422-G001 CLOSED — see functional category above
- P422-G002 OPEN — see functional category above

## P423 carried-forward gaps

- P423-G002 READY_FOR_VERIFICATION — see functional category above
- P423-G003 OPEN — see functional category above

## P424 — Reflection Follow-up Tasks & Action Ownership

- P424-G001 READY_FOR_VERIFICATION — see functional category above
- P424-G002 OPEN — see functional category above

## P425 — Follow-up Task Monitoring & Overdue Management

- P425-G001 READY_FOR_VERIFICATION — see functional category above
- P425-G002 OPEN — see functional category above
- P425-G003 OPEN — see functional category above
- P425-G004 OPEN — see functional category above

## P426 — Follow-up Notifications & Teacher Alerts

- P426-G001 READY_FOR_VERIFICATION — see functional category above
- P426-G002 OPEN — see functional category above
- P426-G003 OPEN — see functional category above

## P427 — Automated Notification Scheduling

- P427-G001 READY_FOR_VERIFICATION — see functional category above
- P427-G002 OPEN — see functional category above
- P427-G003 OPEN — see functional category above

## P428 — Notification Preferences & Reminder Controls

- P428-G001 READY_FOR_VERIFICATION — see functional category above
- P428-G002 OPEN — see functional category above
- P428-G003 OPEN — see functional category above
- P428-G004 OPEN — see functional category above

## P429 — Coordinator Reminder Policy UI & Dashboard

- P429-G001 CLOSED — see functional category above
- P429-G002 OPEN — see functional category above
- P429-G003 OPEN — see functional category above
- P429-G004 OPEN — see functional category above

## P430 — Privacy-Aware Reminder Preference Summary

- P430-G001 OPEN — see functional category above
- P430-G002 OPEN — see functional category above
- P430-G003 OPEN — see functional category above
- P430-G004 OPEN — see functional category above

## P431 — Teacher Cohort Definition & Aggregate Privacy Safeguards

- P431-G001 CLOSED — see functional category above
- P431-G002 CLOSED — see functional category above
- P431-G003 OPEN — see functional category above
- P431-G004 OPEN — see functional category above
- P431-G005 OPEN — see functional category above

## P432 — Reminder Policy Audit Trail & Change History

- P432-G001 OPEN — see functional category above
- P432-G002 OPEN — see functional category above
- P432-G003 OPEN — see functional category above
- P432-G004 OPEN — see functional category above

## P433 — Reminder Audit History Improvements

- P433-G001 CLOSED — see functional category above
- P433-G002 OPEN — see functional category above
- P433-G003 OPEN — see functional category above
- P433-G004 OPEN — see functional category above
- P433-G005 OPEN — see functional category above
- P433-G004 CLOSED — see functional category above

## P434 — Large Audit Export Jobs & Export Activity Tracking

- P434-G001 OPEN — see functional category above
- P434-G002 OPEN — see functional category above
- P434-G003 OPEN — see functional category above
- P434-G004 OPEN — see functional category above
- P434-G005 OPEN — see functional category above

## P435 — Export Job Management & Recovery Controls

- P435-G001 OPEN — see functional category above
- P435-G002 OPEN — see functional category above
- P435-G003 OPEN — see functional category above
- P435-G004 OPEN — see functional category above
- P435-G005 OPEN — see functional category above

## P436 — Export Job Operational Observability & Admin Diagnostics

- P436-G001 OPEN — see functional category above
- P436-G002 OPEN — see functional category above
- P436-G003 OPEN — see functional category above
- P436-G004 OPEN — see functional category above

## P437 — Export Queue Capacity & Backpressure

- P437-G001 OPEN — see functional category above
- P437-G002 OPEN — see functional category above
- P437-G003 OPEN — see functional category above
- P437-G004 OPEN — see functional category above

## P438 carried-forward gaps

- P438-G001 OPEN — see functional category above
- P438-G002 OPEN — see functional category above
- P438-G003 OPEN — see functional category above

## P439 open validation gaps

- P439-G001 OPEN — see functional category above
- P439-G002 OPEN — see functional category above
- P439-G003 OPEN — see functional category above
- P439-G004 OPEN — see functional category above

## P440 open validation gaps

- P440-G001 OPEN — see functional category above
- P440-G002 OPEN — see functional category above
- P440-G003 OPEN — see functional category above
- P440-G004 OPEN — see functional category above

## P444 — Alert Acknowledgement, Assignment & Resolution

- P444-G001 TRACKED — see functional category above
- P444-G002 OPEN — see functional category above
- P444-G003 OPEN — see functional category above
- P444-G004 OPEN — see functional category above
- P444-G005 OPEN — see functional category above

## P445 — Alert SLA, Ownership & Follow-up Management

- P445-G002 TRACKED — see functional category above
- P445-G001 OPEN — see functional category above
- P445-G002 OPEN — see functional category above
- P445-G003 OPEN — see functional category above
- P445-G004 OPEN — see functional category above
- P445-G005 OPEN — see functional category above

## P446 — Alert Notification Automation & SLA Escalation Workflow

- P446-G001 OPEN — see functional category above
- P446-G002 OPEN — see functional category above
- P446-G003 OPEN — see functional category above
- P446-G004 OPEN — see functional category above
- P446-G005 OPEN — see functional category above
- P446-G006 OPEN — see functional category above
- P446-G004 TRACKED — see functional category above
- P446-G006 TRACKED — see functional category above

## P447 — Automated Escalation Routing, Policy Configuration & Reliability

- P447-G001 OPEN — see functional category above
- P447-G002 OPEN — see functional category above
- P447-G003 OPEN — see functional category above
- P447-G004 OPEN — see functional category above
- P447-G005 OPEN — see functional category above
- P447-G002 TRACKED — see functional category above
- P447-G001 TRACKED — see functional category above

## P448 — Alert Policy Management, Recipient Routing & Recovery

- P448-G001 OPEN — see functional category above
- P448-G002 OPEN — see functional category above
- P448-G003 OPEN — see functional category above
- P448-G004 OPEN — see functional category above
- P448-G005 OPEN — see functional category above

## P449 open gaps

- P449-G001 TRACKED — see functional category above
- P449-G002 TRACKED — see functional category above
- P449-G003 TRACKED — see functional category above
- P449-G004 TRACKED — see functional category above
- P449-G005 TRACKED — see functional category above

## P450 — Alert Delivery Routing & Recipient Notification Integration

- P450-G001 OPEN — see functional category above
- P450-G002 OPEN — see functional category above
- P450-G003 OPEN — see functional category above
- P450-G004 OPEN — see functional category above
- P450-G005 OPEN — see functional category above

## P451 — Notification Channels, Preferences & Delivery Lifecycle

- P451-G001 OPEN — see functional category above
- P451-G002 OPEN — see functional category above
- P451-G003 OPEN — see functional category above
- P451-G004 OPEN — see functional category above
- P451-G005 OPEN — see functional category above

## P452 delta gaps (open)

- P452-G001 OPEN — see functional category above
- P452-G002 OPEN — see functional category above
- P452-G003 OPEN — see functional category above
- P452-G004 OPEN — see functional category above

## P453 delta gaps (open)

- P453-G001 OPEN — see functional category above
- P453-G002 OPEN — see functional category above
- P453-G003 OPEN — see functional category above
- P453-G004 OPEN — see functional category above

## P454 — C2-03 Route Security Inventory

- P454-G001 PARTIALLY_IMPLEMENTED — see functional category above
- P454-G002 OPEN — see functional category above

## P455 — Handler-level Security Review Coverage Inventory

- P455-G001 OPEN — see functional category above
- P455-G002 OPEN — see functional category above
- P455-G003 OPEN — see functional category above

## P456 — Route Registration & Middleware Order Verification

- P456-G001 OPEN — see functional category above
- P456-G002 OPEN — see functional category above
- P456-G003 OPEN — see functional category above

## P457 — RBAC Role & Permission Matrix Contract (2026-11-22)

- P457-G001 READY_FOR_VERIFICATION — see functional category above
- P457-G002 READY_FOR_VERIFICATION — see functional category above
- P457-G003 OPEN — see functional category above
- P457-G004 OPEN — see functional category above

## P458 C2-03 F08 — Session/Refresh Security Review

- P458-G001 READY_FOR_VERIFICATION — see functional category above
- P458-G002 READY_FOR_VERIFICATION — see functional category above
- P458-G003 OPEN — see functional category above
- P458-G004 OPEN — see functional category above
- P458-G005 OPEN — see functional category above

## P459 C2-03 F09 — Credential Lifecycle & Account Recovery Review

- P459-G001 READY_FOR_VERIFICATION — see functional category above
- P459-G002 OPEN — see functional category above
- P459-G003 READY_FOR_VERIFICATION — see functional category above
- P459-G004 OPEN — see functional category above
- P459-G005 OPEN — see functional category above

## P460 — C2-03 F10 — MFA Enforcement & Policy Validation Inventory

- P460-G001 READY_FOR_VERIFICATION — see functional category above
- P460-G002 OPEN — see functional category above
- P460-G003 READY_FOR_VERIFICATION — see functional category above
- P460-G004 OPEN — see functional category above

## P461 — C2-03 F11 — Authentication & Authorization Security Consolidation

- P461-G001 OPEN — see functional category above
- P461-G002 OPEN — see functional category above
- P461-G003 OPEN — see functional category above
- P461-G004 OPEN — see functional category above
- P461-G005 OPEN — see functional category above
- P461-G006 OPEN — see functional category above
- P461-G007 OPEN — see functional category above

## P462 — C2-04 F01 — Authentication Runtime Verification Foundation

- P462-G001 READY_FOR_VERIFICATION — see functional category above
- P462-G002 OPEN — see functional category above
- P462-G003 OPEN — see functional category above
- P462-G004 OPEN — see functional category above

## P464 — C2-04 F03 — Authentication Negative-Path & Validation Coverage

- P464-G001 READY_FOR_VERIFICATION — see functional category above
- P464-G002 OPEN — see functional category above
- P464-G003 OPEN — see functional category above

## P465 — Authentication Rate-Limit Integration Coverage

- P465-G001 READY_FOR_VERIFICATION — see functional category above
- P465-G002 OPEN — see functional category above
- P465-G003 OPEN — see functional category above

## P466 — C2-04 F05 — Authorization Boundary Test Foundation

- P466-G001 READY_FOR_VERIFICATION — see functional category above
- P466-G002 OPEN — see functional category above
- P466-G003 OPEN — see functional category above
- P466-G004 OPEN — see functional category above

## P467 — C2-04 F06 — Authorization Role-Matrix Coverage Expansion

- P467-G001 READY_FOR_VERIFICATION — see functional category above
- P467-G002 READY_FOR_VERIFICATION — see functional category above
- P467-G003 OPEN — see functional category above
- P467-G004 OPEN — see functional category above

## P469 — C2-04 F08 — Protected School Configuration Route Authorization Coverage

- P469-G001 READY_FOR_VERIFICATION — see functional category above
- P469-G002 OPEN — see functional category above
- P469-G003 OPEN — see functional category above
- P469-G004 OPEN — see functional category above

## P470 — C2-04 F09 — Authentication/Authorization Error Contract Coverage

- P470-G001 READY_FOR_VERIFICATION — see functional category above
- P470-G002 OPEN — see functional category above
- P470-G003 OPEN — see functional category above
- P470-G004 OPEN — see functional category above

## P471 — C2-04 F10: Auth/authorization acceptance readiness

- P471-G001 READY_FOR_VERIFICATION — see functional category above
- P471-G002 OPEN — see functional category above
- P471-G003 OPEN — see functional category above
- P471-G004 READY_FOR_VERIFICATION — see functional category above

## P472 — C2-04 F11: Security cycle closure and runtime handoff

- P472-G001 READY_FOR_VERIFICATION — see functional category above
- P472-G002 OPEN — see functional category above
- P472-G003 OPEN — see functional category above
- P472-G004 OPEN — see functional category above
- P472-G005 READY_FOR_VERIFICATION — see functional category above
- P472-G006 READY_FOR_VERIFICATION — see functional category above

## P473 — C2-05 — Parent Mobile Daily Journey Audit & Foundation

- P473-G001 OPEN — see functional category above
- P473-G002 OPEN — see functional category above
- P473-G003 OPEN — see functional category above
- P473-G004 OPEN — see functional category above
- P473-G005 OPEN — see functional category above

## P474 — C2-05 — Parent Mobile Multi-Child Dashboard & Secure Child Context

- P474-G001 OPEN — see functional category above
- P474-G002 OPEN — see functional category above
- P474-G003 OPEN — see functional category above
- P474-G004 OPEN — see functional category above
- P474-G005 OPEN — see functional category above

## P475 — C2-05 — Parent Mobile Academic Planner

- P475-G001 OPEN — see functional category above
- P475-G002 OPEN — see functional category above
- P475-G003 OPEN — see functional category above
- P475-G004 OPEN — see functional category above

## P476 — C2-05 — Parent Academic Planner API Integration

- P476-G001 OPEN — see functional category above
- P476-G002 OPEN — see functional category above
- P476-G003 OPEN — see functional category above
- P476-G004 OPEN — see functional category above

## P477 — C2-05 — Parent Finance Summary & Payment Transparency

- P477-G001 OPEN — see functional category above
- P477-G002 OPEN — see functional category above
- P477-G003 OPEN — see functional category above
- P477-G004 OPEN — see functional category above

## P478 — C2-05 — Parent Academic Activity Summary

- P478-G001 OPEN — see functional category above
- P478-G002 OPEN — see functional category above
- P478-G003 OPEN — see functional category above

## P479 — C2-05 — Parent Communication Summary

- P479-G001 OPEN — see functional category above
- P479-G002 OPEN — see functional category above
- P479-G003 OPEN — see functional category above
- P479-G004 OPEN — see functional category above

## P480 — C2-05 — Parent Canteen, Health & Wellbeing

- P480-G001 OPEN — see functional category above
- P480-G002 OPEN — see functional category above
- P480-G003 OPEN — see functional category above
- P480-G004 OPEN — see functional category above

## P481 — C2-05 — Parent Specialist Journey UI Contract Foundation

- P481-G001 OPEN — see functional category above
- P481-G002 OPEN — see functional category above
- P481-G003 OPEN — see functional category above
- P481-G004 OPEN — see functional category above
- P481-G005 OPEN — see functional category above

## P482 — C2-05 Parent Mobile Cycle Closure

- P482-G001 TRACKED — see functional category above
- P482-G002 OPEN — see functional category above
- P482-G003 OPEN — see functional category above
- P482-G004 OPEN — see functional category above
- P482-G005 OPEN — see functional category above
- P482-G006 OPEN — see functional category above

## P483 — C2-06 Student Mobile Daily Journey Audit & Foundation

- P483-G001 OPEN — see functional category above
- P483-G002 OPEN — see functional category above
- P483-G003 OPEN — see functional category above

## P484 — C2-06 Student Academic Planner

- P484-G001 OPEN — see functional category above
- P484-G002 OPEN — see functional category above
- P484-G003 OPEN — see functional category above
- P484-G004 OPEN — see functional category above
- P484-G005 OPEN — see functional category above

## P485 — C2-06 Student Exams, Results & Report Cards

- P485-G001 OPEN — see functional category above
- P485-G002 TRACKED — see functional category above
- P485-G003 TRACKED — see functional category above
- P485-G004 TRACKED — see functional category above

## P486 — C2-06 Student Homework & Assignment Lifecycle Refinements

- P486-G001 OPEN — see functional category above
- P486-G002 OPEN — see functional category above
- P486-G003 OPEN — see functional category above
- P486-G004 OPEN — see functional category above

## P487 — C2-06 Student Communication Center

- P487-G001 TRACKED — see functional category above
- P487-G002 OPEN — see functional category above
- P487-G003 OPEN — see functional category above

## P488 — C2-06 Student Services Hub

- P488-G001 TRACKED — see functional category above
- P488-G002 OPEN — see functional category above
- P488-G003 OPEN — see functional category above
- P488-G004 OPEN — see functional category above

## P489 — C2-06 Student Mobile Resilience

- P489-G001 OPEN — see functional category above
- P489-G002 OPEN — see functional category above
- P489-G003 OPEN — see functional category above
- P489-G004 OPEN — see functional category above

## P490 — C2-06 Student Mobile Cycle Closure Audit

- P490-G001 OPEN — see functional category above
- P490-G002 OPEN — see functional category above
- P490-G003 OPEN — see functional category above
- P490-G004 OPEN — see functional category above
- P490-G005 OPEN — see functional category above
- P490-G006 OPEN — see functional category above
- P490-G007 OPEN — see functional category above

## P491 — C2-07 Runtime & Dependency Stabilization

- P491-G001 OPEN — see functional category above
- P491-G002 OPEN — see functional category above
- P491-G003 OPEN — see functional category above

## P492 — C2-07 API & Database Integration

- P492-G001 OPEN — see functional category above
- P492-G002 OPEN — see functional category above
- P492-G003 OPEN — see functional category above
- P492-G004 OPEN — see functional category above
- P492-G005 OPEN — see functional category above

## P493 — C2-07 Student API Integration

- P493-G001 OPEN — see functional category above
- P493-G002 OPEN — see functional category above
- P493-G003 OPEN — see functional category above
- P493-G004 OPEN — see functional category above

## P494 — C2-07 Security & School Isolation

- P494-G001 OPEN — see functional category above
- P494-G002 OPEN — see functional category above
- P494-G003 OPEN — see functional category above
- P494-G004 OPEN — see functional category above

## P496 — Student Offline Cache & Synchronization Foundations (2026-11-22)

- P496-G001 OPEN — see functional category above
- P496-G002 OPEN — see functional category above
- P496-G003 OPEN — see functional category above
- P496-G004 OPEN — see functional category above
- P496-G005 OPEN — see functional category above

## P497 — Mobile Acceptance & Accessibility

- P497-G001 OPEN — see functional category above
- P497-G002 OPEN — see functional category above
- P497-G003 OPEN — see functional category above

## P498 — C2-07 Full Integration Closure

- P498-G001 OPEN — see functional category above
- P498-G002 OPEN — see functional category above
- P498-G003 OPEN — see functional category above
- P498-G004 OPEN — see functional category above

## P499 — Runtime Acceptance Preflight

- P499-G001 OPEN — see functional category above
- P499-G002 OPEN — see functional category above
- P499-G003 OPEN — see functional category above
- P499-G004 OPEN — see functional category above
- P499-G005 OPEN — see functional category above

## P500 — Dependency & Build Blocker Remediation

- P500-G001 OPEN — see functional category above
- P500-G002 OPEN — see functional category above
- P500-G003 OPEN — see functional category above
- P500-G004 OPEN — see functional category above
- P500-G005 OPEN — see functional category above

## P501 — Lockfile Readiness & Workspace Dependency Resolution

- P501-G001 OPEN — see functional category above
- P501-G002 OPEN — see functional category above
- P501-G003 OPEN — see functional category above
- P501-G004 OPEN — see functional category above

## P502 — Compilation & Build Remediation

- P502-G001 OPEN — see functional category above
- P502-G002 OPEN — see functional category above
- P502-G003 OPEN — see functional category above
- P502-G004 OPEN — see functional category above

## P503 — Frontend Build Stabilization

- P503-G001 OPEN — see functional category above
- P503-G002 OPEN — see functional category above
- P503-G003 OPEN — see functional category above
- P503-G004 OPEN — see functional category above

## P504 — Backend/API Build Stabilization

- P504-G001 OPEN — see functional category above
- P504-G002 OPEN — see functional category above
- P504-G003 OPEN — see functional category above
- P504-G004 OPEN — see functional category above
- P504-G005 OPEN — see functional category above

## P505 — Mobile Build Stabilization

- P505-G001 OPEN — see functional category above
- P505-G002 OPEN — see functional category above
- P505-G003 OPEN — see functional category above
- P505-G004 OPEN — see functional category above

## P506 — Shared Packages & Workspace Integration

- P506-G001 OPEN — see functional category above
- P506-G002 OPEN — see functional category above
- P506-G003 OPEN — see functional category above
- P506-G004 OPEN — see functional category above
- P506-G005 OPEN — see functional category above
- P506-G006 OPEN — see functional category above

## P507 — Environment & Configuration Stabilization

- P507-G001 OPEN — see functional category above
- P507-G002 OPEN — see functional category above
- P507-G003 OPEN — see functional category above
- P507-G004 OPEN — see functional category above
- P507-G005 OPEN — see functional category above

## P508 — Consolidated C2-01 Readiness

- P508-G001 OPEN — see functional category above
- P508-G002 OPEN — see functional category above
- P508-G003 OPEN — see functional category above
- P508-G004 OPEN — see functional category above
- P508-G005 OPEN — see functional category above
- P508-G006 OPEN — see functional category above
- P508-G007 OPEN — see functional category above

## P509 — C2-08-01 Finance Foundation

- P509-G001 OPEN — see functional category above
- P509-G002 OPEN — see functional category above
- P509-G003 OPEN — see functional category above
- P509-G004 OPEN — see functional category above
- P509-G005 OPEN — see functional category above

## P510 — Fee structure enhancement gaps

- P510-G001 READY_FOR_VERIFICATION — see functional category above
- P510-G002 OPEN — see functional category above
- P510-G003 READY_FOR_VERIFICATION — see functional category above

## P511 — Student fee assignment scope and duplicate-count hardening

- P511-G001 OPEN — see functional category above
- P511-G002 READY_FOR_VERIFICATION — see functional category above
- P511-G003 READY_FOR_VERIFICATION — see functional category above
- P511-G004 READY_FOR_VERIFICATION — see functional category above

## P512 — Installments & Payment Schedules (carry-forward)

- P512-G001 READY_FOR_VERIFICATION — see functional category above
- P512-G002 READY_FOR_VERIFICATION — see functional category above
- P512-G003 OPEN — see functional category above
- P512-G004 OPEN — see functional category above
- P512-G005 OPEN — see functional category above

## P513 — Discounts, Scholarships & Concessions

- P513-G001 READY_FOR_VERIFICATION — see functional category above
- P513-G002 READY_FOR_VERIFICATION — see functional category above
- P513-G003 CLOSED — see functional category above
- P513-G004 READY_FOR_VERIFICATION — see functional category above
- P513-G005 OPEN — see functional category above

## P514 — Billing & Invoice Lifecycle

- P514-G001 OPEN — see functional category above
- P514-G002 READY_FOR_VERIFICATION — see functional category above
- P514-G003 OPEN — see functional category above
- P514-G004 OPEN — see functional category above
- P514-G005 CLOSED — see functional category above
- P514-G006 OPEN — see functional category above
- P514-G007 READY_FOR_VERIFICATION — see functional category above
- P514-G008 OPEN — see functional category above

## P515 — Fee Collection & Payment Processing

- P515-G001 OPEN — see functional category above
- P515-G002 OPEN — see functional category above
- P515-G003 OPEN — see functional category above
- P515-G004 OPEN — see functional category above
- P515-G005 OPEN — see functional category above
- P515-G006 OPEN — see functional category above
- P515-G007 OPEN — see functional category above

## P516 — Receipts & Student Ledger

- P516-G001 OPEN — see functional category above
- P516-G002 OPEN — see functional category above
- P516-G003 OPEN — see functional category above
- P516-G004 OPEN — see functional category above
- P516-G005 OPEN — see functional category above
- P516-G006 OPEN — see functional category above
- P516-G007 OPEN — see functional category above
- P516-G008 OPEN — see functional category above
- P516-G009 OPEN — see functional category above

## P517 — Outstanding Balances & Late-Fee Preview

- P517-G001 OPEN — see functional category above
- P517-G002 OPEN — see functional category above
- P517-G003 OPEN — see functional category above
- P517-G004 OPEN — see functional category above
- P517-G005 OPEN — see functional category above
- P517-G006 OPEN — see functional category above
- P517-G007 OPEN — see functional category above

## P518 — Refund Reconciliation Control Summary

- P518-G001 OPEN — see functional category above
- P518-G002 OPEN — see functional category above
- P518-G003 OPEN — see functional category above
- P518-G004 OPEN — see functional category above
- P518-G005 OPEN — see functional category above

## P519 — Parent Finance Integration

- P519-G001 OPEN — see functional category above
- P519-G002 OPEN — see functional category above
- P519-G003 OPEN — see functional category above
- P519-G004 OPEN — see functional category above
- P519-G005 OPEN — see functional category above
- P519-G006 OPEN — see functional category above

## P520 — Finance Consolidation

- P520-G001 OPEN — see functional category above
- P520-G002 OPEN — see functional category above
- P520-G003 OPEN — see functional category above
- P520-G004 OPEN — see functional category above
- P520-G005 OPEN — see functional category above
- P520-G006 OPEN — see functional category above

## P521 — Finance Server-Side Aggregation & Acceptance Remediation

- P521-G001 OPEN — see functional category above
- P521-G002 OPEN — see functional category above
- P521-G003 OPEN — see functional category above
- P521-G004 OPEN — see functional category above
- P521-G005 OPEN — see functional category above

## P522 — Finance Ledger Reconciliation

- P522-G001 OPEN — see functional category above
- P522-G002 OPEN — see functional category above
- P522-G003 OPEN — see functional category above
- P522-G004 OPEN — see functional category above
- P522-G005 OPEN — see functional category above
- P522-G006 OPEN — see functional category above

## P523 — Finance Reconciliation Date Windows & Drill-down

- P523-G001 OPEN — see functional category above
- P523-G002 OPEN — see functional category above
- P523-G003 OPEN — see functional category above
- P523-G004 OPEN — see functional category above
- P523-G005 OPEN — see functional category above

## P524 — Finance Lifecycle Status Matrix

- P524-G001 OPEN — see functional category above
- P524-G002 OPEN — see functional category above
- P524-G003 OPEN — see functional category above

## P525 — Finance Lifecycle Fixture Matrix & Remediation Close-out

- P525-G001 OPEN — see functional category above
- P525-G002 OPEN — see functional category above
- P525-G003 OPEN — see functional category above

## P526 — Admissions Foundation & Configuration

- P526-G001 OPEN — see functional category above
- P526-G002 OPEN — see functional category above
- P526-G003 OPEN — see functional category above

## P527 — Applicant Intake API & Forms

- P527-G001 OPEN — see functional category above
- P527-G002 OPEN — see functional category above
- P527-G003 OPEN — see functional category above

## P528 — Application Status Transitions & Audit

- P528-G001 OPEN — see functional category above
- P528-G002 OPEN — see functional category above
- P528-G003 OPEN — see functional category above

## P529 — phase gap index

- P529-G001 OPEN — see functional category above
- P529-G002 OPEN — see functional category above
- P529-G003 OPEN — see functional category above

## P530 — Secure Admission Document Upload & Metadata Lifecycle

- P530-G001 OPEN — see functional category above
- P530-G002 OPEN — see functional category above
- P530-G003 OPEN — see functional category above

## P531 — Admission Document Review & Decision Hardening

- P531-G001 OPEN — see functional category above
- P531-G002 OPEN — see functional category above
- P531-G003 OPEN — see functional category above

## P532 — Admission-to-Enrollment Conversion Hardening

- P532-G001 OPEN — see functional category above
- P532-G002 OPEN — see functional category above
- P532-G003 OPEN — see functional category above

## P534 — Bulk Communication Orchestration & Delivery Tracking

- P534-G001 OPEN — see functional category above
- P534-G002 OPEN — see functional category above
- P534-G003 OPEN — see functional category above

## P535 — Parent/Student Notifications & Preferences (added 2026-11-23)

- P535-G001 OPEN — see functional category above
- P535-G002 OPEN — see functional category above
- P535-G003 OPEN — see functional category above
- P535-G004 OPEN — see functional category above

## P536 report additions

- P536-G001 OPEN — see functional category above
- P536-G002 OPEN — see functional category above

## P537 — Cross-App Integration, Permissions, Accessibility & C2-09 Cycle Closure

- P537-G001 OPEN — see functional category above
- P537-G002 OPEN — see functional category above
- P537-G003 OPEN — see functional category above

## P538 — phase gap index

- P538-G001 OPEN — see functional category above
- P538-G002 OPEN — see functional category above
- P538-G003 PARTIAL — see functional category above
- P538-G004 OPEN — see functional category above
- P538-G005 OPEN — see functional category above
- P538-G006 OPEN — see functional category above

## P539 Health privacy, field scopes and access audit

- P539-G001 OPEN — see functional category above
- P539-G002 CLOSED — see functional category above

## P540 Health consent and guardian visibility

- P540-G001 OPEN — see functional category above
- P540-G002 OPEN — see functional category above

## P541 — phase gap index

- P541-G001 OPEN — see functional category above

## P542 Health case workflow

- P542-G001 OPEN — see functional category above
- P542-G002 OPEN — see functional category above

## P543 Health incident, escalation and guardian notification workflow

- P543-G001 OPEN — see functional category above

## P544 Health Mobile Integration, Reports & Focused Security Validation

- P544-G001 OPEN — see functional category above

## P545 — phase gap index

- P545-G001 OPEN — see functional category above
- P545-G002 OPEN — see functional category above

## P546 — Canteen Stock Ledger & Recipe Consumption

- P546-G001 OPEN — see functional category above
- P546-G002 OPEN — see functional category above
- P546-G003 OPEN — see functional category above
- P546-G004 OPEN — see functional category above

## P547 — Canteen Procurement, Receiving, Lots & Expiry

- P547-G001 OPEN — see functional category above
- P547-G002 OPEN — see functional category above
- P547-G003 OPEN — see functional category above
- P547-G004 OPEN — see functional category above

## P548 — Production Planning, Serving & Wastage

- P548-G001 OPEN — see functional category above
- P548-G002 OPEN — see functional category above
- P548-G003 OPEN — see functional category above
- P548-G004 OPEN — see functional category above

## P549 — Meal Preorder Lifecycle (source implementation)

- P549-G001 OPEN — see functional category above
- P549-G002 OPEN — see functional category above
- P549-G003 OPEN — see functional category above

## P550 — Wallet, Meal Entitlements & Reconciliation

- P550-G001 OPEN — see functional category above
- P550-G002 OPEN — see functional category above
- P550-G003 TRACKED — see functional category above
- P550-G004 TRACKED — see functional category above
- P550-G005 OPEN — see functional category above

## P551 — Canteen Dietary Safety & Module Closure

- P551-G001 OPEN — see functional category above
- P551-G002 OPEN — see functional category above
- P551-G003 OPEN — see functional category above
- P551-G004 OPEN — see functional category above
- P551-G005 OPEN — see functional category above
- P551-G006 OPEN — see functional category above

## P552 — Library barcode and bulk accession residual gaps

- P552-G001 OPEN — see functional category above
- P552-G002 OPEN — see functional category above
- P552-G003 OPEN — see functional category above
- P552-G004 OPEN — see functional category above

## P554 — Library Reservation Queue & Hold Fulfillment (2026-11-24)

- P554-G001 OPEN — see functional category above
- P554-G002 OPEN — see functional category above
- P554-G003 OPEN — see functional category above
- P554-G004 OPEN — see functional category above
- P554-G005 OPEN — see functional category above
- P554-G006 OPEN — see functional category above
- P554-G007 OPEN — see functional category above

## P558 — Library Parent/Student Self-Service, Notifications & Reports (2026-11-24)

- P558-G001 OPEN — see functional category above
- P558-G002 OPEN — see functional category above
- P558-G003 OPEN — see functional category above
- P558-G004 OPEN — see functional category above
- P558-G005 OPEN — see functional category above
- P558-G006 OPEN — see functional category above
- P558-G007 OPEN — see functional category above

## P559 — Transport Driver/Attendant Management, Verification & Mobile Foundation (2026-11-24)

- P559-G001 OPEN — see functional category above
- P559-G002 OPEN — see functional category above
- P559-G003 OPEN — see functional category above
- P559-G004 OPEN — see functional category above
- P559-G005 OPEN — see functional category above

## P560 — Transport Route/Stop/Vehicle/Student Capacity Allocation (2026-11-24)

- P560-G001 OPEN — see functional category above
- P560-G002 OPEN — see functional category above
- P560-G003 OPEN — see functional category above
- P560-G004 OPEN — see functional category above

## P561 — Transport Pickup/Drop Attendance, Absence, Missed Stop & Handover (2026-11-24)

- P561-G001 OPEN — see functional category above
- P561-G002 OPEN — see functional category above
- P561-G003 OPEN — see functional category above
- P561-G004 OPEN — see functional category above
- P561-G005 OPEN — see functional category above
- P561-G006 OPEN — see functional category above

## P562 — Transport GPS Provider Abstraction, Consent, Retention & Configuration

- P562-G001 OPEN — see functional category above
- P562-G002 OPEN — see functional category above
- P562-G003 OPEN — see functional category above
- P562-G004 OPEN — see functional category above
- P562-G005 OPEN — see functional category above

## P563 — Parent Route Visibility, Live Status, Geofence & Notifications

- P563-G001 OPEN — see functional category above
- P563-G002 OPEN — see functional category above
- P563-G003 OPEN — see functional category above
- P563-G004 OPEN — see functional category above
- P563-G005 OPEN — see functional category above

## P564 gaps — transport incident, emergency, maintenance and compliance

- P564-G001 OPEN — see functional category above
- P564-G002 OPEN — see functional category above
- P564-G003 OPEN — see functional category above
- P564-G004 OPEN — see functional category above
- P564-G005 OPEN — see functional category above
- P564-G006 OPEN — see functional category above

## P565 transport fees, ledger and reconciliation gaps

- P565-G001 OPEN — see functional category above
- P565-G002 OPEN — see functional category above
- P565-G003 OPEN — see functional category above
- P565-G004 OPEN — see functional category above
- P565-G005 OPEN — see functional category above
- P565-G006 OPEN — see functional category above
- P565-G007 OPEN — see functional category above

## P566 — Hostel Roll-call, Curfew, Attendance & Night Checks (2026-11-24)

- P566-G001 OPEN — see functional category above
- P566-G002 OPEN — see functional category above
- P566-G003 OPEN — see functional category above
- P566-G004 OPEN — see functional category above
- P566-G005 OPEN — see functional category above
- P566-G006 OPEN — see functional category above
- P566-G007 OPEN — see functional category above
- P566-G008 OPEN — see functional category above
- P566-G009 OPEN — see functional category above
- P566-G010 OPEN — see functional category above

## P567 — Hostel visitors and gate-pass (carried-forward verification gaps)

- P567-G001 OPEN — see functional category above
- P567-G002 OPEN — see functional category above
- P567-G003 OPEN — see functional category above
- P567-G004 OPEN — see functional category above
- P567-G005 OPEN — see functional category above
- P567-G006 OPEN — see functional category above
- P567-G007 OPEN — see functional category above
- P567-G008 OPEN — see functional category above
- P567-G009 OPEN — see functional category above

## P568 — Hostel leave, guardian communication and return check-in

- P568-G001 OPEN — see functional category above
- P568-G002 OPEN — see functional category above
- P568-G003 OPEN — see functional category above
- P568-G004 OPEN — see functional category above
- P568-G005 OPEN — see functional category above
- P568-G006 OPEN — see functional category above
- P568-G007 OPEN — see functional category above
- P568-G008 OPEN — see functional category above
- P568-G009 OPEN — see functional category above
- P568-G010 OPEN — see functional category above
- P568-G011 OPEN — see functional category above
- P568-G012 OPEN — see functional category above

## P569 — Hostel capacity, transfers, waitlist and checkout settlement

- P569-G001 OPEN — see functional category above
- P569-G002 OPEN — see functional category above
- P569-G003 OPEN — see functional category above
- P569-G004 OPEN — see functional category above
- P569-G005 OPEN — see functional category above
- P569-G006 OPEN — see functional category above
- P569-G007 OPEN — see functional category above
- P569-G008 OPEN — see functional category above
- P569-G009 OPEN — see functional category above
- P569-G010 OPEN — see functional category above

## P570 — Hostel fees, deposits, duty roster, maintenance and safeguarding

- P570-G001 OPEN — see functional category above
- P570-G002 OPEN — see functional category above
- P570-G003 OPEN — see functional category above
- P570-G004 OPEN — see functional category above
- P570-G005 OPEN — see functional category above
- P570-G006 OPEN — see functional category above
- P570-G007 OPEN — see functional category above
- P570-G008 OPEN — see functional category above
- P570-G009 OPEN — see functional category above
- P570-G010 OPEN — see functional category above
- P570-G011 OPEN — see functional category above
- P570-G012 OPEN — see functional category above

## P571 integration and final cycle acceptance gaps

- P571-G001 OPEN — see functional category above
- P571-G002 OPEN — see functional category above
- P571-G003 OPEN — see functional category above
- P571-G004 OPEN — see functional category above
- P571-G005 OPEN — see functional category above
- P571-G006 OPEN — see functional category above
- P571-G007 OPEN — see functional category above
- P571-G008 OPEN — see functional category above
- P571-G009 OPEN — see functional category above
- P571-G010 OPEN — see functional category above
- P571-G011 OPEN — see functional category above
- P571-G012 OPEN — see functional category above

## P572 — C2-11 Wave 1: Workspace and release-gate remediation

- P572-G001 OPEN — see functional category above
- P572-G002 OPEN — see functional category above
- P572-G003 OPEN — see functional category above
- P572-G004 OPEN — see functional category above
- P572-G005 OPEN — see functional category above
- P572-G006 OPEN — see functional category above
- P572-G007 OPEN — see functional category above
- P572-G008 OPEN — see functional category above

## P573 — Prisma & PostgreSQL migration acceptance (C2-11 Wave 2)

- P573-G001 OPEN — see functional category above
- P573-G002 OPEN — see functional category above
- P573-G003 OPEN — see functional category above
- P573-G004 OPEN — see functional category above
- P573-G005 OPEN — see functional category above
- P573-G006 OPEN — see functional category above
- P573-G007 OPEN — see functional category above
- P573-G008 OPEN — see functional category above

## P574 — Dependency-backed builds and API integration (C2-11 Wave 3)

- P574-G001 OPEN — see functional category above
- P574-G002 OPEN — see functional category above
- P574-G003 OPEN — see functional category above
- P574-G004 OPEN — see functional category above
- P574-G005 OPEN — see functional category above
- P574-G006 OPEN — see functional category above
- P574-G007 OPEN — see functional category above
- P574-G008 OPEN — see functional category above

## P575 — Tenant isolation and authorization acceptance (C2-11 Wave 4)

- P575-G001 OPEN — see functional category above
- P575-G002 OPEN — see functional category above
- P575-G003 OPEN — see functional category above
- P575-G004 OPEN — see functional category above
- P575-G005 OPEN — see functional category above
- P575-G006 OPEN — see functional category above
- P575-G007 OPEN — see functional category above
- P575-G008 OPEN — see functional category above

## P576 — Financial and notification provider E2E (C2-11 Wave 5)

- P576-G001 OPEN — see functional category above
- P576-G002 OPEN — see functional category above
- P576-G003 OPEN — see functional category above
- P576-G004 OPEN — see functional category above
- P576-G005 OPEN — see functional category above
- P576-G006 OPEN — see functional category above
- P576-G007 OPEN — see functional category above
- P576-G008 OPEN — see functional category above

## P577 — Browser/mobile journeys and accessibility (C2-11 Wave 6)

- P577-G001 OPEN — see functional category above
- P577-G002 OPEN — see functional category above
- P577-G003 OPEN — see functional category above
- P577-G004 OPEN — see functional category above
- P577-G005 OPEN — see functional category above
- P577-G006 OPEN — see functional category above
- P577-G007 OPEN — see functional category above
- P577-G008 OPEN — see functional category above

## P578 reliability and operational acceptance gaps

- P578-G001 OPEN — see functional category above
- P578-G002 OPEN — see functional category above
- P578-G003 OPEN — see functional category above
- P578-G004 OPEN — see functional category above
- P578-G005 OPEN — see functional category above
- P578-G006 OPEN — see functional category above
- P578-G007 OPEN — see functional category above
- P578-G008 OPEN — see functional category above

## P579 independent review and cycle closure gaps

- P579-G001 OPEN — see functional category above
- P579-G002 OPEN — see functional category above
- P579-G003 OPEN — see functional category above
- P579-G004 OPEN — see functional category above
- P579-G005 OPEN — see functional category above
- P579-G006 OPEN — see functional category above
- P579-G007 OPEN — see functional category above
- P579-G008 OPEN — see functional category above

## Reconciliation rules

- Preserve original phase gap IDs; create sub-IDs only through a formally recorded phase update.
- Classify each item as `MISSING`, `PARTIAL`, `IMPLEMENTED_NOT_VERIFIED`, `VERIFICATION_ONLY`, `DEFERRED`, `BLOCKED_EXTERNAL` or `DUPLICATE_CANDIDATE` after current-source inspection.
- A code change alone does not close a runtime, security, privacy, accessibility or operational evidence requirement.
- The four canonical project documents are the user-facing source set; legacy master-register paths are retained as compatibility mirrors for historical scripts.

---

# P581 — Demo seed and local Docker acceptance gaps

| ID | Area | Status | Required closure evidence |
|---|---|---|---|
| P581-G001 | Docker image build and Compose startup | OPEN | Successful `docker compose config`, image build, startup and health logs on Docker-enabled host |
| P581-G002 | Prisma migration and clean database | OPEN | Clean PostgreSQL migration deployment, schema verification and retained logs |
| P581-G003 | Demo seeder database execution | OPEN | Execute seeder; verify all reported table counts against PostgreSQL |
| P581-G004 | Seeder idempotency | OPEN | Run twice and prove stable counts, no duplicate business records or role assignments |
| P581-G005 | Role credential authentication | OPEN | Successful login and correct scope/permissions for all 14 documented roles |
| P581-G006 | Page-level data visibility | PARTIAL | Browser/API evidence for each listed demo module and role; fix any UI query/filter/tenant-context gaps |
| P581-G007 | Full feature-page demo coverage | OPEN | Add valid module-specific fixtures for library, transport, hostel, canteen, payroll, health, document and remaining modules |
| P581-G008 | Parent account relationship visibility | OPEN | Verify guardian-to-student portal access and negative test that unrelated students are not visible |

P581 source implementation is delivered, but none of these runtime acceptance gaps is closed by static checks alone. Demo data is local-only and must not be used as production data. Payments, provider callbacks, payroll disbursement and safeguarding evidence are not fabricated.
