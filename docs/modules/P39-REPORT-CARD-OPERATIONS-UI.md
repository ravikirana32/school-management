# P39 — Report-card operations UI

## Delivered
- School Admin now has a dedicated report-card governance workspace instead of the legacy generic report-card editor.
- Schema draft form captures academic year ID, grade ID, configured board key, schema code/version and subject/component definition JSON. API validation remains authoritative.
- Schema list exposes DRAFT/ACTIVE/RETIRED state and lets users with `reports.approve` activate a draft.
- Review queue lists report cards, student identity, approval state and approval event timeline. Principal-capable users can approve or reject; rejection requires a reason.
- Authorized report managers can generate the private PDF and publish an approved report.
- Parent mobile report-card cards now offer a private PDF download action through the consent-checked P38 endpoint; signed URL is opened by the device.

## Security and limitations
- API remains authoritative for membership, tenant scope, permissions, schema validation, author separation and consent.
- The UI does not expose raw storage object keys or long-lived credentials.
- Academic-year and grade IDs are entered as identifiers; searchable pickers are not yet connected.
- Subject/component JSON is an advanced editor, not a visual board-pack designer.
- The parent download URL is short-lived (60 seconds) and only returned after server-side consent/link checks. Consent withdrawal after URL issuance cannot revoke an already issued object-store URL before expiry.
- Official board packs, QR verification, branded multi-page PDF, notification outbox and provider delivery remain open.
