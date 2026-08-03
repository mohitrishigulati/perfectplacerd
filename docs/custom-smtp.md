# Custom SMTP for Supabase Auth (Resend)

Configure this in the **Supabase Dashboard** for project `grtozdadqnwocurhjsvp` (Perfect Placer). Do not store API keys in this repository.

## Resend setup (do this first)

1. In [Resend](https://resend.com), add and **verify** the domain `auth.perfectplacer.in` (DNS records as Resend instructs).
2. Create a **Resend API key** (never commit it or paste it into chat).

## Enable SMTP in Supabase

1. **Authentication → Emails → SMTP Settings** (wording may vary slightly in the dashboard).
2. Enable custom SMTP and enter:

   | Field | Value |
   |--------|--------|
   | **Host** | `smtp.resend.com` |
   | **Port** | `465` |
   | **Username** | `resend` |
   | **Password** | Resend API key |
   | **Sender** | `no-reply@auth.perfectplacer.in` |

3. **Save**, wait **60 seconds**, then request **one** new sign-in code to test.

Also confirm:

- **Authentication → URL Configuration** — Site URL and redirect URLs match `docs/production-deployment.md`.
- **Authentication → Email Templates → Magic Link** — link uses `{{ .ConfirmationURL }}`; include `{{ .Token }}` if users enter a numeric code.

## When the built-in mailer rate limit is hit

Supabase enforces **server-side** email limits. The app’s 60-second send cooldown only reduces double-clicks; it does **not** reset Supabase’s limit.

| Do | Don’t |
|----|--------|
| Use the **latest delivered** email if it still has a valid **6-digit code** or **magic link** | Request another email while rate limited |
| Wait **~1 hour**, then request **exactly one** new code | Keep clicking Send |
| Configure **Resend SMTP** above for production | Expect clearing browser storage, changing email, or redeploying to reset the limit |

For immediate access: use a previously delivered valid code or link. For reliable delivery: configure SMTP.

## Notes

- Custom SMTP is the production solution; the default Supabase mailer is rate limited.
- Old emails are not updated when you change SMTP or URL settings—only **new** messages use the new configuration.
