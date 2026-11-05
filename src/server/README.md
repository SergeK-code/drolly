# Server modules

This directory is the only place that may talk to Supabase.

Rules:

- Import `@supabase/ssr` and `@supabase/supabase-js` only under `src/server/**`.
- Add `import 'server-only'` to modules that must never enter a client bundle.
- Do not create a browser Supabase client (`createBrowserClient`).
- Do not import these modules from Client Components, hooks, Zustand stores or `src/features`.
- The browser calls `/api/**` only.

Request flow: Route Handler → controller → service → repository → `createSupabaseServerClient()`.

Auth and page protection live in `src/server/auth/protect.tsx`. Admin APIs must call `requireAdminFromSession`, not only hide UI.

Every Route Handler should use `apiHandler` from `src/server/http/api.ts` so errors share one formatter and a request ID.
