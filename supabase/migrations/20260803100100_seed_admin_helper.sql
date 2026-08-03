-- Optional helper: grant admin by user email (run manually in SQL editor after first admin signs up).
-- Replace the email before executing.

create or replace function public.grant_admin_by_email(admin_email text, admin_role public.admin_role default 'admin')
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_id uuid;
begin
  select id into target_id
  from auth.users
  where lower(email) = lower(admin_email)
  limit 1;

  if target_id is null then
    raise exception 'No auth user found for email %', admin_email;
  end if;

  insert into public.admin_users (user_id, role)
  values (target_id, admin_role)
  on conflict (user_id) do update set role = excluded.role;
end;
$$;

revoke all on function public.grant_admin_by_email(text, public.admin_role) from public;
-- Run as postgres / service role in dashboard only:
-- grant execute on function public.grant_admin_by_email(text, public.admin_role) to service_role;

comment on function public.grant_admin_by_email is
  'Dashboard-only helper to promote a user to admin after they have signed up.';
