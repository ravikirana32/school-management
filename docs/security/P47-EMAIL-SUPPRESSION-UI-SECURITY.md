# P47 Email suppression UI security

- School and organization identifiers are taken from the authenticated membership selector, not typed by the operator.
- Requests use the shared session request helper, including access-token refresh/retry.
- UI hides the workspace without `school.settings.manage`; API independently verifies active membership and permission.
- Cleartext email is accepted only by the create request. It is not placed in list state or displayed after submission.
- API list selection excludes `emailHash` and does not return actor user identifiers.
- Release requires an 8–500 character reason and is audit logged.
- School-local suppression is clearly distinguished from provider-global complaint suppression.
- Provider-specific webhook and global suppression behavior is not claimed.
- Runtime RLS, browser, API and worker acceptance remains pending.
