# P429 Delivery Report

Coordinator-facing school reminder defaults are now editable in School Admin. Controls include due-soon and overdue switches, recurrence cadence, save, refresh, and reset-to-default. Permission uses `academics.manage`; all requests remain tenant/school scoped through the existing API.

Teacher-level preferences are not surfaced to coordinators; the UI explicitly states this limitation rather than exposing or inferring personal settings. Runtime acceptance remains pending.
