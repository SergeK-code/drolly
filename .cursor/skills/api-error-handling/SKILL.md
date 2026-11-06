# Skill: API errors, request IDs and logging

- One class: `AppError`. Helpers: `notFound()`, `conflict()`, `validationFailed()`, `unauthenticated()`, `forbidden()`, `rateLimited()`, `serviceUnavailable()`.
- Controllers validate with `validateData`. Do not call `schema.parse` in routes.
- Use `apiHandler` on every `/api` route. One envelope: `{ success: true, data }` or `{ success: false, error: { code, message, requestId, fieldErrors? } }`.
- Map validation (422), auth (401), authorization (403), not-found (404), conflict (409) and rate-limit (429) correctly.
- Convert unexpected failures to a generic 500. Never return thrown `Error.message`, stacks, SQL or Supabase errors.
- Log the thrown message plus request ID and `safeErrorContext`.
- Redact passwords, tokens, cookies, service keys and personal data.
- Add tests for known and unknown errors.
