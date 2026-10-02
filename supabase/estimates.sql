/* Metroplex: estimate requests (from the website form) and admin-built estimates. */
/* Run once in Supabase: SQL Editor > New query > paste > Run. Requires gallery-setup.sql first. */

/* Estimate requests: visitors can submit, only admins can read or change them. */

create table if not exists public.estimate_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (char_length(phone) between 1 and 40),
  email text not null check (char_length(email) between 3 and 200),
  project_type text check (char_length(project_type) <= 40),
  service text check (char_length(service) <= 60),
  location text check (char_length(location) <= 200),
  message text not null check (char_length(message) between 1 and 4000),
  status text not null default 'new' check (status in ('new', 'reviewing', 'estimated', 'closed')),
  admin_notes text,
  created_at timestamptz default now()
);

create index if not exists estimate_requests_created_idx on public.estimate_requests (created_at desc);

alter table public.estimate_requests enable row level security;

drop policy if exists "Visitors can submit estimate requests" on public.estimate_requests;
create policy "Visitors can submit estimate requests" on public.estimate_requests
  for insert to anon, authenticated
  with check (status = 'new' and admin_notes is null);

drop policy if exists "Admins can view estimate requests" on public.estimate_requests;
create policy "Admins can view estimate requests" on public.estimate_requests
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can update estimate requests" on public.estimate_requests;
create policy "Admins can update estimate requests" on public.estimate_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete estimate requests" on public.estimate_requests;
create policy "Admins can delete estimate requests" on public.estimate_requests
  for delete to authenticated using (public.is_admin());

/* Estimates: admin only. Numbers start at 1001. */

create sequence if not exists public.estimate_number_seq start 1001;

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique default nextval('public.estimate_number_seq'),
  request_id uuid references public.estimate_requests (id) on delete set null,
  client_name text not null,
  client_email text,
  client_phone text,
  client_address text,
  project_title text not null,
  project_location text,
  items jsonb not null default '[]'::jsonb,
  tax_rate numeric(5, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  notes text,
  terms text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  issue_date date not null default current_date,
  valid_until date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists estimates_created_idx on public.estimates (created_at desc);

grant usage, select on sequence public.estimate_number_seq to authenticated;

alter table public.estimates enable row level security;

drop policy if exists "Admins manage estimates" on public.estimates;
create policy "Admins manage estimates" on public.estimates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';
