-- Public contact/lead form submissions (candidate registration interest,
-- employer mandates, or general enquiries). Anyone can submit; only staff
-- admins can read them back.
create type public.contact_inquiry_type as enum ('candidate', 'employer', 'general');

create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type public.contact_inquiry_type not null default 'general',
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index contact_inquiries_created_at_idx on public.contact_inquiries (created_at desc);

alter table public.contact_inquiries enable row level security;

create policy "contact_inquiries_insert_anyone"
on public.contact_inquiries
for insert
to anon, authenticated
with check (true);

create policy "contact_inquiries_select_admin"
on public.contact_inquiries
for select
to authenticated
using (public.is_admin());
