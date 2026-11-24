# Mobile journey acceptance matrix

Device acceptance requires Expo builds, iOS Simulator or Android Emulator, seeded test accounts, and Maestro/Detox runtime. This phase records the reproducible contract only; no device execution is claimed.

| App | Scheme | Required journeys |
|---|---|---|
| Parent | `school-parent` | sign-in/session expiry; child switch; attendance/fees; leave request; notification deep link; offline read/reconnect |
| Teacher | `school-teacher` | sign-in/session expiry; timetable; attendance capture; offline queue; reconnect conflict |
| Student | `school-student` | sign-in/session expiry; daily summary; homework/assessment; offline read; deep link |
| Driver | `school-transport-driver` | sign-in/session expiry; assigned route; pickup/drop; location permission denial/grant; offline retry |
| Staff | `school-staff` | sign-in/session expiry; finance refund evidence upload/retry/cancel; admissions; health; canteen; payroll; HR leave; offline upload recovery |

For each journey capture app version, OS/device, locale, network profile, synthetic tenant/run ID, result and trace. Test permission-denied paths. Do not collect precise location in test logs.
