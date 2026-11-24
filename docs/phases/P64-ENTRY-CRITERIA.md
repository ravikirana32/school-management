# P64 entry criteria

1. Continue from P63 cumulative baseline.
2. Review notification preferences/consent and suppression interaction: a bounce/complaint suppression must remain a hard no-send guard even if user preference is enabled.
3. Add tests for suppression precedence over notification preferences, reactivation/release behavior and outbox cancellation.
4. Define policy for late provider events after manual release and historical outbox rows without recipient hashes.
5. Carry unresolved P00–P63 gaps forward; provider-native adapter remains blocked until provider selection.
