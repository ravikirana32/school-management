# P13 Database Hardening

Migration `20261116220000_p13_attendance_hardening` adds a partial unique index for one pending correction per attendance, query indexes, and reasserts forced RLS on all P12 attendance tables.
