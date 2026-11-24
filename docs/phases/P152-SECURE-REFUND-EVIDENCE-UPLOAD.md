# P152 — Secure Refund Reconciliation Evidence Upload

- Added upload intent API restricted to accounting reconciliation permission and tenant/school/refund/note context.
- Upload policy: PDF/JPEG/PNG, maximum 10 MB.
- Presigned private storage upload with server-generated object key.
- Completion endpoint verifies object MIME and size, deletes invalid objects, and returns a short-lived private download URL.
- Upload initiation is audit logged.
- **P152-G001 OPEN:** malware scanning, clean-object promotion and runtime validation remain.
