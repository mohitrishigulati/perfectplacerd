# Custom SMTP for Supabase Auth (Resend)

Configure this in the **Supabase Dashboard** for project `grtozdadqnwocurhjsvp` (Perfect Placer). Do not store API keys in this repository.

## Checklist

1. Open **Project Settings → Authentication → SMTP Settings** (or **Authentication → Email** → custom SMTP, depending on dashboard layout).
2. Enable **custom SMTP**.
3. Enter:

   | Field | Value |
   |--------|--------|
   | **Sender email** | `no-reply@auth.perfectplacer.in` |
   | **Sender name** | `Perfect Placer` (or your preferred display name) |
   | **Host** | `smtp.resend.com` |
   | **Port** | `465` (SSL) |
   | **Username** | `resend` |
   | **Password** | Your **Resend API key** (create in the Resend dashboard; never commit it) |

4. In **Resend**, verify the domain `auth.perfectplacer.in` (DNS records as Resend instructs).
5. Under **Authentication → URL Configuration**, keep production Site URL and redirect URLs aligned with `docs/production-deployment.md`.
6. Under **Authentication → Email Templates → Magic Link**, use `{{ .ConfirmationURL }}` and include `{{ .Token }}` if users enter a numeric code.
7. Send a **new** test sign-in email after saving SMTP (old emails are not updated).

## Notes

- Supabase’s built-in mailer has low rate limits; custom SMTP is required for production volume.
- The app shows a user-friendly message when rate limits are hit; fixing SMTP reduces how often users see it.
