# P08 Student Privacy and Security

- Student, guardian, relationship, enrollment, pickup and document tables all carry organizationId and schoolId and use forced RLS.
- Composite FKs enforce student/guardian/enrollment school boundaries, including guardian identity within the same tenant.
- All current endpoints require school-admin authorization; generic staff membership is not sufficient.
- Guardian contact is not a user login and does not grant portal access.
- Document records expose metadata only; raw object keys are not returned by student detail API.
- Do not log student names, dates of birth, guardian phone/email or document object keys.
- Before production, complete child-data privacy/legal review, retention and deletion policy, consent/guardian verification, encryption/key management, malware scanning and audited document access.
