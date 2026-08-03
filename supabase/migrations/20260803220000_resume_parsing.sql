-- Resume parsing state, expanded storage limits, and processing rate-limit events

create type public.resume_parsing_status as enum (
  'pending',
  'processing',
  'completed',
  'failed'
);

alter table public.resumes
  add column parsing_status public.resume_parsing_status not null default 'pending',
  add column parsing_error_category text,
  add column extracted_data jsonb not null default '{}'::jsonb,
  add column extraction_confidence jsonb not null default '{}'::jsonb,
  add column parsed_at timestamptz;

create index resumes_parsing_status_idx on public.resumes (user_id, parsing_status);

comment on column public.resumes.extracted_data is
  'Structured profile suggestions derived from resume text. No raw provider payloads.';
comment on column public.resumes.extraction_confidence is
  'Per-field confidence scores (0-1) for extracted_data keys.';

-- Rate-limit upload and parse attempts (metadata only)
create table public.resume_processing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null check (event_type in ('upload', 'parse')),
  resume_id uuid references public.resumes (id) on delete set null,
  created_at timestamptz not null default now()
);

create index resume_processing_events_user_time_idx
  on public.resume_processing_events (user_id, created_at desc);

alter table public.resume_processing_events enable row level security;

create policy "resume_processing_events_insert_own"
on public.resume_processing_events
for insert
to authenticated
with check (user_id = auth.uid());

create policy "resume_processing_events_select_own"
on public.resume_processing_events
for select
to authenticated
using (user_id = auth.uid());

grant select, insert on public.resume_processing_events to authenticated;

-- Private bucket: 10 MB, images + documents
update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
where id = 'resumes';
