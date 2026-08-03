# Local auth testing (without Vercel)

Production on Vercel is for real users. While SMTP or rate limits are being fixed, test sign-in **on your machine** with the same Supabase project (`grtozdadqnwocurhjsvp`).

## 1. Supabase Auth URLs

In **Authentication → URL Configuration**:

- Keep production **Site URL** as `https://perfect-placer-v2.vercel.app` (or your live domain).
- Under **Redirect URLs**, include:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**`

Save.

## 2. Environment

In `.env.local` (not committed):

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — same as production (correct project ref).
- `NEXT_PUBLIC_SITE_URL` can stay the production URL for SEO; **auth emails from local dev** automatically use `http://localhost:3000` for magic-link callbacks when you run `npm run dev`.

Optional override if you use a non-default port:

```env
NEXT_PUBLIC_DEV_AUTH_URL=http://localhost:3001
```

## 3. Run the app

```bash
npm run dev
```

Open **http://localhost:3000/auth**.

## 4. Sign in

1. Request **one** sign-in email (respect Supabase / Resend limits).
2. Prefer the **6-digit code** on `/auth` — it does not depend on Vercel.
3. Magic links in email should point to **localhost** when sent from local dev.

## 5. Why not test on Vercel right now?

| Issue | Local workaround |
|--------|------------------|
| Built-in mailer ~2 emails/hour | Configure Resend SMTP (see `docs/custom-smtp.md`); test locally meanwhile |
| Rate limit already hit | Wait ~1 hour or use last valid code; don’t spam Send on production |
| Deployment protection / preview URLs | Not needed for local dev |

Automated tests (`npm test`, Playwright) never send real OTP emails.

## 6. Production check (after SMTP)

When Resend is verified and SMTP is saved in Supabase, test **one** code on https://perfect-placer-v2.vercel.app/auth — not before SMTP is working.
