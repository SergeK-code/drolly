-- Cancel restores reserved product quantities. Reopening a cancelled order
-- decrements stock again. Status and stock change in one transaction.

create or replace function public.update_order_status(
  p_order_id uuid,
  p_from_status text,
  p_to_status text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from_id smallint;
  v_to_id smallint;
  v_current_id smallint;
  v_line record;
begin
  if auth.uid() is null then
    raise exception 'ORDER_STATUS_UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  if not public.is_admin() then
    raise exception 'ORDER_STATUS_FORBIDDEN' using errcode = 'P0001';
  end if;

  select order_statuses.id
  into v_from_id
  from public.order_statuses
  where order_statuses.code = p_from_status;

  select order_statuses.id
  into v_to_id
  from public.order_statuses
  where order_statuses.code = p_to_status;

  if v_from_id is null or v_to_id is null then
    raise exception 'ORDER_STATUS_VALIDATION' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_order_id::text, 0));

  select orders.status_id
  into v_current_id
  from public.orders
  where orders.id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_STATUS_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_current_id <> v_from_id then
    raise exception 'ORDER_STATUS_CONFLICT' using errcode = 'P0001';
  end if;

  if p_from_status = p_to_status then
    return p_order_id;
  end if;

  if p_to_status = 'cancelled' or p_from_status = 'cancelled' then
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
  end if;

  if p_to_status = 'cancelled' then
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
  elsif p_from_status = 'cancelled' then
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
      set stock_quantity = products.stock_quantity - v_line.quantity
      where products.id = v_line.product_id
        and products.stock_quantity >= v_line.quantity;

      if not found then
        raise exception 'ORDER_STATUS_STOCK' using errcode = 'P0001';
      end if;
    end loop;
  end if;

  update public.orders
  set status_id = v_to_id
  where orders.id = p_order_id;

  return p_order_id;
end;
$$;

revoke all on function public.update_order_status(uuid, text, text) from public;
grant execute on function public.update_order_status(uuid, text, text) to authenticated;
