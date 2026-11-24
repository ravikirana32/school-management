# P37 migration

`20261117170000_p37_homework_attachments_rubrics` follows P36. It adds private homework submission attachment metadata, a scanner-only lookup policy, JSON rubric results, and append-only grade/reopen history. The upload flow reuses the existing S3-compatible presigned POST, object metadata verification, quarantine, signed malware scanner callback, clean-object promotion, and short-lived signed download URL.

Apply only after P36. Rollback is destructive: preserve attachment metadata and grading history before dropping `HomeworkSubmissionGradeEvent` and `HomeworkSubmissionAttachment`; remove `HomeworkSubmission.rubricResults` only after exporting rubric data. The migration has not been applied in this environment.
