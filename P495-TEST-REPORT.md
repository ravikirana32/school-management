# P495 Test Report

Focused static verifier executed against P495 source and expected route/UI wiring. Assertions cover route existence, active-link context resolution, organization/school scoping, student-scoped loan/reservation queries, transport allocation route/stop relations, student-filtered trip events, response field selection, API wiring in Student Services Hub, loading/error/refresh handling, and client not passing student IDs.

Runtime tests were not run: no live API/DB/Redis or mobile runtime validation is claimed.

## Archive verification
- P494 baseline files: 3990
- Byte-identical preserved files: 3984
- Modified files: 6
- New files: 7
- Missing files: 0
- Duplicate ZIP entries: 0
- ZIP CRC: PASS
- SHA-256: `3b6109f367e31376236710b32ea793dec72ed368dad57e3d71b95448e6de614d`
