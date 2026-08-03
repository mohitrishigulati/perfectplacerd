"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sanitizeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/client";
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
    const supabase = createClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo,
      },
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    setEmailForOtp(values.email);
    otpForm.setValue("email", values.email);
    setStep("otp");
    setStatusMessage("Check your email for a sign-in code or magic link.");
  }

  async function onVerifyCode(values: AuthOtpSchema) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: values.email,
      token: values.token,
      type: "email",
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md space-y-6">
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
