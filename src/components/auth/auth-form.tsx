"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import {
  sendSignInOtpAction,
  verifySignInOtpAction,
} from "@/app/auth/actions";
import { sanitizeNextPath } from "@/lib/auth/paths";

type Step = "email" | "otp";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const authError = searchParams.get("error");
  const liveId = useId();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");

  async function handleSendEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setLiveMessage("");
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const emailValue = String(formData.get("email") ?? "").trim();

    if (!emailValue) {
      setFormError("Email is required.");
      setLiveMessage("Email is required.");
      setSubmitting(false);
      return;
    }

    const result = await sendSignInOtpAction({
      email: emailValue,
      origin: window.location.origin,
      nextPath,
    });

    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      setLiveMessage(result.error);
      return;
    }

    setEmail(emailValue);
    setStep("otp");
    setLiveMessage(
      "Sign-in email sent. Check your inbox and spam folder for a code or magic link.",
    );
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const result = await verifySignInOtpAction({ email, token });

    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      setLiveMessage(result.error);
      return;
    }

    setLiveMessage("Signed in. Redirecting…");
    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div id={liveId} className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {authError === "admin_required" && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
          Admin access is required for that page.
        </p>
      )}
      {authError === "callback_failed" && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          Sign-in link expired or was invalid. Request a new code.
        </p>
      )}

      {step === "email" ? (
        <form className="space-y-4" onSubmit={handleSendEmail} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--pp-ink)]">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="field-input mt-1"
              disabled={submitting}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {formError && (
            <p className="field-error" role="alert">
              {formError}
            </p>
          )}
          <button type="submit" disabled={submitting} className="btn-gold w-full">
            {submitting ? "Sending…" : "Send sign-in code"}
          </button>
          <p className="text-xs leading-relaxed text-zinc-600">
            By continuing you agree to our{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="underline">
              Terms of Use
            </Link>
            .
          </p>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerify} noValidate>
          <p className="text-sm text-zinc-600">
            Code sent to{" "}
            <span className="font-medium text-[var(--pp-navy)]">{email}</span>
          </p>
          <div>
            <label htmlFor="token" className="block text-sm font-medium">
              Verification code
            </label>
            <input
              id="token"
              name="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="field-input mt-1"
              required
              disabled={submitting}
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </div>
          {formError && (
            <p className="field-error" role="alert">
              {formError}
            </p>
          )}
          {liveMessage && !formError && (
            <p className="text-sm text-zinc-600" role="status">
              {liveMessage}
            </p>
          )}
          <button type="submit" disabled={submitting} className="btn-gold w-full">
            {submitting ? "Verifying…" : "Verify and continue"}
          </button>
          <button
            type="button"
            className="w-full text-sm text-zinc-600 underline"
            disabled={submitting}
            onClick={() => {
              setStep("email");
              setFormError(null);
              setToken("");
            }}
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
