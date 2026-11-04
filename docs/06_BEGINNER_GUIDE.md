# 06 — Beginner-Friendly Development Guide

## 1. Understand the architecture in one minute

The browser displays pages and collects user input. When it needs data, it sends an HTTP request to our Next.js API. The API validates the request, checks who the user is, applies business rules and then talks to Supabase from the server.

The browser does **not** talk to Supabase.

```text
React page → fetch('/api/products') → Route Handler
           → Controller → Service → Repository → Supabase
```

This is easy to explain:
- Route = receives the HTTP request.
- Controller = coordinates the request.
- Service = decides what the application is allowed to do.
- Repository = reads/writes the database.

## 2. Why Next.js instead of a separate Express app?

Next.js supports both React pages and server-side Route Handlers. Route Handlers provide the backend API, so the project can demonstrate Node.js backend concepts without maintaining two applications.

If the course explicitly requires a separately deployed Express server, confirm that with the instructor. Otherwise, Next.js Route Handlers are a reasonable Node.js backend approach.

## 3. Why Supabase only on the server?

A browser is controlled by the user. Users can inspect requests, modify values and run their own scripts. Therefore:
- Never let the browser decide prices, roles or order totals.
- Never put privileged credentials in browser code.
- Let the server verify the session and permissions.
- Let PostgreSQL RLS provide another access-control layer.

The public anon key is designed to be used with RLS in many Supabase applications, but this project deliberately keeps even ordinary Supabase SDK calls server-side to make the trust boundary easier to understand and audit.

## 4. React Query vs Zustand

**TanStack Query** is for data that comes from the server:
- Products
- Categories
- Orders
- Store settings

It handles fetching, caching, loading, errors and invalidation.

**Zustand** is for state the user is changing locally:
- Cart product IDs and quantities
- Whether the cart drawer is open

Do not use Zustand as a second cache for all database data.

## 5. What is a migration?

A migration is a versioned SQL change to the database. For example:
- Migration 001 creates roles and profiles.
- Migration 002 creates categories and products.
- Migration 003 adds orders and order items.

The migration files are the record of how the database is built. Commit them to Git. Do not make undocumented manual production changes.

## 6. What is RLS?

Row Level Security is a PostgreSQL feature that limits which rows a database request can access. For example, a customer should only read orders where `orders.user_id` equals their authenticated user ID.

RLS is defense in depth. The API must still check permissions and business rules.

## 7. What is an idempotency key?

It is a unique identifier for one checkout attempt. If the network retries the same request, the server recognizes that it already processed that attempt and returns the existing result instead of creating a second order.

## 8. Recommended local workflow

1. Install Node.js LTS and Git.
2. Create a Supabase project or run Supabase locally with the CLI.
3. Copy `.env.example` to `.env.local` and fill values.
4. Run migrations.
5. Start Next.js.
6. Complete one Cursor phase.
7. Inspect the diff; do not accept large unrelated refactors.
8. Run lint, typecheck and tests.
9. Test the feature manually using guest, customer and admin accounts.
10. Commit the working phase before continuing.

## 9. Course demonstration checklist

Be ready to explain:
- Why Route Handlers are the backend entry point.
- How controller/service/repository responsibilities differ.
- How Supabase credentials and SDK access are kept server-side.
- How authentication differs from authorization.
- How RLS protects database rows.
- How Zod validates incoming data.
- How the centralized error handler creates consistent responses.
- How structured logs help debugging.
- Why React Query and Zustand have different jobs.
- Why checkout totals are recalculated on the server.
