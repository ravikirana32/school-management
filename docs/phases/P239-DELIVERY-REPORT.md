# P239 Delivery Report — Enrollment Status UI Guardrails

## Goal
Prevent School Admin from offering enrollment-status transitions that the backend rejects.

## Changes
- Selected enrollment record is resolved from the history collection.
- UI transition mapping mirrors the existing backend transition helper.
- ENROLLED allows PROMOTED, TRANSFERRED, WITHDRAWN, COMPLETED.
- PROMOTED allows TRANSFERRED, WITHDRAWN, COMPLETED.
- TRANSFERRED, WITHDRAWN, COMPLETED are terminal in this UI control.
- Current enrollment state is displayed to the user.
- Submit is disabled unless the selected next state is allowed.

## Scope and limitations
This phase does not add an enrollment approval state, class/section allocation wizard, academic-year promotion, or transfer-to-new-section workflow. It is a UI guardrail around the existing API transitions.

## Validation
- Static assertions: transition mapping, state derivation, allowed-options render, current-state helper, submit guard, and register/checklist mirror presence.
- Builds, typechecks, runtime, migrations, API, browser, mobile, security, and E2E validation are intentionally deferred.
- ZIP integrity checked separately.
