# P391 Status — F03 Invitation Delivery and Acceptance UI

**Feature:** C2-04 / F03 Core School Onboarding  
**Status:** IN PROGRESS — F03 remains open; F04 is not started.

P391 extends organization/school member invitation delivery and acceptance UX. It adds a configured notification-provider delivery path, safe failure settlement, and a token-hash-only persistence contract. Invitation delivery fails closed before creating a record if provider/base URL settings are absent. Provider failure revokes the created invitation. Invitation token is sent only in the email payload, never returned by API. Organization Admin supports accepting a token supplied in the URL hash, using the existing authenticated API token, and removes the token hash after successful acceptance.

This phase does **not** close all F03. Remaining open items include full dependency-ordered orchestration across every configuration domain, multi-campus inheritance/override rules, bulk import/export preview and rollback, and runtime DB/API/browser/E2E acceptance. Do not begin F04 until these are implemented and validated.
