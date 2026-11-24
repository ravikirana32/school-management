# P61 Test Plan

1. Run canonical webhook contract Vitest suite.
2. Validate Prisma schema/generate client and apply migration to a clean and P60 snapshot database.
3. Verify existing rows receive v1 and new events persist v1.
4. Verify omitted contractVersion defaults to v1; v2/unknown values reject before persistence.
5. Verify uniqueness on provider/providerEventId remains idempotent across contract versions.
6. Do not introduce v2 until schema evolution and provider adapter compatibility are explicitly designed.
