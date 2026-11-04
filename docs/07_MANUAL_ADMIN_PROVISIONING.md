# 07 — Manual Admin Provisioning Runbook

There is no public admin registration endpoint or admin signup form.

Recommended first-admin procedure:
1. A trusted project owner creates the account using the Supabase Auth dashboard or a controlled administrative operation.
2. The owner verifies the identity through the intended process.
3. A privileged, server-only provisioning operation assigns the `admin` role in `profiles`.
4. The operation logs the actor, target user ID and timestamp without logging credentials or tokens.
5. The operator verifies the user can access the admin dashboard and that an ordinary customer cannot.

Implementation constraints:
- Never accept a target role from a public request.
- Never expose the service-role key to a browser or commit it.
- Do not create a general-purpose public "make admin" endpoint.
- Keep the privileged operation out of ordinary customer request flows.
- Prefer a one-off CLI/server-side administrative script or a tightly controlled operator-only function.
- Document who can run it and how to revoke admin access.

The exact implementation should be chosen in Phase 3 and reviewed before production use.
