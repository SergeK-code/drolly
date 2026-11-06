-- Catalog images in Supabase Storage. Public read, admin write via is_admin().
-- The Next.js API uploads with the signed-in admin session. No service-role bypass.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog',
  'catalog',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists catalog_public_read on storage.objects;
create policy catalog_public_read
on storage.objects
for select
using (bucket_id = 'catalog');

drop policy if exists catalog_admin_insert on storage.objects;
create policy catalog_admin_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'catalog' and public.is_admin());

drop policy if exists catalog_admin_update on storage.objects;
create policy catalog_admin_update
on storage.objects
for update
to authenticated
using (bucket_id = 'catalog' and public.is_admin())
with check (bucket_id = 'catalog' and public.is_admin());

drop policy if exists catalog_admin_delete on storage.objects;
create policy catalog_admin_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'catalog' and public.is_admin());
