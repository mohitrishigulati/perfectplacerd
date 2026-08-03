-- Perfect Placer v2 — core schema, indexes, and Row Level Security

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.job_status as enum ('draft', 'published', 'archived');

create type public.application_status as enum (
  'submitted',
  'under_review',
  'rejected',
  'accepted',
  'withdrawn'
);

create type public.privacy_request_type as enum ('export', 'delete', 'rectify');

create type public.privacy_request_status as enum (
  'pending',
  'processing',
  'completed',
  'rejected'
);

create type public.admin_role as enum ('admin', 'super_admin');

-- ---------------------------------------------------------------------------
-- Trigger helper (no table dependencies)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  headline text,
  location text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_email_lowercase check (email = lower(email))
);

create index profiles_email_idx on public.profiles (email);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- admin_users (must exist before is_admin() and jobs RLS)
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.admin_role not null default 'admin',
  created_at timestamptz not null default timezone('utc', now())
);

create index admin_users_role_idx on public.admin_users (role);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text not null,
  location text,
  employment_type text,
  department text,
  salary_min integer,
  salary_max integer,
  salary_currency text not null default 'USD',
  status public.job_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint jobs_slug_unique unique (slug),
  constraint jobs_salary_range check (
    salary_min is null
    or salary_max is null
    or salary_min <= salary_max
  ),
  constraint jobs_published_at_when_published check (
    (status = 'published' and published_at is not null)
    or (status <> 'published')
  )
);

create or replace function public.jobs_sync_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = timezone('utc', now());
  end if;
  if tg_op = 'UPDATE' and new.status <> 'published' and old.status = 'published' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create trigger jobs_sync_published_at
before insert or update on public.jobs
for each row
execute function public.jobs_sync_published_at();

create index jobs_status_idx on public.jobs (status);
create index jobs_published_at_idx on public.jobs (published_at desc nulls last);
create index jobs_status_published_at_idx on public.jobs (status, published_at desc nulls last);

create trigger jobs_set_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- resumes
-- ---------------------------------------------------------------------------
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  storage_path text not null,
  file_name text,
  mime_type text,
  byte_size integer,
  is_primary boolean not null default false,
  parsed_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index resumes_user_id_idx on public.resumes (user_id);
create index resumes_user_primary_idx on public.resumes (user_id, is_primary)
where is_primary = true;

create trigger resumes_set_updated_at
before update on public.resumes
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete restrict,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  resume_id uuid references public.resumes (id) on delete set null,
  status public.application_status not null default 'submitted',
  cover_letter text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint applications_job_candidate_unique unique (job_id, candidate_id)
);

create index applications_candidate_id_idx on public.applications (candidate_id);
create index applications_job_id_idx on public.applications (job_id);
create index applications_status_idx on public.applications (status);

create trigger applications_set_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- saved_jobs
-- ---------------------------------------------------------------------------
create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint saved_jobs_user_job_unique unique (user_id, job_id)
);

create index saved_jobs_user_id_idx on public.saved_jobs (user_id);
create index saved_jobs_job_id_idx on public.saved_jobs (job_id);

-- ---------------------------------------------------------------------------
-- privacy_requests
-- ---------------------------------------------------------------------------
create table public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  request_type public.privacy_request_type not null,
  status public.privacy_request_status not null default 'pending',
  details text,
  admin_notes text,
  processed_by uuid references auth.users (id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index privacy_requests_user_id_idx on public.privacy_requests (user_id);
create index privacy_requests_status_idx on public.privacy_requests (status);

create trigger privacy_requests_set_updated_at
before update on public.privacy_requests
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Auth: profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    lower(coalesce(nullif(trim(new.email), ''), new.id::text || '@placeholder.local')),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.jobs enable row level security;
alter table public.resumes enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.privacy_requests enable row level security;
alter table public.audit_logs enable row level security;

-- profiles: own row only
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_select_admin"
on public.profiles
for select
to authenticated
using (public.is_admin());

-- admin_users: users see own admin row; no client writes
create policy "admin_users_select_own"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "admin_users_select_admin"
on public.admin_users
for select
to authenticated
using (public.is_admin());

-- jobs: published listings are public; admins manage all jobs
create policy "jobs_select_published"
on public.jobs
for select
to anon, authenticated
using (status = 'published');

create policy "jobs_select_admin"
on public.jobs
for select
to authenticated
using (public.is_admin());

create policy "jobs_insert_admin"
on public.jobs
for insert
to authenticated
with check (public.is_admin());

create policy "jobs_update_admin"
on public.jobs
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "jobs_delete_admin"
on public.jobs
for delete
to authenticated
using (public.is_admin());

-- resumes: candidate owns their resumes
create policy "resumes_select_own"
on public.resumes
for select
to authenticated
using (user_id = auth.uid());

create policy "resumes_insert_own"
on public.resumes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "resumes_update_own"
on public.resumes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "resumes_delete_own"
on public.resumes
for delete
to authenticated
using (user_id = auth.uid());

-- applications: candidate owns their applications; admins can review
create policy "applications_select_own"
on public.applications
for select
to authenticated
using (candidate_id = auth.uid());

create policy "applications_insert_own"
on public.applications
for insert
to authenticated
with check (
  candidate_id = auth.uid()
  and exists (
    select 1
    from public.jobs j
    where j.id = job_id
      and j.status = 'published'
  )
  and (
    resume_id is null
    or exists (
      select 1
      from public.resumes r
      where r.id = resume_id
        and r.user_id = auth.uid()
    )
  )
);

create policy "applications_update_own"
on public.applications
for update
to authenticated
using (candidate_id = auth.uid())
with check (candidate_id = auth.uid());

create policy "applications_delete_own"
on public.applications
for delete
to authenticated
using (candidate_id = auth.uid());

create policy "applications_select_admin"
on public.applications
for select
to authenticated
using (public.is_admin());

create policy "applications_update_admin"
on public.applications
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- saved_jobs: own saves only (published jobs readable via jobs policy)
create policy "saved_jobs_select_own"
on public.saved_jobs
for select
to authenticated
using (user_id = auth.uid());

create policy "saved_jobs_insert_own"
on public.saved_jobs
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.jobs j
    where j.id = job_id
      and j.status = 'published'
  )
);

create policy "saved_jobs_delete_own"
on public.saved_jobs
for delete
to authenticated
using (user_id = auth.uid());

-- privacy_requests: own requests; admins process
create policy "privacy_requests_select_own"
on public.privacy_requests
for select
to authenticated
using (user_id = auth.uid());

create policy "privacy_requests_insert_own"
on public.privacy_requests
for insert
to authenticated
with check (user_id = auth.uid());

create policy "privacy_requests_select_admin"
on public.privacy_requests
for select
to authenticated
using (public.is_admin());

create policy "privacy_requests_update_admin"
on public.privacy_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- audit_logs: admins read; admins may append entries from the app
create policy "audit_logs_select_admin"
on public.audit_logs
for select
to authenticated
using (public.is_admin());

create policy "audit_logs_insert_admin"
on public.audit_logs
for insert
to authenticated
with check (public.is_admin() and (actor_id is null or actor_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.jobs to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.resumes to authenticated;
grant select, insert, update, delete on public.applications to authenticated;
grant select, insert, delete on public.saved_jobs to authenticated;
grant select, insert on public.privacy_requests to authenticated;
grant select, insert on public.audit_logs to authenticated;

grant all on public.jobs to authenticated;
grant update, delete on public.privacy_requests to authenticated;
