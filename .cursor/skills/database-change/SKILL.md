# Skill: Safe Supabase database change

1. Read `docs/02_DATABASE_DESIGN.md`.
2. Create a new timestamped migration; do not rewrite an already-applied migration.
3. Add constraints, foreign keys and indexes deliberately.
4. Enable RLS and write policies in the same migration for new application tables.
5. Consider how existing rows are backfilled before adding NOT NULL constraints.
6. Avoid destructive operations unless explicitly approved and a backup/rollback plan exists.
7. Update generated database types after migration.
8. Update schema documentation and relevant tests.
9. Run local migration reset/apply and RLS tests when the environment supports it.
10. Report whether checks were executed or only reviewed statically.

Never disable RLS to make the application work. Never make the service-role key the default solution.
