# School Management SaaS – Complete Product Analysis and Development Plan

**Document type:** Product definition, architecture baseline and implementation roadmap  
**Baseline:** P00  
**Status:** Approved design baseline; implementation not yet started  
**Market:** India first, international expansion  
**Product model:** Shared multi-tenant, multi-organization, white-label SaaS

---

## 1. Executive summary

Build an original, enterprise-grade School Management SaaS platform for individual schools, education trusts, school chains and international education groups. The platform includes SaaS owner administration, organization administration, school administration, a public admissions/website portal, a dedicated Teacher mobile application and a dedicated Parent mobile application.

The product must support multiple organizations on a shared platform, multiple schools per organization, school-level operational separation, organization-level consolidated reporting, multiple academic boards and programmes, global identities with scoped memberships, subscription entitlements and configurable branding.

This is an original implementation. Fedena, Entab, Teachmint, MyClassCampus, OpenEduCat and Frappe Education may be researched as market/workflow references. Do not copy proprietary source code, protected designs, trademarks, content or assets. Any third-party code or package must undergo license and security review.

## 2. Final product decisions

| Decision | Approved baseline |
|---|---|
| Education boards | CBSE, ICSE, State Board, IB, IGCSE, other international/custom |
| Mobile applications | Separate Teacher and Parent applications |
| Deployment | Shared multi-tenant SaaS |
| Development approach | Original implementation |
| Market | India first, international expansion |
| Scope | Complete product delivered in phases |
| Branding | White-label |
| Web | React + TypeScript + Vite |
| Mobile | React Native + Expo |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Architecture | Modular monolith initially |
| API | Versioned REST + OpenAPI |
| Cache/jobs | Redis + BullMQ |
| Real-time | Socket.IO |
| Storage | Private S3-compatible object storage |

## 3. Product principles

1. Tenant isolation is a security boundary, not merely a UI filter.
2. Organization and school scopes must be explicit in authorization.
3. Global identity is separate from organization/school membership.
4. Academic and financial history must be preserved.
5. Board-specific rules must be configurable and versioned, not hardcoded in generic workflows.
6. Mobile applications must be designed for real school-day workflows and intermittent connectivity.
7. Every important action must be auditable.
8. Subscription entitlements must be enforced server-side.
9. White-label configuration must be data-driven and theme-token based.
10. Each phase must deliver tested vertical functionality, documentation and a cumulative ZIP.

## 4. Product hierarchy

Platform owner → Organizations/Trusts/Groups → Schools/Campuses → Academic sessions/programmes/classes/sections → Students, guardians, teachers and staff.

A user can hold different roles and scopes. A parent can have authorized children across multiple schools or organizations using one global identity. A teacher can have assignments across multiple schools where explicitly authorized. Organization administrators can see consolidated information only within their organization and assigned permissions.

## 5. Application surfaces

### 5.1 SaaS Super Admin
Platform dashboard, organizations, schools, subscriptions, plans, billing, invoices, payments, trials, entitlements, usage, storage, platform health, support, announcements, integration registry, security monitoring, audit and data lifecycle requests.

Support access to tenant data must be explicitly authorized, time-limited, least-privilege and audited. Platform ownership must not silently bypass tenant isolation.

### 5.2 Organization Admin
Organization profile, schools, central policies, school comparison, consolidated finance and academic analytics, staff directory, shared staff assignments, school transfers, organization-level approvals, documents, announcements and billing.

### 5.3 School Admin
School configuration and the full operational ERP: admissions, student information, academics, attendance, fees, finance, examinations, HR, payroll, transport, library, inventory, facilities, communications and reporting.

### 5.4 Teacher mobile app
Secure login, authorized school switcher, dashboard, timetable, classes, student roster, daily and period attendance, offline attendance queue, homework, submissions, marks, lesson planning, syllabus progress, parent communication, leave, notifications and profile.

### 5.5 Parent mobile app
One login, multiple authorized children, child/school switcher, attendance, homework, timetable, examinations, results, report cards, fees, online payments, receipts, transport tracking, pickup/drop alerts, leave requests, appointments, announcements, messages, complaints, documents and emergency contacts.

### 5.6 Public portal
School information, public announcements, enquiry forms, admission application, application status, document submission, admission payment where configured and school-specific branding.

Student and driver experiences may initially be delivered through role-specific modules or later dedicated apps. They are not substitutes for the committed Teacher and Parent apps.

## 6. Functional module inventory

The following is the logical module catalogue. Detailed capabilities are recorded in `docs/modules/MODULE-INVENTORY.md`.

### SaaS and organization
M001 SaaS administration; M002 organization management; M003 multi-school management; M004 subscriptions; M005 billing; M006 entitlements; M007 white-label; M008 organization governance.

### Identity and access
M009 authentication; M010 users; M011 roles; M012 access control; M013 guardians; M014 staff identity and memberships.

### Academic and student
M015 academic configuration; M016 boards and curriculum; M017 classes and sections; M018 subjects; M019 admissions; M020 student information; M021 student lifecycle; M022 timetable; M023 lesson planning; M024 homework; M025 examinations; M026 report cards; M027 LMS; M028 discipline; M029 student wellness/emergency records.

### Finance and administration
M030 fee management; M031 fee collection; M032 scholarships; M033 accounting; M034 procurement; M035 inventory; M036 assets; M037 HR; M038 attendance; M039 leave; M040 payroll; M041 compliance records.

### Campus operations
M042 transport; M043 GPS; M044 library; M045 hostel; M046 laboratory; M047 canteen; M048 visitor management; M049 facilities; M050 events.

### Communication and engagement
M051 notifications; M052 announcements; M053 parent-teacher communication; M054 complaints; M055 surveys; M056 document centre; M057 emergency communication.

### Applications, analytics and platform services
M058 Teacher app; M059 Parent app; M060 public school website; M061 admission portal; M062 reporting; M063 analytics; M064 integrations; M065 import/export; M066 audit/security.

## 7. Multi-board education framework

Support board profiles and programme structures for CBSE, ICSE, State Board, IB PYP/MYP/DP, IGCSE and custom/international boards.

Represent board rules through versioned data/configuration:
- boards and education programmes;
- curriculum versions and effective dates;
- grade levels and subject groups;
- subjects and learning outcomes;
- academic terms and calendars;
- assessment categories and criteria;
- grading scales and grade boundaries;
- examination structures;
- promotion rules;
- report-card templates.

A school may operate multiple programmes. A selected board profile does not automatically establish official compliance. Board-specific configurations must be validated against current official requirements and versioned when they change.

## 8. Architecture

### 8.1 Initial architecture
Use a modular monolith with explicit domain boundaries. Avoid premature microservices. Extract high-volume or independently scalable domains only when measured operational evidence justifies it.

### 8.2 Technology
- React + Vite + TypeScript for web.
- React Native + Expo for mobile.
- Node.js + Express + TypeScript for APIs.
- PostgreSQL and Prisma.
- Redis and BullMQ.
- Socket.IO.
- S3-compatible private object storage.
- OpenAPI/Swagger.
- Docker and NGINX.
- Vitest/Jest, Supertest, Playwright, Maestro/Detox and k6.
- OpenTelemetry-compatible instrumentation and centralized logs/metrics.

### 8.3 Backend module structure
Each domain follows controllers/routes, application services, domain logic, repositories, validation schemas, authorization policies, events and tests. Controllers must remain thin. Cross-domain interactions use explicit service contracts and domain events. Critical events use a transactional outbox pattern.

### 8.4 Data tenancy
Shared PostgreSQL database and shared schema initially. Every tenant-owned row carries `organization_id`; school-owned records also carry `school_id`. Use composite foreign keys and scoped unique constraints to prevent cross-tenant references. Add PostgreSQL RLS as defence in depth. Set tenant context transactionally and reset it safely. Never rely only on frontend filters or caller-supplied tenant IDs.

### 8.5 Identity model
Global `users` and `persons` are separate from tenant memberships and role assignments. Guardian-to-student relationships and employee-to-school assignments are explicit. A global user may have multiple authorized relationships.

## 9. Database design baseline

The logical schema is specified in `docs/database/DATABASE-DESIGN.md`. Main domains:

- Platform/tenant: organizations, schools, campuses, domains, settings, sessions, entitlements and usage.
- Identity: users, persons, profiles, sessions, devices, roles, permissions, assignments, memberships, MFA and audit.
- Student/guardian: students, enrollments, guardians, guardian users, documents, addresses, emergency contacts, transfers and promotions.
- Staff: employees, school assignments, teacher profiles, subject/class assignments, contracts and leave balances.
- Education: boards, programmes, curriculum versions, grade levels, subjects, outcomes, assessments, grading scales, criteria and report templates.
- Academic operations: classes, sections, subjects, terms, calendars, classrooms, timetables, lesson plans, syllabus progress, homework and submissions.
- Attendance: sessions, student attendance, period attendance, staff attendance and corrections.
- Examination: exams, schedules, subjects, marks, assessment records, grades, publications and report cards.
- Finance: fee heads, structures, invoices, invoice items, payments, allocations, gateway transactions, discounts, refunds, receipts, ledgers, journals and expenses.
- Operations: HR, payroll, leave, transport, GPS, library, hostel, inventory, assets, facilities and visitors.
- Platform services: notifications, messages, files, integrations, webhooks, outbox, imports, exports and report definitions.

Use UUID primary keys, explicit created/updated timestamps, actor attribution where appropriate, soft-delete only where legally and operationally appropriate, and immutable financial/audit history. Monetary values use fixed precision and explicit ISO currency codes, never floating point. Timestamps are stored in UTC; school timezone is explicit.

## 10. API architecture

Base path: `/api/v1`. REST APIs are documented with OpenAPI. Standard response envelopes, pagination, validation errors, request IDs and stable error codes are required.

API domains include auth, users, organizations, schools, subscriptions, access-control, education, academic-sessions, students, guardians, teachers, employees, classes, subjects, timetables, attendance, homework, examinations, results, fees, payments, HR, transport, library, inventory, notifications, messages, reports, files, integrations and audit logs.

Every endpoint must enforce authentication, tenant scope, resource authorization and subscription entitlement. Use idempotency keys for payment and other retry-sensitive operations. Webhooks must be signature-verified, deduplicated and replay-safe. Files must be private by default and checked on every access.

## 11. White-label strategy

Organization and school branding are separately configurable. Branding includes logos, names, color tokens, favicon, domains, email templates, report/receipt templates and mobile theme settings. Shared Teacher and Parent apps load authorized school branding at runtime. Dedicated branded app builds may be an enterprise add-on subject to app-store rules and publishing costs.

## 12. Security, privacy and compliance

- Argon2id password hashing.
- Short-lived access tokens and rotating refresh tokens.
- MFA for privileged roles.
- Rate limits, abuse controls and secure account recovery.
- Least-privilege RBAC plus resource/attribute checks.
- Tenant isolation, RLS and cross-tenant automated tests.
- TLS in transit and encryption at rest.
- Private object storage and short-lived authorized download URLs.
- Audit trails for sensitive reads/actions and all privileged mutations.
- Data minimization, consent, retention, export and deletion workflows.
- Child and guardian data receives heightened access restrictions.
- Payment card data is handled by compliant payment providers; do not store raw card details.
- Security incident response and backup restoration procedures.

Plan for India's DPDP requirements and applicable rules, and jurisdiction-specific requirements such as GDPR/UK GDPR and COPPA where relevant. Obtain legal review before claiming compliance or entering a jurisdiction. Keep compliance configuration jurisdiction-aware.

## 13. Non-functional targets

Initial engineering targets, to be verified:
- 99.9% monthly availability target.
- p95 API latency below 500 ms for normal operations, excluding long-running exports and external provider latency.
- Horizontal application scaling.
- Automated encrypted backups and tested restores.
- Explicit RPO/RTO targets before production.
- WCAG 2.2 AA target for web.
- Localization, timezone, locale, currency and regional address support.
- Monitoring, tracing, structured logs and alerting.
- Load and soak testing before commercial launch.

## 14. Quality strategy

Test layers:
- Unit: Vitest/Jest.
- API integration: Supertest.
- Web E2E: Playwright.
- Mobile E2E: Maestro or Detox.
- Performance: k6.
- Database: migration, constraints, transaction and RLS tests.
- Security: tenant isolation, authorization, file access, webhook and abuse tests.

Release-blocking scenarios:
1. Organization A cannot access Organization B.
2. A school cannot access another school's records without authorized scope.
3. Student lifecycle from admission through promotion.
4. Fee invoice, partial payment, callback, receipt, refund and reconciliation.
5. Parent multi-child and multi-school access.
6. Teacher school switcher, timetable and attendance.
7. Organization consolidated reports reconcile to school source data.
8. Offline attendance synchronization and conflict resolution.
9. Subscription expiry/entitlement enforcement.
10. Backup restoration and audit integrity.

## 15. Phased roadmap

| Phase | Scope |
|---|---|
| P00 | Product definition, requirements, architecture and engineering standards |
| P01 | Monorepo, tooling, Docker, CI, environments, database and migration foundation |
| P02 | Authentication, users, RBAC, sessions and security |
| P03 | SaaS Super Admin |
| P04 | Organizations and multi-school management |
| P05 | Subscriptions, billing and entitlements |
| P06 | School configuration and academic sessions |
| P07 | Boards and curriculum engine |
| P08 | Admissions and student information |
| P09 | Teacher and staff management |
| P10 | Classes, subjects, timetable and syllabus |
| P11 | Student and staff attendance |
| P12 | Fees and payment collection |
| P13 | Accounting and expenses |
| P14 | Examinations and report cards |
| P15 | Homework and LMS |
| P16 | Teacher app foundation |
| P17 | Teacher app advanced workflows |
| P18 | Parent app foundation |
| P19 | Parent app advanced workflows |
| P20 | Notifications and communication |
| P21 | Transport and GPS |
| P22 | Library, inventory and facilities |
| P23 | Hostel, canteen and visitor management |
| P24 | HR and payroll |
| P25 | Organization analytics and consolidated reporting |
| P26 | Admission CRM and public portal |
| P27 | White-label and integrations |
| P28 | Security and compliance hardening |
| P29 | Performance, reliability and full regression |
| P30 | Commercial release, deployment and onboarding |

## 16. Phase delivery contract

At the end of every phase:
1. Implement the phase scope.
2. Run relevant unit, integration, API, web E2E and mobile tests.
3. Run tenant isolation and authorization regression where relevant.
4. Update implementation status and changelog.
5. Update `MASTER-OPEN-GAPS-REGISTER.md`, preserving all unresolved items.
6. Close a gap only with implementation evidence and verification evidence.
7. Add phase-specific documents under `docs/`.
8. Produce a phase-only ZIP and a cumulative ZIP containing all accepted project files.
9. Include a verification report with commands, results, known limitations and environment details.
10. Never claim a test passed unless it was actually run.

## 17. Commercial model

Initial proposed monthly prices (not vendor quotations):
- Starter: ₹1,999.
- Professional: ₹3,999.
- Enterprise: ₹7,999.
- Organization Enterprise: ₹14,999+.

All limits and prices are configurable in Super Admin. Entitlements include student count, schools, storage, notifications, integrations, modules, API usage and white-label options. International price books must be country/currency-specific. GST, payment provider fees, messaging costs, onboarding and premium services are separately configurable.

## 18. P00 exit criteria

P00 is complete when:
- Product decisions are documented.
- Application surfaces and roles are defined.
- Functional module inventory exists.
- Multi-board approach is defined.
- Architecture and technology baseline are documented.
- Tenant and identity model is defined.
- Logical database design is documented.
- API standards and endpoint domains are documented.
- White-label approach is documented.
- Security, privacy and testing strategy is documented.
- P00–P30 roadmap is recorded.
- Phase-wise gap register exists.
- P01 prerequisites and acceptance criteria are documented.

P00 is a documentation/architecture phase. No production application code, migrations or deployment are claimed in this phase.


## Implementation progress note — P17 (2026-11-16)
P17 adds authenticated teacher school membership discovery and a school picker in the Teacher mobile app. The app no longer requires manual organization or school IDs. This is a source-level milestone; runtime RLS/API/device acceptance remains pending and is tracked in `MASTER-OPEN-GAPS-REGISTER.md`.


## Delivery update — P20
P20 source scope adds room inventory, date-specific timetable exceptions (cancellation, substitute assignment, one-day override), holiday/closure-aware teacher timetable projection and advisory locking for API timetable writes. P21 is planned for CSV workflows, bell templates, persisted admin editor and stronger runtime/concurrency verification. See the P20 phase report and master gap register.


## P22 delivery note
P22 extends the timetable subsystem with a guarded room lifecycle, a non-destructive legacy room usage report, and a teacher week grid with a bounded SecureStore read-only cache. See `docs/phases/P22-PHASE-REPORT.md`; runtime acceptance is still pending.


## Delivery update — P23 (2026-11-17)
P23 source implementation adds reviewed legacy room-label mappings and timetable workspace authentication integration. P24 should prioritize full School Admin shell authentication, membership/school selection, dry-run migration preview, dual-control audit, and executable PostgreSQL/API/browser acceptance. This update does not imply runtime acceptance.


## Delivery update — P25 (2026-11-17)
P25 added permission-aware School Admin navigation, explicit preview-only treatment for unfinished screens, SCHOOL_ADMIN permission bootstrap, `academics.manage` timetable authorization, database-side teacher/room overlap guards and append-only audit triggers. These are source-level deliverables pending migration and runtime verification. See `docs/phases/P25-PHASE-REPORT.md` and `MASTER-OPEN-GAPS-REGISTER.md`.

## P26 implementation update (2026-11-17)

P26 connects the School Admin school profile, academic-year creation/listing, calendar/event management, working-day configuration and attendance/grading policy screens to the existing authenticated tenant-scoped APIs. School configuration mutations now enforce the relevant `school.settings.manage` or `academics.manage` permission server-side. Academic year and term date validation rejects impossible Gregorian calendar dates. Curriculum, students, staff and access screens remain preview-only. Runtime acceptance is pending; see `docs/phases/P26-PHASE-REPORT.md` and the root `MASTER-OPEN-GAPS-REGISTER.md`.

## P27 implementation update
The School Admin curriculum, student, staff and access workspaces now call authenticated APIs rather than keeping local preview records. Scope and known workflow limitations are documented in `docs/modules/P27-OPERATIONAL-MODULES-INTEGRATION.md`; P28 entry criteria are in `docs/phases/P28-ENTRY-CRITERIA.md`. Runtime acceptance remains pending.

## Phase execution update — P28

P28 source implementation adds curriculum subject/version status operations, student guardian/enrollment/pickup workflows, staff department/designation/status/teacher assignment workflows, access member/assignment/audit workflows, granular API permissions and student/staff PII read controls. Verification remains source-level only; see the P28 phase report and master open-gaps register for runtime acceptance requirements.

## P29 implementation update — 2026-11-17
Guardian directory workflows now support school-scoped list, explicit link/create, duplicate review and contact/relationship updates. Staff employment history is append-oriented with transactional period rollover and separation closure. Curriculum activation has API advisory locking and a database partial unique-index migration with a duplicate preflight. Parent account invitations and private document binary storage remain deferred until verified guardian identity and secure object-storage/scanning infrastructure are available. Runtime acceptance remains pending.


## P30 implementation status (2026-11-17)
Parent identity invitation foundation, guardian merge/reconciliation, private document storage lifecycle, employment-history overlap constraint and audit cursor pagination source have been added. Parent email delivery worker, malware scanner integration, parent portal authorization, cloud bucket posture and all runtime acceptance remain open. See P30 phase report and master gap register.


## P31 implementation update — Parent portal and worker foundations
P31 extends the plan with parent school/student/published-attendance APIs, consent version display and withdrawal, verified parent role/membership provisioning, async email delivery worker and malware scanner dispatch adapter. These are source foundations. Real provider setup, operational controls, runtime acceptance and broader parent features (fees, homework, communication, report cards and notifications) remain open.


## P32 update — Parent portal attendance pagination
The Parent portal attendance API now provides bounded cursor pagination and the Parent mobile app supports incremental loading. This is a source-level improvement only; database/API integration and device acceptance remain open. Fees, homework, report cards, messaging, notifications and transport still require product prioritization and separate authorization design.


## P33 delivery note
Parent portal source now covers fee statements/payment history, homework, published report cards and in-app school notifications. These are separate school/student records, not organization subscription invoices. Manual payment reconciliation is not a payment gateway. Provider delivery, School Admin authoring UI and runtime acceptance remain open.


## P34 — School Admin Parent Operations
P34 connects the School Admin operational experience to the P33 parent-facing data model: fee charge authoring and manual reconciliation, homework authoring/publication, report-card authoring/publication and consent-derived in-app parent notifications. It adds bounded tenant-scoped list APIs and audited DRAFT-to-PUBLISHED transitions. Gateway payments, homework submission/grading, report-card approvals/PDFs, notification transport and runtime acceptance remain follow-on work.

## Implementation update — P40
P40 delivers the structured report-card schema editor and tenant-scoped academic-year/grade/board lookups, configurable school PDF branding and multi-page A4 output, plus transactional consent-aware in-app parent notification batches/outbox/preferences. External EMAIL/PUSH dispatch, QR verification, multilingual font support, official board assessment packs and payment gateway integration remain open. Runtime acceptance is not verified; consult the root `MASTER-OPEN-GAPS-REGISTER.md` and `docs/phases/P40-PHASE-REPORT.md`.


## P41 update — report-card verification and notifications
P41 adds random-code public verification for published report cards, QR symbols in PDFs, Noto font embedding for major Indian scripts, and an asynchronous consent-aware EMAIL notification worker. Arabic RTL shaping, school logo/template management, provider receipts/bounces, push delivery and runtime acceptance remain roadmap gaps. See `docs/phases/P41-PHASE-REPORT.md`.


## P43 delivery update
P43 source adds school branding asset lifecycle and named report-card template versions, plus database-backed notification outbox leases. These capabilities remain subject to Prisma, database, object-store, scanner, worker, provider, browser/mobile and load verification. Arabic RTL/accessibility, notification receipts/PUSH, retention/legal hold, official board packs and payment gateway decisions remain open.
