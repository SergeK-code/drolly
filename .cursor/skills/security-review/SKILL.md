# Skill: Security review for a feature

Before marking a feature complete, inspect:

- Is Supabase access restricted to server-only modules?
- Does the endpoint validate body, query and path input with Zod?
- Is the current identity derived from the server session?
- Is authorization checked in the service/API, not only the UI?
- Does RLS enforce the same ownership boundary?
- Can a user tamper with IDs, role, price, stock, totals or status?
- Are errors safe and passed through the unified formatter?
- Are logs structured and free of credentials/needless personal data?
- Are authentication/sensitive routes rate-limited?
- Are cookie mutations protected against cross-site requests?
- Are tests present for forbidden and malicious inputs?

Return concrete findings with file paths. Do not claim a control is present without finding its implementation or test.
