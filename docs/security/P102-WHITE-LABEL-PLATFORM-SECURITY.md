# P102 — White-label and Platform Security

- Custom domain registration rejects IPs, localhost, malformed labels and duplicate hostnames.
- DNS ownership challenge is generated from 256 bits of random data; only its SHA-256 hash is stored. The raw challenge is returned only on creation/renewal; challenges expire after 24 hours.
- Domain status progression is PENDING_VERIFICATION → VERIFIED → ACTIVE; disable is explicit. Re-enable requires retained verified ownership evidence and an active organization.
- Active custom-domain requests are bound to one organization; mismatched organization URL segments return 404.
- Custom-domain and tenant-branding tables enforce tenant RLS, with platform-admin context for control-plane operations.
- Public tenant-context response excludes internal actor and audit metadata.
- Platform secrets use AES-256-GCM with nonce and authentication tag; plaintext is never returned. Database table is protected by forced RLS and platform-admin-only policy.
- Support-access approval requires a distinct requester/approver and a fresh MFA timestamp. Because no MFA completion flow currently sets the timestamp, approval remains blocked. No impersonation bypass is provided.
- DNS/TLS/edge configuration, external secret manager integration, multi-key rotation and full support-session enforcement remain open.
