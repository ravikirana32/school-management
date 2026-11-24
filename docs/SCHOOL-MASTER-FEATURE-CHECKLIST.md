# School Management SaaS — Master Feature Checklist

> Living roadmap. Checkmarks represent source implementation progress only when phase evidence is recorded. Runtime/build/test verification is tracked separately and is deferred until implementation freeze. Admissions advanced gaps are intentionally deferred while other priorities progress.

## Current active module — Student lifecycle management

> This is the only module checklist shown in phase updates. Status is based on source inspection only; build/runtime/E2E validation is deferred.

### Current functionality found in source
- [x] Student record creation with admission number and core profile fields
- [x] Guardian creation/linking during student creation
- [x] Student list API with search, status filter, pagination
- [x] Student detail API with enrollment/guardian/pickup/document fields scoped by permissions
- [x] Profile update API with validation
- [x] Profile-completeness API and missing-field indicators
- [x] Guardian list and explicit guardian-link API
- [x] Guardian update API
- [x] Student status change API and status-history API
- [x] Enrollment creation API
- [x] Enrollment status transition API (PROMOTED, TRANSFERRED, WITHDRAWN, COMPLETED) with concurrency guard and audit record
- [x] Student Admin enrollment history UI and guarded status update controls connected to enrollment APIs (P238; runtime validation deferred)
- [x] Enrollment status choices in UI are now filtered by selected record state, and terminal enrollment records show no further allowed actions (P239; source-only)
- [x] Pickup-contact creation API with validity checks
- [x] Student document metadata registration API with validation
- [x] Tenant/school membership and permission checks on student routes
- [x] Student-management subscription entitlement check on creation
- [x] Student PII access permission and audit logging

### Remaining Student lifecycle work to investigate/implement
- [~] Applicant-to-student conversion integration exists; P235 adds transaction-lock idempotency protection for concurrent conversion requests. Conversion UI/API runtime validation remains deferred.
- [~] Enrollment safeguards (duplicate academic-year enrollment, roll-number conflicts, and configured section-capacity claims handled); approval and allocation workflows remain open
- [~] Enrollment terminal-status lifecycle API: P237 adds guarded ENROLLED/PROMOTED → TRANSFERRED/WITHDRAWN/COMPLETED transitions with end dates and seat release; new-year promotion/transfer allocation, re-admission and alumni remain open
- [~] Student profile edit UI now covers expanded API-backed personal/contact/address fields (P242); advanced search/filter UX and clearing existing fields remain open
- [ ] Bulk import/update/export workflows
- [ ] Student ID card generation
- [ ] Guardian family linking, duplicate detection and management UX review
- [ ] Pickup-contact management UI, authorization and expiry handling
- [ ] Document upload/storage flow and expiry/reminder lifecycle
- [~] Student photo handling — private upload/scanning, photo records listing, primary designation, approved secure preview, and soft-deactivation implemented (P244–P248); upload-new-then-deactivate replacement process supported, hard storage deletion remains intentionally deferred
- [ ] Mobile app parity for student-related staff workflows where applicable
- [ ] Student lifecycle notifications and reporting gaps
- [ ] Final build, migration, API security and E2E validation (deferred)

### Current phase progression
- [x] P231–P233 — cumulative student-lifecycle remediation work initiated (see phase reports)
- [x] P234 — enrollment duplicate and roll-number conflict safeguards
- [x] P235 — concurrent applicant-to-student conversion idempotency safeguard
- [x] P236 — direct enrollment now atomically claims a configured section seat and rejects capacity conflicts
- [x] P237 — enrollment status transition API and configured-capacity seat release
- [x] P238 — Student Admin enrollment history UI and status controls connected to existing API
- [x] P239 — enrollment UI now presents only API-allowed next status options for selected enrollment
- [x] P240 — capacity-aware enrollment section selection
- [x] P241 — configured-section enrollment preflight guard
- [x] P242 — expanded API-backed student profile editing fields
- [x] P243 — previous-school and medical profile fields; profile editor now loads existing values and supports clearing nullable profile fields
- [x] P244 — hardened dedicated PHOTO upload mode (JPEG/PNG only, 5 MB cap) through existing private quarantine/scanning pipeline; photo gallery/preview/replace/delete remains open

---

## Status legend
- `[x]` Source implementation completed (phase evidence recorded)
- `[ ]` Not yet completed / needs review
- `[~]` Partial implementation
- `[D]` Deferred by decision
- `[V]` Requires final validation

## Checklist

### Platform foundation & SaaS administration
- [ ] Multi-tenant/multi-school architecture
- [ ] Organization, school, branch/campus management
- [ ] School onboarding wizard
- [ ] Subscriptions, plans, licenses and feature limits
- [ ] Super Admin and School Admin dashboards
- [ ] Platform analytics and monitoring
- [ ] Tenant isolation and tenant configuration
- [ ] White-label branding, themes, logos and custom domains
- [ ] Feature flags and central settings
- [ ] Audit logs, backups and restore

### Authentication, authorization & security
- [ ] Login/logout, email verification, password reset
- [ ] MFA/OTP and account recovery
- [ ] RBAC and permission-based authorization
- [ ] Invitations and user lifecycle
- [ ] Session, device and login history management
- [ ] Account lockout/access policies
- [ ] API auth, refresh tokens and security audit

### Admissions & applicants (basic baseline; remaining gaps deferred)
- [x] Enquiries and application submission
- [x] Application resume/edit and tracking
- [x] Review queue, reviewer assignment and notes
- [x] Document upload/review/replacement/version history
- [x] Applicant correction and information-request workflows
- [x] Applicant inbox/notifications
- [D] Advanced admission lifecycle, offer/fee, notification/mobile parity gaps

### Student lifecycle
- [ ] Applicant-to-student conversion
- [ ] Student registration, unique IDs/admission numbers
- [ ] Student profile, photo, personal/address/contact data
- [ ] Guardian links, emergency contacts and permissions
- [ ] Medical information and previous-school details
- [ ] Student document repository and history
- [ ] Student status lifecycle and audit history
- [ ] Transfers, promotion, re-admission, withdrawal, graduation and alumni
- [ ] Student search/filter, bulk import/update/export
- [ ] Student ID cards

### Academic structure & school setup
- [ ] Academic years, terms/semesters
- [ ] Grades/classes, sections, capacity and class teachers
- [ ] Subjects, curriculum, boards and class-subject mapping
- [ ] CBSE, ICSE, State, IB, IGCSE and other board configuration
- [ ] Electives, languages, academic calendar, holidays and working days
- [ ] Promotion criteria and academic rules

### Enrollment & class allocation
- [ ] Academic-year enrollment and approval
- [ ] Class/section/roll-number allocation
- [ ] Capacity checks and enrollment history
- [ ] Re-enrollment, class/section changes and subject/elective allocation
- [ ] Enrollment cancellation, bulk operations and reports

### Staff, teacher & HR
- [x] Staff/teacher/non-teaching basic profiles and employee IDs (list/create/edit/status; source-level only)
- [x] Basic departments and designations
- [ ] Qualifications and experience
- [ ] Documents, contracts, joining/exit workflows
- [ ] Staff attendance, leave and shifts
- [x] Basic teacher class/section assignments
- [ ] Workload calculation and advanced assignment rules
- [ ] Payroll, salary components, deductions, payslips and reports

### Student & staff attendance
- [ ] Daily, period, class and subject attendance
- [ ] Present/absent/late and leave integration
- [ ] Corrections, approvals and bulk entry
- [ ] Calendar, percentages, shortage alerts
- [ ] Parent alerts, reports, export and mobile workflows
- [ ] Offline capture and sync

### Timetable & scheduling
- [ ] School/class/teacher/room timetable
- [ ] Periods, breaks, availability and room allocation
- [ ] Conflict detection and generation
- [ ] Manual adjustments and substitute teachers
- [ ] Publishing and change alerts

### Examination & assessment
- [ ] Exam setup/types/schedules
- [ ] Marks entry, bulk entry, verification and approval
- [ ] Rubrics, continuous/internal/practical assessments
- [ ] Grades/ranks calculations
- [ ] Report cards, progress reports and transcripts
- [ ] Re-exam, publishing, parent results and analytics

### Fees, billing & finance
- [ ] Fee structures/categories and class mapping
- [ ] Tuition/admission/transport/hostel/activity/optional fees
- [ ] Installments, invoices, student ledgers and charges
- [ ] Payments, online gateway, receipts and partial/advance payments
- [ ] Discounts, scholarships, concessions and late fees
- [ ] Refunds, reversals, outstanding dues and reminders
- [ ] Parent fee portal, dashboards, reports, reconciliation and accounting export

### Parent & guardian management
- [ ] Guardian profiles and many-to-many family/student links
- [ ] Relationship, primary/emergency guardians and permissions
- [ ] Parent account creation/verification and dashboard
- [ ] Child switching and academic/attendance/fee/result visibility
- [ ] Teacher communications, notifications and consent

### Parent mobile app
- [ ] Secure login and multi-child dashboard
- [ ] Student profiles, attendance, timetable and homework
- [ ] Assignments, exams, results and report cards
- [ ] Fee dues, payments, history and receipts
- [ ] Circulars, notices, announcements and push notifications
- [ ] Teacher messaging, meetings, leave requests and leave status
- [ ] Transport tracking, feedback and profile settings

### Teacher/staff mobile app
- [ ] Secure login, role dashboards and assigned classes/subjects
- [ ] Student directory and permitted profile access
- [ ] Attendance capture/edit, homework and assignments
- [ ] Submissions evaluation, marks entry and exam schedules
- [ ] Timetable, leave, notices and circulars
- [ ] Teacher-parent communication, announcements and push
- [ ] Offline capabilities where needed

### Homework & assignments
- [~] Homework drafts: individual plus grade/section targeting source-implemented (P322); bulk targeting uses currently loaded roster with a 100-record cap and partial-success reporting; runtime remains pending
- [x] Due dates, description, published visibility and private attachments/submission attachments supported in existing APIs
- [x] Online text submissions and resubmission flows present; teacher/mobile workflows retained
- [x] Basic grading and teacher feedback; School Admin submission review/grade UI added in P272
- [~] Parent visibility is consent/published scoped; reminders, reporting refinements and complete approval/publish workflow remain OPEN

### Communication & announcements
- [ ] School/class/section/role-targeted notices
- [ ] Email/SMS/push/in-app channels
- [ ] Templates, scheduling and delivery tracking
- [ ] Read acknowledgements, emergency broadcasts
- [ ] Notification preferences and multilingual content

### Transport
- [ ] Vehicles, capacity, routes, stops and schedules
- [ ] Student route assignments and transport fees
- [ ] Drivers/attendants and maintenance/fuel tracking
- [ ] Trips, GPS/live tracking and pickup/drop alerts
- [ ] Transport attendance and reports

### Library
- [ ] Catalogue, ISBN, categories, authors and publishers
- [ ] Copies, barcodes and search
- [ ] Issue, return, renewal and reservations
- [ ] Fines, student/staff accounts and lost/damaged books
- [ ] Library reports

### Inventory, assets & procurement
- [ ] Inventory categories/items/stock movements/warehouses
- [ ] Asset register, tags, assignment, return and depreciation
- [ ] Maintenance and vendor management
- [ ] Purchase requisitions, approvals, POs and goods receipt
- [ ] Stock audits, low-stock alerts, disposal and reports

### Hostel & boarding
- [ ] Hostels, rooms, beds and capacity
- [ ] Student allocations and transfers
- [ ] Hostel attendance, staff and fees
- [ ] Visitors, outpasses and leave permission
- [ ] Warden, complaints, maintenance and reports

### Discipline & student support
- [ ] Incident and discipline records
- [ ] Follow-up and escalation
- [ ] Counseling/support plans and behavior tracking
- [ ] Rewards/recognition
- [ ] Confidential controls and parent communication

### Medical & health
- [ ] Health profiles, conditions, allergies and medication
- [ ] Emergency contacts and nurse/medical room
- [ ] Incidents, visits, first aid and screening
- [ ] Parent emergency notification
- [ ] Sensitive data access restrictions

### Events & extracurriculars
- [ ] Events, calendar, sports, clubs and activities
- [ ] Registration, participants, permissions and attendance
- [ ] Competitions, achievements and certificates
- [ ] Notifications and activity fees

### Visitor & gate management
- [ ] Visitor registration, identification and purpose
- [ ] Host selection, approvals and badges
- [ ] Entry/exit records
- [ ] Authorized student pickup and gate passes
- [ ] Security dashboard and evacuation records

### Facilities & maintenance
- [ ] Buildings, facilities, classrooms and room allocation
- [ ] Maintenance tickets, assignment and priority
- [ ] Preventive maintenance, repair history and vendors
- [ ] Inventory, SLA and facilities reporting

### LMS & digital learning
- [ ] Courses, lessons, content and resources
- [ ] Videos/materials and learning progress
- [ ] Quizzes/question banks and learning activities
- [ ] Assignments, completion and analytics
- [ ] Teacher content creation

### Online classroom
- [ ] Virtual classroom/video integration
- [ ] Scheduling and class links
- [ ] Attendance integration and recordings
- [ ] Session notifications and collaboration

### Reports & analytics
- [ ] Dashboards and student/admission/attendance analytics
- [ ] Academic, exam and fee analytics
- [ ] Staff, transport and inventory analytics
- [ ] Class and student performance trends
- [ ] Custom report builder, filters and scheduled reports
- [ ] PDF/Excel/CSV exports

### Document management
- [ ] Student/staff/admission documents and certificates
- [ ] Categories, secure upload and versioning
- [ ] Expiry tracking and verification
- [ ] Access/download permissions and audit
- [ ] Bulk operations

### Certificates & letters
- [ ] Bonafide, transfer, character, study and conduct certificates
- [ ] Fee, leaving and custom certificates
- [ ] Templates, branding and serial numbers
- [ ] QR verification and history

### School website & public portal
- [ ] Public school profile and configurable pages
- [ ] Admission enquiry and online admissions
- [ ] News, events, notices, gallery and contact forms
- [ ] CMS, public documents, SEO and multilingual content

### Workflow & approvals
- [ ] Configurable workflow stages and rules
- [ ] Role-based/multi-level approvals
- [ ] Approve/reject/return for correction
- [ ] Delegation, escalation and SLA
- [ ] Audit and notification integration

### Messaging & collaboration
- [ ] Staff, teacher-parent and group messaging
- [ ] Class groups and direct messages
- [ ] Attachments, history, search and read status
- [ ] Permissions and moderation

### Settings & customization
- [ ] School profile, academics, fees and attendance rules
- [ ] Grading and promotion configuration
- [ ] Notifications, custom fields/statuses and form builder
- [ ] Templates, languages, timezone and regional formats
- [ ] Branding and configuration backup

### API & integrations
- [ ] Public API, versioning, OpenAPI/Swagger
- [ ] API keys, credentials and webhooks
- [ ] Retry/error handling and event architecture
- [ ] Integration logs/health
- [ ] Import/export APIs
- [ ] Payment, SMS, email, push, accounting and LMS integrations

### Automation
- [ ] Scheduled jobs, workers and task queues
- [ ] Retry policies and dead-letter/failed job handling
- [ ] Automated reminders and event triggers
- [ ] Configurable workflow rules
- [ ] Automation history and monitoring

### Mobile/offline/device
- [ ] Responsive web and mobile apps
- [ ] Secure mobile sessions, deep links and push
- [ ] Offline caching and offline workflows
- [ ] Queue/retry/synchronization and conflict handling
- [ ] Device registration, update handling and low-bandwidth optimization

### UX & accessibility
- [ ] Design system and navigation consistency
- [ ] Role-aware navigation and responsive layouts
- [ ] Loading, empty, error and success states
- [ ] Validation, confirmation and search UX
- [ ] Keyboard/screen-reader accessibility
- [ ] Localization including Kannada and other regional languages

### Data management & migration
- [ ] CSV/Excel import templates and validation
- [ ] Import error reports and duplicate detection
- [ ] Data cleansing, migration and export
- [ ] Archival, retention and deletion
- [ ] Tenant isolation and recovery

### Privacy & compliance
- [ ] Privacy policy, consent and parent consent
- [ ] Sensitive-data protection and least privilege
- [ ] Audit, retention and export/deletion requests
- [ ] Security incident workflow and compliance documents
- [ ] Terms and legal notices

### Reliability & operations
- [ ] Central logs, error and performance monitoring
- [ ] API/database/Redis monitoring
- [ ] Health/readiness/liveness checks
- [ ] Automated backup and restore drills
- [ ] Disaster recovery and incident response
- [ ] Rate limits, abuse protection and caching
- [ ] Performance, scalability and storage lifecycle

### Final validation (deferred until implementation freeze)
- [D] Unit, API, integration and migration tests
- [D] Authorization and tenant isolation tests
- [D] Web, staff mobile and parent mobile validation
- [D] End-to-end and regression tests
- [D] Performance/load/security/accessibility testing
- [D] Offline/browser/device compatibility
- [D] Build verification and deployment acceptance

## Phase update protocol
- After every phase, update checklist statuses based on actual source changes and phase evidence.
- Update root and docs copies of MASTER-OPEN-GAPS-REGISTER.md and MASTER-RESOLVED-GAPS-HISTORY.md; keep mirrors byte-identical.
- Report phase number/title, implemented scope, checklist deltas, open/deferred gaps, static source checks, archive integrity, and cumulative ZIP.
- Do not run builds, typechecks, DB/runtime migrations, formal tests, mobile builds, deployments or E2E until final validation phase is explicitly scheduled. Static source assertions and ZIP integrity checks are allowed.
- Continue phase-by-phase without approval pauses when user says Continue.


## P241 phase checklist
- [x] Configured-section enrollment preflight blocks mismatched section/grade/year selections.
- [x] Full-section selections are blocked using the loaded capacity snapshot.
- [x] Backend atomic capacity enforcement retained as authoritative.
- [ ] Build/typecheck/runtime/API/security/mobile/E2E validation (deferred).

## Student Lifecycle — current workstream status after P244

### 1. Student Records & Profiles
**Completed:** student creation/admission number; API-backed profile edits and nullable clearing; personal/contact/address/demographic fields; previous-school fields; restricted medical profile fields; profile-completeness endpoint/UI; PHOTO document upload through private storage pipeline with JPEG/PNG-only validation and 5 MB cap.

**Remaining:** approved secure photo preview/gallery; replace and remove/deactivate lifecycle; full profile edit/clear field audit; medical profile UX and field-level permission runtime verification; final API/UI/runtime validation (deferred).

### 2–9. Remaining Student Lifecycle workstreams
- [ ] Guardian & Family Management
- [ ] Student Lifecycle & History
- [ ] Enrollment & Allocation
- [ ] Pickup Contact Management
- [ ] Student Documents repository/lifecycle completeness
- [ ] Search, Bulk Operations & Output
- [ ] Mobile, Notifications & Student Insights
- [ ] Student Lifecycle integration completion

## P245 phase checklist
- [x] Student photo records panel added to School Admin.
- [x] Select student and fetch existing student detail using authenticated API.
- [x] Filter PHOTO document metadata and display name, MIME, size, scan status, and creation date.
- [x] Refresh photo records after successful upload.
- [ ] Binary photo previews/gallery.
- [ ] Primary-photo selection (completed in P246).
- [ ] Replace/delete photo lifecycle.
- [ ] Secure approved signed-download endpoint.
- [ ] Runtime/build/API/security/mobile/E2E validation (deferred).

## P246 phase checklist
- [x] `isPrimaryPhoto` persisted on student photo/document records.
- [x] Migration adds primary-photo marker.
- [x] Student detail exposes primary-photo marker.
- [x] Permission-guarded primary-photo selection endpoint.
- [x] Only clean, approved JPEG/PNG PHOTO records are eligible.
- [x] Advisory lock serializes primary-photo updates per student.
- [x] Selection clears prior marker and sets selected photo in transaction.
- [x] Admin UI displays current primary and action to select another eligible photo.
- [x] Primary-photo changes audit logged.
- [ ] Binary photo preview/gallery.
- [ ] Replace/remove photo lifecycle.
- [ ] Secure approved signed-download/preview integration UX.
- [ ] Runtime/build/API/security/mobile/E2E validation (deferred).

## Student Lifecycle — current workstream status after P251
### 1. Student Records & Profiles — in progress
**Completed implementation:** student creation/admission number; API-backed profile edits and nullable clearing; profile fields including personal/contact/address/demographic/previous-school/medical; profile completeness; photo upload (JPEG/PNG, 5 MB); secure quarantine/scanning; metadata listing; persisted primary photo; primary-photo selection; signed preview with 60-second expiry; deactivation and primary-marker clearing; preview thumbnail for the currently previewed record; explicit secure gallery-thumbnail loading for up to 20 eligible photos per request; profile update access guard; audit metadata listing changed and cleared fields without field values.

**Remaining:** gallery previews are implemented with a request cap of 20 (larger galleries require repeat requests); replacement workflow refinements; lifecycle/retention review; profile audit and medical UX refinements; final runtime/API/UI/mobile/E2E/security validation.

### 2–9. Remaining Student Lifecycle workstreams
- [ ] Guardian & Family Management
- [ ] Student Lifecycle & History
- [ ] Enrollment & Allocation
- [ ] Pickup Contact Management
- [ ] Student Documents repository/lifecycle completeness
- [ ] Search, Bulk Operations & Output
- [ ] Mobile, Notifications & Student Insights
- [ ] Student Lifecycle integration completion

### P250 note
Gallery thumbnail loading now requests individual signed previews for up to 20 active CLEAN JPEG/PNG records per explicit action. URLs expire in 60 seconds; failures are counted. No gap closure claimed.

### P251 note
Current primary photo cannot be deactivated via UI; API returns 409 if a primary-photo deactivation is attempted. Replacement sequence: upload, CLEAN scan, set replacement primary, deactivate old photo.


### P251 note
Current primary photo cannot be deactivated via UI; API returns 409 if a primary-photo deactivation is attempted. Replacement sequence: upload, CLEAN scan, set replacement primary, deactivate old photo.


## Cycle strategy updated at P252

- **Cycle 1 — Basic Functional Coverage:** breadth-first coverage across all product modules, using the permanent phase checklist in `MASTER-CYCLE-COVERAGE-CHECKLIST.md`.
- **Cycle 2 — Deep Completion:** advanced rules, edge cases, security, refinement, performance, automation, reporting and formal tests after Cycle 1 audit/completion.
- Preserve existing working code; mark statuses only with source evidence. Runtime verification remains deferred and is not implied by source-level Basic Complete.


## P254 Authentication coverage update
- Cycle 1 status: Partial (source audit; login, session refresh/rotation, logout, session revocation, permission loading, MFA and password-reset API foundations exist; forgot-password request UI added).
- Cycle 2 TODO: provider delivery, emailed reset-link UX, stronger password policy, runtime tests and security regression.


### P255 coverage note
Basic staff profile list/create/edit, departments/designations, employment type, status lifecycle, teacher class assignment and employment history workflows are source-present. Qualifications/experience, account invitation delivery, private documents UX, staff attendance/leave/shifts, workload, payroll and final runtime acceptance remain pending.


## P256 — SaaS Super Admin
- [x] Basic organization creation form connected to existing platform API
- [x] Search organizations by name/slug using API
- [x] API pagination controls
- [x] Loading, empty, success, and error states
- [ ] Platform lifecycle/detail admin UI expansion (Cycle 2)
- [ ] Runtime/API/browser/mobile validation (deferred)

## Subscription & Billing — P257
- [x] Public plan catalogue API and basic plan display in school-admin workspace
- [x] Monthly/quarterly/yearly plan selection UI
- [x] Organization subscription status and period display
- [x] Basic subscription start action connected to API
- [x] Organization invoice list display
- [x] Loading/empty/error/success states
- [ ] Runtime validation and build verification (deferred)
- [ ] Gateway checkout and provider reconciliation (Cycle 2)
- [ ] Subscription change/cancellation lifecycle (Cycle 2)
- [ ] Invoice detail/export/tax compliance (Cycle 2)


## P258 — School Settings & Configuration
- [x] School identity/profile settings (existing)
- [x] Academic year creation/list (existing)
- [x] Academic term creation and listing (P258 added UI and scoped GET API)
- [x] School calendars and event creation (existing)
- [x] Weekly working days (existing)
- [x] Attendance/grading policies (existing)
- [ ] Runtime validation across UI/API/database (deferred)
- [ ] Cycle 2: advanced policy configuration, multi-calendar lifecycle/edit/delete, deeper localization and validation

## Cycle 1 Phase P259 — Student Records Core
- Basic student create, list/search, detail, profile correction, guardian association, lifecycle, enrollment, document/photo management already exist at source level.
- P259 added first/last-name correction controls to the existing student profile editor.
- Runtime/build/API/browser/mobile validation deferred to final validation phases.


## Cycle 1 Phase P260 — Guardian & Family

- Existing student guardian linking, explicit duplicate review, guardian directory, primary/emergency/pickup/communications flags, guardian update API, parent invitation and consent foundations were retained.
- Expanded guardian edit UI to cover last name, alternate phone, occupation, address, active/inactive state, relationship, primary, emergency, pickup and communications flags.
- Source implementation only; runtime/build/API/browser/mobile validation is deferred.
- Advanced family identity matching, multi-student family dashboard refinements and deep privacy/security enhancements remain Cycle 2.


## Cycle 1 Phase P261 — Admissions
- Existing enquiry, application draft, review/status transitions, document review, offers, capacity/seat reservation, notifications, and enrollment conversion flows retained after source audit.
- Added optional date-of-birth field to School Admin draft-application form and included it in API payload.
- Runtime validation pending; no gap closed without evidence.
- Cycle 2 deep admissions refinements remain pending.

### P262 — Enrollment Cycle 1 audit
- [x] Student enrollment creation UI/API with academic-year, grade, section, roll number, enrollment date
- [x] Configured section-capacity selection and client/server capacity safeguards
- [x] Enrollment history retrieval/display and status changes
- [x] Status transition guardrails and audit trail foundations
- [~] Basic enrollment coverage source-audited; build/runtime/API/browser verification deferred
- [ ] Advanced bulk allocation, promotion/transfer automation, approval flows and enrollment reporting (Cycle 2)


## P263 — Student Lifecycle coverage audit
- [x] Student status transition state machine and valid transition checks are implemented.
- [x] School Admin lifecycle form supports status, effective date, reason, and refresh of history.
- [x] Status history API and UI display are present.
- [x] Enrollment status lifecycle supports promotion, transfer, withdrawal, and completion transitions.
- [x] Parent Mobile displays current student status with refresh foundation.
- [ ] Runtime API/database/browser/mobile validation (deferred).
- [ ] Board/jurisdiction lifecycle policy and required exit-document matrix (Cycle 2 / approval pending).

## P265 — Student Operations
- [x] Student list search (existing API)
- [x] First-page pagination (50 records, existing API)
- [x] Status filter for loaded records
- [x] CSV export of loaded records with scope note
- [x] Full school CSV export with pagination across all school records (status filter can be applied)
- [~] CSV import with preview, required-field/date-format validation, existing and in-file duplicate admission-number report, sequential create; no rollback on partial failure
- [~] Bulk selection of loaded page and selected-record CSV export; advanced bulk actions remain Cycle 2
- [ ] Runtime/API/browser validation


## P266 — Academic Structure
- [x] Existing academic-year and term setup UI/API retained
- [x] Existing grade-level CRUD UI/API retained
- [x] Section capacity create/update and listing UI connected to existing admissions capacity API
- [ ] Runtime validation of academic-year, term, grade, and section-capacity workflows
- [ ] Dedicated class/section entity management and advanced rollover (Cycle 2)


## P267 — Subjects & Curriculum
- Board profile, grade mappings, curriculum versions and per-grade subject mappings: existing source coverage retained.
- Subject mandatory/optional choice: added to School Admin form and API payload.
- Subject editing/archiving and advanced board-specific rules: Cycle 2 pending.
- Runtime validation: deferred.

## P269 — Teacher Academic Assignment
- Audited existing teacher assignment API, schema, School Admin form, assignment listing and timetable integration.
- Basic assignment create/list was already present. Extended assignment creation UI to capture class-teacher designation and optional effective start/end dates; payload uses API-supported `isClassTeacher`, `startsOn`, and `endsOn` fields. Assignment listing now surfaces curriculum subject reference, class-teacher flag, effective dates, and active status when present.
- Cycle 1: Partial (source implementation; runtime validation pending).
- Cycle 2: subject picker/assignment edit and lifecycle UX, deep workload rules, comprehensive authorization scenarios and runtime validation remain pending.


## P271 — Attendance Reports
- [x] Daily attendance report for selected date (source implementation)
- [x] Class/session-level counts and presence-rate summary
- [x] Student-level status list across sessions for the selected date
- [x] Historical date-range daily summary (Cycle 1 source implementation; P319, max 31 days)
- [ ] Advanced trends/chart/drill-down (Cycle 2)
- [x] Daily and historical-range CSV export (Cycle 1 source implementation; P320)
- [ ] Runtime/API/browser/mobile acceptance (deferred)


## P273 — Exams & Assessment
- [x] Basic exam register (list/create) in School Admin
- [x] Tenant-scoped exam record API with academic-year/grade/date validation
- [x] Marks entry/save API; student IDs validated within school; maximum-score validation
- [x] Publish marks and lock published assessments from edits
- [x] Roster-driven marks-entry UX with blank defaults, dirty-row tracking, validation, saved/changed/not-entered indicators, and changed-row save (P274/P321 source implementation; runtime pending)
- [ ] Assessment-to-report-card/result aggregation
- [ ] Full build/API/browser/mobile/E2E validation (deferred)


### P303 — Enrollment CSV bulk allocation update
- [x] CSV import preview with row-level validation and sequential submit for valid rows (source-level implementation).
- [~] Student lookup is limited to the loaded/search-result page; full-directory import remains open.
- [ ] Transactional rollback/reconciliation for partial import; promotion/transfer automation, approvals and enrollment reports remain open.

### P304 — Academic-year rollover validation core
- [x] CSV rollover candidate parser with required source/target year and grade/section fields
- [x] Row validation: duplicate student/target year, current enrollment snapshot, source status, and target-year duplicate
- [~] Rollover validation core is delivered, but not wired into an admin planner/execution UI or API
- [ ] Controlled rollover execution, transaction/compensation, approvals, reconciliation/reporting, and runtime acceptance

### P305 — Academic-Year Rollover Preview UI
- [x] Rollover CSV upload and preview workspace integrated in Students module
- [x] Load individual student enrollment histories for matching roster records
- [x] Row-level eligibility/error display using P304 rollover validation core
- [x] Preview-before-execution safety; mutation only occurs after explicit confirmation (execution added in P306)
- [~] Full-directory/server-side roster lookup remains open
- [x] Controlled sequential rollover execution with explicit confirmation and per-row result tracking (P306)
- [~] Transactional reconciliation, capacity reservation, approvals/reporting, and runtime validation remain open

### P306 — Academic-Year Rollover Execution Foundation
- [x] Explicit confirmation before rollover mutation
- [x] Sequential target-year enrollment creation through existing API endpoint
- [x] Per-row Created/Failed/Not run result reporting
- [x] Successful rows skipped on retry; failed rows remain retryable
- [~] Execution is non-transactional; partial success remains committed
- [ ] Full-directory lookup, transactional rollback/reconciliation, capacity reservation, approvals, audit/reporting, and runtime acceptance

### P307 — Rollover Capacity Validation & Conflict Prevention
- [x] Advisory capacity check integrated into rollover preview using section snapshots.
- [x] Available seats calculated from configured capacity minus enrolled and reserved seats.
- [x] Aggregate eligible CSV requests by target section; block oversubscribed candidates.
- [x] Case-insensitive section matching and ignore invalid rows for capacity demand.
- [~] Server-side atomic seat reservation and revalidation remain open; preview capacity can be stale.
- [ ] Runtime build/typecheck/API/browser/mobile validation.

### P308 — Rollover Execution Revalidation & Recovery
- [x] Refresh student enrollment history before execution
- [x] Refresh section capacity before execution when callback is configured
- [x] Revalidate candidate eligibility and block stale/conflicting rows
- [x] Reconcile matching target enrollment already created by earlier attempt
- [x] Per-row status reports Created, Failed, Blocked, Reconciled
- [~] Server-side atomic capacity claims, transaction/rollback, source-state update and concurrency-safe idempotency remain open
- [ ] Full-directory lookup and dependency-backed runtime validation

### P309 — Rollover Audit Trail & Execution Report
- [x] Row-level timestamped audit context for source/target academic year, grade/section and admission number
- [x] Capture Created, Failed, Blocked and Reconciled outcomes with details
- [x] Export execution audit as CSV with safe escaping
- [~] Server-side durable/immutable audit persistence, permissions and retention remain open
- [ ] Consolidated multi-run reporting and filtering remain open
- [ ] Full dependency-backed build/typecheck and API/web/mobile runtime validation


### P310 — Rollover school-directory lookup (Cycle 1)
- [x] Exact admission-number school directory lookup added to API
- [x] Preview resolves students beyond currently loaded student list
- [x] Execution resolves eligible rows via exact lookup before refresh/revalidation
- [x] Static verifier 5/5 PASS
- [ ] Runtime API/UI acceptance (deferred to final validation cycle)
- [ ] Cycle 2 atomic capacity, transaction compensation, durable audit/approvals

### P311 — Student Operations Cycle 1 (next)
- [ ] School-wide student export
- [ ] CSV import preview, row validation, duplicate report
- [ ] Basic bulk selection and bulk actions
- [ ] Runtime validation deferred until final test phase


## P312 — Fee Structure Draft Editing (Cycle 1 gap closure)
- [x] Edit existing DRAFT fee structure from School Admin workspace
- [x] Pre-populate structure code/name/description/currency/components
- [x] Edit component names, amounts, frequencies, mandatory flag, add/remove components
- [x] POST/PATCH selection based on create/edit mode
- [x] Cancel edit/reset form and success feedback
- [x] Blank optional date values omitted from API payload
- [ ] Effective dates pre-populated when editing
- [ ] Runtime API/browser/mobile/build validation (deferred)


## P313 — Fee Assignment Catalog Selectors (Cycle 1)
- [x] Academic year selector bound to active school session academic years
- [x] Grade selector bound to school curriculum grade catalogue
- [x] Section selector loads capacity-configured sections and filters by academic year/grade
- [x] Changing year/grade clears stale section and preview
- [x] Existing preview-confirm flow and draft-charge behavior retained
- [ ] Runtime API/browser/mobile/build validation (deferred)
- [ ] Cycle 2 optional component selection, student overrides, discounts/installments, structure versioning


## P314 — Fee Collection Payment History & Receipt (Cycle 1)
- [x] Added per-charge payment-history visibility toggle in Finance workspace (permission-gated by `fees.payments.read`).
- [x] Shows payment amount, method, date, reference and status when payment details are returned by the API.
- [x] Added printable receipt view with charge, student ID, payment reference/date/method, amount, paid-to-date and outstanding balance.
- [x] Receipt output escapes user-sourced text before writing printable HTML.
- [ ] Runtime/browser print acceptance and dependency-backed build/typecheck remain deferred.
- [ ] Cycle 2: formal receipt numbering/branding, PDF export, parent self-service receipt lifecycle refinements.


## P315 — Attendance Grade/Section Catalog Selection (Cycle 1)
- [x] Attendance session creation grade selector uses school curriculum grade catalogue instead of manual ID entry
- [x] Configured section selector filters by selected academic year and grade
- [x] Changing grade clears section selection
- [x] Manual section entry fallback retained when no capacity-configured section is available
- [x] Catalog loading/error status surfaced in attendance workspace
- [ ] Runtime API/browser/build acceptance remains pending
- [ ] Cycle 2 attendance enhancements (bulk marking, offline reconciliation, advanced reports and policy enforcement) deferred


## P316 — Timetable Filters & Class/Teacher Views (Cycle 1)
- [x] Weekly/class/teacher view selector
- [x] Teacher filter
- [x] Grade filter
- [x] Section filter (grade-aware option list)
- [x] Weekday filter
- [x] Combined filtering and filtered slot count
- [x] Reset filters
- [x] Teacher/class labels in overview
- [ ] Dependency-backed build/typecheck and runtime browser acceptance
- [ ] Cycle 2: automatic timetable generation, advanced conflict/workload rules and print views


## P317 — Subjects & Curriculum Usability (Cycle 1)
- [x] Subject mappings load for the explicitly selected curriculum version (not only the first version in the catalogue).
- [x] Subject catalogue table displays code, name, grade, type, mandatory flag, and weekly periods.
- [x] Catalogue view filters by selected grade; blank grade shows all subjects in selected version.
- [x] Prevent adding a duplicate subject code or name for the same grade in the loaded selected version (case-insensitive).
- [x] Subject create form retains mandatory/optional, subject type, weekly periods and sequence fields.
- [ ] Runtime/API/browser validation (deferred).
- [ ] Subject mapping edit/delete lifecycle and advanced board-specific rules (Cycle 2).

## P318 — Teacher Academic Assignment Usability (Cycle 1)
- [x] Active staff catalogue selection
- [x] Grade catalogue selection with dependent selection reset
- [x] Curriculum-version selector and subject loading
- [x] Grade-filtered subject dropdown (optional subject supported by API)
- [x] Configured section selection filtered by grade and academic year
- [x] Manual section fallback when no configured section exists
- [x] Class teacher designation and effective date fields retained
- [ ] Authenticated runtime/API/browser acceptance
- [ ] Backend duplicate/conflict and workload enforcement
- [ ] Assignment edit/deactivate lifecycle

## P319 — Attendance Historical Date Range Summary (Cycle 1)
- [x] Date range controls and validation (maximum 31 days)
- [x] Daily sessions/roster/marked/present/absent/late/presence-rate summary
- [x] Aggregate range metrics
- [ ] Runtime/API/browser/mobile acceptance
- [ ] Export, chart/drill-down and performance validation


## P320 — Attendance Report CSV Export (Cycle 1)
- [x] Daily report row-level CSV export (date, session, grade/section, student identifiers/name, attendance status, remarks)
- [x] Historical date-range daily-summary CSV export (up to 31-day range)
- [x] CSV quote escaping and UTF-8 BOM
- [x] Export buttons gated on generated report data
- [ ] Runtime/export acceptance in authenticated school environment
- [ ] Performance/mobile/browser validation
- [ ] Advanced trends and drill-down (Cycle 2)


## P321 — Exam Marks Entry Save-State Safeguards (Cycle 1)
- [x] Blank defaults for unentered students (not implicitly zero)
- [x] Changed-row tracking and partial-save behavior
- [x] Numeric, finite, and maximum-marks validation
- [x] Saved / changed / not-entered row indicators and counts
- [x] Post-save roster state refresh
- [ ] Runtime/API/browser/mobile acceptance
- [ ] Clear/delete saved-mark operation (API contract gap)
- [ ] Complete-roster publishing policy enforcement


## P322 — Homework Class/Section Targeting (Cycle 1)
- Source implemented individual, whole-grade, and grade + section target modes.
- Preview count is based on loaded student list; bulk targeting is blocked at the 100-student cap.
- Bulk creates student-scoped drafts sequentially using existing API; partial failures are surfaced.
- Draft/approval/publish workflow retained.
- Static source checks 12/12 PASS; TSX transpilation 0 diagnostics. Runtime/API/browser/mobile/build validation remains pending.

## P323 — Communication Center academic targeting (Cycle 1)
- [x] Persist optional academic year, grade-level and section targets for announcements
- [x] Validate year required for grade/section targeting and grade required for section targeting
- [x] Narrow parent/student recipient fan-out to enrolled target roster at publish
- [x] Keep existing consent and notification opt-out filters
- [x] Catalog-backed academic year/grade/section selectors and configured enrollment estimate (P324; estimate is not exact recipient count)
- [ ] Runtime/database migration/API/browser/mobile acceptance
- [ ] School-wide staff recipient targeting rules and delivery channels


## P324 — Communication Center catalog targeting
- [x] Academic-year dropdown from school session catalog
- [x] Grade dropdown from curriculum catalog
- [x] Section dropdown filtered by year and grade
- [x] Preview selected target scope and configured enrolled-seat estimate
- [x] Show school-wide/grade/section target distinctions
- [ ] Exact recipient preview accounting for account links, guardian consent and notification preferences
- [ ] Runtime, migration, API, browser, mobile and full build acceptance


## P325 Delivery Record
- Student portal homework list/status/score/feedback: source implemented.
- API returns published homework for authenticated active linked student, tenant scoped.
- Source assertions: 10/10; syntax transpilation: 0 diagnostics.
- Runtime verification deferred.

## P326 — Parent homework details and submission progress
- [x] Display due-date status and overdue indicator for homework without submission/grade
- [x] Display submission status and submitted date/time when available
- [x] Display score/max score and teacher feedback when available
- [x] Surface attachment names and scan state without exposing direct links
- [ ] Live API payload and runtime verification
- [ ] Parent attachment download/view workflow

## P327 — Student homework submission workflow
- [x] Student text-answer editor on homework cards
- [x] Submit and resubmit action
- [x] Student/tenant/published-assignment ownership checks
- [x] Graded submission lock
- [x] Submission refresh after successful action
- [ ] Runtime API/database and device validation (deferred)
- [ ] Student attachment submission (open gap)

## P328 — Teacher homework submission review
- [x] Submission status filter: All / Submitted / Resubmitted / Graded
- [x] Counts for each filter category
- [x] Empty state when filter has no rows
- [x] Retain submission answer text, attachment scan-state handling, and grade controls
- [ ] Pagination/all-submissions completeness and counts verified against runtime API
- [ ] Student name display, late classification, rubric review UX
- [ ] API/database/device/E2E validation (deferred)


### F04 — P411 progress
- [x] P411 board starter metadata catalogue for CBSE, ICSE, ISC, generic State Board, IB, IGCSE and Custom, including stage/domain categories and localization guidance; explicitly non-official metadata only
- [x] Read-only list and single-board-pack lookup API; 404 for unknown pack
- [ ] Official board-specific curriculum packs and outcomes/competency mappings with source provenance and approval/version workflow
- [ ] Academic planning, lesson planning, curriculum coverage and progression/rollover workflows
- [ ] Full curriculum management UI, imports/exports and board policy validation
