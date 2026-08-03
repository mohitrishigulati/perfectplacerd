"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createJobAction, updateJobAction } from "@/app/admin/actions";
import { slugifyTitle } from "@/lib/admin/jobs";
import {
  adminJobFormSchema,
  type AdminJobFormValues,
} from "@/lib/validations/admin-job";
import { EXPERIENCE_LEVELS, WORK_MODES } from "@/lib/opportunities/filters";
import {
  EXPERIENCE_LABELS,
  WORK_MODE_LABELS,
} from "@/lib/opportunities/apply";
import type { Tables } from "@/types/database";

type Props = {
  mode: "create" | "edit";
  job?: Tables<"jobs">;
  createJob?: typeof createJobAction;
  updateJob?: typeof updateJobAction;
};

function toFormValues(job?: Tables<"jobs">): AdminJobFormValues {
  if (!job) {
    return {
      title: "",
      slug: "",
      description: "",
      location: "",
      employment_type: "",
      department: "",
      industry: "",
      work_mode: "",
      experience_level: "",
      salary_min: "",
      salary_max: "",
      salary_currency: "USD",
    };
  }
  return {
    title: job.title,
    slug: job.slug,
    description: job.description,
    location: job.location ?? "",
    employment_type: job.employment_type ?? "",
    department: job.department ?? "",
    industry: job.industry ?? "",
    work_mode: job.work_mode ?? "",
    experience_level: job.experience_level ?? "",
    salary_min: job.salary_min ?? "",
    salary_max: job.salary_max ?? "",
    salary_currency: job.salary_currency,
  };
}

export function AdminJobForm({
  mode,
  job,
  createJob = createJobAction,
  updateJob = updateJobAction,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<AdminJobFormValues>({
    defaultValues: toFormValues(job),
  });

  async function onSubmit(raw: AdminJobFormValues) {
    setError(null);
    setMessage(null);

    const withSlug = {
      ...raw,
      slug: raw.slug.trim() || slugifyTitle(raw.title),
    };

    const parsed = adminJobFormSchema.safeParse(withSlug);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }

    const values = parsed.data;

    const result =
      mode === "create"
        ? await createJob(values)
        : await updateJob(job!.id, values);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage(result.message ?? "Saved");
    if (mode === "create" && result.id) {
      router.replace(`/admin/jobs/${result.id}/edit`);
    } else {
      router.refresh();
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <input id="title" className="field-input mt-1" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="field-error">{form.formState.errors.title.message}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="slug" className="text-sm font-medium">Slug</label>
          <input id="slug" className="field-input mt-1" {...form.register("slug")} />
          <p className="mt-1 text-xs text-zinc-500">Leave blank to generate from title.</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <textarea id="description" rows={8} className="field-input mt-1" {...form.register("description")} />
        </div>
        <div>
          <label htmlFor="location" className="text-sm font-medium">Location</label>
          <input id="location" className="field-input mt-1" {...form.register("location")} />
        </div>
        <div>
          <label htmlFor="employment_type" className="text-sm font-medium">Employment type</label>
          <input id="employment_type" className="field-input mt-1" {...form.register("employment_type")} />
        </div>
        <div>
          <label htmlFor="department" className="text-sm font-medium">Department</label>
          <input id="department" className="field-input mt-1" {...form.register("department")} />
        </div>
        <div>
          <label htmlFor="industry" className="text-sm font-medium">Industry</label>
          <input id="industry" className="field-input mt-1" {...form.register("industry")} />
        </div>
        <div>
          <label htmlFor="work_mode" className="text-sm font-medium">Work mode</label>
          <select id="work_mode" className="field-input mt-1" {...form.register("work_mode")}>
            <option value="">—</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>{WORK_MODE_LABELS[mode]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="experience_level" className="text-sm font-medium">Experience</label>
          <select id="experience_level" className="field-input mt-1" {...form.register("experience_level")}>
            <option value="">—</option>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>{EXPERIENCE_LABELS[level]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="salary_min" className="text-sm font-medium">Salary min</label>
          <input id="salary_min" type="number" className="field-input mt-1" {...form.register("salary_min")} />
        </div>
        <div>
          <label htmlFor="salary_max" className="text-sm font-medium">Salary max</label>
          <input id="salary_max" type="number" className="field-input mt-1" {...form.register("salary_max")} />
        </div>
        <div>
          <label htmlFor="salary_currency" className="text-sm font-medium">Currency</label>
          <input id="salary_currency" className="field-input mt-1" {...form.register("salary_currency")} />
        </div>
      </div>

      {error && <p className="field-error" role="alert">{error}</p>}
      {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}

      <button type="submit" className="btn-primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : mode === "create" ? "Create draft" : "Save changes"}
      </button>
    </form>
  );
}
