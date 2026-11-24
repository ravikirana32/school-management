# P214 — Admissions Workspace Application Search & Status Filtering

## Goal
Improve staff handling of the existing admissions application list without changing API contracts or starting build/runtime validation (deferred per user).

## Implemented
- Added a search field for application number, student first/last name, guardian name, phone, and email.
- Added a status filter with `All statuses` and dynamically discovered statuses present in the current API response.
- Added a clear-filters action.
- Added filtered/total counts in the applications section heading.
- Added an empty-result state for filters that match no applications.
- Filtering is client-side over the already-loaded tenant/school-scoped application collection; no new API endpoint or API wiring is required.
- Added responsive filter-bar styling.

## API integration review
Existing list request (`GET /applications`) already loads the tenant/school-scoped application collection. P214 reuses that response; no new API endpoint is introduced. Search is limited to fields already present in the frontend application model.

## Source checks performed
- Confirmed state variables, derived filter, dynamic status options, and filtered rendering are present in the School Admin Admissions Workspace source.
- Confirmed clear-filters resets both controls.
- Confirmed empty-state and shown/total count rendering are present.
- Confirmed stylesheet contains filter-bar layout rules.
- ZIP archive integrity checked after packaging.

## Deferred by instruction
Build, typecheck, DB runtime/migrations, mobile build, local deployment, tests, and browser/API E2E are deferred to the final validation phase.

## Remaining Admissions gaps
Reviewer assignment/workload, review decision model and comment history, richer workflow queue, public account-based multi-application dashboard, document re-upload/version lifecycle, guardian linking/merge, offer/reservation lifecycle, fee/payment/receipt/reconciliation, notifications delivery/recovery, Staff Mobile parity, and security/operational acceptance remain open.

## Phase result
P214 delivers a source-level admissions workspace search/filter enhancement. It does not close Admissions as a whole and does not claim runtime validation.
