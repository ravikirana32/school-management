# P198 — Admissions Web & Mobile Workflow Gap Closure

## Scope
Close practical admissions workflow parity gaps in the School Admin web workspace and Staff Mobile application, especially seat reservation visibility and actions.

## Implemented
- Staff Mobile admissions data loading now fetches applications, offers, and seat reservations together.
- Added a mobile seat-reservation list with application/offer references, grade/section, status, and expiry timestamp.
- Added manual reservation release with a required reason (minimum three characters) and disabled action until valid reason is supplied.
- Added manual expired-reservation sweep action and result feedback.
- Existing web Admissions Workspace retains applications, document review, eligibility rule, capacity, offers, fee handoff, reservation listing/release, and expiry-sweep surfaces.

## Remaining / deferred
- Mobile eligibility-rule editor and configuration parity.
- Mobile enquiry intake and guardian collision-review UI.
- Parent-facing payment and receipt workflow integration.
- Notifications inbox and preference-consent UI.
- Build/typecheck, API tests, mobile/web E2E, and runtime acceptance are deferred per project plan.
