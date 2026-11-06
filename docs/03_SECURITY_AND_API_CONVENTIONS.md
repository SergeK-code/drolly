# 03 — Security, API and Error Conventions

## 1. Supabase is server-only

- Only files under `src/server/**` may import Supabase packages or create Supabase clients.
- Add `import 'server-only'` to Supabase modules and privileged server modules.
- Never prefix Supabase secrets with `NEXT_PUBLIC_`.
- Browser code calls only the application's `/api/**` endpoints.
- Do not put Supabase queries in client components, hooks, Zustand stores, middleware that runs in an unsuitable runtime, or shared client utilities.
- Use a server-side authenticated client for normal user requests so RLS sees the user's identity.
- Service-role key: server-only, narrowly scoped, no general-purpose repository access. Never use it to bypass RLS for routine customer/admin operations.

## 2. Environment variables

Example `.env.example` (placeholders only):

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LOG_LEVEL=info
```

The Supabase URL and anon key are not secrets in the same way as the service key, but under this project's rule they are still consumed only by server modules. Do not expose them via client bundles. Validate environment variables at startup. Keep `.env.local` out of Git.

## 3. Authentication

- Register/sign-in/sign-out endpoints use Supabase Auth from the server.
- Store/refresh sessions using secure cookies via `@supabase/ssr`.
- Cookies: `httpOnly` where compatible with the chosen server-side flow, `secure` in production, `sameSite=lax`, path `/`.
- Never return access or refresh tokens in JSON.
- Avoid logging auth request bodies.
- Use generic sign-in failure messages to avoid account enumeration where appropriate.
- Rate-limit authentication endpoints.
- For sensitive mutations, require a valid session and verify CSRF/origin protections appropriate to cookie-based auth.

## 4. Authorization

Create server helpers such as:
- `getCurrentUser()`
- `requireAuthenticatedUser()`
- `requireAdmin()`

The helper reads the server session and resolves the application role from the database. Do not trust role claims supplied by the browser or local storage.

Every admin API route/service checks admin authorization independently. Hiding an admin button or redirecting the page is not authorization.

## 5. Validation

- Define Zod schemas close to each feature.
- Validate body, query parameters, path parameters and environment variables.
- Reject unknown/invalid values where appropriate.
- Validate string length, integer ranges, UUIDs, enum/lookup codes and pagination limits.
- Treat client validation as convenience only; repeat all checks on the server.
- Never interpolate untrusted strings into SQL. Use Supabase query builder/RPC parameters.

## 6. Unified error handling

Use one error class and one formatter.

Controllers validate untrusted input with `validateData`. Services throw `notFound()`, `conflict()`, `validationFailed()`, or `AppError`. `apiHandler` formats every thrown error.

Success and error share one envelope:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "This value is already used.",
    "requestId": "...",
    "fieldErrors": { "name": ["This value is already used."] }
  }
}
```

Rules:
- `AppError` contains a code, HTTP status, developer message and optional `fieldErrors`.
- One `formatApiError` maps known errors to the envelope. Clients see a dedicated public `message` per status, never thrown internals.
- Unknown errors become HTTP 500 with a generic public message.
- Log the original error server-side with request ID; never return stack traces, SQL, table names, secrets or raw Supabase error messages.
- Route handlers use `apiHandler`. Avoid repeated custom try/catch formatting.
- Use correct HTTP statuses: 400 bad request, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 422 validation, 429 rate limit, 500 unexpected.

## 7. Structured logging

Use Pino or a small JSON logger with fields:
- `timestamp`
- `level`
- `message`
- `requestId`
- `method`
- `path`
- `statusCode`
- `durationMs`
- optional safe `userId`

Never log:
- Passwords, OTPs, auth tokens, cookies, service keys
- Full address, phone, email where not necessary
- Full request bodies
- Payment details
- Unredacted Supabase error objects

Generate or propagate a request ID. Keep logs useful for debugging without collecting sensitive data.

## 8. Rate limiting

Add a small server-side rate-limit abstraction for sign-in, sign-up and sensitive endpoints. In-memory limiting is acceptable only for local development or a single-process demo; it is not reliable across multiple production instances/restarts. For deployment, use a shared store or platform-level rate limiting. Do not add Redis solely for the MVP unless deployment scale requires it. Document the chosen limitation.

## 9. API conventions

- Use plural resources: `/api/products`, `/api/categories`, `/api/orders`.
- Use HTTP methods consistently: GET, POST, PATCH, DELETE (archive instead of hard delete when referenced).
- Return JSON with a consistent success envelope, e.g. `{ "success": true, "data": ... }`.
- Paginated responses include `items`, `nextCursor` or `page`, and `hasMore`.
- Use `201` for created resources, `204` where no body is needed, `400/401/403/404/409/429/500` as appropriate.
- Do not expose internal database fields unnecessarily.

## 10. Security verification checklist

- Search the codebase for `createBrowserClient`, `createClient` outside `src/server`, and `supabase.from(` outside `src/server`.
- Search client code for `SUPABASE_SERVICE_ROLE_KEY`, tokens and secret env names.
- Confirm every admin API endpoint rejects a customer.
- Confirm a customer cannot read another customer's orders/profile/address.
- Confirm public catalog hides inactive products/categories.
- Confirm registration cannot create an admin.
- Confirm checkout ignores client totals and checks current stock/prices.
- Confirm rate limits and error responses do not leak sensitive details.
