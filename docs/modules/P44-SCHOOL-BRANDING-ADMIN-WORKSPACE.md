# P44 — School branding administration workspace

## Delivered
- Added a School Admin `School branding` tab gated by `school.settings.manage`.
- The workspace retrieves the active approved logo through the existing private signed-download API.
- PNG/JPEG upload is limited client-side and server-side to 5 MiB. The client requests a server-authorized presigned POST, uploads directly to private object storage, then calls the completion endpoint.
- The server verifies object metadata and dispatches the existing malware scan. The UI explicitly reports quarantine; it does not claim the new logo is active until a later refresh returns an approved asset.
- No object key is exposed to the browser. Previous assets are retained; no destructive cleanup is enabled.

## Limitations
- Browser runtime, S3 CORS, scanner callback and non-owner RLS were not executable in this environment.
- No logo crop/editor or retention/legal-hold workflow is introduced.
