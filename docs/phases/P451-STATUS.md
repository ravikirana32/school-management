# P451 — Notification Channels, Preferences & Delivery Lifecycle

## Status
Implemented at source level. Channel preference configuration is persisted in `PlatformControlSetting` and audited. The worker reads recipient preferences and suppresses WEBHOOK outbox fan-out when WEBHOOK is not enabled for the recipient. Channel availability is explicitly represented: WEBHOOK is the only executable delivery adapter in P451; IN_APP and EMAIL are preference/readiness options only.

## Implemented scope
- GET/PUT API for platform alert channel preferences.
- Defaults and per-platform-admin channel selections for IN_APP, EMAIL, WEBHOOK.
- Validation of channels, duplicate recipients, maximum 500 preferences, and active platform-admin recipients.
- Audit log entry on preference updates.
- Worker consumes preferences during recipient fan-out and applies WEBHOOK opt-in.
- Outbox payload includes preferred channel metadata.
- Super Admin view/editor and refresh action for channel preference JSON.
- No schema migration; uses existing platform settings storage.

## Known limitations / open gaps
- IN_APP and EMAIL are not yet real delivery adapters and do not deliver messages.
- WEBHOOK delivery still uses the existing global provider URL/token and has no provider-specific channel configuration.
- Recipients can explicitly opt out of WEBHOOK by setting an empty channel list. Preferences do not cancel already queued events. Default channel configuration must retain WEBHOOK while other adapters are inactive.
- Live DB/API/auth, multi-worker concurrency, provider, full build/typecheck, browser/mobile E2E remain unverified.
- P445/P446/P447 historical verifiers are stale or path-broken; their legacy results are not treated as current passing regression tests.

## Source verification
- P451 focused verifier: 18/18 PASS.
- P450 recipient fan-out verifier updated for opt-in channel filtering: 14/14 PASS.
- P449 policy execution verifier: 14/14 PASS.
- P448 policy verifier: 14/14 PASS.
- P447 legacy verifier: 4/12 PASS (outdated assertions; stale verifier).
- P446 and P445 legacy verifiers: fail to locate source due to path resolution defects; not counted.
- TypeScript transpile syntax diagnostics: platform routes 0, worker 0, Super Admin TSX 0.

## Release
P451 cumulative release includes P450 baseline and P451 changes. Archive preservation, CRC, duplicate entries, and SHA-256 are documented in the ZIP verification report.
