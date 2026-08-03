-- Email-notification preference for candidates (default on, matches current behavior).
alter table public.profiles
  add column notify_application_status boolean not null default true;

-- Keep profiles.email in sync when a candidate changes their auth email.
-- handle_new_user only covers insert; auth.users.email can also change later
-- (e.g. via supabase.auth.updateUser({ email })), and nothing previously kept
-- the public.profiles mirror in sync with that.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
    set email = lower(new.email)
    where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
execute function public.handle_user_email_change();
