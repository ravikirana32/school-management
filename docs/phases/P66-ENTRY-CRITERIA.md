# P66 entry criteria

1. Continue from P65 cumulative baseline.
2. Review suppression alias migration/backfill, current/previous key retirement and worker/webhook behavior for consistency.
3. Add operational readiness/diagnostics for alias-version counts without exposing hashes or secrets.
4. Define safe key retirement checklist based on active suppression aliases and outbox rows that may still generate provider callbacks.
5. Carry unresolved P00–P65 gaps forward; no runtime claims without Prisma/PostgreSQL evidence.
