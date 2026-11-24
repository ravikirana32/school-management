# P58 Test Plan

1. Run two concurrent release requests for one active suppression with different actors/reasons; exactly one succeeds and exactly one RELEASED audit row exists.
2. Race release against create for the same email under current and previous HMAC versions; assert no duplicate ACTIVE rows.
3. Force audit insert failure and verify transaction rollback restores ACTIVE state.
4. Verify cross-school IDs cannot release another school's suppression.
5. Run with non-owner non-BYPASSRLS database role and confirm policies are enforced.
6. Retain SQL transaction traces and test output with all email/hash/secret values redacted.
