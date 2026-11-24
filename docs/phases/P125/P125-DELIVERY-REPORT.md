# P125 Delivery Report

P125 adds granular financial permissions and a least-privilege finance role. Payment-detail projections are omitted from the School Admin fee list unless `fees.payments.read` is granted. Manual payment recording now requires `fees.payments.record`; fee-charge creation/publication remains under `fees.manage`.

Parent fee statements continue to use their independent consent-bound authorization path. No refund, gateway, settlement or accounting-ledger capability is claimed.

See `docs/security/P125-FINANCIAL-AUTHORIZATION.md` for endpoint and provisioning details. Static source verifier passed 18/18 checks; the P124 verifier passed 19/19 regression checks; TypeScript syntax transpilation reported zero diagnostics in the two changed TypeScript files. Runtime/database validation remains pending.
