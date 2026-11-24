# P123 Delivery Report

P123 narrows student data exposure and teacher object access. The student detail endpoint no longer serializes all Student scalar fields by default. PII fields are selected only when `students.pii.read` is granted. Enrollment fields are explicitly selected. Built-in teacher-role users must have an active staff record and a current assignment matching the student's active enrollment to read student detail, guardian information, or download student documents.

Fee access was reviewed: the school fee listing requires `fees.read`; the seeded teacher role does not receive that permission. Parent fee access remains separately protected by accepted consent and `parent.fees.read`.

No gap is marked CLOSED because runtime verification has not been performed.
