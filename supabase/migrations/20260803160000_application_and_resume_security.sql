-- Tighten candidate application and resume delete policies; add withdrawal RPC.

drop policy if exists "applications_update_own" on public.applications;
drop policy if exists "applications_delete_own" on public.applications;

drop policy if exists "applications_insert_own" on public.applications;

create policy "applications_insert_own"
on public.applications
for insert
to authenticated
with check (
  candidate_id = auth.uid()
  and status = 'submitted'
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

drop policy if exists "resumes_delete_own" on public.resumes;

create policy "resumes_delete_own"
on public.resumes
for delete
to authenticated
using (
  user_id = auth.uid()
  and not exists (
    select 1
    from public.applications a
    where a.resume_id = resumes.id
  )
);

create or replace function public.withdraw_application(p_application_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'not_authenticated';
  end if;

  update public.applications
  set
    status = 'withdrawn',
    updated_at = timezone('utc', now())
  where id = p_application_id
    and candidate_id = auth.uid()
    and status in ('submitted', 'under_review');

  if not found then
    raise exception using errcode = 'P0001', message = 'withdraw_not_allowed';
  end if;
end;
$$;

revoke all on function public.withdraw_application(uuid) from public;
grant execute on function public.withdraw_application(uuid) to authenticated;
