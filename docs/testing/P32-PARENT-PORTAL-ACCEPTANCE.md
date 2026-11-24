# P32 Parent Portal Acceptance Plan

## Automated source tests added
- Query validation for page size, empty cursor and reversed date range.
- Inclusive `to` date implemented as exclusive next-day UTC bound.
- Stable page slicing and `nextCursor` behavior.

## PostgreSQL/API tests required
1. Parent with one linked student can read first and subsequent pages.
2. Parent cannot use another student's cursor, including a sibling not linked to the current guardian.
3. Parent cannot use cursor from another organization/school.
4. Cursor from a draft/open attendance session is rejected.
5. Cursor outside selected date range is rejected.
6. Same `markedAt` timestamp rows remain deterministic due to ID tie-breaker.
7. `to` date includes records through 23:59:59.999 UTC.
8. Consent withdrawal between page requests denies the next page.
9. Guardian link disabled between page requests denies the next page.
10. Invalid limit, malformed date and reversed range return HTTP 400.
11. Parent with school membership but no PARENT role/consent cannot read attendance.
12. Verify response omits remarks and other private fields.

## External runtime acceptance not performed
- PostgreSQL migration/RLS, Prisma validation, Redis, email provider, malware scanner, S3, Expo build/device E2E and browser E2E require configured infrastructure and dependencies.
