# P380 Delivery Report — F03 board and grade onboarding

F03 guided onboarding now includes school board affiliation and active grade-level configuration in the server-derived readiness dashboard.

- Readiness endpoint loads the school board profile and active grade levels under tenant context.
- Board readiness requires board key and name; grade readiness requires at least one active grade.
- New setup tasks carry remediation guidance and route to the existing Board & curriculum workspace.
- Dependencies now include board-profile → grade-levels and grade-levels → grading-policy, in addition to existing prerequisites.
- Server-side saved-progress/task-assignment key allowlists expanded from seven to nine tasks.

This is a readiness integration into existing configuration workspaces, not a claim that board catalogue rules or grade creation themselves are complete.
