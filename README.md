# Drolly

Single-store e-commerce app for a software engineering course. Customers browse a catalog, keep a local cart, and place cash-on-delivery orders. Admins manage products, orders and store settings.

The browser never uses a Supabase client. UI code calls this app's `/api/**` routes. Only modules under `src/server` may import `@supabase/ssr` or `@supabase/supabase-js`.

## Setup

1. Copy environment placeholders and fill in local values. Do not commit `.env.local`.

   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies and start the app:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000). Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health). Without a configured database it returns `{ "success": true, "data": { "status": "degraded" } }` and never includes secrets.

4. Database (needs Docker): see [supabase/README.md](supabase/README.md).

   ```bash
   npm run db:start
   npm run db:reset
   npm run db:types
   ```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Next.js typegen + TypeScript (`tsc --noEmit`) |
| `npm test` | Vitest |
| `npm run db:start` | Local Supabase (Docker) |
| `npm run db:reset` | Reapply migrations |
| `npm run db:types` | Generate `src/server/supabase/database.types.ts` |

## Architecture notes

- Next.js App Router + TypeScript, with application code in `src/`.
- API flow: Route Handler → controller → service → repository → server-only Supabase.
- Errors use `AppError` and one formatter. Logs are JSON (Pino) with redaction. Request IDs are on responses as `x-request-id`.
- Auth rate limiting uses an in-memory limiter for local/single-process demos only. It is not shared across instances.
- TanStack Query for remote/API state; Zustand for cart and other client-owned UI state (added in later phases).
- Database schema and RLS live in `supabase/migrations/`. Types live in `src/server/supabase/database.types.ts`.
- Supabase URL and anon key are `SUPABASE_URL` and `SUPABASE_ANON_KEY` (server-only, not `NEXT_PUBLIC_`).
