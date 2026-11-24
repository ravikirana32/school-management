# P288 — Parent Notification Preference Accessibility & Channel Availability

## Scope
Continue P287 parent-mobile notification preference UI, addressing misleading controls for channels without delivery support and improving assistive-technology descriptions.

## Implemented
- Added switch accessibility roles, category/channel-specific labels, hints, and checked/disabled state metadata.
- Push preferences are visibly non-actionable in the Parent Mobile UI: switches are disabled, forced off, and described as unavailable because a push delivery provider/worker is not implemented in this baseline.
- Kept IN_APP and EMAIL preference controls and the existing API persistence flow.
- Clarified email channel availability depends on school provider configuration; configuration health is not exposed to this preference screen yet.
- Preserved offline write guard and existing category list.

## Verification
- P288 static source verifier: **10/10 PASS**.
- Full mobile typecheck/build, API runtime, device/browser acceptance: **not run** (dependency-equipped environment/device unavailable in this phase).

## Gaps
- P288-G001: Push provider/worker, registration lifecycle, device-token storage, provider receipts, retries and push delivery runtime — OPEN.
- P288-G002: Expose provider readiness/configuration to parent preference UI and test email deliverability/opt-out end-to-end — OPEN.
- P288-VAL01: Full Parent Mobile typecheck/build and runtime/device integration validation — OPEN.

## Outcome
P287 notification preference controls are clearer and accessible; unsupported Push controls no longer imply push delivery is active. No runtime gap is closed solely on static verification.
