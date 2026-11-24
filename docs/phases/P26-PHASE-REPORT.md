# P26 Phase Report — School Configuration Persistence

## Outcome

Integrated the School Admin profile, academic year, calendar, working-day and policy screens with the existing authenticated school configuration APIs. These five areas are no longer presented as local-only previews. Curriculum, student, staff and access screens remain preview-only and are explicitly tracked as gaps.

## Implementation

- Added `SchoolConfigurationWorkspace.tsx` for the five persisted configuration areas.
- Integrated it into the School Admin shell and removed preview-only flags for those tabs.
- Used the shared authenticated `request` helper for all API calls.
- Added form guards for date and time ranges.
- Changed school configuration API mutation guards to granular school permissions (`school.settings.manage` and `academics.manage`) rather than a blanket School Admin role check.
- Hardened date-only schema validation to reject impossible calendar dates.
- Added client-side unit test source.
- Updated root/docs status and master open-gap register.

## Verification performed

- 21 targeted static source assertions passed.
- TypeScript/TSX syntax transpilation passed for the four changed School Admin files; backend schema/route syntax transpilation also passed.
- ZIP integrity: to be recorded after archive creation.

## Not performed

No package installation, Prisma validation/client generation, database migration, PostgreSQL/RLS/concurrency test, Vitest execution, full TypeScript typecheck, Vite build, API integration test or Playwright browser test is claimed for this phase.

## Runtime acceptance

NOT VERIFIED. This phase connects the UI to existing endpoints at source level. A live API/database environment is required to establish runtime acceptance.
