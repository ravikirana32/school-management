# P567 Delivery Report — Hostel Visitors, Authorized Access & Gate-pass

## Outcome
P567 source implementation is delivered on top of the P566 cumulative baseline. The existing P358 hostel foundation and P566 hostel attendance/safety workflows are preserved.

## Implemented
- Visitor registration linked to an active hostel resident allocation; host building is derived from the resident's bed/room and cannot be supplied by the caller.
- Privacy-minimized identity capture: identity type and last four characters only; no full government identity number or document image is stored.
- Visitor purpose, contact detail, requested timestamp and creator identity.
- Duplicate active visitor authorization guard for the same resident and visitor.
- Auditable APPROVED, DENIED and BLOCKED visitor decisions.
- Approval creates a unique, time-bounded visitor gate-pass with an unpredictable pass code.
- Gate check-in validates approval and current pass validity; gate check-out closes the visit and consumes the pass.
- Visitor and pass expiry state synchronization.
- Resident outpass request references an existing APPROVED HostelLeaveRequest. P567 does not implement P568 leave approval or guardian communication.
- Outpass window must fit within the approved leave window and cannot already be expired.
- Outpass approval revalidates the active resident allocation and linked approved leave request.
- Duplicate active outpass prevention; auditable approval/denial, departure and return events.
- Tenant/school-scoped queries and `hostel.manage` mutation authorization.
- School Admin Hostel Workspace visitor registration, approve/deny/block, gate check-in/out, outpass request, approval, departure and return workflows.

## API
Base path: `/:organizationId/:schoolId/hostel`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/visitors` | List visitor requests and linked pass |
| POST | `/visitors` | Register visitor for a resident |
| POST | `/visitors/:visitId/decision` | Approve, deny or block; approval requires a validity window |
| POST | `/visitors/:visitId/check-in` | Gate check-in within valid window |
| POST | `/visitors/:visitId/check-out` | Gate check-out |
| GET | `/gate-passes` | List resident and visitor passes |
| POST | `/gate-passes/outpass` | Request outpass linked to an existing approved leave |
| POST | `/gate-passes/:passId/decision` | Approve or deny resident outpass |
| POST | `/gate-passes/:passId/depart` | Record resident departure |
| POST | `/gate-passes/:passId/return` | Record resident return |

Mutations require active school membership plus `hostel.manage` or School Admin access. Reads require active school membership plus `hostel.read` or School Admin access. Database queries include organization and school scope.

## Data and migration
- `HostelVisitorVisit` records visitor identity-minimized details, resident allocation, host building, decision, gate staff and check-in/out lifecycle.
- `HostelGatePass` records visitor/resident pass type, unique pass code, linked visitor or approved leave request, validity window, approval and departure/return lifecycle.
- Migration: `20261124093000_p567_hostel_visitors_gate_pass`.

## Verification
- P567 focused source verifier: **57/57 PASS**.
- P566 hostel attendance regression: **44/44 PASS**.
- P358 hostel foundation regression: **43/43 PASS**.
- API route and School Admin TSX syntax transpilation: **0 diagnostics** using TypeScript `transpileModule`.

## Not run / open
- Prisma format/validate/generate and generated-client semantic compatibility.
- PostgreSQL migration on clean/upgraded databases, rollback/recovery and schema drift.
- Runtime API/database integration and production-role RLS/cross-school denial tests.
- Dependency-backed API/Admin builds and full semantic typechecks.
- Gate-staff-specific permission granularity (mutations currently use `hostel.manage`).
- Browser/device E2E, accessibility, concurrent duplicate-pass race/load tests and independent security review.
- Guardian notifications and native parent/warden mobile views; continue under P568+.
