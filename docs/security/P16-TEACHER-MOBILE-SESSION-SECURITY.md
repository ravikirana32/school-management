# P16 Teacher mobile session security

- Refresh token and API base URL: stored using Expo SecureStore (platform-protected storage); never rendered as credentials in UI.
- Access token: memory only; lost when the app process restarts.
- Password: held only in the sign-in form state and cleared after successful login.
- Refresh: server-side rotating refresh contract; one in-flight refresh is shared by concurrent requests in this app process.
- Logout: server revocation attempted, then local refresh token deleted in a `finally` path.
- Transport: HTTPS required except localhost/127.0.0.1 development.

This is a source-level security foundation, not a completed mobile security certification. Device backup behavior, rooted/jailbroken device controls, screenshots/app-switcher privacy, TLS pinning, MFA, remote session management, backend rate limiting and physical-device penetration tests remain open.
