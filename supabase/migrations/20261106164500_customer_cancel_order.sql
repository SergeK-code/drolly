-- Customers may cancel their own pending or confirmed orders.
-- Stock is restored in the same transaction.

create or replace function public.cancel_own_order(p_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_owner_id uuid;
  v_status_code text;
  v_cancelled_id smallint;
  v_line record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'ORDER_STATUS_UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  select order_statuses.id
  into v_cancelled_id
  from public.order_statuses
  where order_statuses.code = 'cancelled';

  if v_cancelled_id is null then
    raise exception 'ORDER_STATUS_VALIDATION' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_order_id::text, 0));

  select orders.user_id, order_statuses.code
  into v_owner_id, v_status_code
  from public.orders
  inner join public.order_statuses
    on order_statuses.id = orders.status_id
  where orders.id = p_order_id
  for update of orders;

  if not found then
    raise exception 'ORDER_STATUS_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_owner_id <> v_user_id then
    raise exception 'ORDER_STATUS_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_status_code not in ('pending', 'confirmed') then
    raise exception 'ORDER_STATUS_CONFLICT' using errcode = 'P0001';
  end if;

  perform 1
  from public.products
  where products.id in (
    select order_items.product_id
    from public.order_items
    where order_items.order_id = p_order_id
      and order_items.product_id is not null
  )
  order by products.id
  for update of products;

  for v_line in
    select
      order_items.product_id,
      sum(order_items.quantity)::integer as quantity
    from public.order_items
    where order_items.order_id = p_order_id
      and order_items.product_id is not null
    group by order_items.product_id
    order by order_items.product_id
  loop
    update public.products
    set stock_quantity = products.stock_quantity + v_line.quantity
    where products.id = v_line.product_id;
  end loop;

  update public.orders
  set status_id = v_cancelled_id
  where orders.id = p_order_id;

  return p_order_id;
end;
$$;

revoke all on function public.cancel_own_order(uuid) from public;
grant execute on function public.cancel_own_order(uuid) to authenticated;
