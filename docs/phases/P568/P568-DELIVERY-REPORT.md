# P568 Delivery Report — Hostel Leave, Guardian Communication & Return Check-in

## Outcome
P568 source implementation is delivered on the P567 cumulative baseline. Existing P358 hostel facilities/allocation, P566 attendance/curfew/night checks and P567 visitor/gate-pass workflows are retained.

## Implemented

### Resident leave lifecycle
- Parent/guardian can submit a leave request for a linked student with an active hostel allocation.
- Required departure/expected-return timestamps and reason; optional destination and contact number.
- Parent can edit pending requests and cancel pending or approved requests before departure.
- Warden/School Admin can approve or deny with an auditable decision note and actor.
- Departure must be in the future; return must be later than departure.
- Overlapping pending/approved/late-return requests are rejected.
- Advisory transaction locks serialize leave changes by student.
- Warden approval automatically issues one P567 `RESIDENT_OUT` gate-pass, linked to the leave request and bounded by the approved departure/return window.
- Legacy P567 manual outpass creation now uses a leave-specific advisory lock and rejects a second pass for the same leave request.

### Guardian consent and notifications
- `HostelGuardianConsent` stores explicit per-student leave-update consent, in-app/email channel preferences, consent version, grant/revoke timestamps and actor.
- Parent can grant/revoke consent in Parent Mobile.
- Notification fanout requires an active guardian link with `canReceiveCommunications`, accepted parent invitation/consent, verified guardian email identity and explicit hostel leave consent.
- `NotificationPreference` opt-outs are honored independently for `HOSTEL_LEAVE` / `IN_APP` and `HOSTEL_LEAVE` / `EMAIL`.
- In-app events create `ParentNotification` records.
- Email events enter the existing `NotificationOutbox` and use the existing HTTPS notification provider worker. The worker's HTTP acceptance is recorded as `ACCEPTED_BY_PROVIDER`; final delivered/bounced/complaint outcomes are set only by a verified provider webhook.
- The delivery worker rechecks guardian link, accepted invitation, explicit hostel consent, email verification, school suppression and channel preference at send time.
- Retry, cancellation, dead-letter and verified provider webhook outcomes update `HostelLeaveNotificationEvent`; provider HTTP acceptance is kept distinct from final delivery.
- No SMS or push provider delivery is claimed or enabled.

### Late return and re-entry
- `hostel-leave-return-monitor-worker` runs on a configurable interval (default 60 seconds).
- Only requests past expected return with a still-`CHECKED_OUT` resident pass become `LATE_RETURN`.
- The transition is conditional/idempotent and audited; consented guardians are notified.
- Warden return check-in requires a checked-out resident pass, closes it as `RETURNED`, and marks the leave `RETURNED` or `RETURNED_LATE`.
- Production Docker Compose includes `worker-hostel-leave-monitor`.

### Interfaces
- Parent Mobile: leave history, create/edit/cancel, explicit consent and channel preferences, gate-pass status and actual return.
- School Admin: leave register, approve/deny, auto-issued pass visibility, return check-in and notification delivery log.

## API endpoints

### Parent portal
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/parents/:organizationId/:schoolId/portal/children/:studentId/hostel-leaves` | List linked student's leave history |
| POST | same path | Create leave request |
| PATCH | `.../hostel-leaves/:leaveRequestId` | Edit pending request |
| POST | `.../hostel-leaves/:leaveRequestId/cancel` | Cancel before departure |
| GET | `.../hostel-consent` | Read guardian consent |
| PUT | `.../hostel-consent` | Grant/revoke consent and select in-app/email channels |

### Hostel staff
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/:organizationId/:schoolId/hostel/leave-requests` | List leave requests, passes and notification events |
| POST | `.../leave-requests/:leaveRequestId/decision` | Approve/deny and automatically issue pass |
| POST | `.../leave-requests/:leaveRequestId/return` | Verify resident return and close pass |
| GET | `.../leave-requests/:leaveRequestId/notifications` | View notification event and provider delivery status |

### Worker
- `worker:hostel-leave-monitor` → `src/workers/hostel-leave-return-monitor-worker.ts`.
- Existing `worker:notification-delivery` now rechecks P568 hostel leave consent and reconciles event status.

## Data and migration
- Extended `HostelLeaveRequest`.
- Added `HostelGuardianConsent`.
- Added `HostelLeaveNotificationEvent`.
- Added optional `HostelGatePass.leaveRequest` relation while retaining historical pass records.
- Added `parent.hostel.manage` permission and Parent role assignment.
- Migration: `20261124100000_p568_hostel_leave_guardian_notifications`.

## Verification
- P568 focused source verifier: **72/72 PASS**.
- P567 regression: **57/57 PASS**.
- P566 regression: **44/44 PASS**.
- P358 regression: **43/43 PASS**.
- Combined focused assertions: **216/216 PASS**.
- API routes, notification helper/worker, monitor worker, School Admin and Parent Mobile files: **9/9 TypeScript transpilation checks with 0 diagnostics**.

## Not run / open
- Prisma format/validate/generate and generated-client semantic compatibility.
- Clean/upgraded PostgreSQL migration, foreign-key/index drift, rollback/recovery and runtime integration.
- Dependency-backed API/Admin/Parent Mobile builds and semantic typechecks.
- Production-role RLS and cross-school/organization negative tests.
- Actual email provider send, retry, bounce/complaint webhook E2E and notification worker operations.
- Browser/device E2E, accessibility, offline behavior, concurrent leave/pass operations, late-return worker race/load tests.
- SMS/push provider delivery, dedicated warden mobile app and independent safeguarding/privacy review.
