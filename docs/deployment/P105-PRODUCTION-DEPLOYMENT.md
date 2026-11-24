# P105 Production Deployment

Use the production compose file with a private `.env.prod`, mounted secrets, TLS certificate and an immutable `IMAGE_TAG`.

Release flow:
1. CI/release requires the authentic `pnpm-lock.yaml` and frozen install.
2. Build/push API, backup and four web images to GHCR.
3. GitHub `production` environment approval gates SSH deployment.
4. Production host pulls immutable images.
5. Encrypted PostgreSQL backup is created before migrations.
6. Prisma migrations are applied.
7. Compose starts/replaces API, workers, web and edge services.
8. Public API readiness is polled.

The current workspace lacks `pnpm-lock.yaml`; the release workflow is intentionally blocked until the real lockfile is restored. No production deploy has been performed.
