/* Metroplex: before & after photos for each gallery project (max 30 per project). */
/* Run once in Supabase: SQL Editor > New query > paste > Run. Requires gallery-setup.sql first. */

create table if not exists public.gallery_project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.gallery_projects (id) on delete cascade,
  image_url text not null,
  image_path text,
  phase text not null default 'after' check (phase in ('before', 'after')),
  display_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists gallery_project_photos_project_idx
  on public.gallery_project_photos (project_id, phase, display_order, created_at);

alter table public.gallery_project_photos enable row level security;

drop policy if exists "Public can view project photos" on public.gallery_project_photos;
create policy "Public can view project photos"
  on public.gallery_project_photos for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert project photos" on public.gallery_project_photos;
create policy "Admins can insert project photos"
  on public.gallery_project_photos for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update project photos" on public.gallery_project_photos;
create policy "Admins can update project photos"
  on public.gallery_project_photos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete project photos" on public.gallery_project_photos;
create policy "Admins can delete project photos"
  on public.gallery_project_photos for delete
  to authenticated
  using (public.is_admin());

/* Enforce the 30-photo limit in the database, not just in the admin UI. */
create or replace function public.enforce_project_photo_limit()
returns trigger
language plpgsql
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.project_id::text));
  if (select count(*) from public.gallery_project_photos where project_id = new.project_id) >= 30 then
    raise exception 'A project can have at most 30 photos.';
  end if;
  return new;
end;
$$;

drop trigger if exists gallery_project_photos_limit on public.gallery_project_photos;
create trigger gallery_project_photos_limit
  before insert on public.gallery_project_photos
  for each row execute function public.enforce_project_photo_limit();

notify pgrst, 'reload schema';
