# Missed / Deferred Functionality Backlog

**Purpose:** identify product and workflow functionality that still needs implementation or completion, separate from build/migration/runtime test execution.

**Important source caveat:** the legacy deduplicated active register was originally assembled at P275 and then received later appendenda. It is useful as a backlog discovery source, but the P579 `SCHOOL-SaaS-FEATURE-GAPS.md` (all 729 open ledger entries) is authoritative for current status. This file does not close, supersede or renumber any gap. Some legacy items may already have partial or source-level implementation in later phases (for example Dockerfiles, mobile journeys, workers or lifecycle APIs); inspect current source and the P580 feature-gap matrix before scheduling implementation. Similar descriptions may still need semantic deduplication and feature-owner review.

## Product functionality backlog carried forward

## Implementation/review gaps
1. **Accounting model and financial reconciliation specification — OPEN** — `P00-G008`
2. **Add a first-class tenant lifecycle status column and validated transition state machine on Organization — IN_PROGRESS (P81 authorized transition endpoint and lifecycle audit implemented; global enforcement across every route/worker remains)** — `P03-G001`
3. **Add API integration tests for teacher self-scope and School Admin write authorization.** — `P18-G009`
4. **Add API integration, browser E2E, concurrency and complete accepted-application conversion tests — OPEN** — `P09-G014`
5. **Add API integration, browser E2E, RLS and lifecycle transition tests — OPEN** — `P10-G013`
6. **Add API, browser and mobile E2E tests for student and guardian journeys — OPEN** — `P08-G012`
7. **Add API/web Dockerfiles and production deployment profiles — OPEN** — `P01-G014`
8. **Add application detail endpoint and complete paginated/filterable application/enquiry APIs — OPEN** — `P09-G004`
9. **Add audit coverage for profile edits, document access, assignment changes and privileged support access — OPEN** — `P10-G017`
10. **Add audit event pipeline for login, logout, permission changes and privileged actions — OPEN** — `P02-G013`
11. **Add audit events for calendar, event, working-day and policy mutations — OPEN** — `P06-G005`
12. **Add audit events for guardian relationship changes, pickup permissions and document access — OPEN** — `P08-G013`
13. **Add audit, retention, consent, export/deletion and child privacy/legal controls — OPEN** — `P09-G015`
14. **Add authorization regression, privilege-escalation, IDOR and API/browser E2E security tests — OPEN** — `P11-G015`
15. **Add automatic enquiry-to-application conversion and follow-up task/communication workflows — OPEN** — `P09-G018`
16. **Add billing address, legal entity, tax registration and invoice numbering per jurisdiction — OPEN** — `P05-G009`
17. **Add board catalogue validation and country/state-specific school profile rules — OPEN** — `P06-G006`
18. **Add board-specific curriculum packs with provenance, versioning and review/approval workflow — OPEN** — `P07-G005`
19. **Add board-specific language and multilingual subject configuration rules — OPEN** — `P07-G011`
20. **Add board/grade age eligibility, required-document checklists and configurable admission rules — OPEN** — `P09-G007`
21. **Add bulk grade/subject/curriculum import and export with validation and rollback — OPEN** — `P07-G007`
22. **Add bulk student import with preview, validation, duplicate report and rollback — OPEN** — `P08-G009`
23. **Add composite constraint proving SchoolMembership school belongs to its organization — OPEN** — `P02-G006`
24. **Add comprehensive audit logging for role, permission, invitation and account-link changes — OPEN** — `P11-G013`
25. **Add curriculum data change audit history and authorized approval flow — OPEN** — `P07-G012`
26. **Add curriculum setup end-to-end tests and tenant-isolation regression suite — OPEN** — `P07-G010`
27. **Add curriculum version activation, retirement and effective-date conflict handling — OPEN** — `P07-G006`
28. **Add database/Redis readiness probes and graceful shutdown — OPEN** — `P01-G008`
29. **Add department/designation lifecycle, hierarchy and validation rules — OPEN** — `P10-G007`
30. **Add duplicate candidate detection, safe merge and admission number generation/sequence — OPEN** — `P09-G012`
31. **Add duplicate detection, candidate matching, safe merge and admission-number allocation — OPEN** — `P08-G005`
32. **Add duplicate staff detection, employee-number generation and safe rehire/merge process — OPEN** — `P10-G016`
33. **Add encrypted secret settings and external secret manager integration — OPEN** — `P03-G007`
34. **Add end-to-end school setup, academic-year, term and calendar flows — OPEN** — `P06-G012`
35. **Add end-to-end, authorization-negative and audit verification tests — READY_FOR_VERIFICATION** — `P03-G012`
36. **Add enrollment capacity, section allocation and promotion/rollover workflows — OPEN** — `P08-G011`
37. **Add entitlement and school-level feature/usage enforcement to every admissions endpoint — OPEN** — `P09-G016`
38. **Add field-level PII masking, break-glass access and support-session controls — OPEN** — `P11-G012`
39. **Add field-level privacy controls and verified access scopes for student health/medical records — OPEN** — `P08-G015`
40. **Add full API integration tests and isolated DB lifecycle — OPEN** — `P01-G012`
41. **Add GET /auth/me with current user, memberships and scoped permissions — READY_FOR_VERIFICATION (P79 source delivered; runtime/API authorization tests pending)** — `P02-G017`
42. **Add granular HR, principal, department-head, teacher and front-office permissions — OPEN** — `P10-G005`
43. **Add granular role permissions for admissions/front-office/reviewers and field-level PII access — OPEN** — `P09-G009`
44. **Add granular student permissions for admissions, teachers, nurses and front office — OPEN** — `P08-G004`
45. **Add guardian/parent self-service application portal, OTP verification, consent and application tracking — OPEN** — `P09-G008`
46. **Add HR, principal, department-head and front-office permission matrices reviewed by school operators — OPEN** — `P11-G007`
47. **Add idempotency keys and concurrency-safe lifecycle operations — OPEN** — `P03-G009`
48. **Add invitation idempotency, duplicate prevention and race-condition tests — OPEN** — `P04-G008`
49. **Add learning outcomes, competency standards, textbooks and learning-resource mapping — OPEN** — `P07-G008`
50. **Add membership suspension, reactivation and offboarding workflows — OPEN** — `P04-G009`
51. **Add metrics, tracing and structured operational observability — OPEN** — `P01-G010`
52. **Add mobile CI workflows — OPEN** — `P01-G011`
53. **Add multi-currency rounding, FX and tax-inclusive/exclusive price semantics — OPEN** — `P05-G015`
54. **Add multi-school staff membership and cross-campus role assignment controls — OPEN** — `P11-G011`
55. **Add notification templates and reliable email/SMS/WhatsApp delivery for stages and offers — OPEN** — `P09-G011`
56. **Add object-storage logo upload, private access and lifecycle cleanup — OPEN** — `P06-G010`
57. **Add organization lifecycle enforcement to all API routes, background workers and scheduled jobs — OPEN** — `P04-G004`
58. **Add organization owner transfer and additional owner/admin management workflows — OPEN** — `P04-G007`
59. **Add organization/school end-to-end onboarding and switching tests — OPEN** — `P04-G010`
60. **Add overlap prevention and concurrency-safe activation for academic years and terms — OPEN** — `P06-G003`
61. **Add permission cache invalidation/versioning and revocation propagation to active sessions — OPEN** — `P11-G016`
62. **Add platform-admin plan CRUD, versioning and safe plan-change migration — OPEN** — `P05-G008`
63. **Add platform-level access/RLS policy for webhook event processing with least privilege — OPEN** — `P05-G013`
64. **Add Playwright web and Maestro/Detox mobile authentication flows — OPEN** — `P02-G014`
65. **Add rate limiting and production proxy/CORS configuration — OPEN** — `P01-G009`
66. **Add rate limiting, lockout/backoff and credential-stuffing protections — OPEN** — `P02-G010`
67. **Add refund/partial refund and payment reconciliation ledger — OPEN** — `P05-G010`
68. **Add RLS database-role privilege audit and production connection-pool validation — OPEN** — `P04-G012`
69. **Add role assignment expiry, effective dates, temporary delegation and approval workflows — OPEN** — `P11-G010`
70. **Add role editing, role deletion, permission change audit and protected system-role policy — OPEN** — `P11-G008`
71. **Add route-level platform permissions rather than relying only on isPlatformAdmin boolean — OPEN** — `P03-G004`
72. **Add settings schema validation, versioning, rollback and change approval — OPEN** — `P03-G008`
73. **Add staff PII redaction, retention, export/deletion and privacy/legal review — OPEN** — `P10-G014`
74. **Add staff/teacher self-service profile, leave, attendance, payroll and HR workflows — OPEN** — `P10-G011`
75. **Add student/guardian data retention, deletion, export and child privacy/legal review — OPEN** — `P08-G008`
76. **Add substitute teacher, holiday and date-specific timetable exception handling.** — `P18-G006`
77. **Add substitute teacher, multi-school staff and cross-campus assignment workflows — OPEN** — `P10-G018`
78. **Add teacher assignment scope enforcement to attendance, exams, grading and student APIs — OPEN** — `P10-G009`
79. **Add teacher mobile week navigation, offline cache and device E2E coverage.** — `P18-G008`
80. **Add teacher-specific student field scopes, attendance, assessment and grade access boundaries — OPEN** — `P11-G006`
81. **Add tenant-isolation and authorization penetration/security test suite — OPEN** — `P02-G015`
82. **Add tenant-level status metrics that distinguish current state from historical lifecycle events — OPEN** — `P03-G010`
83. **Add timetable editor, update API, bulk import/export and bell schedule templates (P19 update, JSON bulk validate/import and JSON export APIs implemented; UI, CSV and templates remain open).** — `P18-G005`
84. **Add timezone, DST, locale, date-format and week-start integration tests — OPEN** — `P06-G009`
85. **Add timezone/DST tests and formally define school-local date semantics.** — `P18-G007`
86. **Add webhook replay protection, signature tests, idempotency race tests and gateway sandbox E2E — OPEN** — `P05-G011`
87. **Admission event notification delivery via email/SMS provider/templates — OPEN.** — `P190-G005`
88. **Applicant notification/inbox for scan and review status changes — OPEN** — `P228-G002`
89. **Apply migration on clean PostgreSQL and verify rollback/recovery procedure.** — `P18-G002`
90. **Apply P04 migration on clean PostgreSQL and validate all Prisma models/migrations — READY_FOR_VERIFICATION** — `P04-G001`
91. **Apply P09 migration on clean and upgraded PostgreSQL databases; verify rollback/recovery — READY_FOR_VERIFICATION** — `P09-G002`
92. **Apply P10 migration on clean and upgraded PostgreSQL databases; verify rollback/recovery — READY_FOR_VERIFICATION** — `P10-G002`
93. **Apply P11 migration on clean/upgraded databases; validate existing RBAC duplicates and rollback — READY_FOR_VERIFICATION** — `P11-G002`
94. **Assigned-to-me/personal queue requires reliable session user identity; auto-balancing, assignment audit, SLA/priority, notifications and mobile parity remain OPEN.** — `P217-G003`
95. **Backup, disaster recovery, RPO and RTO validation — OPEN** — `P00-G014`
96. **Binary evidence upload/storage integration and runtime verification for reconciliation evidence — OPEN (P151 delivers durable references only; no binary upload is claimed)** — `P151-G001`
97. **Board/curriculum rules validation across target jurisdictions — OPEN** — `P00-G005`
98. **Break-glass support access with approval and audit controls — OPEN** — `P00-G016`
99. **Build all four web applications — READY_FOR_VERIFICATION** — `P01-G005`
100. **Build full Super Admin login and CRUD UI with secure token storage — OPEN** — `P03-G011`
101. **CAPTCHA, contact verification, secure recovery UX, proxy trust review, public document security review — OPEN.** — `P201-G003`
102. **Complete permission matrix and resource-level authorization policy — OPEN** — `P00-G004`
103. **Complete privacy/security threat model and independent access-control review — OPEN** — `P11-G018`
104. **Configure invitation email delivery, resend, revoke and delivery audit — OPEN** — `P04-G003`
105. **Configure real payment gateway adapter and hosted checkout sandbox — OPEN** — `P05-G002`
106. **Connect admissions UI to API and add applicant review, document checklist, capacity and offer screens — OPEN** — `P09-G013`
107. **Connect attendance and exam modules to school policy configuration — OPEN** — `P06-G008`
108. **Connect School Admin board/grade/curriculum UI to authenticated APIs and persistent state — OPEN** — `P07-G009`
109. **Connect School Admin configuration preview to authenticated APIs, tenant/school selection and persisted form state — OPEN** — `P06-G004`
110. **Connect School Admin role/permission UI to live APIs and assignment workflows — OPEN** — `P11-G014`
111. **Connect School Admin staff UI to APIs and add full CRUD, filters, assignment and document screens — OPEN** — `P10-G012`
112. **Country-specific legal and privacy compliance review — OPEN** — `P00-G006`
113. **Custom domains and white-label tenant routing — OPEN** — `P00-G012`
114. **Data export, retention and deletion lifecycle — OPEN** — `P00-G020`
115. **Dedicated UI, explicit consent record/version, audit trail and withdrawal semantics remain OPEN.** — `P192-G003`
116. **Detailed ERD constraints and referential integrity review — OPEN** — `P00-G001`
117. **Durable event retry/reconciliation when notification enqueue fails — OPEN.** — `P190-G006`
118. **Durable refund discrepancy notes and status history runtime verification — READY_FOR_VERIFICATION (schema/API/UI source added; runtime acceptance pending)** — `P149-G001`
119. **Eligibility rule configuration UI, public-facing error UX, and mobile checklist parity — OPEN.** — `P196-G004, P196-G004`
120. **Email/SMS provider dispatch, channel preference/consent integration, provider receipts and retry/dead-letter UI — OPEN.** — `P200-G004`
121. **Enable PostgreSQL RLS on tenant-owned tables and add missing-context/cross-tenant tests — OPEN** — `P02-G005`
122. **Enforce active school membership and scoped role checks on every school endpoint — OPEN** — `P04-G006`
123. **Enforce curriculum entitlement and usage limits across every curriculum API and background process — OPEN** — `P07-G013`
124. **Enforce organization-level role administration and delegated access administration — OPEN** — `P11-G009`
125. **Enforce plan entitlements and feature limits across all school configuration mutations — OPEN** — `P06-G011`
126. **Enforce plan entitlements and usage limits in all module APIs, UI and background jobs — OPEN** — `P05-G007`
127. **Enforce staff entitlement, staff-count limits and assignment limits across all entry points — OPEN** — `P10-G015`
128. **Enforce tenant suspended/deactivated state across every tenant API, worker and scheduled job — OPEN** — `P03-G003`
129. **Ensure plan seed migration updates existing plan JSON without overwriting operator-customized commercial settings — OPEN** — `P06-G014`
130. **Ensure student and guardian PII is redacted from logs, traces and support tools — OPEN** — `P08-G014`
131. **Execute cross-tenant RLS and authorization-negative tests using non-owner DB role — READY_FOR_VERIFICATION** — `P07-G002`
132. **Execute cross-tenant RLS and composite-FK negative tests for all P10 tables — READY_FOR_VERIFICATION** — `P10-G003`
133. **Execute cross-tenant RLS and school authorization-negative tests with non-owner DB role — READY_FOR_VERIFICATION** — `P08-G002`
134. **Execute forced-RLS cross-tenant tests for timetable slots using non-owner DB role.** — `P18-G003`
135. **Execute GitHub Actions CI and retain evidence — READY_FOR_VERIFICATION** — `P01-G007`
136. **Execute RLS missing-context and cross-tenant read/write denial tests using non-owner API DB role — READY_FOR_VERIFICATION** — `P04-G002`
137. **Execute role/permission and tenant RLS integration tests using non-owner DB role — READY_FOR_VERIFICATION** — `P11-G003`
138. **Execute tenant RLS and composite-FK negative tests for all admissions tables — READY_FOR_VERIFICATION** — `P09-G003`
139. **Execute two-tenant/two-school RLS positive and negative tests with non-owner DB role — READY_FOR_VERIFICATION** — `P06-G002`
140. **Extend RLS to Organization, AuditLog and every future tenant-owned table with safe platform-admin path — OPEN** — `P04-G005`
141. **Generate invoices automatically with GST/tax rules, credit notes and downloadable PDFs — OPEN** — `P05-G004`
142. **Global identity linking and duplicate-account resolution rules — OPEN** — `P00-G003`
143. **Guardian collision resolution UI/account-linking workflow remains OPEN.** — `P195-G004`
144. **Implement admission document binary upload, malware scanning, verification/rejection endpoint and signed access — OPEN** — `P09-G005`
145. **Implement admission fee handoff integration with student fee ledger, invoice/payment reconciliation — OPEN** — `P09-G010`
146. **Implement assignment conflict detection, unique class-teacher rules and timetable integration — OPEN** — `P10-G008`
147. **Implement complete support/break-glass access with independent approval, expiry enforcement, session recording and audit — OPEN** — `P03-G006`
148. **Implement concurrency-safe seat reservation, section assignment and release on decline/withdrawal — OPEN** — `P09-G006`
149. **Implement dunning, failed-payment retries, grace periods and suspension policy — OPEN** — `P05-G006`
150. **Implement email/phone verification and invitation acceptance workflows — OPEN** — `P02-G008`
151. **Implement employment history update API, contract lifecycle, rehire approval and separation checklist — OPEN** — `P10-G006`
152. **Implement guardian identity verification, consent, invitation and parent portal relationship linking — OPEN** — `P08-G003`
153. **Implement invitation delivery, public token redemption, expiry/revocation and account creation workflow — OPEN** — `P11-G004`
154. **Implement membership-aware organization/school authorization lookup — OPEN** — `P02-G003`
155. **Implement MFA enrollment, challenge, recovery codes and encrypted secret storage — OPEN** — `P02-G009`
156. **Implement password reset completion, one-time token lifecycle and delivery adapter — IN_PROGRESS (P80 completion endpoint and one-time consumption implemented; request delivery adapter, throttling and runtime acceptance remain)** — `P02-G007`
157. **Implement private binary upload, malware scanning, encryption, signed downloads and document verification — OPEN** — `P10-G010`
158. **Implement private document upload, malware scanning, encryption, signed downloads and access audit — OPEN** — `P08-G007`
159. **Implement provider-specific webhook signature/reconciliation, event ordering and retries — OPEN** — `P05-G003`
160. **Implement recurring holidays, calendar import/export and calendar synchronization — OPEN** — `P06-G007`
161. **Implement refresh-token family tracking, reuse detection and family revocation — OPEN** — `P02-G012`
162. **Implement renewal scheduler, proration, upgrades/downgrades and cancellation lifecycle — OPEN** — `P05-G005`
163. **Implement staff identity invitation, verified account linking and scoped staff memberships — OPEN** — `P10-G004`
164. **Implement student lifecycle transition rules, transfer, withdrawal, graduation and reactivation — OPEN** — `P08-G006`
165. **Inbox pagination, bulk mark-read, deep-link navigation to application, mobile inbox parity, provider delivery visibility/retry UI — OPEN.** — `P199-G004`
166. **Indexed normalized identity keys or dedicated identity-key table required for scale; current matching enumerates active school guardians.** — `P195-G003`
167. **Legal terms, privacy notice and data-processing agreement review — OPEN** — `P00-G013`
168. **Migrate admissions, student, staff and school configuration APIs to granular permission checks — OPEN** — `P11-G005`
169. **Mobile eligibility configuration, enquiry intake, guardian collision review, notifications, and payment/receipt parity — OPEN.** — `P198-G004`
170. **Mobile inbox, pagination, bulk read and application deep links — OPEN.** — `P200-G005`
171. **Move refresh token to secure HttpOnly cookie for web and secure native storage for mobile — OPEN** — `P02-G011`
172. **Notification provider strategy, templates and delivery observability — OPEN** — `P00-G010`
173. **OTP request/verify endpoints, atomic attempt enforcement, resend cooldown, token binding, and submission gating — OPEN.** — `P202-G003`
174. **Payment gateway and refund workflow specification — OPEN** — `P00-G009`
175. **Payment gateway checkout/provider adapter and verified signed webhooks — OPEN.** — `P193-G004`
176. **Persisted historical document scan/security-state events with exact timestamps — OPEN** — `P228-G001`
177. **Persisted verified-contact status display on portal refresh and school verification policy UI/API — OPEN.** — `P204-G004`
178. **Pin dependencies and commit pnpm lockfile — OPEN** — `P01-G013`
179. **Policy change audit history, mobile policy UI, production provider delivery and operational secrets — OPEN.** — `P206-G004`
180. **PostgreSQL RLS policy implementation and connection-pool safety verification — OPEN** — `P00-G002`
181. **Pricing and willingness-to-pay validation — OPEN** — `P00-G018`
182. **Production email/SMS provider delivery configuration and secrets — OPEN; only development console delivery can be enabled via `ADMISSIONS_OTP_DEV_CONSOLE=true` outside production.** — `P203-G006`
183. **Provision initial organization owner and school administrator during tenant onboarding — OPEN** — `P03-G002`
184. **Reconciliation note history and status-change runtime verification — READY_FOR_VERIFICATION (schema/API/UI source delivered; runtime acceptance pending)** — `P150-G001`
185. **Refund allocations can select a specific operational payment slice for historical payments materialized into multiple payment records; P141 adds searchable slice lookup and per-slice refundable-balance visibility in Finance UI | PARTIALLY_IMPLEMENTED | Apply P140 migration and generate Prisma client; verify single-slice inference, searchable multi-slice selection, invalid/cross-tenant slice rejection, per-slice balance accuracy, refund amount caps, partial/full refund status, idempotency, rollback, retry and dependency orchestration on PostgreSQL; runtime acceptance remains outstanding** — `P140-G001`
186. **Refund flow, receipt PDF/print, parent payment UI and reconciliation exception workflow — OPEN.** — `P193-G005`
187. **Refund reconciliation drill-down and reviewer resolution notes backed by durable API/audit workflow — OPEN** — `P148-G001`
188. **Refund settlement reconciliation visibility across Finance and parent status views — READY_FOR_VERIFICATION (source integration delivered; runtime ledger reconciliation pending)** — `P146-G001`
189. **Refund settlement vs ledger discrepancy review — READY_FOR_VERIFICATION (Finance UI review indicator delivered; runtime ledger evidence pending)** — `P147-G001`
190. **Reporting definitions and reconciliation rules — OPEN** — `P00-G019`
191. **Require MFA and dual approval for high-risk platform operations — OPEN** — `P03-G005`
192. **Reservation worker deployment/supervision verification — OPEN.** — `P197-G004`
193. **Review decisions/comments/history UX and workload/SLA/priority remain OPEN; reviewer assignment foundation delivered in P216.** — `P215-G003`
194. **Review JWT key management, rotation, revocation strategy and production secrets — OPEN** — `P02-G016`
195. **Reviewer assignment, review workload/queue, decision/comment workflow and history UX — OPEN.** — `P214-G004`
196. **Reviewer assignment/workload, review SLA aging/priority, decisions/comments and full review audit UX — OPEN.** — `P215-G003`
197. **Reviewer notifications, personal queue using authenticated identity, SLA aging/priority, assignment workload balancing and mobile parity — OPEN.** — `P218-G005`
198. **Run API and smoke-test health and versioned endpoints — READY_FOR_VERIFICATION** — `P01-G004`
199. **Run Expo apps on simulator/device and verify navigation — READY_FOR_VERIFICATION** — `P01-G006`
200. **Run pnpm install and resolve/commit workspace lockfile — READY_FOR_VERIFICATION** — `P01-G001`
201. **Run pnpm install, generate Prisma client, typecheck and execute unit/API tests — READY_FOR_VERIFICATION** — `P02-G002`
202. **Run Prisma format/validate/generate and resolve any schema/client mismatches — READY_FOR_VERIFICATION** — `P09-G001, P10-G001`
203. **Run Prisma format/validate/generate and resolve relation/schema mismatches — READY_FOR_VERIFICATION** — `P11-G001`
204. **Run Prisma generate, migrate and seed against a clean database — READY_FOR_VERIFICATION** — `P01-G003`
205. **Run Prisma schema validation and generated-client typecheck for TeacherTimetableSlot.** — `P18-G001`
206. **Runtime end-to-end validation of upload, scanning, review, replacement, and applicant timeline — READY_FOR_VERIFICATION** — `P228-G004`
207. **Scale model and load-test targets — OPEN** — `P00-G015`
208. **School policy configuration UI/API and production provider delivery remain OPEN.** — `P205-G003`
209. **Shared Redis rate limiter, CAPTCHA, guardian email/phone verification and penetration/runtime validation — OPEN.** — `P194-G004`
210. **SMS/email provider delivery integration and operational secret configuration — OPEN.** — `P202-G004`
211. **Staff Mobile document review/replacement parity — OPEN** — `P228-G003`
212. **Start PostgreSQL and Redis through Docker Compose and verify health — READY_FOR_VERIFICATION** — `P01-G002`
213. **Student/driver app scope decision and safeguarding requirements — OPEN** — `P00-G017`
214. **Teacher/parent mobile offline synchronization strategy — OPEN** — `P00-G007`
215. **Token recovery journey and parent portal UX integration — OPEN.** — `P194-G005`
216. **Transport GPS provider, consent and retention model — OPEN** — `P00-G011`
217. **UI status-option filtering, enrollment approval/allocation and new-year promotion/transfer remain OPEN.** — `P238-G003`
218. **Validate academic year/term date boundaries, leap years and school-local date semantics — OPEN** — `P06-G013`
219. **Validate capacity constraints (reserved + enrolled <= capacity) and prevent reducing capacity below allocations — OPEN** — `P09-G017`
220. **Validate migration SQL, Prisma model defaults and timestamp conventions — READY_FOR_VERIFICATION** — `P02-G018`
221. **Validate P06 Prisma models and apply migration on clean and upgraded PostgreSQL databases — READY_FOR_VERIFICATION** — `P06-G001`
222. **Validate P07 Prisma schema and apply migration on clean and upgraded databases — READY_FOR_VERIFICATION** — `P07-G001`
223. **Validate P08 Prisma schema and apply migration on clean and upgraded databases — READY_FOR_VERIFICATION** — `P08-G001`
224. **Validate Prisma schema and migration against clean PostgreSQL; resolve any drift — READY_FOR_VERIFICATION** — `P02-G001`
225. **Validate Prisma schema/migration and route runtime on clean database — READY_FOR_VERIFICATION** — `P03-G013`
226. **Validate Prisma schema/migration and run billing migration against clean PostgreSQL — READY_FOR_VERIFICATION** — `P05-G001`
227. **Validate seed plan prices and commercial packaging with customer research — OPEN** — `P05-G012`
228. **Verify billing RLS with non-owner DB role and cross-tenant negative tests — READY_FOR_VERIFICATION** — `P05-G014`
229. **Verify composite database FKs preventing cross-school curriculum subject mappings through negative integration tests — READY_FOR_VERIFICATION** — `P07-G003`
230. **Verify global permission wildcard/platform-admin bypass policy and constrain production break-glass — OPEN** — `P11-G017`
231. **Verify official board catalogue names, codes, jurisdiction rules and grade structures against primary sources — OPEN** — `P07-G004`
232. **Verify P03 PlatformControlSetting model/migration mapping and preserve P01 settings seed behavior — READY_FOR_VERIFICATION** — `P04-G011`
233. **Wire permission checks into protected API routes and prove deny-by-default — OPEN** — `P02-G004`


## Additional P579 governance and release capabilities still needed

- Independent security/threat-model review and remediation evidence.
- Privacy, data-processing, retention, deletion and jurisdiction-specific legal review with authorized sign-off.
- Child safeguarding and accessibility reviews with manual assistive-technology evidence.
- Complete dependency-resolved SBOM, license and vulnerability review from a frozen dependency graph.
- Independent secrets scan covering source, build artifacts, repository history and deployment configuration.
- Production environment, least-privilege access and credential-rotation review.
- Production-like deployment, rollback and data-compatible recovery rehearsal.
- Named operations/support ownership, on-call escalation, incident response and post-release monitoring acceptance.

## How to use this backlog

1. Cross-reference every item to the current feature-gap matrix by its original phase gap ID.
2. Inspect current source before implementing; a later phase may already have partially delivered the behavior.
3. Split combined descriptions into independently testable acceptance criteria.
4. Mark an item complete only with code references and reproducible tests; retain runtime/security evidence as separate criteria.

## P580 operational follow-up (tracked separately from product features)

- [ ] P580-G001 — Reconcile the consolidated feature catalogue against every current app/API/worker source area and obtain domain-owner confirmation — OPEN
- [ ] P580-G002 — Semantically deduplicate the missed-functionality backlog and assign owners, priority and acceptance criteria — OPEN
- [ ] P580-G003 — Execute Docker Compose config/build/up and retain service health/log evidence on a supported host — OPEN
- [ ] P580-G004 — Complete clean pnpm dependency install and Prisma Client generation inside the Docker image using a reproducible committed lockfile — OPEN
- [ ] P580-G005 — Execute clean and upgrade PostgreSQL migrations in Docker; verify schema, seed and rollback/restore — OPEN
- [ ] P580-G006 — Validate API liveness/readiness and all four web apps through the local Docker network and browser — OPEN
- [ ] P580-G007 — Validate Expo Metro container networking and real iOS/Android device connectivity for all five mobile apps — OPEN
- [ ] P580-G008 — Complete production Docker image build, secrets, TLS, reverse proxy, worker, monitoring and rollback acceptance — OPEN
