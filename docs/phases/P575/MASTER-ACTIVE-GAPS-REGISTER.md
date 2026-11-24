# Master Active Gaps Register — P275
This is the **deduplicated active backlog**. Historical phase-specific entries remain in `MASTER-OPEN-GAPS-REGISTER.md` as a ledger. The count is based on unique descriptions (exact-text deduplication only; semantic deduplication requires review).
## Counts
- Implementation/review gaps: **253 unique descriptions** (250 phase-ledger rows)
- Deferred validation gaps: **46 unique descriptions** (49 phase-ledger rows)
- Total unique active descriptions: **299**
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
## Deferred validation gaps
1. **Admin resolution UI, staff notification/inbox, migration/runtime/build/typecheck/API/mobile/E2E/security acceptance remain OPEN/DEFERRED.** — `P222-G006`
2. **Applicant correction acceptance, reviewer follow-up, email delivery, document lifecycle, builds/typechecks/API/DB/mobile/E2E/security validation remain OPEN/DEFERRED.** — `P221-G004`
3. **Applicant notifications/inbox, reopening same request, full correction-document lifecycle, builds/typechecks, migration execution, API/runtime/mobile/E2E/security validation remain OPEN/DEFERRED.** — `P224-G004`
4. **Applicant portal verification UI, resend UX, policy/configuration UI, build/typecheck/API/security/runtime acceptance — OPEN/DEFERRED.** — `P203-G007`
5. **Assignment audit runtime/migration/API acceptance; builds/typechecks; DB, mobile, E2E and security validation — DEFERRED to final validation.** — `P218-G004`
6. **Build, tests, tenant/permission-negative and runtime acceptance — DEFERRED.** — `P190-G007`
7. **Build/typecheck/API tests/concurrency/runtime acceptance DEFERRED.** — `P195-G005`
8. **Build/typecheck/API/browser/security/mobile/E2E validation deferred.** — `P241-G002`
9. **Build/typecheck/API/E2E/runtime acceptance — DEFERRED.** — `P196-G005, P196-G005, P198-G005`
10. **Build/typecheck/API/E2E/security/runtime acceptance — DEFERRED.** — `P201-G004, P202-G005, P205-G004, P206-G005`
11. **Build/typecheck/API/security/concurrency/runtime acceptance — DEFERRED.** — `P193-G006`
12. **Build/typecheck/API/security/runtime acceptance — DEFERRED.** — `P208-G004`
13. **Build/typecheck/browser/API/security/E2E verification deferred.** — `P238-G004`
14. **Build/typecheck/security tests and runtime acceptance — DEFERRED.** — `P207-G003`
15. **Builds/typechecks/API/mobile/runtime/local deployment/E2E/security validation — DEFERRED to final validation as requested.** — `P214-G005, P215-G004`
16. **Database concurrency/load tests and runtime acceptance — DEFERRED.** — `P197-G003`
17. **Database/runtime/API/mobile/E2E validation remains deferred.** — `P236-G003`
18. **Decision-note authorization refinement, applicant correction/request-info workflows, notification delivery, mobile parity, builds/typechecks/migration/runtime/API/E2E/security acceptance remain OPEN/DEFERRED.** — `P219-G004`
19. **Document-version timeline polish, staff mobile parity, scanner/re-upload runtime acceptance, and build/typecheck/migration/API/E2E/security validation remain OPEN/DEFERRED.** — `P226-G004`
20. **Email/SMS delivery, mobile parity, additional lifecycle events, notification preferences/retention, and final build/typecheck/migration/runtime/API/security/E2E verification remain OPEN/DEFERRED.** — `P229-G005`
21. **End-to-end permission-negative tests, migration/runtime validation — DEFERRED.** — `P199-G005`
22. **Exact immutable scan-state event history, applicant-facing timeline, staff mobile parity, and build/typecheck/migration/runtime/API/E2E/security validation remain OPEN/DEFERRED.** — `P227-G003`
23. **Full build/typecheck/API/browser/security/mobile/E2E validation deferred.** — `P240-G005`
24. **Full install/build/typecheck/API/E2E/runtime acceptance — DEFERRED.** — `P210-G006`
25. **Full notifications/inbox, document re-upload lifecycle, mobile parity, and build/typecheck/migration/runtime/API/E2E/security validation remain OPEN/DEFERRED.** — `P225-G004`
26. **New-year promotion/transfer allocation, approval workflow, UI/mobile integration, and final runtime/API/E2E validation remain OPEN/DEFERRED.** — `P237-G003`
27. **Production SMS/email provider delivery configuration, CAPTCHA, full security/build/typecheck/API/E2E/runtime acceptance — OPEN/DEFERRED.** — `P204-G005`
28. **Reopen/follow-up request UI, applicant response notifications/inbox, builds/typechecks/API/DB/runtime/mobile/E2E/security validation remain OPEN/DEFERRED.** — `P223-G003`
29. **Reviewer note freshness/actor authorization refinement, applicant correction workflow, notifications, mobile parity, and runtime/API/DB/build/E2E/security acceptance remain OPEN/DEFERRED.** — `P220-G003`
30. **Reviewer workload, assignment audit trail, permissions refinement, DB migration/runtime/API/mobile acceptance remain OPEN/deferred.** — `P216-G003`
31. **Reviewer workload, assignment audit trail, permissions refinement, migration/runtime/API/mobile acceptance remain OPEN/deferred.** — `P216-G003`
32. **Runtime/build/typecheck/database/API/mobile/deployment/E2E/security acceptance remains DEFERRED until final validation phase.** — `P217-G004`
33. **SMS provider integration, template/provider contract tests, provider delivery telemetry, build/typecheck/API/security/runtime acceptance — OPEN/DEFERRED.** — `P209-G004`
34. **UI runtime/build/API/browser/security/E2E verification deferred.** — `P239-G003`
35. **Verify all admission producer/worker paths respect preferences; build/API/runtime acceptance DEFERRED.** — `P192-G004`
36. **Worker DB/RLS privilege review, build/typecheck/API/security/runtime acceptance — DEFERRED.** — `P200-G006`
37. **Worker deployment/supervision, concurrency and runtime acceptance — OPEN/DEFERRED.** — `P188-G004`
## Counting notes
- Exact repeated descriptions are counted once and show all source gap IDs.
- Semantically similar descriptions that differ in wording are not automatically merged.
- P241 did not close an older implementation gap; it adds an enrollment preflight guardrail.
- Validation items remain separate from implementation work and are not claimed to have passed.
## P245 status note
- Student profile photo document records now have a School Admin metadata listing with scan status.
- Binary previews, primary-photo selection, replace/delete lifecycle, and secure approved signed-download endpoint remain open. No gap closed in P245.
### P246 implementation note (no gap closure)
Primary-photo designation was implemented with a persisted marker, permission-guarded API/UI, clean scan requirement, serialized update, and audit log. No active gap is closed pending the consolidated evidence review and runtime validation stage.
### P247 phase note — Student photo preview
- Added private approved-photo preview capability and School Admin preview UI (60-second signed inline URL, access/scan gates, audit log).
- No gap closed in this phase; existing gap counts remain unchanged. Runtime validation is deferred.
### P248 phase note — Student photo deactivation (no gap closure)
P248 adds an active/deactivated flag, guarded soft-deactivation endpoint, audit event, and Admin action. Inactive photo records are blocked from secure preview and primary designation. Replacement is supported by uploading a new approved photo then deactivating the prior record. Hard storage deletion remains deferred. No gap was closed; counts remain unchanged pending runtime/consolidated review.
### P249 implementation note (no gap closure)
Student photo preview UX adds an inline thumbnail for the currently previewed photo. Profile update API now enforces the student access guard and audits changed/cleared field names without recording field values. No gaps closed pending consolidated/runtime validation.
### P250 implementation note (no gap closure)
Secure gallery-thumbnail loading is available on explicit request for up to 20 active CLEAN JPEG/PNG photos; each preview is individually generated by the existing audited endpoint and expires after 60 seconds. Runtime validation is deferred.
### P251 implementation note (no gap closure)
Deactivation of the current primary photo is blocked by the API (HTTP 409) and disabled in the admin UI. Safe replacement sequence: upload replacement, wait for CLEAN status, set replacement as primary, then deactivate the prior photo. Runtime validation remains deferred.
## P252 coverage strategy note
- Cycle 1 roadmap tracker added (P253–P314). This phase did not close active implementation or validation gaps.
- Backlog entries remain open unless source implementation and verification evidence are attached.
## P253 — Organization & Multi-School (Cycle 2 / Validation Backlog)
- [ ] Organization onboarding form UI (API onboarding exists; UI workflow remains)
- [ ] Edit organization profile UI
- [ ] School edit/deactivate/archive user workflows
- [ ] Organization/school lifecycle administration UI and safe transition UX
- [ ] Duplicate school-code conflict UX and recovery path
- [ ] Final runtime, API integration, browser and automated test validation (deferred)
P253 added basic organization selection, school listing, and school creation to the Organization Admin UI. Existing tenant scoping, membership discovery, and School Admin school-switching mechanisms were retained. These items are not considered validated until runtime testing.
## P254 Authentication & Access status note
Source audit confirms core login/session/permission/MFA and password-reset API foundations; forgot-password request UI is connected. Email delivery and full emailed-token recovery UX remain open. No gap closed; runtime validation deferred.
## P255 Active Gaps
- **P255-G001 (READY_FOR_VERIFICATION):** Staff profile PATCH UI/API is source-implemented; validate permissions, school reference isolation, null clearing, persistence and audit at runtime.
- **P255-G002 (OPEN):** Staff verified-account linking is limited; no invitation email/self-service acceptance.
- **P255-G003 (PARTIAL):** Private staff document UX and qualifications/experience UI remain incomplete; secure storage foundations exist.
## P256 Active Gaps
- **P256-G001 (READY_FOR_VERIFICATION):** Organization create/search/pagination UI is source-implemented; runtime and permissions verification pending.
- **P256-G002 (OPEN):** Broader platform operations UI workflows remain uncovered; existing backend endpoints retained.
- Cycle 2 backlog: lifecycle/detail UX, support grants, domains, branding, platform settings/secrets, operations alerts, billing, advanced admin UX and validation.
## P257 billing workspace gaps
- **P257-G001** — Runtime/build/API verification of subscription & billing workspace — READY_FOR_VERIFICATION
- **P257-G002** — Verify subscription selection/start API authorization, conflict handling, and tenant scoping — READY_FOR_VERIFICATION
- **P257-G003** — Payment provider checkout and reconciliation adapter — OPEN (Cycle 2/provider setup)
- **P257-G004** — Subscription plan change/cancel lifecycle — OPEN (Cycle 2)
- **P257-G005** — Invoice detail/export/tax compliance and payment UX — OPEN (Cycle 2)
## P258 — School Settings & Configuration
- P258-G001 — Academic term list/create implementation requires runtime verification — READY_FOR_VERIFICATION
- P258-G002 — Settings end-to-end build/runtime/API/browser/database validation — READY_FOR_VERIFICATION
- P258-G003 — Advanced configuration lifecycle/policy refinement — OPEN (Cycle 2)
## P259 — Student Records Core (new items)
- P259-G001: Source-level CRUD/profile/list/search/detail implementation requires runtime verification.
- P259-G002: Cross-surface web/API/mobile student data continuity requires Cycle 1 verification.
- P260-G001: Guardian/family CRUD, linking, consent/invitation, duplicate review and parent portal access require runtime/API/UI/mobile validation.
- P260-G002: Expanded guardian edit UI is source-implemented; runtime behavior and field persistence require validation.
- P260-G003: Advanced family-wide views and deeper identity/privacy refinements are Cycle 2 pending.
## P261 — Admissions
- **P261-G001 (READY_FOR_VERIFICATION):** Existing advanced admissions source flows need final runtime/build/API/browser validation.
- **P261-G002 (IMPLEMENTED_SOURCE_ONLY):** Added optional applicant date-of-birth field to School Admin draft creation and API payload; runtime persistence/age eligibility behavior remains unverified.
- **P261-G003 (CYCLE_2_PENDING):** Advanced admissions deep refinements remain Cycle 2 backlog.
## P262 active gaps — Enrollment
- P262-G001 — Source-level enrollment coverage is audited; runtime/build/API/browser validation is still required.
- P262-G002 — Bulk CSV enrollment preview and sequential allocation partially implemented in P303; cross-year promotion/transfer automation, approval workflows, reports and rollback remain Cycle 2.
## P264 active gaps — Student Documents
- P264-G001 — Source-level document list and CLEAN-only download implemented; runtime verification remains open.
- P264-G002 — Deep governance/retention/scan operations/compliance refinements remain Cycle 2.
## P265 active gaps — Student Operations
- P265-G001 — Basic status filter and loaded-page CSV export implemented source-only; full directory export and bulk import remain OPEN.
- P265-G002 — Runtime/build/API/browser validation remains open.
- P265-G003 — P303 delivers CSV import preview, basic validation and duplicate student/year detection; full-directory lookup, rollback, bulk selection/actions and advanced bulk operations remain Cycle 2.
## P266 active gaps — Academic Structure
- P266-G001 — Basic section-capacity configuration UI was added and uses existing APIs; runtime verification remains OPEN.
- P266-G002 — Dedicated class/section entity model and advanced academic structure/rollover workflows remain Cycle 2.
## P267 active gaps — Subjects & Curriculum
- P267-G001 — Runtime/build/API/browser/mobile validation of board profile, grades, curriculum versions, and subject creation including mandatory/optional selection remains OPEN.
- P267-G002 — Subject editing/deactivation, advanced elective rules, board-specific syllabus alignment, and curriculum import remain Cycle 2.
## P268 active gaps — Timetable
- P268-G001 — Weekly timetable overview grouped by weekday/period is source-implemented; runtime/build/API/browser/mobile validation remains OPEN.
- P268-G002 — Advanced schedule optimization and deep conflict-handling validation remain Cycle 2.
## P269 — Teacher Academic Assignment
- P269-G001 — Runtime/build/API/browser/mobile validation of teacher assignment creation and effective dates remains OPEN.
- P269-G002 — Subject picker, assignment edit/deactivation UX, advanced workload rules and deeper assignment lifecycle refinement remain OPEN/Cycle 2.
## P270 — Attendance
- P270-G001 — Build/typecheck/runtime/API/browser/mobile validation of the attendance workflow and correction request/review UI remains OPEN.
- P270-G002 — Attendance analytics, export refinement, offline sync conflict resolution and deep policy scenarios remain OPEN/Cycle 2.
## P271 — Attendance Reports
- P271-G001 — Runtime/build/API/browser/mobile validation of daily report UI and calculations remains OPEN.
- P271-G002 — Historical date-range reporting, trend analytics and export remain OPEN/Cycle 2.
## P272 — Homework & Assignments
- P272-G001 — Class/section/subject-wide homework targeting and bulk student distribution remain OPEN; current School Admin authoring is individual-student scoped.
- P272-G002 — Draft approval/submission-for-approval workflow remains OPEN; publish route requires APPROVED status not available through the audited authoring flow.
- P272-G003 — Runtime/build/API/browser/mobile/E2E verification remains OPEN and deferred.
## P273 — Exams & Assessment
- P273-G001 — Roster-driven marks-entry UI and class roster lookup — source implemented in P274; READY_FOR_VERIFICATION (runtime deferred).
- P273-G002 — Basic per-exam results API/class summary implemented in P274; persistent report-card aggregation and board-specific grading remain OPEN.
- P273-G003 — Runtime/build/migration/API/browser/mobile/E2E verification remains OPEN and deferred.
## P274 — Results & Grades
- P274-G001 — Board/school-configurable grading bands, grade points and pass policies — OPEN.
- P274-G002 — Persisted term/subject exam aggregation into report cards — OPEN.
- P274-G003 — Term/subject aggregation, rank/position rules, absent/exempt handling — OPEN.
- P274-G004 — Runtime/build/typecheck/API/browser/mobile/E2E validation — OPEN (deferred).
## P275 Deferred validation gap
- `P275-VAL01` — Full Prisma generate/migrate, API typecheck/build/runtime, browser and mobile integration validation of FeeStructure lifecycle; deferred because package dependencies are not present in the supplied extraction. **OPEN**.
## P276 Deferred gaps
- `P276-VAL01` — Run full Prisma generate/migrate, API typecheck/build/runtime, browser and mobile E2E for the assignment-preview and assignment workflow in the local dependency-equipped environment. **OPEN**.
- `P276-UX01` — Replace manually entered academic-year and grade IDs with catalog-backed selector controls. **OPEN**.
- `P276-FIN01` — Optional component selection, student-level overrides, discounts/installments, and structure clone/version governance. **OPEN**.
## P277 Deferred gaps
- `P277-VAL01` — Execute API/database and browser/mobile integration verification of manual fee payment collection in the dependency-equipped environment. **OPEN**.
- `P277-UX01` — Provide printable/downloadable payment receipt and complete collection history/reconciliation UI. **OPEN**.
## P288 — Parent Notification Preferences
- P288-G001 — Push delivery provider/worker, token registration, retries, receipts and device operations — OPEN.
- P288-G002 — Dynamic provider readiness exposure and email delivery/opt-out runtime verification — OPEN.
- P288-VAL01 — Parent Mobile full typecheck/build/runtime/device acceptance — OPEN.
## P289 — Notification Channel Readiness API
- Delivered a school-scoped parent portal channel-readiness endpoint exposing only availability/reason (never provider secrets).
- Email readiness requires HTTPS provider URL, token and sender configuration; in-app is available; push remains unavailable. Parent Mobile now fetches readiness and displays dynamic Email availability.
- P289-G001 — Push provider/device token/delivery worker remains OPEN.
- P289-G002 — Email provider send/receipt/opt-out runtime validation remains OPEN.
- P289-VAL01 — API/mobile runtime, typecheck, DB and device validation remains OPEN.
- P289-VER01 — Static source verification passed 8/8; runtime validation not executed.
## P290 — Parent Email Preference Availability Guard
- Parent Mobile now disables EMAIL preference switches when school provider readiness reports unavailable; accessibility disabled state matches the UI. Push remains disabled and IN_APP stays available.
- P290-G001 — Provider readiness changes without app refresh and user-visible reactivation flow — OPEN.
- P290-VAL01 — Full mobile/API runtime and device acceptance remains OPEN.
- P290-VER01 — Static verifier passed 6/6.
## P291 — Parent Notification Channel Readiness Refresh
- Delivered: Parent Mobile notification preferences now provide an accessible manual refresh button that re-fetches school-scoped channel readiness, blocks offline/duplicate refresh, shows progress and reports success/failure. Existing email and push switch guards remain in place.
- [ ] **P290-G001 (PARTIAL)** — Manual refresh/reactivation delivered; automatic app lifecycle/config-change refresh remains OPEN.
- [ ] **P291-G001** — API/mobile runtime, full typecheck/build and device acceptance for readiness refresh/preferences remains OPEN.
- [ ] Email provider send/receipt/opt-out live verification and Push provider/device-token lifecycle remain OPEN.
- Static verifier P291: 6/6 PASS; no runtime gap closed.
## P292 Active follow-ups
- **P290-G001 (PARTIAL)** — Notification channel readiness refresh is now triggered on app foreground; configuration-change and lifecycle runtime validation still OPEN.
- **P292-VAL01 (OPEN)** — Parent Mobile API/typecheck/build/runtime/device acceptance.
- Email provider live delivery/receipt/opt-out and Push provider/token lifecycle remain OPEN.
## P293 — Parent Notification Channel Status Details
- Parent Mobile notification preferences now expose explicit channel readiness reasons: email availability/reason from the school API and push unavailability explanation. Existing refresh and channel guards remain.
- P293-VAL01 — API/mobile runtime, full typecheck/build and device acceptance remains OPEN.
- Email live delivery/receipt/opt-out and Push provider/device-token lifecycle remain OPEN.
- Static verifier P293 passed 8/8; no gap closed.
## P294 — Parent Notification Preference Persistence & Feedback
- Delivered: Parent Mobile notification preference updates now expose per-channel saving/saved/error feedback; duplicate submissions for the same category/channel are guarded; the switch is disabled during its save; preference state changes only after the API request succeeds; failure feedback remains visible with accessibility alert semantics; offline mutation guard retained.
- **P294-VAL01** — Full API/mobile typecheck, build, runtime and device acceptance remains OPEN.
- Email provider live delivery/receipt/opt-out verification and Push provider/device-token lifecycle remain OPEN.
- Static verifier P294: 10/10 PASS; no master gap closed.
## P295 active validation and provider gaps
- P295-VAL01 — Full Parent Mobile/API typecheck, build, runtime and device acceptance: OPEN.
- Email provider live delivery/receipt/opt-out validation: OPEN.
- Push provider/token lifecycle/worker/receipts/operations: OPEN.
- School/provider readiness configuration change lifecycle refresh: PARTIAL.
## P304 active follow-ups
- **P304-G001 (OPEN)** — Academic-year rollover planner UI/API and controlled execution flow.
- **P304-G002 (OPEN)** — Transactional rollover/rollback or reconciliation for source and target enrollment records and capacity counters.
- **P304-G003 (OPEN)** — Approval controls, permissions, dry-run reports, and bulk promotion/transfer reconciliation.
- **P304-VAL01 (OPEN)** — Full dependency-backed typecheck/build and authenticated API/browser runtime acceptance.
## P305 active follow-ups
- **P305-G001 (OPEN)** — Full-directory/server-side roster matching and preview.
- **P305-G002 (PARTIAL)** — P306 added confirmed sequential enrollment creation; transactional rollback/compensation, source/target reconciliation and audit remain open.
- **P305-G003 (OPEN)** — Capacity checks, approvals/permissions, reconciliation and reporting.
- **P305-VAL01 (OPEN)** — Full dependency-backed typecheck/build and authenticated API/browser runtime acceptance.
## P306 active follow-ups
- **P306-G001 (OPEN)** — Full-directory/server-side student lookup and large roster execution.
- **P306-G002 (OPEN)** — Transactional rollover, rollback/compensation and reconciliation; current execution is non-transactional.
- **P306-G003 (OPEN)** — Capacity reservation, approval/permission gates, audit trail and consolidated reporting.
- **P306-VAL01 (OPEN)** — Dependency-backed typecheck/build and authenticated API/browser runtime acceptance.
## P307 active follow-ups
- **P307-G001 (OPEN)** — Capacity snapshot completeness and server-side atomic seat reservation/revalidation; current rollover preflight is advisory and concurrency races remain possible.
- **P307-G002 (OPEN)** — Full-directory/server-side student lookup and large roster preview/execution.
- **P307-VAL01 (OPEN)** — Dependency-backed typecheck/build and authenticated API/browser/mobile runtime acceptance.
## P308 active follow-ups
- **P308-G001 (OPEN)** — Server-side atomic capacity claim and concurrency-safe idempotency/transaction handling.
- **P308-G002 (OPEN)** — Full-directory/server-side lookup and large-roster rollover.
- **P308-VAL01 (OPEN)** — Dependency-backed build/typecheck and authenticated API/browser/mobile acceptance.
- P307-G001 is PARTIAL: client-side fresh capacity revalidation is implemented; atomic server enforcement remains open.
- P306-G002/P305-G002 are PARTIAL: client reconciliation added; transaction, rollback, source-state update, audit and concurrency protection remain open.
## P309 active follow-ups
- **P309-G001 (OPEN)** — Persist rollover audit events server-side with immutability, permissions and retention. Current audit export is client-side/current-run only.
- **P309-G002 (OPEN)** — Consolidated multi-run reporting, filters and date-range search.
- **P309-VAL01 (OPEN)** — Dependency-backed build/typecheck and authenticated API/browser/mobile acceptance.
- P308-G001/G002/VAL01 remain OPEN as recorded; client revalidation and reconciliation are not substitutes for atomic server enforcement or full-directory support.
## P310 — Rollover lookup validation
- [ ] P310-G001 — Execute runtime API/UI acceptance for directory lookup and rollover flow — READY_FOR_VERIFICATION.
- [ ] P310-G002 — Cycle 2 rollover hardening: atomic seat claims, transaction compensation, durable audit and approvals — OPEN.
- [ ] P311 — Student Operations Cycle 1: export, CSV import preview/validation, bulk actions — NEXT.
## P311 active follow-ups
- **P311-G001 (PARTIAL)** — CSV import rollback/transactional semantics; sequential partial commits remain.
- **P311-G002 (PARTIAL)** — Bulk selection is page-scoped; advanced bulk lifecycle actions are not implemented.
- **P311-G003 (OPEN)** — API/browser runtime acceptance and dependency-backed build/typecheck.
- **P311-G004 (OPEN)** — Import field mapping, guardian CSV import, richer validation/reporting.
## P312 Active follow-ups
- **P312-G001 (PARTIAL)** — Draft edit UI does not pre-populate effective dates yet.
- **P312-G002 (OPEN)** — Build/typecheck/API/browser/mobile runtime acceptance deferred to final validation.
- **P312-G003 (DEFERRED)** — Cycle 2 edit history, bulk structure management and deep validation.
## P313 Active follow-ups
- **P313-G001 (OPEN)** — Build/typecheck/API/browser/mobile runtime acceptance for fee assignment selectors and workflow.
- **P313-G002 (PARTIAL)** — Section dropdown lists configured capacity sections only; no-capacity sections require blank section (assign all).
- **P313-G003 (DEFERRED)** — Cycle 2 optional components, student overrides, discounts/installments, structure version/clone lifecycle.
## P314
- P314-G001 PARTIAL — payment-history panel and print receipt added; permission-dependent data, runtime acceptance pending.
- P314-G002 OPEN — dependency-backed build/API/browser/mobile validation pending.
- P314-G003 DEFERRED — advanced branded/PDF receipt and lifecycle features Cycle 2.
## P315 Active follow-ups
- **P315-G001 (PARTIAL)** — Attendance grade/section catalog selector source implementation; authenticated API/browser runtime acceptance pending.
- **P315-G002 (OPEN)** — Dependency-backed build/typecheck pending.
- **P315-G003 (DEFERRED)** — Cycle 2 bulk marking, offline reconciliation, advanced reporting and automation.
## P316 — Timetable Filters & Class/Teacher Views
- **P316-G001 PARTIAL** — Filters and view selector implemented; runtime/build acceptance pending.
- **P316-G002 OPEN** — Confirm class/teacher/weekday filtering behavior in authenticated browser with real timetable records.
- **P316-G003 DEFERRED** — Advanced timetable generation, optimization and conflict resolution belong to Cycle 2.
## P317 active gaps added
- P317-G001 — Runtime API/database/browser validation of version-specific subject loading, grade filtering and duplicate prevention — READY_FOR_VERIFICATION.
- P317-G002 — Subject mapping edit/delete lifecycle and advanced board-specific curriculum rules — OPEN (Cycle 2).
## P318 active gaps
- P318-G001 (ACTIVE): Validate teacher academic assignment create flow with authenticated runtime API and browser; source assertions alone do not establish runtime acceptance.
- P318-G002 (ACTIVE): Backend duplicate/conflict and teacher workload rules are not fully enforced/verified.
- P318-G003 (ACTIVE): Teacher assignment edit/deactivation lifecycle remains incomplete/unverified.
## P319 active gaps
- P319-G001 (ACTIVE): Runtime/API accuracy and performance acceptance of attendance date-range report (31-day max).
- P319-G002 (ACTIVE): Attendance export and advanced trends/chart/drill-down remain unimplemented.
- P319-G003 (ACTIVE): Full build/typecheck/browser/mobile validation remains pending.
## P320 — Attendance report CSV export
- **Status:** Source implementation complete; runtime acceptance pending.
- **Resolved at source level:** Daily row-level CSV and historical-range summary CSV; UTF-8 BOM; escaped quotes; date-scoped filenames; export controls only after report data is generated.
- **Remaining:** Authenticated runtime/browser/mobile export acceptance, performance validation; advanced trend charts/drill-down are Cycle 2.
- **Evidence:** `P320-DELIVERY-REPORT.md`, `P320-TEST-REPORT.md`; static verifier 12/12 PASS.
## P321 — Exam Marks Entry Save-State Safeguards
- **P321-G001 — READY_FOR_VERIFICATION:** Roster marks-entry safeguards implemented at source; runtime/API/browser/mobile acceptance remains pending.
- **P321-G002 — OPEN:** Explicit clear/delete of a previously saved mark is unsupported by the current API.
- **P321-G003 — OPEN:** Publishing can occur without complete roster coverage; enforce policy and test in a later phase.
- **P321-G004 — OPEN:** Exam marks-write teacher assignment scope enforcement and full build/typecheck/runtime validation remain pending.
- **Evidence:** P321 static verifier 10/10 PASS; transpile syntax 0 diagnostics. Runtime not run.
## P322 update — Homework grade/section targeting
- Cycle 1 targeting UI/source is implemented for individual, grade, and section.
- Open: server-side roster-targeting API and pagination, bulk idempotency/deduplication, transactional bulk creation, runtime contract confirmation, end-to-end acceptance.
- No runtime gaps closed based on static source verification alone.
## P323 — Communication Center academic targeting
- Source-level support added for optional academic-year/grade/section targeting.
- Publish recipient resolution narrows enrolled parent/student recipients to the selected roster; staff recipient audience remains school-wide.
- Static assertions 12/12 PASS; UI/API transpile syntax 0 diagnostics.
- OPEN: catalog selectors and preview/count, free-text section validation, staff audience scoping, database migration/runtime/API/browser/mobile/full build validation, email/push.
## P324 update — Communication catalog selectors and enrollment preview
- Source-level academic year, grade, and section selectors now use school catalogs. Section options are filtered by academic year and grade. Preview provides a configured enrollment estimate only; exact recipients remain API-resolved at publish.
- P324 verifier 16/16 PASS; TSX transpilation 0 diagnostics. Runtime/API/database/browser/mobile/build not run.
- OPEN: exact consent/account-aware recipient preview; stale/incomplete capacity-based estimate; staff audience scope; delivery channels; runtime and E2E acceptance.
## P325 — Student Portal Homework Visibility
- Added student-only published homework API for active linked student account.
- Added student mobile homework cards showing due date, description, submission status, score and teacher feedback; refresh and school-switch loading included.
- Source verification 10/10; TSX/API syntax transpile 0 diagnostics. Runtime and full build remain pending.
- Open follow-ups: attachment opening, offline homework cache, improved multi-school selector, runtime authorization validation.
## P328 update — Teacher homework submission review
- Teacher mobile now filters loaded submissions by All / Submitted / Resubmitted / Graded and displays per-status counts; existing answer and grading controls retained.
- Source verifier 10/10 PASS; TSX transpile 0 diagnostics. Runtime, API/database, device/E2E, and full build not run.
- OPEN: counts only cover current loaded page; student names, late classification, rubric-review UI, and runtime verification remain outstanding.
## P329 update — Parent Homework Attachment Access
- P329 adds parent-mobile attachment rows, security status, CLEAN-only Open action, authenticated short-lived URL request and Expo Linking launch. Static verifier 12/12 and TSX transpilation 0 diagnostics.
- P326-G003: READY_FOR_VERIFICATION (runtime signed-link/guardian/device acceptance pending).
- P329-G002: OPEN (inline preview and refined viewer UX).
- No runtime gap closed.
## P330 — Student Homework Attachment Submission
- Cycle 1 attachment picker/upload/API/security-status source implementation complete.
- P327-G002 moved to READY_FOR_VERIFICATION; runtime acceptance still open.
- Cycle 2 deep refinements (multi-file, progress/retry, preview, secure open) deferred.
- Static verifier 14/14 PASS; transpile syntax 0 diagnostics; full typecheck blocked by missing dependencies.
## P331 — Applicant Account & Multi-Application Dashboard (implemented; verification limited)
- [x] Email OTP applicant-account discovery and school-scoped multi-application dashboard implemented.
- [ ] Secure dashboard-card linking to existing application editing/document/submission workflows remains OPEN (tracking-token flow still required).
- [ ] Runtime/email-provider/Prisma generation/full build/device/E2E validation remains OPEN for Cycle 2.
## P332 — Admission eligibility & checklist UX completion
- **P332-G001 (SOURCE_IMPLEMENTED):** Public checklist states and verified-complete progress count implemented.
- **P332-G002 (SOURCE_IMPLEMENTED):** Public submission errors display missing document names when API provides them.
- **P332-G003 (SOURCE_IMPLEMENTED):** Staff Mobile checklist parity with board-aware rule selection and ANY fallback.
- **P332-G004 (OPEN):** Runtime/device/build/E2E validation and richer checklist-builder UX deferred to Cycle 2.
## P333 — Guardian Identity & Duplicate Applicant Review
- [x] P333-G001 — Admissions staff can preflight guardian contact matches with normalized email/phone, match reasons and linked-account indicator.
- [x] P333-G002 — Enrollment conversion supports explicit guardian selection when multiple matches exist; selected candidate is server-validated against same-tenant/school matching records.
- [x] P333-G003 — Staff mobile enrollment flow supports identity review/selection and displays possible duplicate applications based on normalized child name plus guardian contact match.
- [ ] P333-G004 — Full guardian merge/deduplication, invitations, consent and complete duplicate-applicant resolution remain OPEN; Cycle 2 deep workflow.
- [ ] P333-G005 — Runtime/API/database/device/E2E acceptance remains OPEN for Cycle 2.
## P334 — Admission Reviewer Personal Queue
- [x] P334-G001 — Session-bound `my-review-queue` API for the current reviewer, active review statuses, organization/school scoping, and bounded oldest-first result.
- [x] P334-G002 — School Admin Workspace “My assigned queue” action retrieves the authenticated queue and filters application list by returned IDs.
- [ ] P334-G003 — Runtime/API/browser/E2E acceptance remains OPEN for Cycle 2.
## P335 — Reviewer Workload & SLA
- **P335-G001 (SOURCE_IMPLEMENTED):** Server aggregates all active admissions review cases within organization/school scope.
- **P335-G002 (SOURCE_IMPLEMENTED):** Reviewer workload counts, overdue counts, oldest case age and unassigned totals shown.
- **P335-G003 (SOURCE_IMPLEMENTED):** Stage age/due calculations use latest matching stage history; documented fallbacks.
- **P335-G004 (SOURCE_IMPLEMENTED):** School Admin overview metrics and overdue list implemented.
- **P335-G005 (OPEN/Cycle 2):** Configurable SLA policies, workload auto-balancing, and runtime/full-build/API/database/browser/E2E acceptance.
## P336 — Admission Decision & Review History Completion
- [x] P336-G001 — School Admin application detail combines persisted stage transitions and structured DECISION review notes in a chronological timeline, displaying type, status/recommendation, rationale, timestamp and actor/reviewer (display name when available; ID fallback). Status: SOURCE_IMPLEMENTED.
- [ ] P336-G002 — Dedicated immutable final-decision ledger/finalization event beyond existing structured decision notes and stage history remains OPEN for a future refinement.
- [ ] P336-G003 — Runtime database/API, full build/typecheck, browser, device and E2E validation remains deferred to Cycle 2.
## P337 — Applicant Withdrawal Lifecycle
- [x] P337-G001 — Token-based withdrawal endpoint and state/audit/notification/seat cleanup implemented. SOURCE_IMPLEMENTED.
- [ ] P337-G002 — Applicant dashboard UX and staff withdrawal reporting UX remain open.
- [ ] P337-G003 — Refund reconciliation remains open (P344).
- [ ] P337-G004 — Cycle 2 runtime and E2E validation deferred.
## P338 — Admission Offer Lifecycle (Applicant Portal)
- [x] P338-G001 — Tracking-token-authenticated public offer listing endpoint with safe selected fields. SOURCE_IMPLEMENTED.
- [x] P338-G002 — Token-authenticated applicant acceptance/decline, lock/state guards, audit stage history and notification. SOURCE_IMPLEMENTED.
- [x] P338-G003 — Expired offer cleanup persists, with active reservation release and capacity reconciliation. SOURCE_IMPLEMENTED.
- [ ] P338-G004 — Public portal UI to review/respond to offers remains OPEN.
- [ ] P338-G005 — Runtime, browser, mobile, full build and E2E validation deferred to Cycle 2.
## P339 — Seat Reservation Lifecycle Completion
- [x] P339-G001 — School-scoped API extends active, unexpired reservations with validated expiry bounds. SOURCE_IMPLEMENTED.
- [x] P339-G002 — Reservation and open-offer expiry synchronized; capacity counters unchanged. SOURCE_IMPLEMENTED.
- [x] P339-G003 — School Admin reservation list includes extend action, validation, API error handling, and refresh. SOURCE_IMPLEMENTED.
- [ ] P339-G004 — Staff-mobile extension UI and immutable reservation history remain OPEN.
- [ ] P339-G005 — Runtime/build/browser/mobile/E2E validation deferred to Cycle 2.
## P340 — Admissions Capacity Dashboard
- [x] P340-G001 — School Admin admissions dashboard shows capacity/enrolled/reserved/available totals scoped to selected academic year. SOURCE_IMPLEMENTED.
- [x] P340-G002 — Section-level capacity, utilization percentage, and OPEN/FULL/OVER CAPACITY status table with utilization sorting. SOURCE_IMPLEMENTED.
- [x] P340-G003 — Over-capacity warning summarizes excess enrolled+reserved seats; zero-capacity/empty-year safe handling. SOURCE_IMPLEMENTED.
- [ ] P340-G004 — API-derived capacity snapshot freshness, staff-mobile dashboard parity, and runtime/E2E validation remain Cycle 2 OPEN.
## P341 — Admission Document Recovery
- [ ] P341-G005 — Runtime private-storage/scanner integration, interrupted-upload recovery, staff/mobile and browser E2E validation remains OPEN.
## P342 — Admission Finance Configuration
- Delivered: school-scoped admission finance defaults persisted in `SchoolPolicy` (`admissions_finance_config`); GET/PUT configuration API; permission-gated write requires `admissions.manage` plus `fees.manage`; validates enabled flag, optional default fee, ISO 4217-style 3-letter currency code, and fee label. Offer issuance now uses configured default fee/currency when request does not explicitly provide a fee/currency. Explicit offer fee remains authoritative.
- Deferred: School Admin configuration UI, runtime database/permission integration validation, configuration audit history, and full E2E tests.
## P343 — Admission Payment Lifecycle
- [ ] P343-G004 — Runtime database/API, duplicate-reference concurrency, browser/mobile and E2E validation remain OPEN for Cycle 2.
## P344 — Admission Receipts & Refunds
- P344-G001: Admission payment receipt printing is source-implemented.
- P344-G002: Admission-specific refund linkage/status UI remains open.
- P344-G003: Refund credit-note/receipt print remains open.
- P344-G004: Runtime/browser/mobile/E2E acceptance remains Cycle 2.
## P345 — Admissions Notification Completion
- P345-G001: Staff notification on reviewer assignment implemented.
- P345-G002: Staff notification on application status transition implemented.
- P345-G003: Additional admission event notification coverage remains open.
- P345-G004: Runtime/provider/build/browser/mobile/E2E validation remains Cycle 2.
## P346 — Admissions Consent & Preference Integration
- Delivered: Parent Mobile admissions notification preferences already expose IN_APP/EMAIL/PUSH with offline intent persistence and conflict/reconnect reconciliation. Added admissions-specific explanatory consent copy clarifying optional admission updates and separate application-tracking/essential account-security messages. Existing guardian consent acceptance/withdrawal timestamps and communication eligibility gates were audited and reused; no schema migration.
- **P346-G001 (PARTIAL):** Admissions preference explanatory UI integrated; dedicated admissions consent record/version history and explicit withdrawal UI/API remain OPEN.
- **P346-G002 (OPEN):** Audit every admissions notification producer for per-channel preference enforcement; runtime API/database, mobile build/device, and E2E validation remain OPEN.
- Static verifier: 9/9 PASS; no runtime validation claimed.
## P347 — Admissions Exception Monitoring (OPEN)
- P347-G001: Broaden exception coverage to notification delivery failures, fee-handoff anomalies, capacity overbooking and withdrawn cleanup signals.
- P347-G002: Remediation actions/direct workflow navigation from exception rows.
- P347-G003: Runtime DB/API, permissions and cross-school isolation, build/typecheck, browser/mobile and E2E.
## P348 — Admissions Staff Mobile Exception Monitor
- **P348-G001 OPEN:** Staff mobile runtime/build and physical-device validation are deferred to Cycle 2.
- **P348-G002 OPEN:** Mobile exception monitor is read-only; direct remediation actions/deep links are deferred.
- **P348-G003 OPEN:** Runtime cross-school isolation and full E2E/regression validation remain deferred.
## P349 — Admissions Public Security Completion
- **P349-G001 OPEN:** Runtime validation of Redis public admissions rate limiting, proxy/IP configuration, bypass/OTP abuse controls, upload storage security, and cross-school isolation is deferred to Cycle 2.
- **P349-G002 OPEN:** Tracking tokens in URL paths may be captured in access/request logs; header migration requires a compatibility design.
- **P349-G003 OPEN:** API/build/browser/mobile/E2E regression validation and external penetration testing/security review remain outstanding.
## P351 — Health & Wellbeing
- **P351-G001 PARTIAL:** Health profiles and events API/schema, school admin workspace, parent consented-child health summary API/mobile view, and staff mobile health panel are source-implemented. API schema generation, migration runtime, and build/runtime validation are not run (dependencies unavailable in this working environment).
- **P351-G002 OPEN:** Parent notifications on recorded health events and incident escalation are not yet connected to notification delivery.
- **P351-G003 OPEN:** Student self-health view/consent policy and role-granular nurse/health-worker access are not implemented.
- **P351-G004 OPEN:** Full security validation for sensitive health data, runtime tenant isolation, build/typecheck, API integration tests, and E2E/device tests remain Cycle 2.
- **P351-G001 PARTIAL:** Profiles/events API and persistence schema/migration; school-admin workspace; staff mobile event panel; guardian-consented parent mobile health summary implemented. Static verifier 12/12 PASS; runtime migration/build/device validation unavailable.
- **P351-G002 OPEN:** Parent notifications and incident escalation on health event creation.
- **P351-G003 OPEN:** Student self-health access/consent policy and dedicated nurse/health-worker roles.
- **P351-G004 OPEN (Cycle 2):** Runtime API/database, tenant-isolation/security validation, build/typecheck, full E2E/regression and device matrix.
## P352 — Canteen & Meals (Cycle 1 source implementation complete; verification gaps open)
- P352-G001 — Prisma validation/generation, database migration, live API, tenant isolation and permission tests — OPEN / Cycle 2.
- P352-G002 — Full lifecycle/edge-case tests and duplicate-order/idempotency controls — OPEN / Cycle 2.
- P352-G003 — Recipe/ingredient-linked stock consumption, waste and automated decrement — OPEN / Cycle 2.
- P352-G004 — Payment gateway and finance-ledger reconciliation; current manual payment-status recording — OPEN / Cycle 2.
- P352-G005 — Web/mobile builds, runtime/device, offline, full E2E/regression and security tests — OPEN / Cycle 2.
- P352-G006 — Advanced meal-plan/allocation/serving/report UX enhancements — OPEN / Cycle 2.
## P353 — Payroll
- **P353-G001 PARTIAL:** Payroll source implementation is present (structures, assignments, monthly calculation, run approval/payment status, Admin UI, Staff Mobile self-payslip). Runtime/schema/build validation not run.
- **P353-G002 OPEN:** Statutory India payroll rules (PF/ESI/PT/TDS/gratuity/bonus/state rules) require implementation and professional validation.
- **P353-G003 OPEN:** Attendance/leave proration, overtime, unpaid leave, arrears, advances and adjustment workflows.
- **P353-G004 OPEN:** Accounting posting, bank transfer integration/export, payment reconciliation/idempotency and payment failure handling.
- **P353-G005 OPEN:** Segregation-of-duties controls, immutable approval snapshots, correction/reversal workflow, payslip PDFs and notifications.
- **P353-G006 OPEN (Cycle 2):** Prisma CLI, database migration, live API/tenant isolation, Admin/Staff mobile builds, E2E/regression, security and device validation.
## P354 — HR Lifecycle
- **P354-G001 PARTIAL:** Source implementation added; runtime and build validation unavailable.
- **P354-G002 OPEN:** Recruitment stages/offers/candidate conversion and interview UI.
- **P354-G003 OPEN:** Onboarding/offboarding checklist UI and staff exit transition.
- **P354-G004 OPEN:** Leave entitlement/balance/calendar/overlap and payroll/attendance integration.
- **P354-G005 OPEN:** Performance cycle/goal tracking, notifications, analytics.
- **P354-G006 OPEN (Cycle 2):** Runtime database/API, tenant security, build, regression, E2E, and device validation.
## P355 — Parent/Student/Teacher Mobile Coverage Audit
- **P355-G001 OPEN:** Student attendance history/summary and timetable.
- **P355-G002 OPEN:** Student fees/payments and report cards/results.
- **P355-G003 OPEN:** Student communications/health access and offline continuity.
- **P355-G004 OPEN:** Parent/Teacher offline sync conflict recovery and runtime validation.
- **P355-G005 OPEN (Cycle 2):** E2E, security, accessibility, build and device/OS matrix.
## P356 — Library Management
- **P356-G001 PARTIAL:** Library catalogue, physical copies, issue/return, basic reservation endpoints, school Admin UI and permission-seeded roles implemented. Runtime validation unavailable.
- **P356-G002 OPEN:** Reservation fulfillment queue, cancellation, expiry, hold notifications and queue ordering.
- **P356-G003 OPEN:** Fine policy calculation/settlement, lost/damaged copy lifecycle, copy condition/status management and audit controls.
- **P356-G004 OPEN:** Parent/Student Mobile catalogue and reservation flows; staff scan/barcode/QR intake and circulation.
- **P356-G005 OPEN:** Reports/exports, overdue communications, analytics, full UI enhancements.
- **P356-G006 OPEN (Cycle 2):** Prisma validate/generate, database migration, runtime API/tenant/security tests, web/mobile build, E2E/regression and device validation.
## P357 — Transport Management
- Transport source foundation added; static verifier 45/45 PASS. Runtime validation pending.
- Open: mobile journeys, roster/capacity/schedule validation, event route-stop/student allocation validation, billing, tracking, notifications, maintenance, exports and runtime test coverage.
## P358 — Hostel Management
- Hostel management source delivered with static verifier 43/43 PASS; runtime validation pending.
- Open: mobile/guardian journeys, leave approval, roll-call/curfew/visitor safety, occupancy validation, billing, incidents, integration and runtime verification.
## P359 — C2-01 Build Stabilization
1. **Generate and commit pnpm lockfile after registry access is restored — OPEN** — `P359-G001`
2. **Dependency-based typecheck, lint and build across API/Web/Mobile — READY_FOR_VERIFICATION** — `P359-G002`
3. **Prisma/DB/Redis/API runtime acceptance — READY_FOR_VERIFICATION** — `P359-G003`
4. **Repair/triage legacy static verifier failures — CLOSED (143/143 legacy verifier scripts pass; only C2-01 lockfile audit remains blocked)** — `P359-G004`
5. **CI gates after lockfile availability — OPEN** — `P359-G005`
6. **Expo bundle/native/device E2E matrix — READY_FOR_VERIFICATION** — `P359-G006`
7. **Production env/secrets/TLS validation against provisioned deployment — READY_FOR_VERIFICATION** — `P359-G007`
## C2-01 Supplemental remediation — P360
- **P359-G001 lockfile generation — OPEN / BLOCKED:** rechecked npm registry; DNS/network returns `EAI_AGAIN`. pnpm is unavailable in the runtime. No lockfile fabricated.
- **P359-G002 dependency-based build/typecheck/lint — OPEN / BLOCKED:** awaiting dependencies/lockfile.
- **P359-G003 runtime stack validation — OPEN / BLOCKED:** Prisma/PostgreSQL/Redis/API runtime validation not executed.
- **P359-G004 legacy verifier remediation — CLOSED:** 143 legacy verifier scripts pass. The separate combined suite remains 143/144 because workspace audit gate requires a lockfile.
- **P359-G005 CI gates — OPEN:** not validated with reproducible install.
- **P359-G006 mobile bundle/device checks — OPEN / BLOCKED:** dependencies unavailable.
- **P359-G007 production deployment checks — OPEN:** environment/services not provisioned for validation.
- **P360-G001 workspace manifest audit — CLOSED:** new supplemental audit covers 13 manifests, unique package names, dependency declarations, workspace dependency references, and source script targets; 0 errors.
## P361 — C2-01 CI source gate improvement
- **P361-G001 CLOSED:** Dependency-free source validation is independently gated in CI; local evidence: 4/4 checks pass (syntax scan, package manifest audit, domain invariants, P80–P108 source contracts).
- **P359-G001 OPEN/BLOCKED:** Lockfile still missing; registry/network access required.
- **P359-G002 OPEN/BLOCKED:** Dependency-based typecheck, lint, builds remain unverified.
- **P359-G003 OPEN/BLOCKED:** Prisma/DB/Redis/API runtime acceptance remains unverified.
- **P359-G005 PARTIAL:** Source-only CI gate added; reproducible install/build workflow still blocked by lockfile/dependency setup.
- **P359-G006 OPEN/BLOCKED:** Expo export/native/device validation remains unverified.
- **P359-G007 OPEN:** Production environment and deployment validation not performed.
## P362 — C2-01 Register Mirror Integrity
- **P362-G001 CLOSED:** Root and documentation gap-register mirrors reconciled; byte-identical parity restored.
- **P362-G002 CLOSED:** Mirror parity verifier integrated into the dependency-free CI source gate (6 pairs).
- **P362-G003 OPEN:** Dependency install, full builds, runtime and deployment verification remain pending.
## P363 — CI Workflow Contract Audit
- **P363-G001 CLOSED:** CI workflow contract verifier added; checks required workflow steps and security scan policy.
- **P363-G002 CLOSED:** Contract audit integrated into dependency-free source gate (6/6 checks pass).
- **P363-G003 OPEN/BLOCKED:** pnpm lockfile and dependency install/build/runtime acceptance remain unresolved.
## P364 — C2-01 Bootstrap Diagnostics
- **P364-G001 CLOSED:** Added safe dependency-free bootstrap diagnostics and contract verifier; the C2-01 source gate now includes it (7/7 checks pass).
- **P364-G002 OPEN/BLOCKED:** Diagnostic findings confirm the lockfile is missing and pnpm is unavailable; reproducible install, dependency builds, runtime/mobile/E2E and production validation remain blocked.
## P365 — Container Runtime Contract Audit
- **P365-G001 CLOSED:** Added `scripts/verify-p365-runtime-contract.mjs` to verify root Node engine and pnpm pins match API/web container Node 22 images and Corepack pnpm 9.15.0 activation (8/8 checks).
- **P365-G002 CLOSED:** Added verifier self-contract and CI source-gate integration; C2-01 dependency-free source gate passes 9/9.
- **P365-G003 OPEN/BLOCKED:** Lockfile/dependency installation and runtime acceptance remain blocked; static audit cannot substitute for Docker builds or deployed runtime checks.
## P366 — C2-01 Stabilization Closure Audit
- **P366-G001 CLOSED:** Final stabilization closure contract verifier added; confirms source gate, CI install/build contracts, blocker transparency, and C2-02 boundary.
- **P366-G002 CLOSED:** Verifier self-contract added and integrated into the dependency-free CI source gate.
- **P359-G001 OPEN/BLOCKED:** Lockfile cannot be generated in this environment; Corepack pnpm 9.15.0 acquisition failed with registry DNS `EAI_AGAIN registry.npmjs.org`. No synthetic lockfile created.
- **P359-G002 OPEN/BLOCKED:** Typecheck/lint/build remain unverified until dependencies can be installed.
- **P359-G003 OPEN/BLOCKED:** Prisma, PostgreSQL, Redis, and API runtime acceptance remain unverified.
- **P359-G005 PARTIAL:** Source-only CI is contract-verified; frozen install and build jobs are not locally executable.
- **P359-G006 OPEN/BLOCKED:** Expo bundle/native/device validation unavailable without dependencies.
- **P359-G007 OPEN:** Production environment and deployment acceptance remain pending.
- **P366-G003 ACCEPTANCE BLOCKER:** C2-01 source stabilization scope is complete to the extent possible without registry access; environment-dependent acceptance remains OPEN. Per user direction, C2-02 may begin next, but C2-01 acceptance risks must remain tracked and must not be represented as closed.
## P367 — C2-02 Source Audit Completed / Runtime Acceptance Open
C2-02 static source inventory and tenant-scope index audit completed. 165 Prisma models inspected; 150 tenant-scoped models; 150/150 index/unique coverage PASS. TransportTripEvent composite tenant index/migration added. Runtime DB/RLS/negative/concurrency/API acceptance remains OPEN.
## C2-02 Acceptance Boundary (P367)
Static audit completed; runtime acceptance remains OPEN. See `C2-02-ACCEPTANCE-GAP-MATRIX.md` for all required closure evidence.
## P368 — C2-03 Authentication & Security Source Audit
- **P368-G001 CLOSED (source audit):** Added dependency-free auth/security source audit covering JWT, active sessions/users, MFA, Argon2id, opaque-token hashing, Redis fail-closed rate limiting, privacy-safe abuse counters and Helmet.
- **P368-G002 CLOSED:** Added audit self-contract and integrated both P369 checks into C2-01 source-only CI gate.
- **P368-G003 OPEN:** Full auth API, RBAC, privilege escalation/IDOR, MFA lifecycle, refresh rotation/reuse, Redis integration, tenant authorization-negative, CORS/cookie/deployment, dependency and penetration validation remain pending runtime environment.
## P369 — C2-03 source-audit completion sweep
- **P369-G001 CLOSED (static source audit):** RBAC helper and scope guard controls are audited and route-module authorization marker inventory is generated.
- **P369-G002 CLOSED:** RBAC audit self-contract added and integrated into the C2-01 dependency-free CI source gate.
- **C2-03 SOURCE AUDIT STATUS:** Completed as far as dependency-free source analysis can establish. Runtime acceptance remains OPEN and is not marked complete; see `C2-03-ACCEPTANCE-GAP-MATRIX.md`.
## P371 — Current C2-04/F03 Onboarding Navigation
- P371-G001 CLOSED (source slice): accessible guided step navigation and next-incomplete recommendation added; checklist completion still API-derived.
- P371-G002 OPEN: server-persisted progress, checklist ownership and invitations.
- P371-G003 OPEN: configuration writes/dependency orchestration and multi-campus/bulk configuration.
- P371-G004 OPEN/BLOCKED: dependency install/build/runtime/E2E acceptance.
## P372 — C2-04/F03 Onboarding Dependency Gates
- P372-G001 CLOSED (source slice): setup prerequisite metadata and UI Configure gating added for profile, academic year, terms, calendar, working days and attendance/grading policies. Accessible unmet-prerequisite explanation added; checklist state remains API-derived. Verifier 14/14 PASS.
- P372-G002 OPEN: backend prerequisite enforcement, persisted onboarding progress/ownership, invitations and setup mutation workflows remain open.
- P372-G003 OPEN: full dependency-order orchestration, campus inheritance/overrides, bulk import/export preview/rollback remain open.
- P372-G004 OPEN/BLOCKED: dependency install/build/runtime/API/mobile/E2E acceptance remains blocked/unverified.
## P373 — C2-04/F03 Onboarding Progress Persistence
- P373-G001 CLOSED (client-local source slice): versioned organization/school-scoped browser storage persists selected wizard step; invalid values are ignored; storage errors do not crash; completion state remains API-derived. Verifier 12/12 PASS.
- P373-G002 OPEN: server-side progress, shared checklist ownership and multi-user resumption.
- P373-G003 OPEN: school owner/admin invitations, configuration writes and backend prerequisite enforcement.
- P373-G004 OPEN: multi-campus inheritance/overrides and bulk import/export preview/rollback.
- P373-G005 OPEN/BLOCKED: dependency install/build/runtime/API/mobile/E2E acceptance.
## P374 — C2-04/F03 Server-derived onboarding readiness
- P374-G001 CLOSED: Admin onboarding consumes a server-derived readiness summary (7 checks) behind authenticated active-school membership and tenant context. Contract verifier 14/14 PASS.
- P374-G002 OPEN: server-persisted progress, checklist ownership, multi-user resume.
- P374-G003 OPEN: owner/admin invitations and enforced dependency-ordered configuration.
- P374-G004 OPEN: campus inheritance/overrides and bulk import/export preview/rollback.
- P374-G005 OPEN/BLOCKED: runtime/API/DB/build/typecheck/mobile/E2E acceptance remains unverified.
## P375 — C2-04/F03 Onboarding remediation details
- P375-G001 CLOSED (source slice): API readiness check metadata now contains human-readable descriptions and remediation steps; UI surfaces them for incomplete checks. 10/10 verifier PASS.
- P375-G002 OPEN: shared server persistence, checklist ownership, multi-user resumption and invitations.
- P375-G003 OPEN: backend enforced setup prerequisites and dependency-ordered configuration writes.
- P375-G004 OPEN: multi-campus inheritance/overrides and bulk import/export preview/rollback.
- P375-G005 OPEN/BLOCKED: live build/typecheck/runtime/API/mobile/E2E acceptance remains unverified.
## P376 — F03 onboarding dependency ownership
- CLOSED (source slice): Server readiness response now owns checklist dependency metadata and next-incomplete recommendation; UI consumes them and gates configure actions.
- OPEN: Server-persisted progress/ownership, invitations, backend-enforced configuration prerequisite validation, complete setup sequencing, multi-campus inheritance/overrides and bulk import/export preview/rollback.
- BLOCKED/OPEN: Runtime/build/typecheck/API/DB/mobile/E2E acceptance remains unverified.
## P377 active gaps
- Runtime/DB validation of onboarding progress migration and endpoint behavior.
- Multi-admin conflict/last-write behavior is not yet explicitly surfaced to the UI.
- Owner/admin invitation and checklist ownership/assignment workflows remain.
- Configuration prerequisite enforcement for setup writes remains.
- Multi-campus inheritance/overrides and bulk import/export preview/rollback remain.
## P378 — F03 Onboarding Task Ownership
- **P378-G001 CLOSED (source slice):** School onboarding checklist tasks are assignable to existing active school members through a school-scoped API and Admin UI. Assignment writes require `school.settings.manage`, validate task keys and active school membership, and emit audit events. Source verifier 19/19 PASS. Tenant RLS is enabled and forced on both assignment and progress tables.
- **P378-G002 OPEN:** Owner/admin invitations, invite acceptance and invitation delivery remain unimplemented in onboarding.
- **P378-G003 OPEN:** Full grade/section/subject/room/fee/role setup orchestration and backend prerequisite enforcement remain.
- **P378-G004 OPEN:** Multi-campus inheritance/overrides and bulk import/export preview/rollback remain.
- **P378-G005 OPEN/BLOCKED:** Prisma generation/schema validation, database migration, typecheck/build, runtime, browser and E2E acceptance not run.
## P379 — F03 schema prerequisite
- Duplicate Prisma model/enum declarations removed from schema source; verifier confirms uniqueness and single generator/datasource (6/6 PASS).
- Prisma CLI validation, generated-client compatibility, migrations and runtime acceptance remain blocked/pending environment bootstrap.
## P380 — F03 Board and grade readiness
- **P380-G001 CLOSED (source slice):** Server readiness and guided onboarding now include board affiliation and active grade levels, with remediation and dependency ordering. Progress/task allowlists support nine setup tasks. P380 verifier 13/13 PASS; updated P372/P374/P378 verifiers pass.
- **P380-G002 OPEN:** Board-specific catalogue/eligibility rules, bulk grade/subject setup, and runtime verification of the curriculum workspace are still required.
- **P380-G003 OPEN:** Full backend prerequisite enforcement for setup mutations, owner/admin invitations, multi-campus inheritance/overrides and bulk import/export preview/rollback remain.
- **P380-G004 OPEN/BLOCKED:** Prisma CLI validation, database migration, API typecheck/build/runtime and browser/E2E acceptance remain unverified.
## P381 — F03 Room and fee readiness
- **P381-G001 CLOSED (source slice):** Added tenant-scoped readiness checks for at least one active room and one published school-wide/current-year fee structure; integrated remediation and dependency-gated guided actions. P381 verifier 12/12 PASS.
- **P381-G002 OPEN:** Setup mutations still require complete server-side prerequisite enforcement and configuration orchestration; multi-campus inheritance/overrides and bulk import/export preview/rollback remain.
- **P381-G003 OPEN:** Owner/admin invitations and invitation delivery are not part of onboarding checklist assignment.
- **P381-G004 OPEN/BLOCKED:** Prisma CLI validation, DB migration, API typecheck/build/runtime and browser/E2E acceptance remain unverified.
## P382 — F03 onboarding readiness export
- **P382-G001 CLOSED (source slice):** Client-side readiness CSV export implemented and verified 11/11.
- **P382-G002 OPEN:** Export is not server-generated/audited and does not close F03 workflow gaps.
- **P382-G003 OPEN:** Invitations, orchestration, server-side prerequisite enforcement, multi-campus inheritance, bulk import/rollback remain.
- **P382-G004 OPEN/BLOCKED:** Runtime/build/database/browser/E2E validation remains outstanding.
## P383 update — task assignment filters
- The school-admin onboarding task list now supports All, Assigned to me, and Unassigned views with counts.
- Email-based member resolution supports the Mine filter; it is disabled when the signed-in user cannot be matched to an active school roster entry.
- F03 remains active; this does not close server workflow, invitations/delivery, backend enforcement, campus overrides, import rollback, or runtime acceptance.
## P384 active gaps update
- P384 assignment save feedback source slice completed and verified (10/10); awaiting runtime validation.
- F03 remains open: invitation lifecycle/delivery, end-to-end configuration orchestration, server-side prerequisite enforcement, multi-campus inheritance/overrides, bulk import preview/rollback, and runtime/API/browser acceptance.
## P385 active gaps update
- Per-task concurrent assignment save status is implemented and source-verified (10/10); the shared busy-state clobber issue is addressed.
- F03 remains open: owner/admin invitation and acceptance lifecycle/delivery, complete setup orchestration, server mutation prerequisite enforcement, campus inheritance/overrides, bulk import preview/validation/rollback, and runtime acceptance.
- Prisma/DB/API build/runtime/browser E2E still unverified.
## P386 active gaps update
- Per-task onboarding assignment errors now isolate concurrent failures and show inline accessible alerts; source verifier 8/8 PASS.
- F03 remains IN_PROGRESS: invitation lifecycle/delivery, full orchestration, backend prerequisites, campus inheritance/overrides, import preview/validation/rollback, and runtime acceptance remain open.
- Runtime, DB, API build and browser/E2E remain unverified.
## P387 update
- F03 remains IN_PROGRESS. Assignment UI state now resets at readiness load start to reduce stale scope display; complete lifecycle/orchestration/backend prerequisites and runtime acceptance remain open.
## P388 active gaps update
- Readiness checklist, refresh timestamp, and recommended-next-step state now clear on load/scope loss to prevent stale school readiness UI; source verifier 8/8 PASS.
- F03 remains IN_PROGRESS: invitation lifecycle/delivery, full setup orchestration, backend prerequisite enforcement, campus inheritance/overrides, bulk import preview/validation/rollback, and runtime acceptance remain open.
- DB, API build/runtime, browser/device, and E2E remain unverified.
## P389 active gaps
- Organization invitation list/create/revoke UI and APIs source-implemented; token fields are excluded from list responses; revocation is audited; duplicate pending invites rejected; acceptance attempts serialize and role assignments are deduplicated. P389 source verifier 15/15 PASS.
- Invitation delivery remains disabled/unconfigured; invitations stay pending delivery.
- F03 remains IN_PROGRESS: configuration orchestration, server-side prerequisite enforcement, campus inheritance/overrides, bulk import preview/validation/rollback, runtime/API/DB/browser/E2E acceptance remain open.
## P390 F03 update
- API-side prerequisite gates now protect academic terms, calendars, working days and school policy configuration writes. This closes only the source implementation slice; F03 remains active.
- Still open: organization invitation email delivery/deep-link UX, full orchestration of grade/section/subject/room/fee/role setup, multi-campus inheritance/overrides, bulk configuration import preview/validation/rollback, and runtime acceptance.
## P391 current F03 gaps
- **OPEN:** Dependency-ordered end-to-end onboarding orchestration across all setup domains.
- **OPEN:** Multi-campus inheritance/overrides, including API validation and UI scope switching.
- **OPEN:** Bulk import/export preview, validation, atomic commit, rollback/undo.
- **BLOCKED:** Runtime API/DB/provider/browser/mobile/E2E acceptance.
Invitation email delivery source slice implemented in P391; it requires deployment provider configuration and was not live-tested.
## P392 — F03 orchestration remaining
- Dependency-aware status and server next-action metadata delivered, but complete orchestration across all setup domains remains OPEN.
- Multi-campus inheritance/override and bulk configuration preview/validation/commit/rollback remain OPEN.
- Runtime/API/DB/provider/browser/mobile/E2E acceptance remains BLOCKED/UNVERIFIED.
- F03 remains IN_PROGRESS. Do not begin F04.
## P393 update — F03 blocker details
- Onboarding task rows now display named incomplete prerequisites. This improves remediation visibility but does not close remaining F03 gaps.
- OPEN: multi-campus inheritance/overrides.
- OPEN: bulk configuration import/export preview, validation, atomic commit and rollback.
- OPEN: full dependency enforcement coverage and runtime/API/DB/browser/mobile/E2E acceptance.
- F03 remains IN_PROGRESS; F04 remains blocked.
## P394 F03 update
- CLOSED (source slice): onboarding task assignment CSV preview/import with active-member/task validation, duplicate rejection, unassignment and sequential apply reporting.
- OPEN: bulk school configuration import/export with preview, atomic commit/rollback; multi-campus inheritance/override; full orchestration.
- BLOCKED: runtime/API/DB/browser/mobile/E2E acceptance.
## P395 update — F03 onboarding assignment CSV
- **CLOSED (source slice):** CSV parsing supports quoted commas, escaped quotes, multiline values and CRLF; malformed quoted fields fail preview safely. Parser runtime cases passed.
- **OPEN:** Bulk school configuration import/export with preview, validation, atomic commit and rollback; multi-campus inheritance/override; complete prerequisite coverage; runtime acceptance.
## P395 update — F03 onboarding CSV parser hardening
- **CLOSED (source slice):** Assignment import parser now handles quoted commas, escaped double quotes, embedded newlines and CRLF; rejects malformed quoted input. Parser checks 5/5 passed.
- **OPEN:** Bulk school configuration import/export preview, validation, atomic commit and rollback; multi-campus inheritance/overrides; full onboarding orchestration and runtime acceptance. F03 remains IN_PROGRESS; F04 not started.
## P396 Active Gaps
- Configuration JSON transfer currently supports Profile, Weekly Working Days, and Policies only; academic years/terms, calendars/events and remaining domains are not included.
- Multi-campus inheritance and per-campus override configuration remains OPEN.
- Import apply is sequential with best-effort compensating rollback, not an atomic multi-resource transaction.
- Full F03 orchestration and prerequisite enforcement coverage remains OPEN.
- Runtime/build/API/DB/browser/mobile/E2E acceptance remains unverified.
## P397 Active Gaps update
- P397 closed the source slice for academic year/term configuration transfer. It is additive, sequential, and may partially create records on failure.
- Still OPEN: calendars/events and other domains in config transfer, atomic cross-resource import/rollback, multi-campus inheritance/overrides, full dependency orchestration and prerequisite coverage.
- BLOCKED: full build/typecheck/runtime/API/DB/browser/mobile/E2E acceptance.
## P398 Active Gaps update
- Calendar/event transfer is now implemented for a selected calendar with preview and additive new-calendar creation. P398 verifier 18/18 PASS.
- Remaining: multi-calendar and remaining-domain bulk transfer, transaction/rollback guarantee, multi-campus inheritance/overrides, full setup dependency orchestration, and runtime acceptance.
- Calendar/academic imports remain sequential and may partially create data. Runtime build/API/DB/browser/mobile/E2E validation is unverified.
## P399 update — strict calendar event timestamps
- Calendar transfer timestamp validation now requires timezone-explicit ISO 8601 date-times and rejects malformed dates, clocks, and offsets. Source verifier/helper behavior: 14/14 PASS. This closes only the strict timestamp validation slice.
- OPEN: transactional calendar import and rollback; multi-campus inheritance/overrides; remaining configuration domains; full dependency orchestration; runtime/API/DB/browser/mobile/E2E acceptance. F03 remains IN_PROGRESS; F04 remains blocked.
## P400 update — Campus configuration inheritance
- Foundation resolver and versioned validation model delivered for profile, working-day and policies scopes.
- Still active: end-to-end campus CRUD and inheritance integration, persistence/API/UI/permissions, inheritance-chain traversal and cycle prevention; transactional bulk config transfer/rollback; remaining onboarding domain orchestration and runtime acceptance. F03 remains IN_PROGRESS; F04 not started.
### P401 — campus inheritance chain
- Chain resolution helper implemented and verified (16/16). This is not yet wired to persistence, API, authorization or UI.
- Active: campus CRUD/persistence and API integration; campus inheritance editor; configuration application integration; atomic transfer/rollback; remaining F03 dependency orchestration and runtime acceptance.
## P402 update — campus inheritance override editing utilities
- **P402-G001 CLOSED (source slice):** Added reusable draft creation, inherited-scope toggles, whole-scope override set/remove, nested override path editing and summary helpers with defensive cloning and unsafe-path rejection. P402 source verifier 16/16 PASS.
- **P402-G002 OPEN:** Editing helpers are not integrated into campus persistence, CRUD/API, authorization, or admin UI; compiled runtime behavior and full build remain unverified.
- **OPEN:** Campus persistence/API/UI integration, multi-campus live configuration application, transactional import/rollback, remaining setup-domain transfer, complete dependency orchestration, and runtime/API/DB/browser/mobile/E2E acceptance. F03 IN_PROGRESS; F04 not started.
### P403
- **Resolved:** Campus inheritance document persistence foundation (tenant-scoped model/table, RLS, GET/PUT/DELETE routes, validation, permission gate and audit hooks). Static verifier evidence only; runtime remains unverified.
- **Open:** Campus UI integration; persisted campus existence and cycle checks; wiring inheritance into configuration reads/writes; full build/runtime/database/E2E validation.
## P404 update
- **CLOSED (source slice):** persisted campus inheritance cycle guard rejects cyclic proposed parent changes using tenant-scoped parent records; HTTP 409 is returned before persistence.
- **OPEN:** campus existence, campus UI/CRUD, live configuration resolver wiring, concurrent update race protection, transactional imports, remaining F03 orchestration, runtime/API/DB/browser/mobile/E2E acceptance.
## P405 — Effective persisted campus inheritance resolution
- **P405-G001 CLOSED (source slice):** Added a permission-gated effective-resolution endpoint for persisted campus inheritance. It validates the target/parent chain, rejects cycles and duplicate records, and combines scope overrides ancestor-to-child using deep merge for inherited scopes and replacement for non-inherited scopes. Tenant/school filters are retained. Verifier: 16/16 PASS.
- **P405-G002 OPEN:** This endpoint returns effective override documents only; it is not yet integrated into the actual School Profile, Working Days or Policy configuration read/write flows. Campus entity existence remains record-based rather than validated against a campus registry. Transaction/locking, admin UI, transactional imports, runtime/API/DB/browser/mobile/E2E acceptance and remaining onboarding orchestration are open. F03 IN_PROGRESS; F04 blocked.
## P406 active gaps
- Campus effective read view is available as an explicit endpoint, but integration into normal configuration consumers is not complete.
- Campus registry existence validation and management UI are open.
- Concurrent inheritance mutation safety and transactional import/rollback are open.
- Full runtime, API, database/RLS, browser/mobile and E2E acceptance remains unrun.
## P407 active gaps
- Campus registry API exists, but campus management UI and mobile workflows remain unimplemented.
- Concurrency-safe main-campus designation and inheritance-parent updates across concurrent requests need database-backed transaction/locking hardening and runtime tests.
- Migration application, live API/DB/RLS tests, build/typecheck, browser/mobile and E2E acceptance are outstanding.
## P408 remaining active gaps
- Verify Campus Registry UI through installed dependencies/build and authenticated browser/API runtime.
- Add campus selection UX to relevant teacher/parent/student/staff workflows and mobile apps.
- Integrate campus-effective profile/working-days/policies into standard configuration read/write paths.
- Make inheritance graph save race-safe/transactional.
- Complete remaining onboarding orchestration and atomic import/rollback.
- Run DB/RLS migration, runtime, browser/mobile and E2E acceptance. F03 remains IN_PROGRESS; F04 blocked.
## P409 active gaps
- Campus-effective configuration is selectable and previewable, but standard school configuration writes still do not apply campus overrides.
- Mobile campus selectors, concurrent inheritance-update safety, transactional imports/rollback, remaining onboarding orchestration, and runtime/browser/mobile/E2E acceptance remain open. F03 IN_PROGRESS; F04 blocked.
## P410 current disposition — F03 source implementation complete
- F03 School Onboarding source implementation is complete at P410. Campus inheritance administration and scope overrides are available in School Admin; graph writes are transactionally serialized and revalidated; configuration transfer import now validates and commits atomically per scope.
- Remaining cross-cutting validation is deferred: full build/typecheck with dependencies, Prisma schema/migrations, live API/DB/RLS, browser/mobile and E2E acceptance.
- Campus selection/context for mobile apps remains in the mobile feature workstreams.
- **F04 is unblocked for the next implementation phase.**
## P411 — F04 active gaps
- Official board-specific curriculum packs and outcome/competency mapping with authoritative source references, approvals, effective dates and version history remain OPEN. P411 provides only non-official starter metadata.
- Curriculum planning, lesson planning, coverage tracking, promotion/retention/transfer/graduation/rollover, capacity/allocation workflows, complete UI/import/export and board-policy validation remain OPEN.
## P412 — F04 curriculum outcome foundation
- Outcome/competency mapping persistence and source provenance/review lifecycle APIs are implemented at source level.
- Remaining active: official board-specific curriculum sources/content and validation, outcome UI/edit/import, assessment mapping, planning/coverage/progression/rollover, and deferred runtime acceptance (Prisma/build/typecheck/API/DB/RLS/browser/mobile/E2E).
## P413 update — Curriculum outcomes administration
- P413 source implementation adds an authenticated, school-scoped outcome administration UI with version/grade/subject selection, filtering, create form with provenance and review-state controls.
- Outcome management UI source slice is implemented; runtime validation remains deferred. P412-G002 remains OPEN for edit/delete, bulk import/export, assessment mapping, official board content and full acceptance.
## P415 update — F04 curriculum outcomes bulk data
- Bulk CSV template/download and export source implementation is complete; export supports optional grade and review-status filters.
- CSV import preview and all-or-nothing commit source implementation is complete; row-level issues, duplicate checks, grade/subject/version scope, 500-row and 1.5 MB caps are implemented; imported records remain DRAFT.
- Still active: outcome-to-assessment mapping, official board curriculum packs and provenance review, and full runtime acceptance (build/typecheck/Prisma/API/DB/RLS/browser/mobile/E2E).
## P416 snapshot update
- Outcome-to-exam mapping source slice implemented and focused verifier passes 26/26. Runtime verification remains deferred; official curriculum content and granular assessment question/component mapping remain open.
## P417 — Curriculum Outcome Coverage & Assessment Alignment Dashboard
- Added a tenant/school/version-scoped coverage dashboard API with grade, review-status and subject filters. It aggregates mapped/unmapped/multi-mapped outcomes, mapping totals, mapped exam counts and coverage percentages.
- Grade-wise and subject-wise coverage breakdowns are included, along with exam-wise coverage for all matching school exams (including exams with zero mappings), unmapped-outcome action lists and multi-mapped outcome details. Exam query is restricted by school, outcome grade(s), and curriculum academic year when configured.
- Added the School Admin coverage dashboard integrated into the outcomes workspace, showing KPI cards, grade/subject/exam tables and unmapped/multiple-mapping action lists. Dashboard subject selection resets when version/grade/review filters change.
- Focused verifier: 24/24 PASS. Pure-function runtime smoke: 7/7 PASS. P411–P416 regression verifiers pass. TS/TSX parser scan: 262 files, 0 parse diagnostics.
- Full build/typecheck, Prisma validation/migration, live API/DB/RLS, browser/mobile and E2E acceptance remain deferred/unverified.
### P417 residual gaps
- Runtime/DB validation remains open: full API execution, authorization/RLS integration, Prisma schema validation and migrations, browser/mobile/E2E acceptance.
- Exam-wise eligibility currently counts general (unscoped) grade-level outcomes as eligible for each exam subject; school-owned curriculum subject outcomes require exact subject name/code match. Confirm policy with real school data during runtime validation.
- Granular question/component-level alignment and authoritative board curriculum data remain open.
## P418 lesson-planning runtime acceptance gaps
- Prisma validation/generation and migration application not run (workspace dependencies/runtime unavailable).
- API/database/RLS integration and browser/mobile/E2E acceptance not run.
- Confirm lesson-plan lifecycle transitions and curriculum outcome linking policy with real school runtime data.
## P420 active residuals
- P420-G002 OPEN: Prisma/build/typecheck, migration/live API/DB/RLS, browser/mobile and E2E acceptance remain deferred. Teacher assignments are not yet surfaced in teacher mobile/portal workflows.
## P421 active gap delta
- P421-G002 — Full typecheck/build, Prisma validation/generation/migration, live API/DB/RLS authorization tests, mobile device runtime and E2E acceptance — OPEN. Teacher status lifecycle and assignment scope are source-implemented; runtime evidence remains pending.
## P422 active residual gaps
- P422-G002 OPEN: Dependency-backed typecheck/build, Prisma validation/generation and migration application, live API/DB/RLS, permissions integration, mobile runtime and E2E acceptance remain unverified. Reflection history review/export and offline queue are not included.
## P423 active residuals
- P423-G002 OPEN: runtime verification remains pending (Prisma validation/generation, migration apply, API/DB/RLS and permission integration, build/typecheck and browser/mobile E2E).
- P423-G003 OPEN: ID-based filters are functional but not friendly; pagination and task assignment/due-date workflow are not included.
## P424 newly discovered gaps
- P424-G001 — Runtime acceptance of reflection action tasks (Prisma/migration/API/RLS/authorization/build/mobile/E2E) — READY_FOR_VERIFICATION
- P424-G002 — Task assignment reassignment, completion notes UI, overdue reminder delivery and task history — OPEN
## P425 carried-forward / newly identified gaps
- [ ] P425-G001 — Runtime acceptance of due-bucket API filtering and coordinator/teacher task monitoring: Prisma/API integration, authorization/RLS, date boundary behavior, build and mobile/browser E2E — READY_FOR_VERIFICATION.
- [ ] P425-G002 — School-configured timezone handling for due-today/overdue date boundaries; current API bucketing uses UTC while client indicators use device-local date — OPEN.
- [ ] P425-G003 — Reminder and escalation delivery (push/email/in-app) for upcoming and overdue reflection tasks — OPEN.
- [ ] P425-G004 — Coordinator dashboard totals/pagination beyond the bounded 500-task list; current counts are only for loaded records — OPEN.
## P426 active gaps
- P426-G001: Runtime acceptance of notification model, migration, API and tenant/staff RLS; full build/typecheck and mobile E2E. READY_FOR_VERIFICATION
- P426-G002: Automatic scheduled worker and push/provider delivery with retries, receipts and preferences. OPEN
- P426-G003: School timezone alert calculation, reminder UX and observability. OPEN
## P427 active gaps
- P427-G001: Scheduler runtime acceptance, worker deployment, DB/RLS, due-time behavior and multi-instance verification. READY_FOR_VERIFICATION
- P427-G002: Push/email delivery, retry policy, receipts and notification preferences remain OPEN
- P427-G003: Runtime acceptance and E2E for time-zone boundaries and scheduled alerts remains OPEN
- P426-G002 partially remediated: automatic in-app task reminder scheduling implemented at source level; external delivery/retries/receipts/preferences still remain.
## P428 active gaps
- P428-G001: Runtime acceptance of reminder preferences API/mobile controls, migration, tenant RLS and scheduler behavior — READY_FOR_VERIFICATION
- P428-G002: Coordinator defaults settings UI still needed (API is available) — OPEN
- P428-G003: Full build/typecheck, live database migration and authorization/E2E — OPEN
- P428-G004: External push/email channel preferences and delivery — OPEN
## P429 active gaps
- P429-G002 — Design and implement coordinator visibility into individual teacher preference settings with suitable privacy and permission controls; API currently supports teacher-self only. OPEN
- P429-G003 — Runtime acceptance, full build/typecheck, DB/RLS/migration and browser/mobile E2E. OPEN
- P429-G004 — External push/email delivery, retries, receipts and observability. OPEN
## P430 — Privacy-Aware Reminder Preference Summary
- P430-G001 OPEN: Validate cohort is teacher-only or document broader active-staff aggregate scope.
- P430-G002 OPEN: Live permission/RLS/privacy validation, including low-count disclosure.
- P430-G003 OPEN: Full build/typecheck, migration/runtime and browser/mobile E2E.
- P430-G004 OPEN: External channels and delivery operations (push/email, retries, receipts, observability).
## P431 active gaps
- [ ] P431-G003 — Privacy review and runtime tenant authorization/RLS acceptance — OPEN
- [ ] P431-G004 — Full build/typecheck, database runtime, browser/mobile E2E — OPEN
- [ ] P431-G005 — Push/email provider delivery, retry/backoff, receipts and observability — OPEN
## P432 active gaps
- [ ] P432-G001 — Live PostgreSQL migration, RLS and immutable trigger runtime validation — OPEN
- [ ] P432-G002 — Actor display-name resolution/privacy review — OPEN
- [ ] P432-G003 — Prisma validation/generation, full build/typecheck and browser/mobile E2E — OPEN
- [ ] P432-G004 — External push/email channels, retries, receipts and observability — OPEN
## P433 active gaps
- [ ] P433-G002 — Runtime acceptance of history filters, cursor pagination and CSV export; full build/typecheck — OPEN
- [ ] P433-G003 — PostgreSQL/RLS runtime and browser/mobile E2E acceptance — OPEN
- [ ] P433-G004 — Large audit export (>1,000 rows) background export and export-audit event consideration — OPEN
- [ ] P433-G005 — External push/email provider delivery, retries, receipts and observability — OPEN
## P434 active gaps
- [ ] P434-G001 — Live migration/Prisma/RLS/worker runtime acceptance — OPEN
- [ ] P434-G002 — Full build/typecheck and browser E2E; live export flow validation — OPEN
- [ ] P434-G003 — Multi-worker concurrency, recovery and cleanup runtime testing — OPEN
- [ ] P434-G004 — Exports are capped at 50,000 rows/job; chunked streaming for larger datasets — OPEN
- [ ] P434-G005 — External push/email delivery, retries, receipts and observability — OPEN
## P435 — Export Job Management & Recovery Controls
- **P435-G001 OPEN:** Runtime validate migration, Prisma schema/client, requester/tenant/school authorization and RLS for list/cancel/retry endpoints.
- **P435-G002 OPEN:** Runtime test cancel/retry status transitions, concurrent worker claims, stale processing recovery and three-attempt ceiling.
- **P435-G003 OPEN:** Full build/typecheck and browser E2E for export-job management UI.
- **P435-G004 OPEN:** Consider dedicated `CANCELLED` status instead of `EXPIRED` + cancellation code; verify API clients tolerate status semantics.
- **P435-G005 OPEN:** Export files currently stored in DB text; verify storage pressure/limits and evaluate object storage/streaming beyond 50k rows.
## P436 — Export Job Operational Observability
- P436 source slice adds permission-gated school-scoped aggregate metrics and School Admin health panel; verifier 18/18 PASS.
- P436-G001 through G004 remain OPEN: runtime auth/RLS/DB acceptance, build/E2E, heartbeat/external observability, and scale/performance.
## P437 — Export Queue Capacity & Backpressure
- Delivered: configurable active-job caps per school/requester; duplicate queued filter request suppression; HTTP 429 capacity response with retry guidance.
- **P437-G001 OPEN:** Runtime DB/API acceptance, concurrency race validation for capacity enforcement, and tenant RLS.
- **P437-G002 OPEN:** Full workspace build/typecheck and browser/mobile E2E.
- **P437-G003 OPEN:** Multi-school fairness remains global FIFO; evaluate round-robin fairness and worker scaling.
- **P437-G004 OPEN:** Validate caps against real workload and query performance; DB-level atomic enforcement is not implemented.
## P438 active gaps
- [ ] P438-G001 — Process-local fairness cursor resets on worker restart — OPEN
- [ ] P438-G002 — Worker remains single-concurrency; configurable parallel processing is not implemented — OPEN
- [ ] P438-G003 — Live queue/load testing not run — OPEN
## P439 active gaps
- [ ] P439-G001 — Live multi-instance DB concurrency/duplicate-claim validation — OPEN
- [ ] P439-G002 — Representative throughput/load and failure-isolation testing — OPEN
- [ ] P439-G003 — Persist/validate fairness across restarts and worker instances — OPEN
- [ ] P439-G004 — Full build/typecheck and browser/mobile E2E — OPEN
## P440 active gaps
- [ ] P440-G001 — Persist export worker metrics/history beyond logs — OPEN
- [ ] P440-G002 — Configure operational alerting for worker degraded/stale status — OPEN
- [ ] P440-G003 — Live heartbeat/API/staleness validation — OPEN
- [ ] P440-G004 — Full workspace build/typecheck and browser/mobile E2E — OPEN
## P441 follow-up active gaps
- P441 alert runtime/webhook validation pending.
- Multi-instance monitor behavior and monitor restart state loss not validated.
- Full build/typecheck and browser/mobile E2E pending.
## P443 — Alert Escalation Console & Lifecycle Visibility
- Completed: escalation metadata surfaced in platform alert API and Super Admin console.
- Added lifecycle filters for escalated-only and unacknowledged alerts.
- Focused verifier: 7/7. Regression verifiers P442–P432: 175/175. Total: 182/182.
- Runtime/full build/E2E validation remains open.
## P444 active gaps
- [x] P444-G001 — Validate assignment IDs against platform-admin directory — RESOLVED in P445 source verifier; runtime validation remains under P444-G002
- [ ] P444-G002 — Live DB/API migration and lifecycle transition tests — OPEN
- [ ] P444-G003 — Runtime authorization and lifecycle history access tests — OPEN
- [ ] P444-G004 — Full build/typecheck and browser/mobile E2E — OPEN
- [ ] P444-G005 — Concurrent lifecycle transition and audit-ordering tests — OPEN
## P445 — Alert SLA, Ownership & Follow-up Management
- **P445-G001 OPEN:** Execute the P445 migration against a real PostgreSQL environment and validate query/endpoint behavior.
- **P445-G002 OPEN:** Add and run API authorization and SLA endpoint tests for future deadline validation, resolved-alert rejection, and assignment identity validation.
- **P445-G003 OPEN:** Add a background scheduler/outbound notification integration for automatic follow-up reminders; current follow-up is a durable manual record.
- **P445-G004 OPEN:** Run full workspace build/typecheck and browser/mobile E2E for SLA/workload controls.
- **P445-G005 OPEN:** Validate SLA workload queries and concurrent follow-up writes under realistic database contention.
## P446 — Alert Notification Automation & SLA Escalation Workflow
- Implemented periodic one-time SLA reminder processing (alerts within 60 minutes of due time) and one-time overdue escalation for unresolved/unacknowledged alerts.
- Added durable reminder/escalation markers and indexes; automation event payloads are sent through existing alert outbox delivery/retry.
- API and Super Admin UI expose reminder/escalation timestamps. Focused verifier 12/12; P432–P445 regression 204/204; combined P432–P446 216/216 source assertions.
- **P446-G001 OPEN:** Run migration and automated SLA sweeps against live PostgreSQL and verify query/locking behavior.
- **P446-G002 OPEN:** Validate webhook delivery, retry, recipient routing and provider-side deduplication for reminder/escalation events.
- **P446-G003 OPEN:** Validate multiple worker instances, timer drift/restarts, and race conditions in a live environment.
- **P446-G004 OPEN:** Replace fixed 60-minute reminder and current critical escalation behavior with configurable SLA policies if product requirements demand policy-level customization.
- **P446-G005 OPEN:** Full workspace build/typecheck and browser/mobile E2E for the new alert automation visibility.
- **P446-G006 OPEN:** Make reminder/escalation marker claim and event outbox insert atomic or add reconciliation for a marker claimed without a corresponding event.
## P447 Active Gaps
- **P447-G001 OPEN:** Live PostgreSQL transaction rollback, row-lock, and concurrent sweep validation.
- **P447-G002 OPEN:** Validate deployed worker environment policy values and runbook.
- **P447-G003 OPEN:** Persisted school/severity policy CRUD remains a future requirement-dependent gap; current values are environment configurable.
- **P447-G004 OPEN:** Full workspace build/typecheck and browser/mobile E2E.
- **P447-G005 OPEN:** Live provider delivery, retries, and recipient validation.
## P448 Active Gaps
- **P448-G001 OPEN:** Connect stored severity-based policy to worker reminder/escalation processing and recipient routing.
- **P448-G002 OPEN:** Live API/database verification of policy validation and persistence.
- **P448-G003 OPEN:** Browser validation of Super Admin policy editor.
- **P448-G004 OPEN:** Full workspace build/typecheck and browser/mobile E2E.
- **P448-G005 OPEN:** Multi-worker policy reload/reconciliation validation.
## P449 delta gaps (open)
- P449-G001 recipient routing end-to-end/provider confirmation.
- P449-G002 live DB/worker policy execution tests.
- P449-G003 multi-worker contention/idempotency runtime tests.
- P449-G004 full build/typecheck and browser/mobile E2E.
- P449-G005 runtime policy audit/version and malformed-policy fallback validation.
## P450 — Alert Delivery Routing & Recipient Notification Integration
- **P450-G001 OPEN:** Live webhook/provider validation of recipient-specific outbox deliveries and independent retry behavior.
- **P450-G002 OPEN:** Implement direct in-app/email delivery channels and channel-specific provider adapters.
- **P450-G003 OPEN:** Add user notification preferences/opt-out handling for platform alert channels.
- **P450-G004 OPEN:** Validate fan-out and delivery behavior under concurrent workers with a live database.
- **P450-G005 OPEN:** Full workspace build/typecheck and browser/mobile E2E validation.
## P451 delta gaps (open)
- P451-G001 in-app channel adapter/inbox.
- P451-G002 email provider adapter.
- P451-G003 live preference/webhook opt-out validation.
- P451-G004 queued-delivery preference reconciliation/race handling.
- P451-G005 concurrency, full build/typecheck, and browser/mobile E2E.
## P452 — In-App Inbox Pagination & Grouping
- **P452-G001 OPEN:** Live DB/API and cross-user authorization tests for cursor pagination/unread count.
- **P452-G002 OPEN:** Client validation for category grouping and paginated grouping UX.
- **P452-G003 OPEN:** Retention/pruning lifecycle for IN_APP outbox records.
- **P452-G004 OPEN:** Full workspace build/typecheck and browser/mobile E2E.
## P454 — C2-03 Route Security Inventory
- **P454-G001 PARTIALLY_IMPLEMENTED:** API route modules are inventoried and classified for review; classification and completeness are static, not handler-level security evidence.
- **P454-G002 OPEN:** Route-by-route auth/RBAC/tenant-scope review and runtime negative tests remain pending. See `C2-03-ROUTE-SECURITY-INVENTORY.json` and P454 reports.
## P461 — C2-03 Security Consolidation
- P461-G001 runtime route/mount reconciliation.
- P461-G002 endpoint-level auth/RBAC/tenant-scope negative tests.
- P461-G003 live role/grant drift and least-privilege verification.
- P461-G004 refresh/session concurrency and revocation integration testing.
- P461-G005 enable provider-backed password recovery and test delivery.
- P461-G006 runtime MFA provisioning, key rotation, enforcement and UX validation.
- P461-G007 full builds, E2E, penetration test, and tenant/school isolation acceptance.
## P483 — Student Mobile C2-06 kickoff (active)
- Daily activity snapshot source implementation is delivered; runtime data acceptance remains pending.
- Student Mobile full daily journey coverage is still OPEN: timetable, attendance, calendar, exams/results, report cards, library, transport, hostel, finance/documents, offline/push/deep-link, accessibility and security acceptance.

## P484 Active Gaps
- **P484-G001 OPEN:** Live timetable endpoint/API/database integration and date-specific slot acceptance.
- **P484-G002 OPEN:** Attendance record/status/date validation against real student-linked records.
- **P484-G003 OPEN:** Calendar default selection, audience filtering and event date/time acceptance.
- **P484-G004 OPEN:** Expo typecheck/build and device/browser E2E.
- **P484-G005 OPEN:** Authorization negative cases, cross-school isolation, offline/cache freshness, accessibility and timezone tests.

## P486 Active Gaps
- **P486-G001 PARTIALLY_IMPLEMENTED:** Student homework lifecycle labels and due-date classification added; real date/time data acceptance remains open.
- **P486-G002 PARTIALLY_IMPLEMENTED:** Graded submissions are locked consistently in mobile UI; runtime API validation remains open.
- **P486-G003 PARTIALLY_IMPLEMENTED:** Client answer limit aligns with 10,000-character API validation; device validation remains open.
- **P486-G004 OPEN:** Late-submission policy semantics, attachment failure/retry, typecheck/build, accessibility, live authorization, offline/reconnect and E2E acceptance.

## P488 Active Gaps
- **P488-G001 OPEN:** Student-scoped Library loan/reservation API, security authorization and student UI integration.
- **P488-G002 OPEN:** Student-scoped Transport allocation/route/stop/trip status APIs and mobile integration.
- **P488-G003 OPEN:** Student Services runtime acceptance: API connectivity, typecheck/build, device, offline/cache freshness, accessibility and E2E.
## P489 Active Gaps
- **P489-G001 SOURCE_IMPLEMENTED / runtime OPEN:** Safe bounded retry for read-only GET/HEAD requests; verify retry timing and transient status behavior against network conditions.
- **P489-G002 SOURCE_IMPLEMENTED / device OPEN:** Offline-only restored-session banner and reconnect action; verify reconnect, refresh-token rotation and expiry on device.
- **P489-G003 OPEN:** No durable encrypted student cache, offline mutation queue or cache freshness policy is delivered.
- **P489-G004 OPEN:** Expo typecheck/build, offline/online transition, background/foreground, accessibility, security and E2E acceptance.

## P490 Active Gaps
- **P490-G001–G007 OPEN:** C2-06 cycle closure carries forward the missing student library and transport API integrations, hostel/finance/document journeys, runtime/build/device validation, school/student authorization and date/time acceptance. See the detailed P490 entry in the Master Open Gaps Register.

## P534 — Communication delivery tracking gaps added
- **P534-G001 OPEN:** Full API/database runtime verification for JSON communicationId filtering, status aggregation and tenant/school-negative access checks.
- **P534-G002 OPEN:** Recipient-level delivery details, retries/failure actions and provider email/push delivery tracking remain future work.
- **P534-G003 OPEN:** Full API/web build, typecheck, browser/mobile, accessibility and end-to-end acceptance remain pending.


## P535 — Parent/Student Notifications & Preferences (added 2026-11-23)
- **P535-G001 OPEN:** Runtime tests needed for student notification preference API authorization, active student-link guards, and tenant/school isolation negative cases.
- **P535-G002 OPEN:** Student Mobile offline preference intent persistence/reconciliation is not implemented; only Parent Mobile has the existing offline queue.
- **P535-G003 OPEN:** Student preference controls currently support IN_APP only. Email/push preferences require channel readiness and provider integration.
- **P535-G004 OPEN:** Full API/mobile build, database integration, browser/device, accessibility and E2E acceptance remain pending.


## P536 newly identified report gaps
290. **Server-side pagination and report filters for admissions and communications APIs — OPEN** — `P536-G001`
291. **Extend communication delivery reporting beyond the latest 30 records and add external email/push transport status when providers are integrated — OPEN** — `P536-G002`

## P537 — Cross-App Integration, Permissions, Accessibility & C2-09 Cycle Closure
- **P537-G001 OPEN:** Full runtime cycle acceptance remains pending: complete builds/typecheck, API/database integration, browser/mobile workflow validation and E2E across admissions, enrollment, communications and notification preferences.
- **P537-G002 OPEN:** Formal accessibility audit and runtime role/tenant/school-negative authorization validation have not been executed; static integration evidence is not a substitute.
- **P537-G003 OPEN:** C2-09 is source-phase complete, but runtime acceptance closure is blocked by carried-forward P534–P536 delivery, pagination/report scale and provider integration gaps.


## P571 integration and final cycle acceptance gaps
- [ ] P571-G001 — Restore reproducible pnpm workspace install and commit/verify pnpm-lock.yaml — OPEN (pnpm unavailable in P571 environment; baseline archive has no lockfile)
- [ ] P571-G002 — Run Prisma format, validate and generate against the complete schema; resolve generated-client/type errors — OPEN (Prisma CLI and dependencies unavailable)
- [ ] P571-G003 — Apply all migrations to clean and upgraded PostgreSQL databases; resolve SQL/schema drift — OPEN (Docker/PostgreSQL unavailable; migration file presence is not execution evidence)
- [ ] P571-G004 — Run dependency-backed semantic typechecks and production builds for all nine application packages, shared packages and API — OPEN (workspace dependencies absent)
- [ ] P571-G005 — Resolve and rerun the 29 failing repository static verifiers; retain approved contract changes and evidence — OPEN (327/356 passed)
- [ ] P571-G006 — Execute API/database integration tests with isolated PostgreSQL lifecycle and representative cross-module journeys — OPEN (no database runtime)
- [ ] P571-G007 — Execute production-role RLS and cross-tenant negative tests for Library, Transport, Hostel and all tenant-owned resources — OPEN (no PostgreSQL runtime)
- [ ] P571-G008 — Execute transaction/concurrency/load tests for reservation queues, seat/bed allocation, waitlist, invoices, refunds, duty shifts and worker idempotency — OPEN (no DB/runtime test harness)
- [ ] P571-G009 — Verify payment, email, SMS/push and webhook provider lifecycle using test credentials and observed callbacks — OPEN (provider credentials/callbacks unavailable; no delivery/settlement claim)
- [ ] P571-G010 — Complete browser/device E2E and offline recovery for parent, staff, teacher, student, driver and school admin journeys — OPEN (browser/device execution unavailable)
- [ ] P571-G011 — Complete automated and manual accessibility audits across web and mobile workflows — OPEN (no browser/device audit evidence)
- [ ] P571-G012 — Obtain independent privacy/security/legal review for GPS, guardian consent, health, safeguarding, visitor identity and retention controls — OPEN (independent sign-off pending)


## P572 Active Gaps
- **P572-G001 OPEN:** Exact pnpm 9.15.0 lockfile generation and frozen install are blocked by unavailable npm registry access; do not fabricate lockfile metadata.
- **P572-G002 OPEN:** C2-01 workspace CI gate remains blocked by missing pnpm-lock.yaml; all 14 package manifests and script targets pass the dependency-free manifest audit.
- **P572-G003–G006 OPEN:** Prisma validation/generation, clean/upgraded PostgreSQL migrations, dependency-backed package builds/typechecks and database integration require the pinned dependency/database environment.
- **P572-G007 OPEN:** Six stale verifier assertions were corrected; 356/357 static verifiers now pass, with the remaining failure being the missing lockfile gate.
- **P572-G008 OPEN:** Production-role RLS and cross-tenant negative tests require PostgreSQL and a non-owner database role.

## P573 Active Gaps
- **P573-G001–G008 OPEN:** Real pnpm lockfile, frozen install, Prisma validation/generation, clean/upgraded PostgreSQL migrations, migration-order review, failure recovery and CI migration smoke tests remain blocked by unavailable toolchain/database runtime.

## P574 Active Gaps
- **P574-G001 OPEN:** Authentic pnpm 9.15.0 lockfile and frozen install blocked by registry DNS failure.
- **P574-G002–G004 OPEN:** Prisma generation, semantic typechecks and production builds not run because dependencies/toolchain are absent.
- **P574-G005–G007 OPEN:** PostgreSQL lifecycle, API/database integration and DB-backed cross-module/authorization tests not run.
- **P574-G008 OPEN:** Full static suite post-fix run incomplete; P501/P502 focused verifiers pass, C2-01 lockfile gate remains.


## P575 Active Gaps
- **P575-G001 OPEN:** PostgreSQL catalog acceptance for forced RLS and tenant-scoped USING/WITH CHECK policies across all tenant-owned tables.
- **P575-G002 OPEN:** Restricted-role cross-organization/school/student/guardian/campus and resource-family negative API tests.
- **P575-G003 OPEN:** Live pooled-connection, transaction rollback and worker-context isolation; source helpers now reset all selectors, but runtime proof is pending.
- **P575-G004 OPEN:** Complete physical-table ownership inventory and review of tenant models without direct static RLS evidence, including dynamic migration SQL.
- **P575-G005 OPEN:** Route/resource authorization audit across apps, exports, websockets, object storage and workers.
- **P575-G006 OPEN:** Production application role non-owner/non-superuser/NOBYPASSRLS verification.
- **P575-G007 OPEN:** Complete P573/P574 lockfile, Prisma, build/typecheck, PostgreSQL migration and API integration prerequisites.
- **P575-G008 OPEN:** Cross-tenant concurrency, worker/resource E2E, browser/mobile regression and independent security review.
