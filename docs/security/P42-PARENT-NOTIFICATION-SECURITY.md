# P42 Parent notification security

- Authentication and `parent.notifications.read` plus active parent portal consent are required.
- Consent is re-evaluated on every list/count/read request.
- Student-scoped records are constrained to currently active communication links.
- Cursors only carry ordering metadata; they do not grant access. The cursor anchor is looked up under the same tenant, school, recipient and current student-link predicates.
- `read-all` uses a single tenant-scoped `updateMany` with recipient, school and current audience constraints.
- Notification body content remains school-authored data; clients should render it as text, not trusted markup.
- Retention/deletion is intentionally not automated pending a documented retention schedule and legal-hold requirements.
