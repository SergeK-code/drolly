# Server-only Supabase

`createSupabaseServerClient()` is the request-scoped client for Route Handlers and server services. It uses `@supabase/ssr` with Next.js cookies and the **anon** key so RLS applies.

`database.types.ts` describes the schema. Import this folder only from `src/server`.

There is **no** service-role client. Ordinary auth uses the request-scoped anon client. Admins are promoted with SQL, see `docs/07_MANUAL_ADMIN_PROVISIONING.md`.

Not allowed:

- `createBrowserClient`
- Importing this folder (or any `@supabase/*` package) from Client Components, hooks, Zustand stores or client utilities
- Putting the service-role key in `NEXT_PUBLIC_*`
- Using the service-role key as a general RLS bypass
