-- One database function sets exactly one default address for the signed-in user.
-- SECURITY INVOKER: RLS still applies. No service-role bypass.

create or replace function public.sync_default_customer_address(p_address_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  owner uuid;
begin
  if auth.uid() is null then
    raise exception 'ADDRESS_UNAUTHENTICATED';
  end if;

  select user_id into owner
  from public.customer_addresses
  where id = p_address_id;

  if owner is null or owner is distinct from auth.uid() then
    raise exception 'ADDRESS_NOT_FOUND';
  end if;

  update public.customer_addresses
  set is_default = false
  where user_id = auth.uid()
    and is_default = true;

  update public.customer_addresses
  set is_default = true
  where id = p_address_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.sync_default_customer_address(uuid) to authenticated;
revoke execute on function public.sync_default_customer_address(uuid) from anon, public;
