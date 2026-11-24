# P338 Delivery Report

## Scope
Applicant offer review and accept/decline response API, plus expired-offer persistence and reservation cleanup.

## Implemented
- `GET /api/v1/public/:organizationId/:schoolId/admissions/status/:trackingToken/offers`: returns the token owner's school-scoped offer list using selected safe fields.
- `POST /api/v1/public/:organizationId/:schoolId/admissions/status/:trackingToken/offers/:offerId/respond`: accepts `ACCEPTED` or `DECLINED`; rate-limited; tracking-token resolved; offer must belong to the application and tenant; transaction lock and state recheck prevent conflicting responses.
- Accept moves application to `ACCEPTED`; decline moves it to `WITHDRAWN` and releases the active reservation.
- Offer expiration returns 409 and persists `EXPIRED`; active reservation is released and capacity is reconciled.
- Stage history and applicant notification are created for a successful response.

## Verification
Static route-contract checks were run against the source. No TypeScript compiler/runtime, database, UI/browser, mobile or E2E tests were executed in this environment.

## Remaining
Applicant portal UI, staff reporting refinements, and Cycle 2 runtime/regression acceptance remain open.
