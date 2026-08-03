"use client";

import { useMemo, useState } from "react";
import { applyResumeSuggestionsAction, retryParseResumeAction } from "@/app/dashboard/resume-actions";
import type { DashboardProfile } from "@/lib/dashboard/queries";
import type { PrimaryResume } from "@/lib/dashboard/queries";
import { buildSuggestionComparisonRows } from "@/lib/resumes/apply-suggestions";
import { getParsingUserMessage } from "@/lib/resumes/parsing-messages";
import type { ExtractedResumeProfile } from "@/lib/resumes/extraction/types";
import type { SuggestionFieldKey } from "@/lib/validations/resume-suggestions";

type Props = {
  resume: PrimaryResume;
  profile: DashboardProfile;
};

export function ResumeSuggestionsReview({ resume, profile }: Props) {
  const extracted = resume.extracted_data as ExtractedResumeProfile;
  const confidence = useMemo(
    () => resume.extraction_confidence ?? {},
    [resume.extraction_confidence],
  );

  const rows = useMemo(
    () =>
      buildSuggestionComparisonRows({
        profile,
        extracted,
        confidence,
      }),
    [profile, extracted, confidence],
  );

  const [selected, setSelected] = useState<SuggestionFieldKey[]>(() =>
    rows.filter((row) => row.defaultSelected).map((row) => row.key),
  );
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [retryBusy, setRetryBusy] = useState(false);

  function toggleField(key: SuggestionFieldKey) {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  async function onApply() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await applyResumeSuggestionsAction({
        resumeId: resume.id,
        acceptedFields: selected,
        overwriteExisting,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setMessage(result.message ?? "Profile updated.");
    } finally {
      setBusy(false);
    }
  }

  async function onRetryParse() {
    setRetryBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await retryParseResumeAction(resume.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setMessage(result.message ?? "Retry started.");
      window.location.reload();
    } finally {
      setRetryBusy(false);
    }
  }

  if (resume.parsing_status === "pending" || resume.parsing_status === "processing") {
    return (
      <section
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Profile suggestions</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400" role="status">
          {resume.parsing_status === "pending"
            ? "Waiting to read your resume…"
            : "Reading resume and preparing suggestions…"}
        </p>
      </section>
    );
  }

  if (resume.parsing_status === "failed") {
    return (
      <section
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Profile suggestions</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300" role="status">
          {getParsingUserMessage(resume.parsing_error_category)}
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={onRetryParse}
          disabled={retryBusy}
        >
          {retryBusy ? "Retrying…" : "Retry reading resume"}
        </button>
        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  }

  if (!rows.length) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold">Profile suggestions</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No profile fields could be suggested from this resume. You can edit your
          profile manually.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="resume-suggestions-heading"
    >
      <h2 id="resume-suggestions-heading" className="text-lg font-semibold">
        Review profile suggestions
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Compare your current profile with values read from your resume. Nothing is
        saved until you apply selected fields.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th scope="col" className="py-2 pr-3 font-medium">
                Apply
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Field
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Current profile
              </th>
              <th scope="col" className="py-2 font-medium">
                Resume suggestion
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-zinc-100 align-top dark:border-zinc-900"
              >
                <td className="py-3 pr-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.key)}
                    onChange={() => toggleField(row.key)}
                    aria-label={`Apply ${row.label}`}
                  />
                </td>
                <td className="py-3 pr-3">
                  <div className="font-medium">{row.label}</div>
                  {row.lowConfidence && (
                    <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                      Low confidence — review carefully
                    </span>
                  )}
                </td>
                <td className="py-3 pr-3 text-zinc-600 dark:text-zinc-400">
                  {row.current}
                </td>
                <td className="py-3">{row.suggested}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={overwriteExisting}
          onChange={(event) => setOverwriteExisting(event.target.checked)}
        />
        Replace existing non-empty profile fields for selected items
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={onApply}
          disabled={busy || selected.length === 0}
        >
          {busy ? "Applying…" : "Apply selected suggestions"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onRetryParse}
          disabled={retryBusy}
        >
          {retryBusy ? "Retrying…" : "Retry reading resume"}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
