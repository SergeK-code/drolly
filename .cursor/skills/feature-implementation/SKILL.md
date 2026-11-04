# Skill: Implement a feature using the project architecture

Use when adding a new API-backed feature.

1. Read the project brief and relevant schema/security docs.
2. Identify the HTTP contract and user role.
3. Define Zod input/output schemas.
4. Add or update repository methods in server-only code.
5. Implement business rules in a service.
6. Implement a controller that validates and calls the service.
7. Add a thin Route Handler that delegates to the controller and shared error handler.
8. Add client fetch functions and TanStack Query hooks only if the UI needs them.
9. Add UI loading, empty, error and success states.
10. Add tests for validation, authorization, business rules and failure paths.
11. Search to ensure no Supabase import escaped `src/server`.
12. Run lint, typecheck and tests.

Keep the implementation small. Do not add layers that do not improve clarity.
