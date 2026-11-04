# Database (Supabase)

SQL migrations in `supabase/migrations/` are the source of truth. Do not change production schema by hand.

## Local reset (Docker required)

This machine needs Docker Desktop (or another Docker engine) for `supabase start`. The CLI is available via `npx supabase`.

```bash
npx supabase start
npx supabase db reset
```

`db reset` reapplies every migration, then `supabase/seed.sql`. Lookup roles, order statuses and the store settings row already live in the first migration.

After a successful start, copy the local API URL, anon key and service-role key into `.env.local` (names are in `.env.example`). Only `src/server` may read those values.

Regenerate TypeScript types:

```bash
npm run db:types
```

Stop local services:

```bash
npx supabase stop
```

## Applying to a hosted project

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Do not disable RLS. Do not use the service-role key as a general bypass.

## What is not in this phase

Checkout stock decrement / idempotency lives in Phase 7 as an atomic database function. Status transition rules live in the service layer (Phase 7), not as free-form status strings.
