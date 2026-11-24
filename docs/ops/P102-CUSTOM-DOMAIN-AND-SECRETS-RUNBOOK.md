# P102 Operations Runbook

## Custom domain onboarding
1. In Super Admin, select the organization and register its fully qualified hostname.
2. Publish the returned TXT record at `_school-saas-verification.<hostname>` with the exact value returned by the API.
3. TXT challenge expires after 24 hours. Use Renew challenge if it expires; replace the DNS TXT value with the newly returned value.
4. Verify DNS ownership in Super Admin. Verification is not activation.
5. Configure the provider CNAME/edge mapping and TLS certificate for the hostname. This step is deployment/provider-specific and is not automated by this phase.
6. Activate the verified domain in Super Admin.
7. Confirm `GET /api/v1/public/tenant-context` returns the intended tenant when sent through the configured custom hostname.
8. Confirm tenant-scoped API URLs with another organization's ID return 404.

Disabling a domain stops tenant mapping resolution. A previously verified domain can be reactivated only while its organization remains active. A disabled domain that needs fresh proof can be re-registered after its old registration is removed by an authorized operational process (domain deletion UI/API is not included in P102).

## Platform secrets
- Generate a key outside source control: `openssl rand -hex 32`.
- Set the output as `PLATFORM_SECRET_ENCRYPTION_KEY` in the deployment secret store, not in Git.
- Restart the API after configuration.
- Save/rotate secrets through Super Admin. List APIs expose metadata only.
- Back up the encryption key using the organization's approved secrets backup process. Loss of the key makes existing ciphertext unrecoverable.
- P102 uses one configured key version (`v1`). Do not change the key in place while records exist; multi-key re-encryption tooling is still open.

## Support access
- Requests are time-bounded to at most four hours and cannot be self-approved.
- Approval requires a different platform admin and a session MFA timestamp within five minutes.
- Current authentication does not issue that timestamp; approvals therefore remain blocked until the verified MFA challenge flow is implemented.
- Support grants do not yet establish an impersonated tenant session or bypass tenant authorization.

## Super Admin UI
- Configure `VITE_API_URL` to the API origin.
- Sign in using an existing platform-admin bearer access token. The UI holds the token in component memory only and clears it on disconnect/refresh.
