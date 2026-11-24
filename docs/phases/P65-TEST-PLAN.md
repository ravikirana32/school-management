# P65 Test Plan

1. Run Prisma validate/generate and apply P65 migration to clean and P64 snapshot databases.
2. Verify all historical suppression rows have one alias with matching version/hash/status/releasedAt.
3. Create same email while current=v2/previous=v1; assert one suppression and two active aliases.
4. Release suppression; assert all aliases become RELEASED atomically.
5. Recreate after release; assert new active suppression and aliases.
6. Worker tests: active v1 alias blocks a v2-recipient message and vice versa; released aliases do not block.
7. Webhook tests: bounce/complaint finds existing alias, avoids duplicate suppression, or inserts row+alias+audit atomically.
8. Race create/release/webhook across two API processes using non-owner RLS role; assert no duplicate active aliases and coherent audit.
