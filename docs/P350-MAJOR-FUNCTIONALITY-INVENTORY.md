# P350 — Major Functionality Inventory & Cycle 1 Gap Audit (Source-Structure Audit)

Date: 2026-11-20  
Baseline: P349 cumulative  
Purpose: Establish a major-functionality inventory before continuing feature phases.

## Audit method and limits
This audit inspected the P349 source tree, backend API module folders, Prisma schema model names, and School Admin/mobile app source structure. It is a **source-structure and implementation-evidence audit**, not a live runtime acceptance audit. Presence of files/models/workspaces is evidence that work exists, but does not prove every user journey is connected end-to-end. Where no dedicated module was found, it is marked `NOT EVIDENCED AS A DEDICATED MODULE` rather than definitively missing; overlapping capabilities may exist elsewhere.

Cycle 1 means basic functional flows across API, database, web, and relevant mobile apps. Cycle 2 includes deep test coverage, runtime validation, advanced edge cases, UX polish, optimization, security audit/pentest, and advanced integrations.

## Source structure snapshot
- Backend module folders detected: access, admissions, assessments, attendance, auth, billing, curriculum, documents, journeys, notifications, operations, organizations, parents, platform, report-cards, schools, security-operations, staff, students.
- Prisma schema models detected: 131.
- School Admin workspaces detected include: Admissions, Attendance, Communication, Data Governance, Enrollment Rollover, Exam/Assessment, Fee Structures, Finance, Journey Readiness, Messaging, Notification Suppression, Operational Modules, Parent Operations, Report Card Governance, School Branding, School Configuration, Security Operations, Student Account Links, Subscription Billing, Timetable.
- Separate app source directories detected: school-admin, organization-admin, super-admin, public-portal, teacher-mobile, parent-mobile, student-mobile, staff-mobile.

## Functional inventory and provisional status
Legend: `SOURCE EVIDENCE` = relevant backend models/module/workspace exist; `AUDIT/CONNECTIVITY REQUIRED` = basic journey completion still needs route/UI/persistence integration review; `NOT EVIDENCED AS DEDICATED MODULE` = no distinct module directory found in inspected module structure.

| Major area | Source evidence found | Provisional Cycle 1 status | Recommended action |
|---|---|---|---|
| Identity, auth, access & tenant foundation | auth/access/organizations/platform; User, memberships, roles, permissions, sessions, MFA, audit, lifecycle models | SOURCE EVIDENCE; runtime integration not verified | Preserve; Cycle 2 runtime authorization/tenant audit |
| School configuration & academic year/calendar | schools/curriculum; School, SchoolProfile, AcademicYear, AcademicTerm, SchoolCalendar, CalendarEvent, policy, board profile | SOURCE EVIDENCE; audit workflow integration | Validate create/configure/publish flow |
| Curriculum & subject catalogue | curriculum module; CurriculumVersion, CurriculumSubject, GradeLevel | SOURCE EVIDENCE; audit board mapping and assignment flow | Confirm class/grade/subject end-to-end |
| Admissions | admissions module; admission enquiry/application/doc/offer/reservation/payment models | Cycle 1 BASIC FLOW COMPLETE per P331–P349 | Freeze Cycle 1; carry advanced gaps to Cycle 2 |
| Student SIS & lifecycle | students module; Student, StudentStatusHistory, StudentEnrollment, student lifecycle tests | SOURCE EVIDENCE; lifecycle flow needs holistic audit | Audit registration/transfer/promotion/exit and linked modules |
| Guardians & parent identity | parents/students modules; Guardian, StudentGuardian, ParentInvitation, StudentAccountLink | SOURCE EVIDENCE; cross-app journey audit | Validate guardian invitation/link/multi-child flow |
| Attendance | attendance module, AttendanceSession, StudentAttendance, AttendanceCorrectionRequest; AttendanceWorkspace | SOURCE EVIDENCE; teacher/parent integration audit | Validate marking, corrections, summaries, notifications |
| Timetable & room scheduling | staff module; TeacherTimetableSlot, TeacherTimetableException, BellScheduleTemplate, SchoolRoom; TimetableWorkspace | SOURCE EVIDENCE; conflict and mobile publishing audit | Validate timetable authoring/assignment/viewing flow |
| Staff & teacher management | staff module; StaffMember, employment history, assignment, documents, invitations; staff workspaces | SOURCE EVIDENCE; role and lifecycle integration audit | Validate hiring/profile/assignment/leave basics; identify gaps |
| Assessment & examinations | assessments module; SchoolAssessmentExam, result calculation; ExamAssessmentWorkspace | SOURCE EVIDENCE; marks/results flow integration audit | Validate exam creation → marks → result calculation/publish |
| Report cards | report-cards module; StudentReportCard, schema version, approval, PDF artifact models | SOURCE EVIDENCE; publishing/student-parent retrieval audit | Validate generation/approval/publish/retrieve basic flow |
| Fees & billing | billing module; FeeStructure, StudentFeeCharge, StudentFeePayment, refunds, Billing/Subscription models; fee and finance workspaces | SOURCE EVIDENCE; reconcile school fee vs platform billing boundaries | Validate student fee assessment → collect → receipt → dues/refund |
| School accounting/ledger | AccountingAccount, journal entries/lines, period, historical import and allocation models; ledger service | SOURCE EVIDENCE; Cycle 1 completeness requires focused flow audit | Validate basic fee/payment posting and reconciliation link |
| Teaching, homework & assignments | HomeworkAssignment, Submission, Attachment, GradeEvent models | SOURCE EVIDENCE; dedicated route/workspace connectivity not confirmed | Audit teacher create → student submit → teacher grade → parent/student view |
| Communications & messaging | notifications module, SchoolCommunication, threads/messages, ParentNotification, outbox/delivery events; Communication/Messaging workspaces | SOURCE EVIDENCE; provider configuration and user-facing journeys audit | Validate notice/message creation, recipient selection, delivery status, mobile visibility |
| Parent portal/mobile | parent-mobile app folder, parent module, parent operations and portal security source | SOURCE EVIDENCE; full portal coverage/device runtime not verified | Audit attendance, fees, notifications, reports, messages, multiple children |
| Student mobile | student-mobile app directory; shared student models/API | APP SOURCE PRESENT; feature completeness unclear | Audit basic dashboard, timetable, attendance, assignments, results, fees |
| Teacher mobile | teacher-mobile app directory; staff/attendance/timetable/assessment/hw backend evidence | APP SOURCE PRESENT; feature completeness unclear | Audit basic teacher daily workflow across mobile |
| Staff mobile | staff-mobile app; AdmissionsPanel | SOURCE EVIDENCE, at least admissions-specific functionality | Audit remaining staff mobile daily workflows; avoid duplicate admissions work |
| Library | No dedicated `library` backend module/model names identified in inspected structure | NOT EVIDENCED AS A DEDICATED MODULE | High-priority Cycle 1 gap audit; add basic catalogue/issue/return if absent |
| Transport | No dedicated `transport` backend module/models identified | NOT EVIDENCED AS A DEDICATED MODULE | Audit and implement route/stop/student assignment/basic fees if absent |
| Hostel/residential | No dedicated `hostel` module/model names identified | NOT EVIDENCED AS A DEDICATED MODULE | Audit and implement buildings/rooms/beds/allotment/fees if absent |
| Health/wellbeing | No dedicated `health`/clinic module/model names identified | NOT EVIDENCED AS A DEDICATED MODULE | Audit and implement restricted medical/emergency basics if absent |
| Canteen/meal services | No dedicated `canteen` module/model names identified | NOT EVIDENCED AS A DEDICATED MODULE | Audit and implement menu/orders/meal tracking basics if absent |
| HR leave/performance/recruitment | Staff/employment records present; dedicated recruitment, leave, performance evidence not found in inspected modules | PARTIAL/NOT EVIDENCED | Audit; implement basic leave and HR lifecycle only if missing |
| Payroll | No dedicated `payroll` backend module/model names identified | NOT EVIDENCED AS A DEDICATED MODULE | Audit; basic salary setup, monthly payroll, payslip/payment flow if absent |
| Reports/analytics | Report cards, finance, operational workspaces exist; no general analytics module detected | PARTIAL SOURCE EVIDENCE | Ensure minimum operational reports; advanced analytics Cycle 2 |
| SaaS platform/super-admin | platform/organizations/billing; Super Admin, Organization Admin app directories; subscription, entitlement, tenant-domain models | SOURCE EVIDENCE; provisioning lifecycle audit required | Validate tenant create → school setup → plan/trial → status/renewal/suspension basics |
| Data governance & documents | documents module; governance, retention, consent, legal hold models; workspaces | SOURCE EVIDENCE; end-to-end lifecycle audit | Validate upload → access → retention/export/deletion request basic flow |
| Integrations/operations | notifications provider/webhooks, billing payment gateway, operations/alerts, security operations, observability folders | SOURCE EVIDENCE; provider/runtime validation deferred | Keep basic provider setup functional; advanced monitoring/runtime validation Cycle 2 |

## Recommended next major Cycle 1 sequence
1. **P351 Academic Management workflow audit/closure** — academic year/term, class/grade/section, subject/curriculum setup, class promotion linkage. Implement only missing end-to-end basics.
2. **P352 Student Lifecycle audit/closure** — enrollment, transfers, class/section changes, promotion, withdrawal/exit, documents/certificates. Reuse admissions conversion and existing lifecycle service.
3. **P353 Attendance flow integration** — staff/teacher marking, correction approval, parent/student summaries, notification link.
4. **P354 Teaching & Assignment flow** — lesson/homework create, student submission/attachment, teacher evaluation, results visibility.
5. **P355 Exams & Results flow** — exam setup, schedule, marks entry, calculation, publish, report-card linkage.
6. **P356 Fees & School Finance flow** — student charges, payment, receipt, balance, concessions/refunds and accounting basic link; avoid overlap with SaaS billing.
7. **P357 HR & Leave basic flow** — staff profile/assignment plus leave request/approval/status if not already present.
8. **P358 Payroll basic flow** — basic salary structures, run, payslip, payment status if absent.
9. **P359 Parent & Student app coverage audit/closure** — complete the minimum journeys from mobile apps, not app-only UI.
10. **P360 Teacher app daily-workflow audit/closure** — timetable, attendance, assignments, marks and notifications.
11. **P361 Communication journey closure** — announcements, message audiences, channel handoff, status and mobile visibility.
12. **P362 Library basics** — catalogue, copy inventory, issue, return, renewal, reservation, overdue.
13. **P363 Transport basics** — vehicles, route/stops, student assignment, pickup/drop communication (GPS advanced integration Cycle 2).
14. **P364 Hostel basics** — rooms/beds, allotment, transfers, attendance/outpass, fee handoff.
15. **P365 Student health & incident basics** — access-restricted health profile, emergency contacts, visit/incident records.
16. **P366 Canteen basics** — menu, meal plans, order and consumption tracking.
17. **P367 SaaS Super Admin basic lifecycle** — tenant provisioning, school, plan, subscription, limits, suspension/reactivation and support-safe visibility.
18. **P368 Minimum reports/dashboard coverage** — admissions, student strength, attendance, academics, fees, staff and transport/hostel where implemented.
19. **P369 Integration & operations basics** — import/export, backup/restore path, audit, provider config and tenant-aware operation gaps.

This sequence is a working priority plan. Phase-by-phase source audits may reorder priorities if a prerequisite is missing or an existing end-to-end flow is already complete.

## Cycle 2 carry-forward (do not block Cycle 1 module progression)
- Runtime DB/API and browser/device validation, comprehensive API/web/mobile E2E, regression and full CI evidence.
- Full tenant-isolation and permission-negative suite, RLS verification, pentest and rate-limit abuse runtime testing.
- Advanced curriculum/board rule validation, sophisticated timetable optimization, analytics/report builder, deep GPS/biometric integrations.
- Performance/load testing, offline synchronization edge cases, accessibility and UX polish, backup/DR RPO/RTO validation, compliance/legal review.

## Audit result
The repository has broad source evidence for the core academic, student, attendance, timetable, staff, assessment, report-card, admissions, billing/finance, parent, notification, document/governance and platform areas. Dedicated source structures were **not identified** for Library, Transport, Hostel, Health, Canteen and Payroll during this limited audit. Those areas are therefore the clearest major candidates to audit/implement next. The inventory intentionally avoids asserting that existing source evidence proves a complete runtime journey.

## Change notes
- P350 adds inventory and priority documentation only; no application source, database schema or migration changes.
- Existing functionality preserved.
- Root master open-gap register mirrored unchanged in this phase; module inventory is not a gap closure record. Future phases should update the master register with concrete implementation gaps and evidence.
- P350 verifier checks inventory artifacts and baseline archive preservation only.
