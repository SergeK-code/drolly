# Server modules

This directory is the only place that may talk to Supabase.

Rules:

- Import `@supabase/ssr` and `@supabase/supabase-js` only under `src/server/**`.
- Add `import 'server-only'` to modules that must never enter a client bundle.
- Do not create a browser Supabase client (`createBrowserClient`).
- Do not import these modules from Client Components, hooks, Zustand stores or `src/features`.
- The browser calls `/api/**` only.

Request flow: Route Handler → controller → service → repository → `createSupabaseServerClient()`.

Every Route Handler should use `apiHandler` so errors share one formatter and a request ID.
