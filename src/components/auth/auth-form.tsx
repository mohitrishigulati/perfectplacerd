"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sanitizeNextPath } from "@/lib/auth/paths";
import {
  sendSignInOtpAction,
  verifySignInOtpAction,
} from "@/app/auth/actions";
import {
  authEmailSchema,
  authOtpSchema,
  type AuthEmailSchema,
  type AuthOtpSchema,
} from "@/lib/validations/auth";

type Step = "email" | "otp";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const authError = searchParams.get("error");

  const [step, setStep] = useState<Step>("email");
  const [emailForOtp, setEmailForOtp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const emailForm = useForm<AuthEmailSchema>({
    resolver: zodResolver(authEmailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<AuthOtpSchema>({
    resolver: zodResolver(authOtpSchema),
    defaultValues: { email: "", token: "" },
  });

  async function onSendCode(values: AuthEmailSchema) {
    setFormError(null);
    setStatusMessage(null);

    const result = await sendSignInOtpAction({
      email: values.email,
      origin: window.location.origin,
      nextPath,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setEmailForOtp(values.email);
    otpForm.setValue("email", values.email);
    setStep("otp");
    setStatusMessage(
      "Check your inbox and spam folder. Use the 6-digit code in the email, or click the sign-in link in the same message.",
    );
  }

  async function onVerifyCode(values: AuthOtpSchema) {
    setFormError(null);

    const result = await verifySignInOtpAction({
      email: values.email,
      token: values.token,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {authError === "not_configured" && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          Sign-in is not configured on this server. Add Supabase env vars in
          Vercel and redeploy, then set Supabase redirect URLs to this site&apos;s{" "}
          <code className="text-xs">/auth/callback</code>.
        </p>
      )}

      {authError === "callback_failed" && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          Sign-in link expired or was invalid. Request a new code and try again.
        </p>
      )}

      {authError === "admin_required" && (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          Admin access is required for that page. Sign in with an admin account
          or contact support.
        </p>
      )}

      {step === "email" ? (
        <form
          className="space-y-4"
          onSubmit={emailForm.handleSubmit(onSendCode)}
          noValidate
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              {...emailForm.register("email")}
            />
            {emailForm.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>
          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
          {formError?.toLowerCase().includes("rate limit") && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Supabase limits how many auth emails a project can send per hour on
              the default mailer (often after many test sign-ins). Wait about an
              hour, then try once. For production, set up custom SMTP under
              Supabase → Project Settings → Authentication → SMTP.
            </p>
          )}
          <button
            type="submit"
            disabled={emailForm.formState.isSubmitting}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {emailForm.formState.isSubmitting ? "Sending…" : "Send sign-in code"}
          </button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={otpForm.handleSubmit(onVerifyCode)}
          noValidate
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Code sent to{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {emailForOtp}
            </span>
          </p>
          <input type="hidden" {...otpForm.register("email")} />
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Verification code
            </label>
            <input
              id="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              {...otpForm.register("token")}
            />
            {otpForm.formState.errors.token && (
              <p className="mt-1 text-sm text-red-600">
                {otpForm.formState.errors.token.message}
              </p>
            )}
          </div>
          {statusMessage && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {statusMessage}
            </p>
          )}
          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
          {formError?.toLowerCase().includes("rate limit") && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Supabase limits how many auth emails a project can send per hour on
              the default mailer (often after many test sign-ins). Wait about an
              hour, then try once. For production, set up custom SMTP under
              Supabase → Project Settings → Authentication → SMTP.
            </p>
          )}
          <button
            type="submit"
            disabled={otpForm.formState.isSubmitting}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {otpForm.formState.isSubmitting ? "Verifying…" : "Verify and continue"}
          </button>
          <button
            type="button"
            className="w-full text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            onClick={() => {
              setStep("email");
              setFormError(null);
              setStatusMessage(null);
            }}
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
