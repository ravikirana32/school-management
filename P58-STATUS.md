# P58 Status — Suppression release concurrency guard

**Status:** Source implementation complete; PostgreSQL concurrency acceptance pending. **Production approval: NOT GRANTED.**

- Release endpoint now conditionally updates only a row still ACTIVE and matching the caller's organization/school.
- Audit RELEASED event is inserted only when `updateMany.count === 1`, inside the same tenant transaction.
- Concurrent losing release attempts return not found and do not overwrite release actor/reason or create duplicate audit rows.
- Create path continues to rely on the partial unique active index, catches Prisma P2002 and re-reads the active row.
- Static verifier 7/7 PASS; TypeScript syntax 1 file, 0 diagnostics; PostgreSQL transaction/race/RLS tests NOT RUN.
