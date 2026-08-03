"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { registerResumeAction } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import type { PrimaryResume } from "@/lib/dashboard/queries";

const ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type Props = {
  userId: string;
  resume: PrimaryResume | null;
};

export function ResumeUploader({ userId, resume }: Props) {
  const inputId = useId();
  const router = useRouter();
  const [title, setTitle] = useState(resume?.title ?? "Primary resume");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const objectPath = `${userId}/${crypto.randomUUID()}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(objectPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const result = await registerResumeAction({
        title: title.trim() || "Primary resume",
        storagePath: objectPath,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        byteSize: file.size,
      });

      if (!result.ok) {
        throw new Error(result.message);
      }

      setMessage(result.message ?? "Resume uploaded.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="resume-upload-heading"
    >
      <h2 id="resume-upload-heading" className="text-lg font-semibold">
        Private resume
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        PDF or Word documents up to 5&nbsp;MB. Files are stored in a private
        bucket and only you can access them.
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
            disabled={uploading}
          />
        </div>
      </div>

      {uploading && (
        <p className="mt-3 text-sm text-zinc-600" role="status">
          Uploading securely…
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
