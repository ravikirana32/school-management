# P13 Migration

Migration: `20261116220000_p13_attendance_hardening`. Apply after P12. Adds a partial unique index for one pending correction per attendance, supporting indexes, and reasserts forced RLS. Validate clean/upgrade deployment and concurrent correction review in PostgreSQL. No migration was run in this phase.
