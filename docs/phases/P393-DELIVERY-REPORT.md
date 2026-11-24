# P393 Delivery Report — Onboarding Blocker Detail

P393 improves F03 Guided School Onboarding by displaying named prerequisites directly on blocked task rows. Previously the task row stated only “Blocked by prerequisites”; now it lists the specific incomplete tasks, using the prerequisite keys and task-title mapping already used for gating. The detail is conditionally displayed only for incomplete tasks with unresolved prerequisites and uses accessible `role="note"` semantics. Unknown labels fall back to their key.


This is a source/UI enhancement only. No runtime build, database, API runtime, browser or E2E testing is claimed. F03 remains open; F04 has not started.
