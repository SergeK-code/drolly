# 02 — Database Design (MVP)

Use Supabase PostgreSQL. SQL migration files under `supabase/migrations/` are the source of truth. Do not edit production schema manually as the normal workflow.

Use UUID primary keys, `timestamptz` timestamps, foreign keys, indexes and constraints. Store money as integer minor units (e.g. cents) plus an ISO currency code; never use floating-point money.

## Tables

### `app_roles`

| Field  | Type               | Purpose                                   |
| ------ | ------------------ | ----------------------------------------- |
| `id`   | smallint / UUID PK | Role identifier                           |
| `code` | unique text        | Stable code such as `customer` or `admin` |
| `name` | text               | Display label                             |

Seed only the required role rows. Do not accept a role from public registration.

### `profiles`

| Field                      | Type                           | Purpose                       |
| -------------------------- | ------------------------------ | ----------------------------- |
| `id`                       | UUID PK, FK to `auth.users.id` | Same ID as Supabase Auth user |
| `role_id`                  | FK `app_roles.id`              | Application role              |
| `full_name`                | text                           | Customer/admin display name   |
| `phone`                    | text nullable                  | Contact number                |
| `created_at`, `updated_at` | timestamptz                    | Audit timestamps              |

A newly registered user is always assigned `customer` on the server/database. The public request cannot set `role_id`.

### `categories`

| Field                      | Type          | Purpose                 |
| -------------------------- | ------------- | ----------------------- |
| `id`                       | UUID PK       | Category ID             |
| `name`                     | unique text   | Category title          |
| `slug`                     | unique text   | URL-friendly identifier |
| `description`              | text nullable | Optional description    |
| `image_path`               | text nullable | Storage object path     |
| `is_active`                | boolean       | Public visibility       |
| `sort_order`               | integer       | Display order           |
| `created_at`, `updated_at` | timestamptz   | Audit timestamps        |

### `products`

| Field                      | Type                  | Purpose                      |
| -------------------------- | --------------------- | ---------------------------- |
| `id`                       | UUID PK               | Product ID                   |
| `category_id`              | FK categories         | Category                     |
| `name`                     | text                  | Product name                 |
| `slug`                     | unique text           | URL-friendly identifier      |
| `description`              | text nullable         | Product details              |
| `sku`                      | text nullable, unique | Optional stock code          |
| `price_minor`              | integer               | Current price in minor units |
| `currency`                 | char(3)               | Currency code                |
| `stock_quantity`           | integer               | Available stock              |
| `image_path`               | text nullable         | Storage object path          |
| `is_active`                | boolean               | Public visibility            |
| `created_at`, `updated_at` | timestamptz           | Audit timestamps             |

Constraints: price and stock must be non-negative. Consider `CHECK (price_minor >= 0)` and `CHECK (stock_quantity >= 0)`.

### `customer_addresses`

| Field                      | Type          | Purpose                 |
| -------------------------- | ------------- | ----------------------- |
| `id`                       | UUID PK       | Address ID              |
| `user_id`                  | FK profiles   | Owner                   |
| `label`                    | text nullable | e.g. Home               |
| `recipient_name`           | text          | Receiver                |
| `phone`                    | text          | Contact phone           |
| `address_line`             | text          | Street/building details |
| `area`                     | text          | Area/city               |
| `notes`                    | text nullable | Delivery instructions   |
| `is_default`               | boolean       | Default address         |
| `created_at`, `updated_at` | timestamptz   | Timestamps              |

For a simple MVP, enforce at most one default address per user with a partial unique index or manage it transactionally.

### `order_statuses`

| Field        | Type               | Purpose                                                                                |
| ------------ | ------------------ | -------------------------------------------------------------------------------------- |
| `id`         | smallint / UUID PK | Status ID                                                                              |
| `code`       | unique text        | e.g. `pending`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled` |
| `name`       | text               | Display label                                                                          |
| `sort_order` | integer            | Display order                                                                          |

### `orders`

| Field                      | Type                  | Purpose                         |
| -------------------------- | --------------------- | ------------------------------- |
| `id`                       | UUID PK               | Order ID                        |
| `order_number`             | unique text           | Human-friendly reference        |
| `user_id`                  | FK profiles           | Customer                        |
| `status_id`                | FK order_statuses     | Current status                  |
| `recipient_name`           | text                  | Checkout snapshot               |
| `phone`                    | text                  | Checkout snapshot               |
| `delivery_address`         | text                  | Address snapshot                |
| `delivery_notes`           | text nullable         | Checkout notes                  |
| `subtotal_minor`           | integer               | Server-calculated subtotal      |
| `delivery_fee_minor`       | integer               | Server-calculated delivery fee  |
| `total_minor`              | integer               | Server-calculated total         |
| `currency`                 | char(3)               | Currency                        |
| `payment_method`           | text/check constraint | `cash_on_delivery` only for MVP |
| `created_at`, `updated_at` | timestamptz           | Timestamps                      |

Do not accept amounts or status from the client when creating an order.

### `order_items`

| Field              | Type                 | Purpose                      |
| ------------------ | -------------------- | ---------------------------- |
| `id`               | UUID PK              | Item ID                      |
| `order_id`         | FK orders            | Parent order                 |
| `product_id`       | FK products nullable | Original product if retained |
| `product_name`     | text                 | Historical name snapshot     |
| `sku`              | text nullable        | Historical SKU snapshot      |
| `unit_price_minor` | integer              | Historical unit price        |
| `quantity`         | integer              | Ordered quantity             |
| `line_total_minor` | integer              | Server-calculated line total |

Snapshots preserve what the customer ordered even if a product is later renamed or archived.

### `store_settings`

One row for the single store.
| Field | Type | Purpose |
|---|---|---|
| `id` | smallint PK | Fixed singleton key |
| `store_name` | text | Store display name |
| `contact_phone` | text nullable | Contact |
| `contact_email` | text nullable | Contact |
| `currency` | char(3) | Store currency |
| `delivery_fee_minor` | integer | Base delivery fee |
| `minimum_order_minor` | integer | Minimum order |
| `updated_at` | timestamptz | Last update |

## Relationships

```text
auth.users 1 ── 1 profiles ── N customer_addresses
app_roles  1 ── N profiles

categories 1 ── N products

profiles 1 ── N orders
order_statuses 1 ── N orders
orders 1 ── N order_items
products 1 ── N order_items (nullable historical reference)

store_settings: one singleton row
```

## Status values

Use lookup tables for roles and order statuses so the database has referential integrity and the app can display labels. The `code` is a stable machine identifier; do not create free-form status values.

Suggested order status codes: `pending`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`. Define allowed transitions in the service layer. Example: pending → confirmed/cancelled; confirmed → preparing/cancelled; preparing → out_for_delivery; out_for_delivery → delivered.

## Checkout transaction

Checkout must be atomic. Implement a PostgreSQL function/RPC or an equivalent carefully designed transaction that:

1. Receives authenticated customer identity, product IDs and quantities, address details/reference, and an idempotency key.
2. Verifies the caller is the customer (or otherwise securely derives the user ID from `auth.uid()`).
3. Loads current active products and prices from the database.
4. Checks quantities and available stock.
5. Calculates subtotal, delivery fee and total using integer arithmetic.
6. Checks the minimum order amount.
7. Inserts the order and order-item snapshots.
8. Decrements stock safely so two concurrent checkouts cannot oversell.
9. Records a unique idempotency key/result to prevent duplicate orders after retries.

The API must not accept a client-computed total as authoritative. If implementing the full atomic function is beyond the first course milestone, do not ship checkout until stock and order creation are transactionally safe.

## RLS policy intent

Enable RLS on all application tables.

- Public/anon: read active categories and active products only; read safe public store settings only.
- Customer: read/update own profile within allowed fields; manage own addresses; read own orders and order items.
- Admin: manage catalog, read/update orders and settings.
- Roles: users must not be able to change their own role. Admin role assignment is only through a trusted provisioning path.
- Lookup tables: allow necessary reads; block arbitrary writes from ordinary users.

RLS is not a replacement for service-layer authorization. Test policies using both customer and admin sessions.
