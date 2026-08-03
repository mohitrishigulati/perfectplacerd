# Perfect Placer v2

Greenfield Next.js application for Perfect Placer. This project lives alongside the existing Perfect Placer website and does not replace or modify it.

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/) (with `@hookform/resolvers` when forms are added)

## Prerequisites

- Node.js 20+
- npm (or your preferred package manager)
- A Supabase project (for local development once you connect data)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and add your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and (for server tasks) `SUPABASE_SERVICE_ROLE_KEY` from your [Supabase API settings](https://supabase.com/dashboard/project/_/settings/api).

3. In **Authentication → URL configuration**, add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - Your production URL `/auth/callback` when deployed.

4. Enable **Email** provider with OTP (magic link + code) as needed.

5. Apply database migrations — see **[docs/supabase-setup.md](docs/supabase-setup.md)** for CLI or SQL Editor steps.

6. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Authentication

Passwordless email OTP is implemented at `/auth`, with `/auth/callback` for magic links and POST `/auth/sign-out` to end the session.

- **Candidate routes** (`/dashboard/*`) require a signed-in user (middleware + server layout).
- **Admin routes** (`/admin/*`) require a row in `admin_users` (checked with the anon client and RLS, not the service role).
- The **service role key** is only for optional server scripts; it is never used in client or middleware code.

## Database

SQL migrations live in `supabase/migrations/`:

| Table | Purpose |
| ----- | ------- |
| `profiles` | Candidate profile (linked to `auth.users`) |
| `jobs` | Job listings (`draft` / `published` / `archived`) |
| `resumes` | Candidate resume metadata |
| `applications` | Job applications |
| `saved_jobs` | Saved published jobs |
| `admin_users` | Users who can manage jobs |
| `privacy_requests` | Privacy/GDPR requests |
| `audit_logs` | Admin audit trail |

Row Level Security enforces: candidates see only their own profile, resumes, and applications; published jobs are readable by everyone; only admins insert/update jobs.

Full setup: [docs/supabase-setup.md](docs/supabase-setup.md).

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start dev server (Turbopack)         |
| `npm run build`    | Production build                     |
| `npm run start`    | Start production server              |
| `npm run lint`     | Run ESLint                           |
| `npm run typecheck`| TypeScript check (`tsc --noEmit`)    |
| `npm run test`     | Unit tests (auth & route guards)     |
| `npm run test:e2e` | Playwright E2E (build + dynamic port) |
| `npm run test:qa`  | lint, typecheck, unit tests, E2E     |
| `npm run db:push`  | Push migrations to linked Supabase project |

## Project structure

```
supabase/
  migrations/          # Postgres schema + RLS
  config.toml          # Local Supabase CLI config
docs/
  supabase-setup.md    # Migration and env setup
src/
  app/                 # App Router routes and layouts
  components/          # Shared UI components
  hooks/               # Custom React hooks
  lib/
    env.ts             # Zod-validated public env helpers
    supabase/          # Browser and server Supabase clients
    validations/       # Zod schemas for forms and APIs
  types/               # Shared TypeScript types
    database.ts        # Supabase table types
```

Supabase clients in `src/lib/supabase/` are typed with `Database` from `src/types/database.ts`.

## Environment variables

See [.env.example](.env.example) and [docs/supabase-setup.md](docs/supabase-setup.md). Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## License

Private — Perfect Placer.
