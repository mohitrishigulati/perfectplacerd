"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  deleteAccountAction,
  requestDataExportAction,
  updateEmailAction,
  updateNotificationPreferencesAction,
} from "@/app/dashboard/actions";
import { changeEmailSchema, deleteAccountSchema } from "@/lib/validations/profile";

type DeleteAccountFormValues = {
  confirm: string;
};

type ChangeEmailFormValues = {
  email: string;
};

function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const emailForm = useForm<ChangeEmailFormValues>({
    defaultValues: { email: "" },
  });
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function onSubmit(values: ChangeEmailFormValues) {
    setResult(null);
    const parsed = changeEmailSchema.safeParse(values);
    if (!parsed.success) {
      setResult({
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Enter a valid email address",
      });
      return;
    }
    const response = await updateEmailAction(parsed.data);
    setResult({ ok: response.ok, message: response.message ?? "" });
    if (response.ok) {
      emailForm.reset({ email: "" });
    }
  }

  return (
    <form className="mt-4 space-y-3" onSubmit={emailForm.handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="current-email" className="text-sm font-medium">
          Current email
        </label>
        <input
          id="current-email"
          className="field-input mt-1"
          value={currentEmail}
          disabled
        />
      </div>
      <div>
        <label htmlFor="new-email" className="text-sm font-medium">
          New email
        </label>
        <input
          id="new-email"
          type="email"
          className="field-input mt-1"
          autoComplete="email"
          {...emailForm.register("email")}
        />
        {emailForm.formState.errors.email && (
          <p className="field-error">{emailForm.formState.errors.email.message}</p>
        )}
      </div>
      {result && (
        <p
          className={`text-sm ${result.ok ? "text-emerald-700" : "text-red-600"}`}
          role={result.ok ? "status" : "alert"}
        >
          {result.message}
        </p>
      )}
      <button type="submit" className="btn-secondary" disabled={emailForm.formState.isSubmitting}>
        {emailForm.formState.isSubmitting ? "Sending…" : "Change email"}
      </button>
    </form>
  );
}

function NotificationPreferences({
  initialValue,
}: {
  initialValue: boolean;
}) {
  const [checked, setChecked] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: boolean) {
    setChecked(next);
    setSaving(true);
    setError(null);
    const result = await updateNotificationPreferencesAction({
      notifyApplicationStatus: next,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      setChecked(!next);
    }
  }

  return (
    <div className="mt-4">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-zinc-300"
          checked={checked}
          disabled={saving}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>
          Email me when the status of one of my applications changes.
        </span>
      </label>
      {error && (
        <p className="field-error mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function SettingsPanel({
  email,
  notifyApplicationStatus,
}: {
  email: string;
  notifyApplicationStatus: boolean;
}) {
  const router = useRouter();
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteForm = useForm<DeleteAccountFormValues>({
    defaultValues: { confirm: "" },
  });

  async function onExportClick() {
    setExportError(null);
    setExportMessage(null);
    const result = await requestDataExportAction();
    if (!result.ok) {
      setExportError(result.message);
      return;
    }
    setExportMessage(result.message ?? "Ready to export");
  }

  async function onDelete(values: DeleteAccountFormValues) {
    setDeleteError(null);
    const parsed = deleteAccountSchema.safeParse(values);
    if (!parsed.success) {
      setDeleteError(parsed.error.issues[0]?.message ?? "Confirmation required");
      return;
    }
    const result = await deleteAccountAction(parsed.data);
    if (!result.ok) {
      setDeleteError(result.message);
      return;
    }
    router.replace("/auth");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-labelledby="email-heading"
      >
        <h2 id="email-heading" className="text-lg font-semibold">
          Sign-in email
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          You sign in with a code sent to this address, so changing it also
          changes how you log in.
        </p>
        <ChangeEmailForm currentEmail={email} />
      </section>

      <section
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-labelledby="notifications-heading"
      >
        <h2 id="notifications-heading" className="text-lg font-semibold">
          Notifications
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Control which emails we send you.
        </p>
        <NotificationPreferences initialValue={notifyApplicationStatus} />
      </section>

      <section
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-labelledby="export-heading"
      >
        <h2 id="export-heading" className="text-lg font-semibold">
          Export your data
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Download a JSON copy of your profile, applications, saved jobs, and
          privacy requests. Resume files remain private; metadata is included.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="btn-secondary" onClick={onExportClick}>
            Log export request
          </button>
          <a href="/api/dashboard/export" className="btn-primary text-center">
            Download JSON export
          </a>
        </div>
        {exportMessage && (
          <p className="mt-3 text-sm text-emerald-700" role="status">
            {exportMessage}
          </p>
        )}
        {exportError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {exportError}
          </p>
        )}
      </section>

      <section
        className="rounded-2xl border border-red-200 bg-red-50/70 p-5 dark:border-red-900 dark:bg-red-950/30"
        aria-labelledby="delete-heading"
      >
        <h2 id="delete-heading" className="text-lg font-semibold text-red-900 dark:text-red-200">
          Delete account
        </h2>
        <p className="mt-1 text-sm text-red-800 dark:text-red-300">
          This permanently removes your auth account, profile, applications, and
          uploaded resume files.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={deleteForm.handleSubmit(onDelete)}
          noValidate
        >
          <div>
            <label htmlFor="confirm-delete" className="text-sm font-medium">
              Type DELETE to confirm
            </label>
            <input
              id="confirm-delete"
              className="field-input mt-1"
              autoComplete="off"
              {...deleteForm.register("confirm")}
            />
            {deleteForm.formState.errors.confirm && (
              <p className="field-error">
                {deleteForm.formState.errors.confirm.message}
              </p>
            )}
          </div>
          {deleteError && (
            <p className="field-error" role="alert">
              {deleteError}
            </p>
          )}
          <button
            type="submit"
            className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-60"
            disabled={deleteForm.formState.isSubmitting}
          >
            {deleteForm.formState.isSubmitting
              ? "Deleting…"
              : "Delete my account"}
          </button>
        </form>
      </section>
    </div>
  );
}
