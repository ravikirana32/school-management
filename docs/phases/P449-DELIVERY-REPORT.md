# P449 Delivery Report

P449 connects P448's persisted severity-based alert policy to SLA automation.

- Reads the platform setting `operations_alert_policy` at each automation run.
- Normalizes and validates four severities; invalid policy data uses documented safe defaults.
- Processes reminders per severity using each rule's reminder window.
- Processes overdue escalations per severity using each rule's escalation delay after the SLA deadline.
- Includes configured recipient IDs and policy version in reminder/escalation event payloads.
- Keeps atomic claim+outbox creation within transaction blocks and dedupe keys for generated events.
- Honors policy `enabled=false` by returning without creating SLA reminder/escalation events.
- Registers `verify:p449` and adds `scripts/verify-p449-alert-policy-execution.mjs`.

## Important integration boundary
Recipient IDs are carried in outbox payloads for downstream delivery. The webhook provider/consumer must interpret and route to these recipients; P449 does not implement individual recipient delivery channels.
