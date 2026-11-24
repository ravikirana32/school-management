# P381 Delivery Report — F03 room and fee readiness

The server-derived onboarding dashboard now checks two additional setup requirements:
- **Rooms/resources:** at least one active school room is required; tenant-scoped query; remediation routes to Timetable.
- **Fees:** at least one published fee structure for the active academic year or school-wide is required; tenant-scoped query; remediation routes to Fees.

The tasks are dependency-gated on school profile/grade configuration and academic year/grade configuration respectively. Both steps can be assigned through the P378 checklist ownership UI and persist through the P377 resume API. The checklist now has eleven steps.

Existing room and fee management APIs/workspaces are reused; this phase integrates them into readiness rather than reimplementing those modules.
