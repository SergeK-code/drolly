# 00 — Project Brief and Scope

## Product goal

Build a straightforward single-store online shop where customers can browse a catalog, add items to a cart, place a cash-on-delivery order, and view their orders. Administrators manage the catalog, orders and basic store information.

The project should be straightforward to demonstrate in a software engineering course. Each layer should have one clear responsibility and be easy to trace.

## Roles

| Role | Capabilities |
|---|---|
| Guest | Browse active categories/products, search, view product details, register/sign in |
| Customer | Guest capabilities plus manage own profile/address, checkout, view own orders |
| Admin | Manage products/categories, view and update orders, manage basic store settings |

No public admin registration. No driver role.

## MVP features

### Storefront
- Responsive home/catalog page
- Category filtering
- Product list and product details
- Debounced product search
- Server pagination; load more/infinite list
- Only active and available products are publicly visible

### Customer account
- Register and sign in through our own API endpoints
- Sign out
- View/update own basic profile
- Maintain a delivery address (keep MVP to one default address if desired)
- Secure session cookies

### Cart and checkout
- Add, remove and change quantities
- Persist cart locally for convenience
- Re-check product availability, price and stock on the server at checkout
- Cash on delivery only
- Show confirmation and order history

### Admin
- Protected dashboard
- Product create/read/update/archive (soft delete recommended)
- Category create/read/update/archive
- Order list and detail
- Update order status through allowed transitions
- Basic store settings (name, contact details, delivery fee, minimum order amount)

## Explicitly out of scope

- Multiple stores or marketplace seller accounts
- Driver accounts, driver app, driver dashboard, live GPS or tracking
- Online payments, card storage, payment gateway integration
- Coupons, loyalty points, reviews, chat, recommendations
- Microservices, event streaming, complex permissions framework
- Mobile app

## Course-friendly architecture mapping

| Course concept | Where it appears |
|---|---|
| Routing | Next.js pages and `src/app/api/**/route.ts` |
| Controller | `src/server/controllers/` |
| Service/business logic | `src/server/services/` |
| Data access | `src/server/repositories/` or server-only Supabase module |
| Database | Supabase PostgreSQL + migrations |
| Authentication | Supabase Auth, server-side session |
| Authorization | Server-side role check + RLS |
| Validation | Zod schemas |
| Error handling | `AppError` + centralized API formatter |
| Logging | Structured server logger |
| Client state | Zustand cart store |
| Server/API state | TanStack Query |
| Testing | Unit, API integration and end-to-end tests |

## Definition of done

A feature is complete only when:
- It works for the intended role.
- Server-side validation and authorization are present.
- Supabase access remains server-only.
- Loading, empty and error states are handled.
- Sensitive information is not logged or returned.
- Relevant tests pass.
- TypeScript and lint checks pass.
- The implementation is documented briefly.
