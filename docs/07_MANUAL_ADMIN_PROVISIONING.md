# 07 — Manual Admin Provisioning Runbook

There is no public admin registration endpoint or admin signup form. Public
`POST /api/auth/register` always creates a **customer**.

## Who can run this

Only a trusted project owner with access to the Supabase SQL editor (or another
operator connection where `auth.uid()` is null). Do not give this to ordinary
admins through the storefront.

## Promote a user

1. The person registers normally (customer) or you create them in Authentication.
2. Confirm the Auth user id (`auth.users.id` / `profiles.id`).
3. In the SQL editor, run:

```sql
update public.profiles
set role_id = (select id from public.app_roles where code = 'admin')
where id = '<auth-user-uuid>';
```

The `profiles` trigger allows this because the SQL editor has no `auth.uid()`.
A logged-in customer or admin **cannot** change `role_id` through the API.

4. Log (outside the app) who ran it, the target user id, and the time. Do not
   log passwords or tokens.
5. Sign in as that user and open `/admin`. Sign in as a customer and confirm
   `/admin` redirects away and `GET /api/admin/me` returns 403.

## Revoke admin

```sql
update public.profiles
set role_id = (select id from public.app_roles where code = 'customer')
where id = '<auth-user-uuid>';
```

Then ask the person to sign out and sign in again.

## Constraints

- Never accept a target role from a public request.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit it.
- Do not add a “make admin” API or signup page.
- Do not use the service-role key for ordinary register/sign-in.
