# P191 — Admission Notification Templates (source foundation)

## Scope
Provide reusable plain-text templates for the core admission notification events and a safe deterministic renderer.

## Delivered
- Templates for application submission, missing documents, offer issued, and offer accepted.
- Placeholder syntax `{{variableName}}`.
- Renderer substitutes values as plain text; it does not evaluate HTML or code.
- Missing variables are rejected with a named error rather than silently creating malformed messages.
- Unit tests cover normal replacement, missing variables, and literal text handling.

## Limitations / follow-on gaps
- Templates are source defaults, not persisted school-configurable templates.
- No Admin UI for editing templates or branding.
- Email/SMS provider integration for admission-specific events is not wired to these templates yet.
- Locale-specific template packs, preview, validation, approval and versioning remain open.
- Build and runtime validation are deferred.
