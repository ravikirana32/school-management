# P61 entry criteria

1. Continue from P60 cumulative baseline.
2. Review provider-neutral webhook ingestion for schema evolution, canonical event versioning and forward compatibility.
3. Add explicit event contract versioning or compatibility policy without accepting unknown unsafe fields.
4. Preserve exact signature verification, bounded payload size, idempotency and tenant scope derivation.
5. Carry all unresolved P00–P60 gaps forward; provider-native adapter remains blocked pending provider selection.
