/* Metroplex Construction Services: gallery setup */
/* Run once in the Supabase dashboard: SQL Editor > New query > paste > Run. */
/* Admin access is limited to users listed in public.admin_users, so an account that */
/* merely exists in Supabase Auth cannot edit the gallery. After running this file: */
/*   1. Authentication > Sign In / Providers: turn OFF "Allow new users to sign up". */
/*   2. Authentication > Users > Add user: create the admin (email + password, auto-confirm). */
/*   3. Approve that user: */
/*        insert into public.admin_users (user_id) */
/*        select id from auth.users where email = 'management@metroplex-services.com'; */

/* Admin allowlist */

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;
/* No policies on admin_users: it is only readable through is_admin() below. */

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

/* Gallery table */

create table if not exists public.gallery_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  image_url text not null,
  image_path text,
  location text,
  featured boolean default false,
  display_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists gallery_projects_order_idx
  on public.gallery_projects (display_order, created_at desc);

alter table public.gallery_projects enable row level security;

drop policy if exists "Public can view gallery" on public.gallery_projects;
create policy "Public can view gallery"
  on public.gallery_projects for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert gallery" on public.gallery_projects;
create policy "Admins can insert gallery"
  on public.gallery_projects for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update gallery" on public.gallery_projects;
create policy "Admins can update gallery"
  on public.gallery_projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete gallery" on public.gallery_projects;
create policy "Admins can delete gallery"
  on public.gallery_projects for delete
  to authenticated
  using (public.is_admin());

/* Storage bucket */

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-gallery',
  'project-gallery',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view gallery images" on storage.objects;
create policy "Public can view gallery images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-gallery');

drop policy if exists "Admins can upload gallery images" on storage.objects;
create policy "Admins can upload gallery images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-gallery' and public.is_admin());

drop policy if exists "Admins can update gallery images" on storage.objects;
create policy "Admins can update gallery images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-gallery' and public.is_admin())
  with check (bucket_id = 'project-gallery' and public.is_admin());

drop policy if exists "Admins can delete gallery images" on storage.objects;
create policy "Admins can delete gallery images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-gallery' and public.is_admin());
