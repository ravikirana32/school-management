# P10 Staff data model

Models: StaffDepartment, StaffDesignation, StaffMember, StaffEmploymentHistory, TeacherAssignment, StaffDocument and StaffAuditEvent. The migration adds tenant-composite foreign keys from staff to department/designation, history to staff/department/designation, assignments to staff/academic year/grade/curriculum subject, and documents/audit to staff. Every P10 table has forced RLS requiring matching organization and school settings. Employee numbers and department/designation codes are unique per school.
