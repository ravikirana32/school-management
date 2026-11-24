# Database Design – Logical Model

## Conventions
- UUID primary keys.
- `created_at`, `updated_at` on mutable business entities.
- `created_by`/`updated_by` where audit attribution is required.
- `organization_id` on organization-owned rows.
- `school_id` on school-owned rows.
- UTC timestamps; explicit IANA school timezone.
- ISO currency codes and fixed-precision monetary values.
- Composite foreign keys and tenant-scoped unique constraints.
- RLS as defence in depth, not a replacement for application authorization.
- Preserve academic and financial history.

## Core tenancy
`organizations 1—N schools`; `organizations 1—N organization_memberships`; `schools 1—N school_memberships`; `schools 1—N academic_sessions`.

## Identity
`users` represent login identities; `persons` represent people. Link using explicit profile/identity relationships. `user_role_assignments` include organization/school scope. Guardian identity is linked to guardian-person records, and guardian-person records link to students. Employee records link to persons and may have multiple school assignments.

## Logical entity inventory

### Platform/tenancy
organizations, schools, school_domains, organization_settings, school_settings, tenant_features, tenant_usage, tenant_storage, academic_sessions, school_campuses, school_branches.

### Identity/security
users, persons, user_profiles, user_sessions, user_devices, roles, permissions, role_permissions, user_role_assignments, user_school_memberships, user_mfa_methods, audit_logs, login_attempts, consent_records.

### Student/guardian
students, student_enrollments, student_guardians, guardian_users, student_addresses, student_documents, student_medical_records, student_emergency_contacts, student_transfers, student_promotions, student_previous_education.

### Staff
employees, employee_school_assignments, departments, designations, teacher_profiles, teacher_subject_assignments, teacher_class_assignments, employee_documents, employee_contracts, employee_leave_balances.

### Education configuration
education_boards, education_programmes, curriculum_versions, curriculum_subjects, grade_levels, subject_groups, subjects, learning_outcomes, assessment_categories, grading_scales, grade_boundaries, assessment_criteria, promotion_rules, report_card_templates.

### Academic operations
classes, sections, class_subjects, academic_terms, academic_calendars, academic_events, classrooms, timetables, timetable_entries, lesson_plans, syllabus_units, syllabus_progress, homework, homework_attachments, homework_submissions, homework_evaluations.

### Attendance
attendance_sessions, student_attendance, period_attendance, staff_attendance, attendance_corrections, attendance_devices.

### Examinations
examinations, examination_subjects, examination_schedules, student_marks, assessment_records, student_grades, result_publications, report_cards.

### Finance
fee_categories, fee_heads, fee_structures, fee_structure_items, student_fee_assignments, fee_invoices, fee_invoice_items, fee_payments, payment_transactions, payment_allocations, fee_discounts, fee_refunds, fee_receipts, expense_categories, expenses, account_ledgers, journal_entries, journal_entry_lines.

### Operations
salary_structures, salary_components, payroll_runs, payslips, leave_types, leave_applications, leave_approvals, vehicles, drivers, transport_routes, route_stops, student_transport_assignments, vehicle_devices, vehicle_location_history, geofences, trip_events, library_books, book_copies, book_issues, library_fines, hostels, hostel_rooms, hostel_beds, hostel_allocations, inventory_items, stock_movements, suppliers, purchase_orders, assets, maintenance_requests, facility_bookings, visitors, visitor_entries, visitor_passes.

### Platform services
notifications, notification_templates, notification_deliveries, announcements, announcement_targets, conversations, messages, message_participants, parent_teacher_meetings, complaints, files, file_access_grants, integrations, webhook_events, outbox_events, import_jobs, export_jobs, report_definitions.

## Required constraints to design in P01
- Tenant-scoped unique keys (e.g. organization + school code).
- Composite references to ensure related records belong to the same tenant/school.
- Enrollment uniqueness by student, school and academic session as appropriate.
- Attendance uniqueness by student, attendance session and period where applicable.
- Invoice/receipt numbering uniqueness within school and fiscal period.
- Provider transaction/event uniqueness for idempotency.
- Non-negative and balanced accounting constraints enforced in services and database where feasible.
- Prevent duplicate active guardian relationships where policy requires.
- Referential integrity for promotion and transfer history.

## Open design work
A visual ERD, complete cardinalities, indexes, partitioning thresholds, retention policies, RLS SQL policies and migration scripts are not part of P00; see P00 gaps register.
