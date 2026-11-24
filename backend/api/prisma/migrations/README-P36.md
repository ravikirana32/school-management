# P36 migration

`20261117160000_p36_homework_submissions` adds a tenant-scoped homework submission table, composite tenant foreign keys to the assignment and student, one-submission-per-assignment/student uniqueness, grade bounds/state checks, query indexes, and forced RLS. Apply only after the P35 migration and validate the schema against the generated Prisma client before deployment. Rollback is a controlled destructive operation: drop the `HomeworkSubmission` table only after exporting any submissions that must be retained.
