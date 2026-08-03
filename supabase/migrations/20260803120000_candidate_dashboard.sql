-- Candidate profile fields, resume storage, and account export helpers

create type public.profile_visibility as enum ('private', 'recruiters', 'public');

alter table public.profiles
  add column bio text,
  add column skills text[] not null default '{}',
  add column preferences jsonb not null default '{}'::jsonb,
  add column profile_visibility public.profile_visibility not null default 'private';

create index profiles_visibility_idx on public.profiles (profile_visibility);

-- ---------------------------------------------------------------------------
-- Private resume storage (one folder per user)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "resumes_storage_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "resumes_storage_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "resumes_storage_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "resumes_storage_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------------------------------------------------------------------------
-- Candidate self-service export (metadata only; resume file via storage API)
-- ---------------------------------------------------------------------------
create or replace function public.export_candidate_data(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if target_user_id is distinct from auth.uid() and not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'exported_at', timezone('utc', now()),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = target_user_id),
    'resumes', coalesce(
      (select jsonb_agg(to_jsonb(r.*) order by r.created_at desc)
       from public.resumes r where r.user_id = target_user_id),
      '[]'::jsonb
    ),
    'applications', coalesce(
      (select jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'status', a.status,
          'cover_letter', a.cover_letter,
          'created_at', a.created_at,
          'updated_at', a.updated_at,
          'job_id', a.job_id,
          'resume_id', a.resume_id
        ) order by a.created_at desc
      ) from public.applications a where a.candidate_id = target_user_id),
      '[]'::jsonb
    ),
    'saved_jobs', coalesce(
      (select jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'job_id', s.job_id,
          'created_at', s.created_at
        ) order by s.created_at desc
      ) from public.saved_jobs s where s.user_id = target_user_id),
      '[]'::jsonb
    ),
    'privacy_requests', coalesce(
      (select jsonb_agg(to_jsonb(pr.*) order by pr.created_at desc)
       from public.privacy_requests pr where pr.user_id = target_user_id),
      '[]'::jsonb
    )
  )
  into result;

  if result is null or not exists (
    select 1 from public.profiles p where p.id = target_user_id
  ) then
    raise exception 'profile not found';
  end if;

  return result;
end;
$$;

revoke all on function public.export_candidate_data(uuid) from public;
grant execute on function public.export_candidate_data(uuid) to authenticated;
