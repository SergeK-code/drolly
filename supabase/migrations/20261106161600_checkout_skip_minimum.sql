-- Keep store_settings.minimum_order_minor stored, but do not enforce it at checkout.

create or replace function public.place_cod_order(
  p_idempotency_key uuid,
  p_items jsonb,
  p_address_id uuid default null,
  p_address jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_is_customer boolean;
  v_existing uuid;
  v_recipient text;
  v_phone text;
  v_address_line text;
  v_area text;
  v_notes text;
  v_delivery_address text;
  v_subtotal integer := 0;
  v_delivery_fee integer;
  v_currency char(3);
  v_order_id uuid;
  v_order_number text;
  v_line record;
  v_product record;
  v_quantity integer;
  v_ids uuid[];
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'CHECKOUT_UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || ':' || p_idempotency_key::text, 0)
  );

  select exists (
    select 1
    from public.profiles as profiles
    inner join public.app_roles as app_roles
      on app_roles.id = profiles.role_id
    where profiles.id = v_user_id
      and app_roles.code = 'customer'
  )
  into v_is_customer;

  if not v_is_customer then
    raise exception 'CHECKOUT_FORBIDDEN' using errcode = 'P0001';
  end if;

  select checkout_attempts.order_id
  into v_existing
  from public.checkout_attempts
  where checkout_attempts.user_id = v_user_id
    and checkout_attempts.idempotency_key = p_idempotency_key;

  if v_existing is not null then
    return v_existing;
  end if;

  if p_idempotency_key is null then
    raise exception 'CHECKOUT_VALIDATION' using errcode = 'P0001';
  end if;

  if (p_address_id is null and p_address is null)
     or (p_address_id is not null and p_address is not null) then
    raise exception 'CHECKOUT_ADDRESS' using errcode = 'P0001';
  end if;

  if p_address_id is not null then
    select
      customer_addresses.recipient_name,
      customer_addresses.phone,
      customer_addresses.address_line,
      customer_addresses.area,
      customer_addresses.notes
    into v_recipient, v_phone, v_address_line, v_area, v_notes
    from public.customer_addresses
    where customer_addresses.id = p_address_id
      and customer_addresses.user_id = v_user_id;

    if v_recipient is null then
      raise exception 'CHECKOUT_ADDRESS' using errcode = 'P0001';
    end if;
  else
    v_recipient := nullif(btrim(p_address ->> 'recipient_name'), '');
    v_phone := nullif(btrim(p_address ->> 'phone'), '');
    v_address_line := nullif(btrim(p_address ->> 'address_line'), '');
    v_area := nullif(btrim(p_address ->> 'area'), '');
    v_notes := nullif(btrim(p_address ->> 'notes'), '');

    if v_recipient is null or v_phone is null or v_address_line is null or v_area is null then
      raise exception 'CHECKOUT_ADDRESS' using errcode = 'P0001';
    end if;
  end if;

  v_delivery_address := v_address_line || ', ' || v_area;

  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 50 then
    raise exception 'CHECKOUT_EMPTY' using errcode = 'P0001';
  end if;

  drop table if exists checkout_lines;
  create temporary table checkout_lines (
    product_id uuid primary key,
    quantity integer not null
  ) on commit drop;

  begin
    insert into checkout_lines (product_id, quantity)
    select
      lines.product_id,
      lines.quantity
    from jsonb_to_recordset(p_items) as lines(product_id uuid, quantity integer);
  exception
    when unique_violation or invalid_text_representation or not_null_violation then
      raise exception 'CHECKOUT_VALIDATION' using errcode = 'P0001';
  end;

  if exists (
    select 1
    from checkout_lines
    where quantity is null or quantity < 1 or quantity > 99
  ) then
    raise exception 'CHECKOUT_VALIDATION' using errcode = 'P0001';
  end if;

  select array_agg(checkout_lines.product_id order by checkout_lines.product_id)
  into v_ids
  from checkout_lines;

  select
    store_settings.delivery_fee_minor,
    store_settings.currency
  into v_delivery_fee, v_currency
  from public.store_settings
  where store_settings.id = 1
  for update;

  if v_currency is null then
    raise exception 'CHECKOUT_VALIDATION' using errcode = 'P0001';
  end if;

  for v_product in
    select
      products.id,
      products.name,
      products.sku,
      products.price_minor,
      products.currency,
      products.stock_quantity,
      products.is_active,
      categories.is_active as category_is_active
    from public.products
    inner join public.categories
      on categories.id = products.category_id
    where products.id = any (v_ids)
    order by products.id
    for update of products
  loop
    select checkout_lines.quantity
    into v_quantity
    from checkout_lines
    where checkout_lines.product_id = v_product.id;

    if not v_product.is_active or not v_product.category_is_active then
      raise exception 'CHECKOUT_UNAVAILABLE' using errcode = 'P0001';
    end if;

    if v_product.currency is distinct from v_currency then
      raise exception 'CHECKOUT_CURRENCY' using errcode = 'P0001';
    end if;

    if v_product.stock_quantity < v_quantity then
      raise exception 'CHECKOUT_STOCK' using errcode = 'P0001';
    end if;

    v_subtotal := v_subtotal + (v_product.price_minor * v_quantity);
  end loop;

  if (select count(*) from checkout_lines) is distinct from (
    select count(*) from public.products where products.id = any (v_ids)
  ) then
    raise exception 'CHECKOUT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  v_order_number := 'D-' || lpad(nextval('public.order_number_seq')::text, 8, '0');

  insert into public.orders (
    order_number,
    user_id,
    status_id,
    recipient_name,
    phone,
    delivery_address,
    delivery_notes,
    subtotal_minor,
    delivery_fee_minor,
    total_minor,
    currency,
    payment_method
  )
  values (
    v_order_number,
    v_user_id,
    1,
    v_recipient,
    v_phone,
    v_delivery_address,
    v_notes,
    v_subtotal,
    v_delivery_fee,
    v_subtotal + v_delivery_fee,
    v_currency,
    'cash_on_delivery'
  )
  returning orders.id into v_order_id;

  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    sku,
    unit_price_minor,
    quantity,
    line_total_minor
  )
  select
    v_order_id,
    products.id,
    products.name,
    products.sku,
    products.price_minor,
    checkout_lines.quantity,
    products.price_minor * checkout_lines.quantity
  from checkout_lines
  inner join public.products on products.id = checkout_lines.product_id;

  for v_line in
    select checkout_lines.product_id, checkout_lines.quantity
    from checkout_lines
    order by checkout_lines.product_id
  loop
    update public.products
    set stock_quantity = products.stock_quantity - v_line.quantity
    where products.id = v_line.product_id
      and products.stock_quantity >= v_line.quantity;

    if not found then
      raise exception 'CHECKOUT_STOCK' using errcode = 'P0001';
    end if;
  end loop;

  insert into public.checkout_attempts (user_id, idempotency_key, order_id)
  values (v_user_id, p_idempotency_key, v_order_id);

  return v_order_id;
end;
$$;

revoke all on function public.place_cod_order(uuid, jsonb, uuid, jsonb) from public;
grant execute on function public.place_cod_order(uuid, jsonb, uuid, jsonb) to authenticated;
