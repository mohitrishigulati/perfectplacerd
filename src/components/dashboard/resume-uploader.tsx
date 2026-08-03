"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { registerResumeAction } from "@/app/dashboard/actions";
import { parseResumeAction } from "@/app/dashboard/resume-actions";
import { createClient } from "@/lib/supabase/client";
import { buildResumeStorageObjectPath } from "@/lib/resumes/safe-filename";
import type { PrimaryResume } from "@/lib/dashboard/queries";

const ACCEPT =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type UploadStage =
  | "idle"
  | "uploading"
  | "registering"
  | "reading"
  | "preparing"
  | "done"
  | "error";

type Props = {
  userId: string;
  resume: PrimaryResume | null;
};

function stageMessage(stage: UploadStage): string | null {
  switch (stage) {
    case "uploading":
      return "Uploading…";
    case "registering":
      return "Securing your file…";
    case "reading":
      return "Reading resume…";
    case "preparing":
      return "Preparing suggestions…";
    case "done":
      return "Ready for review.";
    default:
      return null;
  }
}

export function ResumeUploader({ userId, resume }: Props) {
  const inputId = useId();
  const consentId = useId();
  const router = useRouter();
  const [title, setTitle] = useState(resume?.title ?? "Primary resume");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [consent, setConsent] = useState(false);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      setError("Only PDF or DOCX resumes are allowed.");
      return;
    }

    if (file.size > MAX_RESUME_BYTES) {
      setError("Resumes must be 10 MB or smaller.");
      return;
    }

    if (!consent) {
      setError(
        "Please confirm resume processing consent before uploading.",
      );
      return;
    }

    setStage("uploading");
    setError(null);
    setMessage(null);

    const objectId = crypto.randomUUID();
    const objectPath = buildResumeStorageObjectPath(userId, objectId, file.name);

    let failed = false;
    try {
      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(objectPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        throw new Error("Upload failed. Please try again.");
      }

      setStage("registering");
      const result = await registerResumeAction({
        title: title.trim() || "Primary resume",
        storagePath: objectPath,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        byteSize: file.size,
      });

      if (!result.ok) {
        await supabase.storage.from("resumes").remove([objectPath]);
        throw new Error(result.message);
      }

      if (result.resumeId) {
        setStage("reading");
        const parseResult = await parseResumeAction(result.resumeId);
        setStage("preparing");
        if (!parseResult.ok) {
          setMessage(parseResult.message);
        } else {
          setStage("done");
          setMessage(stageMessage("done"));
        }
      } else {
        setStage("done");
        setMessage(result.message ?? "Resume uploaded.");
      }

      router.refresh();
    } catch (err) {
      failed = true;
      setStage("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (!failed) {
        setStage("idle");
      }
    }
  }

  const progress = stageMessage(stage);

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="resume-upload-heading"
    >
      <h2 id="resume-upload-heading" className="text-lg font-semibold">
        Private resume
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        PDF or DOCX only, up to 10&nbsp;MB. Files stay in a private bucket
        accessible to you and authorized recruiters reviewing your applications.
      </p>

      {resume && (
        <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
          <p className="font-medium">{resume.title}</p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {resume.file_name ?? "Uploaded file"}
            {resume.byte_size
              ? ` · ${Math.round(resume.byte_size / 1024)} KB`
              : null}
          </p>
          <p className="mt-1 text-zinc-500">
            Updated {new Date(resume.updated_at).toLocaleString()}
          </p>
        </div>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="resume-title" className="text-sm font-medium">
            Resume label
          </label>
          <input
            id="resume-title"
            className="field-input mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <label htmlFor={consentId} className="flex items-start gap-2 text-sm">
          <input
            id={consentId}
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1"
          />
          <span>
            I agree that Perfect Placer may process this resume to suggest profile
            information. See our{" "}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>{" "}
            for retention and deletion details.
          </span>
        </label>

        <div>
          <label htmlFor={inputId} className="text-sm font-medium">
            {resume ? "Replace resume file" : "Upload resume file"}
          </label>
          <input
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:file:bg-zinc-100 dark:file:text-zinc-900"
            onChange={onFileChange}
            disabled={
              stage === "uploading" ||
              stage === "registering" ||
              stage === "reading" ||
              stage === "preparing"
            }
          />
        </div>
      </div>

      {progress && (
        <p className="mt-3 text-sm text-zinc-600" role="status" aria-live="polite">
          {progress}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
