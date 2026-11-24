# P66 Suppression HMAC Key Retirement Runbook

## Safety rule
Never retire a previous HMAC key while an active suppression alias or an outbox record that may still generate a provider callback depends on that key version. HMAC values cannot be transformed to a new key without the original email, and plaintext email is intentionally not stored.

## Pre-retirement checks
1. Deploy the new current key/version to every API and worker instance.
2. Keep the former key/version configured as previous on every instance throughout the overlap.
3. Open School Admin → Email suppression → Suppression key health. This view returns counts and key version labels only; it never returns secrets, hashes, recipient emails or row IDs.
4. Confirm active alias count for the previous version is zero.
5. Confirm outbox references for the previous version are zero, or that every referenced outbox is beyond a provider-approved callback retention window and its hash has been safely retired under an approved data-retention policy.
6. Confirm all API and worker replicas are running the same current/previous configuration and no old deployment is still processing jobs.
7. Record change approval, counts, backup/rollback point and operator/time in the change record.

## Retirement
1. Remove `NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_SECRET` and `NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_VERSION` from the deployment secret/configuration for API and workers in a coordinated rollout.
2. Restart/roll all instances and verify current-key suppression checks remain healthy.
3. Recheck key-health counts and run the notification suppression smoke test.
4. Do not delete released alias rows as part of key retirement; retain them according to the approved audit retention policy.

## Rollback
If a previous-version suppression must be recognized again, restore the previous secret and version to all API/worker instances before resuming notification delivery. Do not regenerate or replace stored hashes.

## Operational limits
- The key-health API reports grouped counts only and is permission-gated by `school.settings.manage`.
- Outbox references may remain after delivery because a delayed bounce/complaint callback can still need the stored hash/version. No automatic cleanup or key retirement is enabled.
- A retention/legal-hold policy and provider callback horizon must be approved before treating old outbox references as safe to retire.
