# P107 Security, Privacy and Operational Assurance Guidance

## Threat-model baseline

| Threat area | Example failure | Minimum control / evidence |
|---|---|---|
| Identity compromise | Stolen administrator credentials | MFA enforcement, session revocation, privileged-access review and authentication audit |
| Tenant isolation | Cross-school record access | Membership + permission checks, tenant context, forced PostgreSQL RLS and negative cross-tenant validation |
| Privilege escalation | Unauthorized role or support grant | Least privilege, independent approval, time-bound grants and immutable audit evidence |
| Data exposure | Logs, exports or attachments reveal personal data | Data minimization, redaction, encryption, scoped downloads and retention controls |
| Application abuse | Injection, credential stuffing, upload abuse | Input validation, rate limits, secure upload scanning, dependency review and security monitoring |
| Availability loss | Database, region or provider outage | Tested backups, restore runbook, recovery objectives and provider escalation |
| Insider misuse | Unapproved access or data export | Separation of duties, access review, audit review and approved data-subject workflow |

## Incident response runbook outline
1. Detect and record time, affected tenant/service, reporter and severity. Do not place passwords, tokens or unnecessary student data in the record.
2. Triage impact and scope; preserve relevant logs and evidence in an access-controlled forensic system.
3. Contain using approved session revocation, key rotation, tenant isolation or service controls. Record approver and timestamps.
4. Assess privacy impact and notification obligations with the designated legal/privacy owner; do not infer statutory deadlines from this generic runbook.
5. Eradicate root cause, restore from a known-good state where required, and validate integrity.
6. Close only after owner approval, evidence links, customer communications where applicable and lessons learned are recorded.

## Privacy and governance checklist
- Maintain a data inventory, purpose, access owner and retention schedule for each data class.
- Verify identity and authority before access/export/correction/erasure fulfilment.
- Apply legal holds before any deletion decision; preserve approval and execution evidence.
- Minimize personal data in incident descriptions, application logs and evidence references.
- Review subprocessors, cross-border transfers, encryption/key ownership and breach escalation with qualified counsel.
- Do not execute erasure from the P107 register. Existing P101 governance workflow remains approval/review only.

## Board and jurisdiction evidence
For each school, record the board/jurisdiction, source circular or rule identifier, effective date, applicability decision, responsible reviewer, evidence artifact reference, review date and approval outcome. The school must obtain legal/compliance approval before treating a rule as mandatory or a control as satisfied.

## Disaster recovery evidence template
Record service/system, data set, backup frequency, backup location/region, encryption/key dependency, approved RPO, approved RTO, last backup timestamp, last restore timestamp, measured recovery point, measured recovery duration, approver and exercise report reference. A configured target is not an achieved target. Only a completed restore/failover exercise can provide evidence of recoverability.

## Operational cautions
- P107 stores operational metadata and evidence pointers only; it is not a SIEM, ticketing, forensic evidence vault, backup controller or legal rules engine.
- Restrict access to the School Admin security workspace to trusted governance administrators.
- Review records periodically and retain external evidence under the organization's approved retention schedule.
