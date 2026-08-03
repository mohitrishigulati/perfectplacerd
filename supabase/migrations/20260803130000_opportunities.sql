-- Opportunity discovery fields for published listings

create type public.work_mode as enum ('onsite', 'hybrid', 'remote');

create type public.experience_level as enum (
  'entry',
  'mid',
  'senior',
  'lead',
  'executive'
);

alter table public.jobs
  add column work_mode public.work_mode,
  add column experience_level public.experience_level,
  add column industry text,
  add column search_vector tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(title, '')
        || ' '
        || coalesce(description, '')
        || ' '
        || coalesce(industry, '')
        || ' '
        || coalesce(location, '')
    )
  ) stored;

create index jobs_work_mode_published_idx
  on public.jobs (work_mode)
  where status = 'published';

create index jobs_experience_published_idx
  on public.jobs (experience_level)
  where status = 'published';

create index jobs_industry_published_idx
  on public.jobs (industry)
  where status = 'published';

create index jobs_location_published_idx
  on public.jobs (location)
  where status = 'published';

create index jobs_search_published_idx
  on public.jobs using gin (search_vector)
  where status = 'published';
