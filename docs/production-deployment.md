# Production deployment — Perfect Placer v2

Complete Supabase setup and Vercel deploy for production. Run commands from the **`perfect-placer-v2`** directory.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) installed
- Supabase project created (note **Project ref** from Settings → General)
- Vercel project linked to this GitHub repo

## 1. Environment variables

Copy `.env.example` to `.env.local` for local work. In **Vercel → Settings → Environment Variables** (Production):

| Variable | Source |
| -------- | ------ |
| `NEXT_PUBLIC_SITE_URL` | `https://perfect-placer-v2.vercel.app` (or your custom domain) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Settings → API → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → `service_role` (server only) |

Redeploy after changing any `NEXT_PUBLIC_*` variable.

## 2. Link Supabase project

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` (e.g. `ghfukjipfdatwdjuscfp`).

## 3. Apply all migrations

Migrations in version control (run in timestamp order):

| File | Purpose |
| ---- | ------- |
| `20260803100000_initial_schema.sql` | profiles, jobs, applications, saved_jobs, admin_users, privacy_requests, audit_logs, RLS |
| `20260803100100_seed_admin_helper.sql` | `grant_admin_by_email()` |
| `20260803120000_candidate_dashboard.sql` | Profile fields, resumes bucket |
| `20260803130000_opportunities.sql` | Search facets, work mode, experience |
| `20260803140000_admin_staff.sql` | Job lifecycle, admin resume access |
| `20260803150000_seed_executive_opportunities.sql` | Six published sample opportunities |

Push to remote database:

```bash
npx supabase db push
```

Alternative (local reset then push is not for prod):

```bash
npx supabase db reset   # local only
```

## 4. Verify schema

```bash
npx supabase migration list
```

In Supabase **SQL Editor**:

```sql
select count(*) from public.jobs where status = 'published';
-- Expect >= 6 after seed migration
```

## 5. Auth URLs (Supabase Dashboard)

**Authentication → URL configuration**

- **Site URL:** same as `NEXT_PUBLIC_SITE_URL`
- **Redirect URLs:** `{SITE_URL}/auth/callback`

**Email template → Magic Link:** include `{{ .Token }}` for OTP codes.

Configure **SMTP** under Authentication for production email volume.

## 6. First admin

After one user signs up:

```sql
select public.grant_admin_by_email('you@example.com', 'admin');
```

## 7. Deploy application

```bash
git push origin main
```

Or:

```bash
npx vercel --prod
```

## 8. Smoke test

- `/` and all public pages return 200
- `/opportunities` lists published jobs (not raw DB errors)
- `/auth` sends OTP when rate limits allow
- `/dashboard` redirects guests to `/auth`

## Troubleshooting

| Symptom | Action |
| ------- | ------ |
| Empty opportunities | Run `npx supabase db push`; confirm RLS and `status = published` |
| Auth rate limit | Wait or enable custom SMTP |
| 404 on wrong domain | Use `NEXT_PUBLIC_SITE_URL` matching live Vercel URL |

See also [docs/supabase-setup.md](./supabase-setup.md).
