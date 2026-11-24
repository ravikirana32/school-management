# P258 Delivery Report — School Settings & Configuration

## Audit
Existing school profile, academic-year create/list, calendars and event creation, weekly working days, attendance/grading policy configuration, API validation, school-scoped authorization and persistence were source-audited and retained. No duplicate work was added.

## Implemented missing basic coverage
- Academic term selector for an academic year.
- Existing term listing with sequence ordering.
- Create academic term form (name/code/type/sequence/date range).
- School-scoped GET API for terms under an academic year; checks academic year belongs to active organization/school.
- Basic UI date ordering guard and permission-aware submit.

## Status
Cycle 1: **Partial**. Source changes implemented; runtime/build/typecheck/API/browser/mobile verification is deferred. No gaps closed without evidence.

## Cycle 2 backlog
Advanced settings lifecycle/edit/delete, richer policy configuration, deeper localization and cross-module behavior, security review, runtime validation and tests.

## Checks
Archive integrity, static source assertions and root/docs mirror equality checked. Runtime verification deferred.
