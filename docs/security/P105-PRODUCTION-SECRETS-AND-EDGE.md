# P105 Production Secrets and Edge Security

- API secret values can be read from `*_FILE` mounted-secret variables; values are not committed to `.env.prod.example`.
- Production validation requires distinct JWT access/refresh secrets, platform and parent-invite encryption keys, metrics bearer token, notification suppression hash secret, S3 bucket, password-protected Redis and explicit HTTPS CORS origins.
- S3 access/secret keys must be configured together or both omitted for workload identity.
- PostgreSQL/Redis are internal-only; Nginx is the public edge.
- Nginx uses an unprivileged image, TLS 1.2/1.3, HTTPS redirects, HSTS, content/referrer/frame headers, body-size limits, connection limits and auth-route rate limiting.
- API and worker processes run as non-root.
- Secret initialization refuses to overwrite existing secret files; operators must protect the age identity offline.
- No secret values are logged by the production environment checker.
- Certificate provisioning/renewal, external WAF, runtime image scanning, workload identity and secrets rotation drills remain deployment tasks.
