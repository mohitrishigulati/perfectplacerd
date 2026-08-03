"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useRef, useState } from "react";
import {
  sendSignInOtpAction,
  verifySignInOtpAction,
} from "@/app/auth/actions";
import {
  getSendOtpButtonLabel,
  isOtpSendBlocked,
  useOtpSendCooldown,
} from "@/components/auth/use-otp-send-cooldown";
import {
  cooldownRemainingSeconds,
  normalizeOtpTokenInput,
} from "@/lib/auth/otp-send-cooldown";
import { resolvePostAuthRedirectPath } from "@/lib/auth/post-auth-redirect";

type Step = "email" | "otp";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = resolvePostAuthRedirectPath(searchParams.get("next"));
  const authError = searchParams.get("error");
  const liveId = useId();
  const sendInFlightRef = useRef(false);
  const verifyInFlightRef = useRef(false);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const { cooldownSeconds, beginCooldownAfterSuccessfulSend } =
    useOtpSendCooldown();

  const sendBlocked = isOtpSendBlocked({ submitting, cooldownSeconds });

  async function requestSignInEmail(emailValue: string) {
    if (sendInFlightRef.current) {
      return;
    }
    if (cooldownRemainingSeconds() > 0) {
      return;
    }

    sendInFlightRef.current = true;
    setFormError(null);
    setLiveMessage("");
    setSubmitting(true);
    setLiveMessage("Sending sign-in email…");

    const result = await sendSignInOtpAction({
      email: emailValue,
      nextPath: redirectPath,
    });

    setSubmitting(false);
    sendInFlightRef.current = false;

    if (!result.ok) {
      setFormError(result.error);
      setLiveMessage(result.error);
      return;
    }

    beginCooldownAfterSuccessfulSend();
    setEmail(emailValue);
    setStep("otp");
    setLiveMessage(
      "Sign-in email sent. Enter the 6-digit code from your email or use the magic link.",
    );
  }

  async function handleSendEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const emailValue = String(formData.get("email") ?? "").trim();

    if (!emailValue) {
      setFormError("Email is required.");
      setLiveMessage("Email is required.");
      return;
    }

    await requestSignInEmail(emailValue);
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (verifyInFlightRef.current || submitting) {
      return;
    }

    verifyInFlightRef.current = true;
    setFormError(null);
    setSubmitting(true);
    setLiveMessage("Verifying code…");

    const result = await verifySignInOtpAction({ email, token });

    setSubmitting(false);
    verifyInFlightRef.current = false;

    if (!result.ok) {
      setFormError(result.error);
      setLiveMessage(result.error);
      return;
    }

    setLiveMessage("Signed in. Redirecting…");
    router.replace(redirectPath);
    router.refresh();
  }

  const sendButtonLabel = getSendOtpButtonLabel({ submitting, cooldownSeconds });

  return (
    <div className="w-full max-w-md space-y-6">
      <div id={liveId} className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {authError === "admin_required" && (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          Admin access is required for that page.
        </p>
      )}
      {authError === "callback_failed" && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          Sign-in link expired or was invalid. Request a new code.
        </p>
      )}

      {step === "email" ? (
        <form className="space-y-4" onSubmit={handleSendEmail} noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--pp-ink)]"
            >
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
          {cooldownSeconds > 0 && !formError && (
            <p className="text-sm text-zinc-600" role="status">
              {getSendOtpButtonLabel({ submitting: false, cooldownSeconds })}
            </p>
          )}
          <button
            type="submit"
            disabled={sendBlocked}
            aria-busy={submitting}
            className="btn-gold w-full"
          >
            {sendButtonLabel}
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
            <span className="font-medium text-[var(--pp-navy)]">{email}</span>.
            You can also use the magic link in the same email.
          </p>
          <div>
            <label htmlFor="token" className="block text-sm font-medium">
              6-digit verification code
            </label>
            <input
              id="token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              placeholder="000000"
              className="field-input mt-1 tracking-widest"
              required
              disabled={submitting}
              value={token}
              onChange={(event) =>
                setToken(normalizeOtpTokenInput(event.target.value))
              }
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
          <button
            type="submit"
            disabled={submitting || token.length !== 6}
            aria-busy={submitting}
            className="btn-gold w-full"
          >
            {submitting ? "Verifying…" : "Verify and continue"}
          </button>
          <button
            type="button"
            className="w-full text-sm text-zinc-600 underline disabled:cursor-not-allowed disabled:opacity-60"
            disabled={sendBlocked}
            aria-busy={submitting}
            onClick={() => void requestSignInEmail(email)}
          >
            {cooldownSeconds > 0
              ? getSendOtpButtonLabel({ submitting, cooldownSeconds })
              : submitting
                ? "Sending…"
                : "Resend sign-in code"}
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
