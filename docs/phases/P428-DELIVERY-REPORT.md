# P428 Delivery Report — Notification Preferences & Reminder Controls

P428 adds teacher reminder preference APIs and Teacher Mobile toggles for due-soon and overdue notifications. The teacher's per-category settings are stored using the existing NotificationPreference model and authenticated user scope. A new TeacherTaskReminderPolicy model provides school defaults and configurable overdue recurrence, managed through academics.manage coordinator endpoints. The scheduler respects both school defaults and teacher overrides, keeps due-soon dedupe daily by school-local date, and applies configurable overdue cadence slots.

Migration: `20261121240000_p428_teacher_task_reminder_preferences`.

Focused verifier: 21/21 PASS. P426 and P427 regressions: 26/26 and 18/18 PASS. Syntax transpilation: 0 diagnostics for API routes, worker, and Teacher Mobile TSX. Runtime acceptance remains pending.
