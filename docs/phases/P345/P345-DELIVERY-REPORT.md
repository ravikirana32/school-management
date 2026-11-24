# P345 Delivery Report — Admissions Notification Completion

## Feature
Admissions notification completion (staff in-app event coverage).

## Existing behavior retained
- Applicant inbox notifications and status notifications were already present.
- Staff submission notification was already implemented in the public admissions routes.
- Existing notification batch/outbox, recipient authorization pattern, and school inbox endpoints are reused.

## Changes
- Added `backend/api/src/modules/admissions/admission-staff-notifications.ts` to create idempotent staff in-app event notifications within the caller's transaction.
- Added staff notification for reviewer assignment updates.
- Added staff notification for application status transitions.
- Recipients must have `admissions.manage` permission and active membership/user state in the same organization/school.
- Outbox entries include application metadata and are tenant-scoped; duplicate rows are skipped.

## Verification evidence
- `node scripts/verify-p345-admissions-notification-completion.mjs`: 12/12 PASS.
- ZIP integrity and cumulative baseline preservation verified separately.
- No runtime/build/provider/E2E verification claimed.

## Open gaps
- Live email/push provider verification and full provider/device lifecycle remain Cycle 2.
- Additional event types, such as enquiry conversion and offer/payment/refund staff notifications, need an event coverage review.
- Database-backed transaction and concurrent duplicate-delivery testing remain open.
