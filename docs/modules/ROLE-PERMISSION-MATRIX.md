# Role and Permission Baseline

## Role families
- SaaS Super Admin
- SaaS Support Agent (restricted, audited)
- Organization Owner
- Organization Administrator
- Organization Finance Manager
- Organization Academic Director
- School Administrator
- Principal
- Accountant
- Teacher
- Librarian
- Transport Manager
- HR Manager
- Parent/Guardian
- Student (future role surface)
- Driver (future role surface)

## Permission model
Use permission keys such as `students.read`, `students.create`, `attendance.mark`, `attendance.correct`, `fees.collect`, `fees.refund`, `examinations.publish`, `reports.export`.

Roles group permissions; they do not bypass resource scope. Every assignment includes its applicable organization and/or school scope. Resource-level checks are required for child records, files, marks, financial records and messages.

## Baseline access expectations
| Role | Scope |
|---|---|
| SaaS Super Admin | Platform administration; tenant data access is not implicit |
| SaaS Support Agent | Explicit, time-limited support scope only |
| Organization Owner/Admin | Authorized schools within own organization |
| Organization Finance Manager | Organization financial reports and authorized school finance |
| Organization Academic Director | Academic oversight across authorized schools |
| School Administrator | Assigned school operational scope |
| Principal | Assigned school, with configured approvals |
| Accountant | Assigned school finance |
| Teacher | Assigned classes, subjects and students; homework.read/homework.grade only for active assigned class scope |
| Librarian | Assigned library |
| Transport Manager | Assigned transport operations |
| HR Manager | Authorized employee/HR records |
| Parent/Guardian | Explicitly linked children and permitted fields |
| Student | Own permitted records only |
| Driver | Assigned route/trip and minimum necessary student data |

A complete action-by-action matrix, separation-of-duties rules and negative authorization tests are required in P02 before production use.
