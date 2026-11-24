# P64 Test Plan

1. Run policy and webhook route Vitest tests.
2. Insert a suppression, release it at time T2, then process provider event at T1<T2; assert no new active suppression.
3. Process provider event at T3>T2; assert suppression is recreated with a new audit event.
4. Race manual release against provider event in PostgreSQL; assert transaction ordering is deterministic and no duplicate active row exists.
5. Verify worker does not send when active suppression exists even when notification preference is enabled.
6. Test all cases across current and previous HMAC versions.
