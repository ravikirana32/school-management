# P415 Test Report

## Source verifier
Command: `node scripts/verify-p415-curriculum-outcome-csv.mjs`
Result: **23/23 PASS**. Checks API routes, school/version scope, permission and entitlement gates, size/row limits, grade/subject validation, duplicate detection, schema validation, transactional revalidation, draft-only import, UI preview/commit flow, issue reporting, and download controls.

## CSV runtime smoke
Command: `node --experimental-strip-types scripts/verify-p415-csv-runtime.mjs`
Result: **5/5 PASS**. CSV round-trip for quoted commas and embedded newline; CRLF parsing; malformed quoted field rejection.

## Regression verifiers
- P411: 15/15 PASS
- P412: 17/17 PASS
- P413: 22/22 PASS
- P414: 19/19 PASS

## Syntax scan
`node scripts/check-source-syntax.m` — **258 files scanned, 0 parse errors**.

## Not run
- Workspace/API build and typecheck
- Prisma validate/generate and migration application
- Live API/DB/RLS integration
- Browser/mobile interaction and E2E acceptance

Dependencies/runtime/database unavailable; no runtime results are claimed.
