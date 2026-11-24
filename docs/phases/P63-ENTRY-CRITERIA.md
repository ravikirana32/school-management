# P63 entry criteria

1. Continue from P62 cumulative baseline.
2. Review notification event ingestion and suppression integration: bounce/complaint events should create school-local suppression where policy requires it, without provider-global assumptions.
3. Add an auditable idempotent event-to-suppression policy for canonical BOUNCED/COMPLAINED events, guarded by tenant and provider configuration.
4. Avoid creating suppression from unverified or duplicate conflicting events.
5. Carry unresolved P00–P62 gaps forward; provider-native behavior remains blocked until provider selection.
