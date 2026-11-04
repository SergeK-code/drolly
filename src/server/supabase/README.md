# Server-only Supabase

`createSupabaseServerClient()` is the request-scoped client for Route Handlers and server services. It uses `@supabase/ssr` with Next.js cookies and the **anon** key so RLS applies.

`database.types.ts` describes the schema. Import this folder only from `src/server`.

There is **no** service-role client in this phase. Do not add one for ordinary queries. If Phase 3 needs a privileged admin-provisioning operation, put it in its own server-only module with a narrow export.

Not allowed:

- `createBrowserClient`
- Importing this folder (or any `@supabase/*` package) from Client Components, hooks, Zustand stores or client utilities
- Putting the service-role key in `NEXT_PUBLIC_*`
- Using the service-role key as a general RLS bypass
