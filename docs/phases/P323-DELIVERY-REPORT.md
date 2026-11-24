# P323 — Communication Center Academic Targeting

## Delivered (Cycle 1 source-level)
- Optional academic year, grade-level and section targets are persisted on SchoolCommunication.
- Draft UI accepts academic-year ID, grade-level ID, and section name. The form indicates class targeting narrows parent/student recipients; staff recipient targeting remains school-wide.
- API validation requires academic year whenever grade or section targeting is provided, and requires grade when section is supplied.
- Publish resolves enrolled student IDs for the selected academic year/grade/section, then narrows guardian communication links and student account links to that roster.
- Existing audience roles, consent/communication opt-in filtering, notification preference opt-outs, audit logging, and draft-only publish lifecycle remain intact.
- Migration adds the three optional columns and a targeting index.

## Validation
- Static assertions: 12/12 PASS.
- School Admin TSX transpilation: 0 syntax diagnostics.
- API route TS transpilation: 0 syntax diagnostics.
- Prisma migration/schema validation, database migration execution, API runtime, browser, mobile, full build/typecheck not run.

## Limitations / gaps
- Academic-year and grade-level targets are currently entered as IDs; catalog-backed selectors and audience preview/count are not implemented.
- Section name is free text and must match enrollment data.
- Targeting narrows parent/student recipients only; teacher/staff audience recipient scope remains school-wide.
- No transactional delivery preview or runtime-confirmed recipient count before publish.
- Email/push delivery is not implemented in this phase.
