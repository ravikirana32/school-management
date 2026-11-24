# Security, Privacy and Tenant Isolation Baseline

## Security principles
Least privilege, deny by default, defense in depth, data minimization, secure defaults, auditable administration and secure lifecycle management.

## Tenant isolation
- Resolve organization and school scope from authenticated membership.
- Validate all resource relationships inside the same authorized scope.
- Apply composite tenant foreign keys where feasible.
- Apply PostgreSQL RLS as an additional control.
- Set tenant context inside a transaction; never leak context through pooled connections.
- Run automated negative tests across organizations and schools.
- Ensure background jobs and exports carry validated tenant scope.
- Ensure cache keys include tenant scope.
- Ensure search indexes and object storage paths cannot leak tenant data.

## Identity and sessions
Argon2id password hashes, short-lived access tokens, rotating refresh tokens, MFA for privileged users, secure recovery, device/session revocation, rate limiting and suspicious-login monitoring.

## Files
Private by default. Every download requires authorization. Use short-lived signed URLs, content-type/size validation, malware scanning where appropriate and safe file names. Do not expose storage bucket paths.

## Financial security
Payment provider signatures, webhook deduplication, idempotency, immutable transaction history, reconciliation and no storage of raw card data.

## Child and sensitive data
Restrict medical, guardian, emergency and disciplinary records to explicit roles and purposes. Log sensitive access. Define consent, retention, export, correction and deletion workflows. Avoid sensitive information in logs, analytics and push notification previews.

## Support access
No silent super-admin impersonation. Support access must be approved, scoped, time-bound, visible where appropriate and audited.

## Compliance planning
Assess India's DPDP requirements and applicable rules. Assess GDPR/UK GDPR, COPPA and local requirements for each intended international market. Legal review is required before compliance claims or launch in a jurisdiction.
