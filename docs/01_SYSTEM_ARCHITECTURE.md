# 01 — System Architecture

## 1. Architectural style

Use a **modular monolith**. The Next.js application contains both the user interface and the backend API. It is one deployable application with clear internal layers.

Do not create a separate Express server. Next.js Route Handlers provide the HTTP API and make the Node.js backend requirement visible.

## 2. Request flow

```text
Customer/Admin browser
       |
       | HTTPS fetch('/api/...')
       v
Next.js Route Handler (HTTP boundary)
       |
       v
Controller (parse request, call use case, shape response)
       |
       v
Service (business rules and authorization)
       |
       v
Repository / server-only Supabase client
       |
       v
Supabase Auth + PostgreSQL
```

For server-rendered public pages, a Server Component may call a server service directly. It must still use server-only Supabase access. Do not make a server component call its own API over HTTP unnecessarily.

## 3. Suggested project structure

```text
src/
├── app/
│   ├── (storefront)/
│   │   ├── page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   └── categories/[slug]/page.tsx
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── account/
│   │   ├── page.tsx
│   │   └── orders/[id]/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── cart/       # optional server cart; MVP may keep cart local
│   │   ├── checkout/
│   │   ├── orders/
│   │   └── admin/
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── products/
│   ├── cart/
│   └── admin/
├── features/
│   ├── auth/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── orders/
│   └── store-settings/
├── server/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── supabase/
│   ├── auth/
│   ├── errors/
│   ├── http/
│   └── logging/
├── stores/
│   └── cart-store.ts
├── lib/
│   ├── env.ts
│   ├── validation/
│   └── utils/
└── types/
supabase/
└── migrations/
.cursor/
├── rules/
└── skills/
```

Keep the structure small. Do not create empty folders in advance. A feature can start with one service and one controller; add a repository only when it makes data access clearer or reusable.

## 4. Layer responsibilities

### Route Handler
- Defines HTTP method and URL.
- Reads path/query/body/cookies.
- Calls the matching controller.
- Returns a `NextResponse`.
- Does not contain business rules or SQL queries.

### Controller
- Validates the incoming request with the feature's Zod schema.
- Calls the service.
- Returns a consistent success response.
- Does not implement business rules.

### Service
- Implements business rules.
- Checks the current user and role where needed.
- Rejects invalid state transitions.
- Calculates authoritative totals and checks stock.
- Calls repositories.

### Repository
- Performs database reads/writes.
- Uses only server-only Supabase clients.
- Does not decide business policy.
- Maps database failures to safe internal errors where appropriate.

### Client feature code
- Calls `/api/...` with `fetch`.
- Uses TanStack Query for API data.
- Uses Zustand for cart and simple UI state.
- Never imports server modules or Supabase packages.

## 5. Supabase access boundary

Create a server-only Supabase client module using `@supabase/ssr` and Next.js cookies. Add `import 'server-only'` to server modules where supported.

There must be no `createBrowserClient`, no Supabase client in client components, and no Supabase package import in `src/stores`, `src/features/**/hooks`, or `src/components`.

Use a request-scoped authenticated client for normal user operations. Use Supabase Auth through server endpoints. Do not expose service-role credentials to the browser.

Prefer the authenticated user's session for normal database work so RLS applies. Use a service-role client only for a narrow, documented provisioning task if genuinely required. It must be isolated in a server-only module, never used as a general shortcut, and never be imported by ordinary request handlers.

## 6. Authentication and authorization

- Supabase Auth handles identity.
- API endpoints establish/refresh the session using secure, HTTP-only cookies.
- A server helper resolves the authenticated user.
- A server helper checks the user's database-backed role.
- Admin pages may redirect for UX, but every admin API/service must independently verify admin authorization.
- Never trust role values sent by the browser.
- RLS policies provide database-level defense in depth.

## 7. State management

| State | Owner |
|---|---|
| Product/category lists, product details, orders, settings | TanStack Query |
| Cart items and quantities | Zustand, persisted locally |
| Temporary UI state (drawer, selected tab) | Component state or small Zustand state |
| Authenticated identity and role | Server session; client receives only safe display data |
| Product prices, stock, order totals | Database/server only |

The cart may store product IDs and quantities, plus display snapshots for UI. At checkout, the server reloads authoritative price, active status and stock from the database.

## 8. Pagination and search

- Use server pagination with a stable ordering (e.g. `created_at DESC, id DESC`).
- Prefer cursor pagination when the dataset/order makes it practical; otherwise page/limit is acceptable for a course MVP.
- Validate `limit`, cursor/page, category and search query.
- Debounce search input in the client (about 300 ms); server still validates and parameterizes it.
- Do not fetch the full catalog and filter it in the browser.

## 9. Deployment shape

Deploy the Next.js app to a Node.js-compatible host. Supabase remains a managed backend. If using AWS, use an appropriate Node runtime such as ECS/App Runner; S3 can store uploaded product images. Do not export the app as static-only HTML because the server API and session handling are required.
