# P15 — Teacher Attendance Mobile

The Teacher Expo app now provides a connected attendance workflow: connect to a school API, load the signed-in teacher's active assignments, create or load attendance sessions, load the assignment-scoped roster, mark attendance and submit the session.

The access token is held in React component memory only. No AsyncStorage/secure persistence is included in this phase; the user must authenticate again after app restart. A production auth/session flow and secure token storage are still required.

Backend changes:
- Teacher assignment checks now include academic year and assignment effective dates.
- Teacher session lists are filtered to the teacher's active assignments.
- A dedicated teacher roster endpoint exposes minimum student fields only for the assigned class.
- Existing create/open/mark/submit routes validate teacher assignment against year, grade, section and session date.
