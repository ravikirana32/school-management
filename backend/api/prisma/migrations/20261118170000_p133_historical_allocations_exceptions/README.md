# P133 migration

Creates tenant-scoped historical allocation, exception and exception-event tables. Enables and forces RLS, adds composite tenant-safe row references, amount/type/state checks, an allocation validation trigger, append-only allocation/event triggers and a one-way exception resolution trigger. Apply after P132. Prisma client generation and PostgreSQL execution are pending and must be verified in a local database before production use.
