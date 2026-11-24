# P41 — Report-card verification, multilingual PDF and email delivery

## Scope delivered

- Report-card PDF generation now uses PDFKit and bundles Noto Sans fonts for Latin, Arabic glyph coverage, Bengali, Devanagari, Gujarati, Gurmukhi, Kannada, Malayalam, Tamil and Telugu. Font license/copyright text is bundled in `backend/api/assets/fonts/noto/LICENSE.txt`.
- PDF generation embeds the selected font and creates a QR symbol using the verification URL/code. Page numbering, school colour, footer and signature label are retained.
- Each artifact receives a cryptographically random 128-bit uppercase hexadecimal verification code stored uniquely in `ReportCardPdfArtifact`.
- Public verification is read-only and returns school, academic year, term and issue date only. It deliberately discloses no student identity, admission number, marks or document URL.
- Report-card publication now writes channel-specific IN_APP and EMAIL outbox rows. Channel preferences are evaluated independently; opting out of IN_APP does not silently opt the user out of EMAIL.
- A dedicated BullMQ notification worker reconciles durable pending rows, checks active linked guardian, communication permission, accepted/non-withdrawn consent and current EMAIL preference immediately before delivery, then calls an HTTPS provider with an idempotency key. It retries and dead-letters exhausted jobs.

## Operational setup

1. Configure `NOTIFICATION_EMAIL_PROVIDER_URL`, `NOTIFICATION_EMAIL_PROVIDER_TOKEN` and `NOTIFICATION_EMAIL_FROM`.
2. Configure `REPORT_CARD_VERIFY_BASE_URL` as the public HTTPS origin (for example `https://school.example.com`). The API appends `/api/v1/public/report-cards/verify/{code}`.
3. Apply the P41 migration and regenerate Prisma Client.
4. Run `pnpm worker:notification-delivery` as a separate process with a dedicated DB role. Do not use a table-owner or `BYPASSRLS` credential. The migration grants the worker GUC-scoped policies only on its required tables.
5. Configure edge/WAF distributed rate limiting for the public verification endpoint. The in-process 30 requests/minute/IP limiter is only a secondary guard and is not shared across replicas.

## Limitations

- Noto fonts are embedded per selected script. PDFKit/fontkit rendering must be visually checked for conjuncts/complex shaping on every target script; Arabic right-to-left paragraph shaping is not claimed.
- QR code is a scannable URL/code symbol (or raw code if no public origin is configured), not a cryptographic digital signature. Authenticity is established by the server-side random code lookup and PUBLISHED-state check.
- Email provider is a generic HTTPS adapter contract. No provider-specific delivery receipt webhook or bounce reconciliation is implemented. PUSH delivery is not enabled because device-token registration and platform push credentials are not yet available.
- School logo upload, reusable named template library, tagged/accessibility PDF and QR scan device E2E remain open.
