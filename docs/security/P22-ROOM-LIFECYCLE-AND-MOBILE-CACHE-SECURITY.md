# P22 security notes

- Room APIs remain tenant-scoped and School Admin-only.
- Room code is immutable through the API. PostgreSQL triggers serialize room and timetable room writes with a school-wide advisory lock, reject code changes while timetable references exist, reject deactivation while active references exist, and reject new slot/exception room references unless the canonical room is active.
- Legacy room usage report is read-only and scoped to the selected school.
- Teacher timetable cache uses Expo SecureStore, not unencrypted AsyncStorage. Cache is limited to 40 minimal period records per date, a rolling maximum of 14 dates, and a 14-day TTL.
- Cache is cleared on sign-out for all schools discovered in the current signed-in session. Cached timetable is explicitly read-only; attendance mutations are disabled offline.
- No student names, attendance marks, refresh tokens or credentials are written to timetable cache.
- SecureStore/device behavior has not been verified on physical devices. Platform backup, device compromise and shared-device risks remain subject to mobile security review.
