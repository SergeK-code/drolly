-- Drolly MVP schema: lookup tables, catalog, customers, orders, RLS.
-- Money is integer minor units (e.g. cents) plus a 3-letter currency code.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Lookup: application roles (never accept a role from public registration)
-- ---------------------------------------------------------------------------

create table public.app_roles (
  id smallint primary key,
  code text not null unique,
  name text not null
);

insert into public.app_roles (id, code, name)
values
  (1, 'customer', 'Customer'),
  (2, 'admin', 'Admin');

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role_id smallint not null references public.app_roles (id),
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_id_idx on public.profiles (role_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Always create a customer profile for a new Auth user.
-- Public clients cannot choose a role here.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_role_id smallint;
begin
  select id into strict customer_role_id
  from public.app_roles
  where code = 'customer';

  insert into public.profiles (id, role_id, full_name)
  values (
    new.id,
    customer_role_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Authenticated sessions cannot set or change role_id.
-- Service-role / SQL editor (no auth.uid()) may provision an admin.
create or replace function public.enforce_profile_role_rules()
returns trigger
language plpgsql
as $$
declare
  customer_role_id smallint;
begin
  select id into strict customer_role_id
  from public.app_roles
  where code = 'customer';

  if tg_op = 'INSERT' then
    if auth.uid() is not null then
      new.id := auth.uid();
      new.role_id := customer_role_id;
    elsif new.role_id is null then
      new.role_id := customer_role_id;
    end if;
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'Profile id cannot be changed';
  end if;

  if new.role_id is distinct from old.role_id and auth.uid() is not null then
    raise exception 'Role can only be changed by a privileged operator';
  end if;

  return new;
end;
$$;

create trigger profiles_enforce_role_rules
before insert or update on public.profiles
for each row
execute function public.enforce_profile_role_rules();

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_sort_order_non_negative check (sort_order >= 0)
);

create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  sku text unique,
  price_minor integer not null,
  currency char(3) not null,
  stock_quantity integer not null default 0,
  image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_non_negative check (price_minor >= 0),
  constraint products_stock_non_negative check (stock_quantity >= 0),
  constraint products_currency_format check (currency ~ '^[A-Z]{3}$')
);

create index products_category_id_idx on public.products (category_id);
create index products_active_created_idx on public.products (created_at desc, id desc)
  where is_active = true;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Customer addresses (at most one default per user)
-- ---------------------------------------------------------------------------

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  area text not null,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customer_addresses_user_id_idx on public.customer_addresses (user_id);

create unique index customer_addresses_one_default_idx
  on public.customer_addresses (user_id)
  where is_default;

create trigger customer_addresses_set_updated_at
before update on public.customer_addresses
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table public.order_statuses (
  id smallint primary key,
  code text not null unique,
  name text not null,
  sort_order integer not null,
  constraint order_statuses_sort_order_non_negative check (sort_order >= 0)
);

insert into public.order_statuses (id, code, name, sort_order)
values
  (1, 'pending', 'Pending', 10),
  (2, 'confirmed', 'Confirmed', 20),
  (3, 'preparing', 'Preparing', 30),
  (4, 'out_for_delivery', 'Out for delivery', 40),
  (5, 'delivered', 'Delivered', 50),
  (6, 'cancelled', 'Cancelled', 60);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles (id) on delete restrict,
  status_id smallint not null references public.order_statuses (id),
  recipient_name text not null,
  phone text not null,
  delivery_address text not null,
  delivery_notes text,
  subtotal_minor integer not null,
  delivery_fee_minor integer not null,
  total_minor integer not null,
  currency char(3) not null,
  payment_method text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_subtotal_non_negative check (subtotal_minor >= 0),
  constraint orders_delivery_fee_non_negative check (delivery_fee_minor >= 0),
  constraint orders_total_non_negative check (total_minor >= 0),
  constraint orders_total_matches_parts check (total_minor = subtotal_minor + delivery_fee_minor),
  constraint orders_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint orders_payment_method_cod check (payment_method = 'cash_on_delivery')
);

create index orders_user_id_created_idx on public.orders (user_id, created_at desc);
create index orders_status_id_idx on public.orders (status_id);

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  sku text,
  unit_price_minor integer not null,
  quantity integer not null,
  line_total_minor integer not null,
  constraint order_items_unit_price_non_negative check (unit_price_minor >= 0),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_line_total_non_negative check (line_total_minor >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- Single-store settings
-- ---------------------------------------------------------------------------

create table public.store_settings (
  id smallint primary key,
  store_name text not null,
  contact_phone text,
  contact_email text,
  currency char(3) not null,
  delivery_fee_minor integer not null,
  minimum_order_minor integer not null,
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id = 1),
  constraint store_settings_delivery_fee_non_negative check (delivery_fee_minor >= 0),
  constraint store_settings_minimum_order_non_negative check (minimum_order_minor >= 0),
  constraint store_settings_currency_format check (currency ~ '^[A-Z]{3}$')
);

create trigger store_settings_set_updated_at
before update on public.store_settings
for each row
execute function public.set_updated_at();

insert into public.store_settings (
  id,
  store_name,
  currency,
  delivery_fee_minor,
  minimum_order_minor
) values (1, 'Drolly', 'USD', 0, 0);

-- ---------------------------------------------------------------------------
-- Trusted admin check (SECURITY DEFINER so it can read profiles under RLS)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles as profiles
    inner join public.app_roles as app_roles
      on app_roles.id = profiles.role_id
    where profiles.id = auth.uid()
      and app_roles.code = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

revoke all on function public.handle_new_user() from public;
revoke all on function public.enforce_profile_role_rules() from public;
revoke all on function public.set_updated_at() from public;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.app_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.order_statuses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;

-- Lookup tables: readable, not writable by ordinary users.
create policy app_roles_select_authenticated
  on public.app_roles
  for select
  to authenticated
  using (true);

create policy order_statuses_select_authenticated
  on public.order_statuses
  for select
  to authenticated
  using (true);

-- Profiles: own row, or admin read/update. Role changes are blocked by trigger.
create policy profiles_select_own_or_admin
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_insert_self_customer
  on public.profiles
  for insert
  to authenticated
  with check (
    id = auth.uid()
    and role_id = (select id from public.app_roles where code = 'customer')
  );

create policy profiles_update_own_or_admin
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Catalog: public sees active items only; admins manage all rows.
create policy categories_select_active_or_admin
  on public.categories
  for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

create policy categories_insert_admin
  on public.categories
  for insert
  to authenticated
  with check (public.is_admin());

create policy categories_update_admin
  on public.categories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy categories_delete_admin
  on public.categories
  for delete
  to authenticated
  using (public.is_admin());

create policy products_select_active_or_admin
  on public.products
  for select
  to anon, authenticated
  using (
    public.is_admin()
    or (
      is_active = true
      and exists (
        select 1
        from public.categories as categories
        where categories.id = products.category_id
          and categories.is_active = true
      )
    )
  );

create policy products_insert_admin
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

create policy products_update_admin
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy products_delete_admin
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- Addresses: owner only.
create policy customer_addresses_select_own
  on public.customer_addresses
  for select
  to authenticated
  using (user_id = auth.uid());

create policy customer_addresses_insert_own
  on public.customer_addresses
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy customer_addresses_update_own
  on public.customer_addresses
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy customer_addresses_delete_own
  on public.customer_addresses
  for delete
  to authenticated
  using (user_id = auth.uid());

-- Orders: customers read their own rows. Inserts happen later via a
-- server-side checkout function, not a customer INSERT policy.
create policy orders_select_own_or_admin
  on public.orders
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy orders_update_admin
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy order_items_select_own_or_admin
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders as orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

-- Store settings: anyone may read the singleton; only admin may update it.
create policy store_settings_select_public
  on public.store_settings
  for select
  to anon, authenticated
  using (true);

create policy store_settings_update_admin
  on public.store_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
