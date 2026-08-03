# Custom SMTP for Supabase Auth (Resend)

The **website code is production-ready**. Candidate sign-in email delivery depends on Supabase Auth. The **free built-in mailer** allows roughly **2 auth emails per hour**—not enough for regular logins. **Custom SMTP (Resend) is required** for production.

Project: **`grtozdadqnwocurhjsvp`**. Do not store API keys in this repository.

## Why Resend

| Mailer | Typical limit | Use case |
|--------|----------------|----------|
| Supabase built-in | ~**2 emails / hour** | Dev smoke tests only |
| Custom SMTP (Resend) | Your Resend plan + Supabase rate limits you configure | Production candidate login |

The app’s **60-second send cooldown** only prevents double-clicks; it does **not** change Supabase’s server-side email quota.

---

## 1. Resend — domain and API key

1. Create a [Resend](https://resend.com) account.
2. **Resend → Domains → Add Domain** → enter **`auth.perfectplacer.in`**.
3. Add Resend’s **DNS records** at your domain provider (exact records shown in Resend).
4. Wait until the domain shows **Verified**.
5. Create a **Resend API key** (never commit it, paste into chat, or store in git).

---

## 2. Supabase — SMTP settings

**Authentication → Emails → SMTP Settings** (enable custom SMTP):

| Field | Value |
|--------|--------|
| **Sender name** | `Perfect Placer` |
| **Sender email** | `no-reply@auth.perfectplacer.in` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | Your Resend API key |

**Save.**

Also confirm:

- **Authentication → URL Configuration** — Site URL `https://perfect-placer-v2.vercel.app` and redirect URLs per `docs/production-deployment.md`.
- **Authentication → Email Templates → Magic Link** — `{{ .ConfirmationURL }}`; include `{{ .Token }}` for 6-digit code entry.

---

## 3. Supabase — rate limits (after SMTP)

**Authentication → Rate Limits** (wording may vary):

- Set the **email send** limit to **25 / hour** initially (adjust later based on traffic and Resend quotas).

---

## 4. Test sign-in

1. Wait **60 seconds** after saving SMTP.
2. Request **one** fresh login code on https://perfect-placer-v2.vercel.app/auth (do not spam Send while testing).

Old emails are not rewritten when you change SMTP or URLs—only **new** messages use the new setup.

---

## When the built-in mailer limit is already hit

| Do | Don’t |
|----|--------|
| Use the **latest delivered** email if the **6-digit code** or **magic link** is still valid | Request another email while rate limited |
| Wait **~1 hour**, then request **one** new code | Keep clicking Send |
| Complete **Resend SMTP** above | Expect clearing browser storage, another email address, or redeploying to reset Supabase’s limit |

For immediate access: use a previously delivered valid code or link.
