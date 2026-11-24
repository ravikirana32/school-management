# P276 Status — Student Fee Assignment

Implemented source coverage:
- Preview endpoint validates school-scoped academic year and grade catalog entries.
- Preview estimates enrolled-student count, eligible mandatory components, charge count, duplicate charges and estimated per-student total.
- Assignment endpoint accepts academic year, grade, optional section and optional due date.
- Requires a published structure and school-scoped catalog IDs.
- Assigns only ENROLLED students; optional fee components are skipped by default.
- Creates each component as a DRAFT StudentFeeCharge compatible with existing fee approval/publishing and collection workflows.
- Stable per-component charge codes and unique existing-charge detection make repeated assignments idempotent; a tenant-grade assignment lock serializes overlapping section/all-section attempts.
- Audits assignment details and skipped duplicates.
- School Admin UI includes preview and confirmation flow.
- Static verifier plus TypeScript syntax transpilation for API and affected UI files.

Deferred:
- UI catalog selectors currently accept academic-year and grade IDs; replace with catalog-driven dropdowns.
- Complete runtime/database/API/browser/mobile E2E validation not run because dependencies are not installed in this extracted environment.
- Optional component opt-in selection, student-level overrides, discounts, installments and version/clone workflow are future gaps.

Baseline: P275 cumulative archive.
