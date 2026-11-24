# P41 security controls

- Verification code: 128-bit CSPRNG value, uppercase hex, unique DB index; not derived from tenant IDs or report-card IDs.
- Public verification: strict input format, narrow read-only DB context flag and policies, no student PII or private storage URL in response. Add distributed gateway/WAF rate limiting in deployment.
- PDF: Noto font assets bundled with license; PDF remains private S3 object. QR only resolves a public metadata verification endpoint.
- Notification: dedicated worker context GUC; no platform-admin bypass. Worker RLS is limited to outbox mutations and SELECT access to Guardian, StudentGuardian, ParentInvitation and NotificationPreference.
- Delivery authorization is re-evaluated at send time. Active guardian, verified email, student communication link, accepted non-withdrawn consent and current channel preference are required.
- HTTPS-only provider, bearer token from environment and stable idempotency key. Provider credentials are never stored in the outbox payload.
- Production worker DB credentials must not own the tables and must not have BYPASSRLS. Test this with a non-owner role before deployment.
