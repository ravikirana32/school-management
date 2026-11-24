# P307 Delivery Report — Rollover Capacity Validation & Conflict Prevention

## Delivered
- Added `rollover-capacity.ts` advisory preflight utility for academic-year rollover rows.
- Uses target academic year + grade + normalized section as the capacity key.
- Available seats = capacity minus enrolled and reserved seats.
- Aggregates valid candidate rows per target section; blocks all eligible rows in a section when requested seats exceed available seats.
- Invalid rows do not consume advisory capacity.
- Unconfigured sections remain unchanged (capacity data absent is not treated as zero seats).
- Integrated capacity snapshots into `EnrollmentRolloverWorkspace` and passed loaded admission-capacity records from the Students workspace.
- Added verifier and package script `verify:p307`.

## Verification
- P307: 7/7 PASS.
- P306 execution: 12/12 PASS.
- P305 preview: 9/9 PASS.
- P304 validation: 15/15 PASS.
- P303 bulk enrollment: 13/13 PASS.
- P73 student lifecycle: 10/10 PASS.
- P79 auth/me contract: 9/9 PASS.
- P302 notification queue: 9/9 PASS.
- Total across selected verifiers: 84 checks PASS.
- ZIP integrity: PASS.
- Dependency-backed typecheck/build and authenticated API/browser/mobile runtime acceptance were NOT run.

## Open gaps
- P307-G001: Capacity data may be incomplete/unconfigured; API-side atomic seat reservation/revalidation is not proven. Advisory checks cannot prevent concurrent rollover race conditions.
- P307-G002: Full-directory roster lookup and large-scale preview/execution.
- P307-VAL01: Typecheck/build and authenticated API/browser/mobile runtime acceptance.

No backend/runtime gap is marked resolved based on static checks alone.
