# P46 security

Only keyed HMAC hashes are stored; no cleartext email is persisted. Hash secret must be stable and 32+ chars; rotation requires rehash. APIs are school-membership/permission gated. Forced RLS and composite school/org FKs scope records. Worker reads suppressions only under notification-worker GUC policy. Audit history captures actor/action/reason. No endpoint reveals hash or email. Tenant-local semantics intentionally avoid cross-tenant leakage.
