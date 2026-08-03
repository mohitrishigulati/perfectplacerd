-- Enforce "at most one primary resume per user" atomically at the database
-- level. Previously the app inserted a new primary resume then demoted the
-- old one in a separate follow-up update; a concurrent upload or a failure
-- between those two steps could leave two rows with is_primary = true, which
-- every downstream query assumes never happens (.eq("is_primary", true).maybeSingle()).

drop index if exists resumes_user_primary_idx;

create or replace function public.resumes_enforce_single_primary()
returns trigger
language plpgsql
as $$
begin
  if new.is_primary then
    perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));

    update public.resumes
    set is_primary = false
    where user_id = new.user_id
      and id <> new.id
      and is_primary = true;
  end if;

  return new;
end;
$$;

drop trigger if exists resumes_enforce_single_primary_trigger on public.resumes;

create trigger resumes_enforce_single_primary_trigger
before insert or update of is_primary on public.resumes
for each row
when (new.is_primary)
execute function public.resumes_enforce_single_primary();

-- Hard invariant as a safety net: the trigger demotes siblings before the
-- row is written, so this should never fire under normal operation.
create unique index resumes_user_primary_idx on public.resumes (user_id)
where is_primary = true;
