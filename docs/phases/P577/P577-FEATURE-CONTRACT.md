# P577 Feature Contract

## Browser test contract
- Four configurable web targets: Super Admin, Organization Admin, School Admin and Public Portal.
- Missing target URLs are skipped with an explicit reason; skipped tests remain non-acceptance.
- Entry smoke asserts non-server-error response, visible React root, non-empty title, document language and responsive viewport metadata.
- axe checks WCAG 2.0/2.1/2.2 A/AA tags and blocks serious/critical violations.
- CI traces/screenshots retained on failure; artifacts must be sanitized.

## Mobile acceptance contract
Parent, Teacher, Student and Driver app journey matrix covers auth/session expiry, core workflows, deep links, permission paths and offline/reconnect. Requires device builds and seeded synthetic tenant.

## Accessibility contract
Automated axe is supplemented by manual keyboard, focus, screen reader, zoom/reflow, contrast, target-size, reduced-motion, Kannada/English and VoiceOver/TalkBack review.

## Security contract
Use disposable tenant data, synthetic student/guardian records, runtime-generated storage state and sandbox-only provider credentials. Never commit secrets or production PII.
