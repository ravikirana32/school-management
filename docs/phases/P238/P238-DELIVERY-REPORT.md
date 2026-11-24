# P238 Delivery Report — Enrollment History UI & Status Controls

## Scope
Student Lifecycle: connect the existing enrollment detail/status API to the School Admin Students workspace.

## Source changes
- `apps/school-admin/src/OperationalModulesWorkspace.tsx`
  - Added enrollment-history state and a student selector separate from the existing student profile selector.
  - Added a load-history action using the scoped student detail API.
  - Displays enrollment rows including academic year, grade, section, roll number, status, enrolled date, and ended date.
  - Added an enrollment status change form connected to the P237 PATCH endpoint.
  - Refreshes enrollment history after status change and shows error/success feedback.

## Checklist
- [x] School Admin can load a student's enrollment history from the existing detail endpoint.
- [x] History table shows enrollment identity/allocation and lifecycle dates/status.
- [x] School Admin can request status transition using the P237 guarded endpoint.
- [x] UI refreshes history after a successful change.
- [x] API error text is surfaced to the user.
- [ ] Status option filtering based on current enrollment state, approval/allocation workflow, and new academic-year transfer/promotion remain future work.
- [ ] Build/typecheck/browser/API/security/E2E validation deferred by project policy.

## Verification
Static source assertions only. No build, typecheck, runtime, migration, or formal tests executed.

## Archive
Cumulative P238 ZIP includes this report and all prior phase files.
