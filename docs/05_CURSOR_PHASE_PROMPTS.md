# 05 — Cursor Prompts (Copy One Prompt at a Time)

## How to use these prompts

- Start Cursor at the project root.
- Keep `.cursor/rules/` enabled.
- Paste the Bootstrap prompt first.
- For each later phase, paste only that phase prompt.
- Require Cursor to inspect its own changes, run checks and summarize results.
- If a phase fails verification, fix it before continuing.
- Do not allow Cursor to silently skip security work or invent existing files.

---

## Prompt 0 — Bootstrap the project

```text
We are starting a completely new project. There is no existing application to preserve.

Build a simple, course-friendly single-store e-commerce application using Next.js App Router, React and TypeScript. Supabase PostgreSQL and Supabase Auth will be used, but Supabase must be accessed ONLY from server-side code. The browser must call our own Next.js API endpoints and must never use a Supabase client.

Read these files first:
- docs/00_PROJECT_BRIEF.md
- docs/01_SYSTEM_ARCHITECTURE.md
- docs/03_SECURITY_AND_API_CONVENTIONS.md
- .cursor/rules/

Then:
1. Create the Next.js project if this repository is empty. If the project was already initialized by the developer, inspect it and do not overwrite it.
2. Configure TypeScript strict mode, ESLint and Tailwind.
3. Install only the dependencies needed for the agreed architecture: @supabase/ssr, @supabase/supabase-js, zod, @tanstack/react-query, zustand, pino, vitest and appropriate test utilities. Do not add an ORM.
4. Create a minimal folder structure from docs/01_SYSTEM_ARCHITECTURE.md. Do not create unnecessary empty abstractions.
5. Add scripts for dev, build, lint, typecheck and test.
6. Add .env.example with placeholders only and ensure .env.local is ignored.
7. Add a short README setup section.
8. Do not implement business features yet.

Important: Supabase packages may be imported only by server-only modules under src/server. Do not create a browser Supabase client. Add guardrails/documentation to enforce this.

Before finishing, run lint, typecheck and tests. Report files created, commands run and any unresolved issue. Do not claim a check passed unless you ran it.
```

## Prompt 1 — Database migrations and RLS

```text
Implement Phase 1 only: database foundation.

Read docs/02_DATABASE_DESIGN.md and docs/03_SECURITY_AND_API_CONVENTIONS.md first.

Create Supabase CLI configuration and SQL migrations for:
app_roles, profiles, categories, products, customer_addresses, order_statuses, orders, order_items and store_settings.

Requirements:
- Use UUID primary keys where appropriate, foreign keys, constraints, indexes and timestamptz.
- Use lookup tables for roles and order statuses; do not use arbitrary free-form role/status values.
- Seed customer/admin roles and the agreed order status rows.
- New public registrations must never be able to choose their role.
- Prices use integer minor units plus currency.
- Add non-negative price/stock/quantity/amount constraints.
- Add RLS to every application table and policies matching docs/02_DATABASE_DESIGN.md.
- Public users can read active catalog only.
- Customers can access only their own profile, addresses and orders.
- Admin policies must rely on a trusted role lookup, not client input.
- Do not expose service-role access or disable RLS to make a feature work.
- Add/update generated database TypeScript types if the CLI is available.
- Add a short migration and local reset guide.

Keep SQL readable and comment security-sensitive policies. Do not implement UI or API features in this phase.

Run or explain the exact local migration/test commands. If Supabase CLI/local Docker is unavailable, clearly distinguish static review from an executed database test. Finish with a table of tables, policies and checks.
```

## Prompt 2 — Backend foundation, unified errors and logs

```text
Implement Phase 2 only: backend foundation.

Read docs/01_SYSTEM_ARCHITECTURE.md and docs/03_SECURITY_AND_API_CONVENTIONS.md.

Create:
- Server-only, request-scoped Supabase client using @supabase/ssr and Next.js cookies.
- Any privileged/service-role client only if needed, in a separate server-only module with a narrow exported operation. Do not use it for normal queries.
- Route Handler → Controller → Service → Repository example using a simple health or catalog-read endpoint.
- AppError class with code, status and safe public message.
- One centralized API error formatter and consistent success/error response helpers.
- Request ID creation/propagation.
- Structured Pino logger with redaction.
- Zod environment validation.
- Shared helpers for parsing JSON/query params safely.
- Server-side rate-limit interface and a documented local-development implementation. Do not claim in-memory limits are production-distributed.
- A health endpoint that reveals no secrets or infrastructure credentials.

Do not build product CRUD or UI yet.

Security constraints:
- No Supabase imports outside src/server.
- No raw Supabase error, stack trace, SQL or secrets in API responses.
- Never log passwords, cookies, tokens, service keys or request bodies.
- Do not swallow errors.
- All route handlers should use the same error formatting path.

Add tests for AppError mapping, unknown errors, request IDs and redaction behavior. Run lint/typecheck/tests and report exact outcomes.
```

## Prompt 3 — Authentication, sessions and admin provisioning

```text
Implement Phase 3 only: authentication and authorization.

Read the project brief, database design and security conventions.

Implement server API endpoints for:
- POST /api/auth/register
- POST /api/auth/sign-in
- POST /api/auth/sign-out
- GET /api/auth/session

Use Supabase Auth from server-side code only. Use @supabase/ssr and secure cookie/session handling. Never return access or refresh tokens in JSON.

Requirements:
- Registration schema validates name, email and password.
- Public registration always creates a customer; ignore/reject any role or role_id supplied by a client.
- Create/synchronize the profile safely.
- Sign-in/register endpoints use the shared rate limiter.
- Add getCurrentUser, requireAuthenticatedUser and requireAdmin helpers.
- Resolve role from the database using the authenticated user's ID.
- Admin pages may redirect for usability, but every admin API/service must enforce requireAdmin.
- Create a secure manual admin provisioning runbook and, only if required, a narrowly scoped server-only provisioning command/function. Do not add an admin signup page or public admin endpoint.
- Protect account and admin route groups.
- Handle expired/invalid sessions safely.

Do not implement product features yet. Add tests proving guest/customer/admin behavior and that registration cannot elevate role. Search the whole repo for Supabase imports and verify they exist only in src/server. Run checks and report results.
```

## Prompt 4 — Public catalog APIs and infinite loading

```text
Implement Phase 4 only: public category and product read APIs.

Create GET endpoints for categories and products, plus product detail by ID or slug. Follow Route Handler → Controller → Service → Repository.

Requirements:
- Zod-validate query strings, category filters, page/cursor and limit.
- Server-side pagination with stable ordering. Do not return the entire catalog.
- Search is performed by the database query, not by downloading all products.
- Return a consistent paginated response with items, hasMore and nextCursor/page.
- Only active products and active categories are public.
- Do not reveal internal admin-only fields.
- Add TanStack Query hooks using fetch('/api/...') only.
- Add a debounced search input and an infinite list/load-more UI.
- Include loading, empty, retry and error states.
- Client hooks/components must not import Supabase or server modules.
- Avoid unnecessary abstractions and dependencies.

Add tests for query validation, inactive item filtering and pagination. Verify no Supabase access exists in browser code. Run checks.
```

## Prompt 5 — Admin product and category CRUD

```text
Implement Phase 5 only: admin catalog management.

Build admin APIs and simple dashboard pages for product/category create, read, update and archive.

Requirements:
- Every mutation requires requireAdmin in the service layer; do not rely on page protection.
- Zod schemas validate all path/body fields.
- Validate non-negative integer prices/stock, currency format, category existence, slug uniqueness and text lengths.
- Never accept role, owner, stock adjustment or privileged flags from untrusted input without explicit rules.
- Prefer archive/deactivate over hard delete for products referenced by orders.
- Return safe, consistent errors through the unified handler.
- Build straightforward admin forms and tables; keep UI consistent and accessible.
- Use TanStack Query and invalidate affected product/category queries after mutations.
- Image upload is deferred to Phase 9.
- Do not use service-role client as a shortcut.

Test admin success, customer/guest forbidden, validation failures, duplicate slug and archive behavior. Run lint/typecheck/tests.
```

## Prompt 6 — Storefront and local cart

```text
Implement Phase 6 only: customer storefront and cart.

Build a clean responsive storefront with:
- Home/catalog page
- Category browsing/filtering
- Product cards and detail page
- Debounced search and infinite product list
- Cart drawer/page with quantity updates and removal

Use TanStack Query for server data. Use Zustand with local persistence for cart IDs and quantities. The cart may keep display snapshots, but those snapshots are not authoritative.

Rules:
- No Supabase import or direct Supabase access in any client component, hook or store.
- Do not calculate authoritative checkout totals in the browser.
- Handle products that become inactive or unavailable after being added.
- Include loading, empty, error and not-found states.
- Use semantic HTML, keyboard-friendly controls and responsive layouts.
- Keep design simple; do not add animation/UI dependencies without a clear need.

Test cart state behavior and basic storefront navigation. Run checks.
```

## Prompt 7 — Checkout, COD orders and order history

```text
Implement Phase 7 only: checkout and orders. This is security- and data-integrity-sensitive.

Read docs/02_DATABASE_DESIGN.md carefully.

Implement:
- Customer address selection/entry
- POST /api/checkout
- Atomic database checkout transaction/function
- Customer GET /api/orders and GET /api/orders/:id
- Admin order list/detail and status update endpoint

Checkout requirements:
- Require authenticated customer.
- Accept product IDs and quantities, address reference or validated address snapshot, and idempotency key.
- Do NOT accept client price, subtotal, delivery fee, total, stock, user ID, role, payment status or initial order status as authoritative.
- Reload current active products and prices from the database.
- Validate quantities and stock.
- Calculate all totals on the server using integer minor units.
- Read delivery fee/minimum order from store settings.
- Create order and item snapshots atomically.
- Decrement stock without overselling under concurrent requests.
- Make retries idempotent so duplicate requests do not create duplicate orders.
- Payment method is cash_on_delivery only.
- Do not integrate an online payment provider.

Order requirements:
- Customer can read only own orders and items.
- Admin can read all orders.
- Admin status changes must follow the allowed transition map in a service.
- Customer cannot set or update order status.
- Use unified error formatting and safe structured logs.

Add tests for tampered totals, unavailable products, insufficient stock, duplicate idempotency key, ownership, status transitions and concurrent/transactional behavior where test infrastructure permits. If atomicity cannot be guaranteed, do not present checkout as production-safe; explain the limitation.
```

## Prompt 8 — Profile, addresses and store settings

```text
Implement Phase 8 only.

Add customer profile/address management and admin store settings.

Requirements:
- Customer can view/update only their own profile fields and addresses.
- Customer cannot change role or account privileges.
- Admin can update store name, contact details, currency, delivery fee and minimum order.
- Settings are validated server-side with Zod.
- Checkout uses current database settings, not client copies.
- Public storefront may read only the safe public subset of settings.
- Add a simple dashboard summary using existing data only; avoid complex analytics.
- Use API fetch + TanStack Query; no client Supabase.
- Use the unified error formatter and logger.

Add authorization and validation tests. Run all checks.
```

## Prompt 9 — Images, security hardening and end-to-end tests

```text
Implement Phase 9 only: media uploads, tests and hardening.

Image uploads:
- Use Supabase Storage or S3, but choose one and explain why. Keep storage access server-controlled.
- Validate file size, MIME type and extension; do not trust browser MIME alone.
- Use generated object paths; prevent path traversal and overwriting unrelated objects.
- Restrict upload operations to admins.
- Store only object path/metadata in the database.
- Do not expose service-role credentials or broad write permissions.

Testing:
- Unit tests for validators/services.
- API tests for auth, role checks, ownership, error responses and product CRUD.
- Playwright smoke test: browse catalog → add to cart → submit COD order → view order.
- Admin smoke test: sign in as admin → create/edit/archive product → update order status.
- Include empty/loading/error UI checks where practical.

Security:
- Search for all Supabase imports and prove they are server-only.
- Search for service-role and secret references in client bundle/source.
- Verify RLS policies.
- Verify rate limiting and request ID logging.
- Run dependency audit and review findings; do not blindly apply breaking upgrades.
- Run lint, typecheck, tests and production build.

Do not claim a security property is verified unless an automated test or explicit inspection supports it. Report remaining risks.
```

## Prompt 10 — Deployment and final handover

```text
Implement Phase 10 only: deployment readiness and handover.

Prepare the Next.js application for a Node.js-compatible production host. If AWS is selected, document an appropriate Node hosting option (such as ECS or App Runner) and optional S3 media storage. Do not use static-only S3 hosting for this server-rendered/API application.

Tasks:
- Production environment variable checklist.
- Supabase production project setup and migration deployment steps.
- Build/start configuration for Node hosting.
- HTTPS, secure cookie and trusted-origin configuration.
- Health check and structured log configuration.
- Database backup/restore and rollback notes.
- Admin provisioning procedure.
- Domain/DNS and storage setup notes.
- Final README with local development, tests, migrations, deployment and troubleshooting.

Run production build, lint, typecheck and tests. Do not deploy or change real cloud resources without explicit authorization. Finish with architecture overview, commands, environment variable names, test results, security checks and known limitations.
```

## Final audit prompt — Run after all phases

```text
Perform a read-only architecture and security audit of the completed app. Do not make changes until you have produced findings.

Check:
1. Supabase SDK/client/query imports occur only in server-only modules.
2. No browser code can access Supabase directly.
3. No service-role key or secret is included in NEXT_PUBLIC variables or client bundles.
4. Every admin API/service checks admin authorization.
5. Registration cannot create or promote an admin.
6. RLS is enabled and policies match public/customer/admin access.
7. All incoming API data is Zod-validated.
8. Errors use one formatter and never leak stack traces/database internals.
9. Logs redact secrets and personal data.
10. Rate limiting is applied to authentication and sensitive endpoints.
11. Checkout calculates prices on the server and is atomic/idempotent.
12. Customers can access only their own orders/addresses.
13. Product pagination is server-side and stable.
14. Zustand contains only client state; TanStack Query contains server state.
15. No driver or multi-store features were added.

Return a severity-ranked report with file paths and evidence. Then propose the smallest safe fixes. Wait for approval before applying broad refactors.
```
