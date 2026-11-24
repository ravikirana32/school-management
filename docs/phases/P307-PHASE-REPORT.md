# P307 Phase Report — Rollover Capacity Validation & Conflict Prevention

**Status:** Delivered; static verification passed.

## Changes
- `apps/school-admin/src/rollover-capacity.ts`: advisory aggregate capacity check.
- `EnrollmentRolloverWorkspace.tsx`: applies capacity preflight before preview rows are displayed.
- `OperationalModulesWorkspace.tsx`: passes admission-capacity snapshots into rollover workspace.
- `scripts/verify-p307-rollover-capacity.mjs`: focused verifier.
- `package.json`: `verify:p307` script.

## Behavior
Configured available seats are capacity minus enrolled and reserved seats. Rollover CSV candidate rows are aggregated by target year/grade/section; oversubscribed eligible rows are blocked. Existing invalid rows are excluded from seat demand. Section matching is trimmed and case-insensitive. Unconfigured sections are left unchanged and are not presumed to have zero capacity.

## Verification
P307 7/7 PASS; P306 12/12; P305 9/9; P304 15/15; P303 13/13; P73 10/10; P79 9/9; P302 9/9. ZIP integrity PASS. Full dependency-backed build/typecheck, API/browser/mobile acceptance not run.

## Open gaps
P307-G001 server-side atomic seat reservation/revalidation remains OPEN. P307-G002 full-directory lookup remains OPEN. P307-VAL01 runtime/build acceptance remains OPEN.
