# Supabase setup — Perfect Placer v2

This guide applies the SQL migrations under `supabase/migrations/` and connects the Next.js app to your project.

## 1. Create a Supabase project

1. Sign in at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **New project** → choose organization, name (e.g. `perfect-placer-v2`), database password, and region.
3. Wait until the project finishes provisioning.

## 2. Configure environment variables

From **Project Settings → API**, copy:

| Variable | Where to find it |
| -------- | ---------------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (server only; never expose to the browser) |

In the repo root:

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local`. Do not commit `.env.local`.

## 3. Apply database migrations

Choose **one** of the following.

### Option A — Supabase CLI (recommended)

Install the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started).

Link the remote project (replace `your-project-ref`):

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
```

Push migrations:

```bash
npx supabase db push
```

For local Postgres + Studio:

```bash
npx supabase start
npx supabase db reset
```

Local URLs and keys are printed by `supabase start`; use those in `.env.local` when developing against local Supabase.

### Option B — SQL Editor (dashboard)

1. Open **SQL → New query** in the dashboard.
2. Run the contents of `supabase/migrations/20260803100000_initial_schema.sql`.
3. Run `supabase/migrations/20260803100100_seed_admin_helper.sql`.

Order matters: run files in lexical (timestamp) order.

## 4. Create the first admin user

RLS allows only `admin_users` to create or update jobs.

1. Enable **Authentication → Providers** you need (e.g. Email).
2. Sign up once in the app (or **Authentication → Users → Add user**) so a row exists in `auth.users` and `profiles`.
3. In the SQL Editor, as a privileged role, run:

```sql
select public.grant_admin_by_email('you@example.com', 'admin');
```

Replace the email with the admin account. For production, restrict use of `grant_admin_by_email` to the dashboard/service role only.

Alternatively, insert directly (requires knowing the user UUID):

```sql
insert into public.admin_users (user_id, role)
values ('00000000-0000-0000-0000-000000000000', 'admin');
```

## 5. Verify Row Level Security

Quick checks in the SQL Editor using [JWT simulation](https://supabase.com/docs/guides/database/postgres/row-level-security#testing-policies) or from the app:

| Actor | Expected access |
| ----- | ---------------- |
| Anonymous | `SELECT` on `jobs` where `status = 'published'` only |
| Authenticated candidate | Own `profiles`, `resumes`, `applications`, `saved_jobs`, `privacy_requests` |
| Admin | Full job create/update; read applications and privacy requests; audit log read/insert |

## 6. Authentication (email OTP)

1. **Authentication → Providers → Email**: enable email sign-in (OTP / magic link).
2. **Authentication → URL configuration**: add `http://localhost:3000/auth/callback` (and production `/auth/callback`).
3. Sign in at `/auth`, then visit `/candidate`. Promote admins with `grant_admin_by_email` before using `/admin`.

The app uses only the **anon** key in the browser and middleware. Admin checks query `admin_users` with the signed-in user’s JWT (RLS). Do not put `SUPABASE_SERVICE_ROLE_KEY` in any `NEXT_PUBLIC_*` variable or client bundle.

## 7. Storage (later)

Resume files reference `resumes.storage_path`. When you add Supabase Storage, create a private bucket (e.g. `resumes`) and add storage policies so users can read/write only their own objects. That is not included in the current migrations.

## Schema overview

- **profiles** — one row per `auth.users` (auto-created on signup).
- **jobs** — draft/published/archived; published listings are public.
- **resumes** — candidate-owned resume metadata (+ storage path).
- **applications** — one application per candidate per job; only to published jobs.
- **saved_jobs** — bookmarks for published jobs.
- **admin_users** — who may manage jobs and admin tables.
- **privacy_requests** — GDPR-style requests from candidates.
- **audit_logs** — admin-visible audit trail.

TypeScript table shapes live in `src/types/database.ts` for use with `@supabase/supabase-js`.
