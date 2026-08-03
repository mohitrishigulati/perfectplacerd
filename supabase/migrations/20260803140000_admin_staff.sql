-- Staff admin: extended job lifecycle, resume access for admins

alter type public.job_status add value if not exists 'paused';
alter type public.job_status add value if not exists 'closed';

create or replace function public.jobs_sync_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = timezone('utc', now());
  end if;
  if tg_op = 'UPDATE'
    and new.status in ('draft', 'archived')
    and old.status = 'published' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create policy "resumes_select_admin"
on public.resumes
for select
to authenticated
using (public.is_admin());

create policy "resumes_storage_select_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and public.is_admin()
);
