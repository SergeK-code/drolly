# Skill: API errors, request IDs and logging

- Use `AppError` for expected failures.
- Use the shared API wrapper/formatter for every route.
- Return a consistent response envelope.
- Map validation, auth, authorization, not-found, conflict and rate-limit errors to appropriate HTTP status codes.
- Convert unexpected failures to a generic 500 response.
- Log unexpected errors server-side with request ID and safe context.
- Redact passwords, tokens, cookies, service keys and personal data.
- Never return raw Supabase errors or stack traces.
- Add tests for known and unknown errors.
