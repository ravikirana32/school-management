# P48 Suppression HMAC Key Rotation Security

- Keep `NOTIFICATION_SUPPRESSION_HASH_CURRENT_SECRET` and its version configured consistently across API and worker deployments.
- During rollover, configure the former current secret/version as `NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_SECRET` and `...PREVIOUS_VERSION` on every API and worker instance before removing it from any instance.
- New suppression rows are written under current key only. Reads/deduplication and pre-send checks calculate hashes under both current and previous keys.
- Existing rows are not rehashed. HMAC is one-way and source emails are deliberately not persisted; retaining the previous key is required to continue recognizing active historical rows.
- Before retiring a previous key, query active suppression rows by `hashVersion` under a privileged operational process and retain an auditable evidence record. No automated retirement or destructive cleanup is supplied.
- Secrets must be stored in the deployment secret manager, never committed to source control or logged. Rotate API and worker configuration as one coordinated rollout. Missing current key causes API writes to return unavailable and worker startup to fail closed.
