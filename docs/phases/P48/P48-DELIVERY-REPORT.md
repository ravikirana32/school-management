# P48 Delivery Report

## Delivered
1. `hashVersion` persisted on email suppression records, defaulting legacy records to `v1`.
2. `getSuppressionHashKeys` validates and orders current/previous HMAC keys, with legacy environment compatibility.
3. School-admin create API checks both configured key versions to prevent duplicate active suppression records across a rollover and writes using the current version.
4. Notification delivery worker checks all configured versions immediately before provider send, preserving fail-closed startup behavior when no current key exists.
5. Additive Prisma migration, environment example, static verifier, phase documentation and cumulative root/docs gap register updates.

## Rotation safety model
This is a staged key-overlap strategy, not a cryptographic re-hash of existing records. Since email addresses are not retained, historical HMAC values cannot be re-derived with a new key. Existing v1 rows remain protected by the previous v1 key; new rows use v2. Retire v1 only after evidence proves no active v1 suppression remains and retention/legal policy permits it.

## Deferred
- RTL shaping/tagged accessible PDF: no library selected or tested.
- Provider-native webhook adapter/global complaint suppression: provider not selected.
- Retention/legal-hold cleanup: policy not approved; no destructive job enabled.
