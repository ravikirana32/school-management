# P117 Status — MFA Policy Enforcement Across Web and Mobile

**Status:** Source implementation complete; runtime acceptance pending.

## Implemented
- `/auth/mfa/status` evaluates platform-admin requirement and configurable role keys (`MFA_REQUIRED_ROLE_KEYS`).
- Policy response includes reasons, enrollment requirement, challenge requirement, current-session freshness and five-minute freshness window.
- School Admin loads policy after identity bootstrap and provides authenticator enrollment and verification controls.
- Teacher Mobile and Parent Mobile load policy after sign-in and session refresh/restore; configured accounts are gated behind enrollment or challenge UI.
- Mobile flows support TOTP and one-time recovery-code challenge using the existing verification endpoint.

## Limitations
- Policy is client-gated for configured roles; universal server-side enforcement across all protected API routes is not implemented. Platform-admin privileged-route middleware remains the server-side gate for platform administration.
- Additional role keys require deployment configuration. No role defaults beyond platform administrator are assumed.
- Runtime and device verification are pending.

## Gap register count note
The register contains 751 unique `Pxx-Gyyy` identifiers. Of these, 554 have explicit status rows in the structured status tables; 197 older identifiers occur in legacy checklist/summary sections without an explicit normalized status. They remain preserved and are not silently assigned a status or deleted.
