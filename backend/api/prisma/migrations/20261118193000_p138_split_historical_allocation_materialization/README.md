# P138 migration

Allows a single external settlement reference to be represented by multiple operational refund rows when a historical refund is split across allocation targets. Each allocation retains its own unique `idempotencyKey` and immutable allocation-link row. Apply through the normal Prisma migration deployment process. PostgreSQL runtime verification remains pending.
