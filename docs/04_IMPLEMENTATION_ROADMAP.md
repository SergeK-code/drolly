# 04 — Phase-by-Phase Implementation Roadmap

Complete phases in order. Each phase ends with a working, verified checkpoint. Do not ask Cursor to implement the whole app in one prompt.

## Phase 0 — Project bootstrap

**Purpose:** Create a clean Next.js TypeScript app and install only necessary dependencies.

**Features/tasks**
- Next.js App Router, TypeScript, ESLint, Tailwind
- Supabase CLI setup
- Zod, `@supabase/ssr`, Supabase JS (server use only), TanStack Query, Zustand, Pino, Vitest
- Folder skeleton and environment validation
- Add `.cursor/rules` and skills from this pack
- Add scripts for lint, typecheck, test

**Acceptance**
- App runs locally.
- TypeScript/lint pass.
- No secrets committed.
- No browser Supabase client exists.

## Phase 1 — Database foundation

**Purpose:** Create the smallest complete data model.

**Features/tasks**
- Migrations for roles, profiles, categories, products, addresses, statuses, orders, order items, store settings
- Foreign keys, constraints, indexes, seed lookup rows and one settings row
- RLS enabled and policies added
- Supabase generated TypeScript database types
- Document migration/reset workflow

**Acceptance**
- Fresh local database can be reset and migrated.
- Constraints reject negative prices/stock and invalid references.
- RLS tests verify public/customer/admin boundaries.

## Phase 2 — Backend foundation

**Purpose:** Establish the course-friendly backend structure before feature work.

**Features/tasks**
- Server-only Supabase client(s)
- Route → controller → service → repository pattern
- `AppError`, centralized formatter and response envelope
- Request ID and structured logger
- Zod environment validation
- Shared request parsing helpers
- Rate-limit abstraction
- Health endpoint without exposing secrets

**Acceptance**
- Sample endpoint follows all layers.
- Known and unknown errors return consistent safe JSON.
- Logs contain request ID but no sensitive values.
- Static checks confirm Supabase imports remain server-only.

## Phase 3 — Authentication and roles

**Purpose:** Secure customer accounts and administrator access.

**Features/tasks**
- Server API endpoints: register, sign-in, sign-out, current session
- Cookie/session handling with `@supabase/ssr`
- Customer profile creation; role assigned server-side as customer
- `requireAuthenticatedUser` and `requireAdmin`
- Manual admin provisioning procedure/function, not public registration
- Protected account/admin pages and API endpoints
- Rate-limit sign-in/register

**Acceptance**
- Guest cannot access account/admin APIs.
- Customer can access own account but not admin endpoints.
- Registration cannot set role.
- Admin provisioning works only through trusted operator procedure.
- Tokens never appear in browser JSON or logs.

## Phase 4 — Catalog read APIs

**Purpose:** Make the public store browseable.

**Features/tasks**
- Public category list/detail
- Public product list/detail
- Search, category filter, pagination
- Only active products/categories returned
- Zod query validation
- TanStack Query hooks and loading/empty/error states
- Debounced search and infinite loading

**Acceptance**
- No full catalog download.
- Pagination has stable ordering and no duplicate/missing items in normal test data.
- Search debounce works.
- Inactive catalog items are hidden.

## Phase 5 — Admin catalog management

**Purpose:** Allow admins to manage the catalog.

**Features/tasks**
- Admin product CRUD (archive rather than destructive delete where referenced)
- Admin category CRUD
- Server validation for all fields
- Admin-only authorization in services
- Slug uniqueness handling
- Optional image upload can wait until Phase 9

**Acceptance**
- Admin can create/update/archive products and categories.
- Customer and guest are rejected from mutations.
- Invalid price/stock/category rejected.
- Product list/detail caches invalidate after mutation.

## Phase 6 — Storefront and cart

**Purpose:** Build the customer shopping experience.

**Features/tasks**
- Responsive storefront pages
- Product cards/details/category pages
- Zustand cart with local persistence
- Quantity controls and cart totals for display only
- Cart clear/restore behavior
- Empty cart and unavailable product states

**Acceptance**
- Cart survives refresh.
- Cart contains IDs and quantities; client totals are display-only.
- Inactive/deleted products are handled gracefully.
- No Supabase access in client code.

## Phase 7 — Checkout and orders

**Purpose:** Create reliable COD orders.

**Features/tasks**
- Customer address form/selection
- Checkout API and service
- Atomic database checkout function/transaction
- Server recalculates all prices, subtotal, delivery fee and total
- Stock check/decrement without overselling
- Idempotency key
- COD-only payment method
- Customer order list/detail
- Admin order list/detail and allowed status transitions

**Acceptance**
- Client cannot manipulate price, total, stock or status.
- Duplicate request does not create duplicate order.
- Concurrent checkout cannot oversell.
- Customer sees only own orders.
- Admin can update only allowed status transitions.

## Phase 8 — Admin settings and account polish

**Purpose:** Finish basic store operations.

**Features/tasks**
- Store name/contact/currency/delivery fee/minimum order settings
- Admin settings form and API
- Customer profile/address management
- Basic dashboard summary from existing data (avoid complex analytics)

**Acceptance**
- Only admin can update settings.
- Checkout uses current server-side settings.
- Customer can only update own profile/address.

## Phase 9 — Images, tests and hardening

**Purpose:** Prepare a stable demonstration/release.

**Features/tasks**
- Product/category image upload through server-controlled flow
- Prefer signed upload/download URLs or server-controlled storage permissions
- Validate file type, size and ownership
- Unit tests for services/validators
- API tests for authz and error formatting
- Playwright smoke tests: browse → cart → COD order; admin catalog management
- Rate-limit deployment strategy documented
- Security scan, dependency audit and accessibility pass

**Acceptance**
- Upload cannot overwrite another user's/admin's arbitrary path.
- Core tests pass.
- No secrets or server modules in client bundle.
- Error/logging behavior is consistent.

## Phase 10 — Deployment and handover

**Purpose:** Deploy the Next.js Node app and document operation.

**Features/tasks**
- Production environment variables
- Supabase production project and migration deployment
- Node-compatible hosting (AWS ECS/App Runner or equivalent)
- Domain/HTTPS
- Optional S3 for media; do not put secrets in public assets
- Logging/health checks/backup and rollback notes
- README with setup, migrations, admin provisioning, deployment

**Acceptance**
- Production build passes.
- HTTPS and secure cookies work.
- No service key in client assets.
- Admin provisioning is documented and not public.
- Fresh developer can run the project using README.
