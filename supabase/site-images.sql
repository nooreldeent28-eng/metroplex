/* Metroplex: editable website photos (hero, section images). */
/* Run once in Supabase: SQL Editor > New query > paste > Run. Requires gallery-setup.sql first. */

create table if not exists public.site_images (
  key text primary key,
  image_url text not null,
  image_path text,
  updated_at timestamptz default now()
);

alter table public.site_images enable row level security;

drop policy if exists "Public can view site images" on public.site_images;
create policy "Public can view site images" on public.site_images
  for select to anon, authenticated using (true);

drop policy if exists "Admins can insert site images" on public.site_images;
create policy "Admins can insert site images" on public.site_images
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update site images" on public.site_images;
create policy "Admins can update site images" on public.site_images
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete site images" on public.site_images;
create policy "Admins can delete site images" on public.site_images
  for delete to authenticated using (public.is_admin());

notify pgrst, 'reload schema';
