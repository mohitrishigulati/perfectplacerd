"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { updateProfileAction } from "@/app/dashboard/actions";
import type { DashboardProfile } from "@/lib/dashboard/queries";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";

const VISIBILITY_OPTIONS = [
  {
    value: "private",
    label: "Private",
    description: "Only you can see your profile details.",
  },
  {
    value: "recruiters",
    label: "Recruiters only",
    description: "Verified recruiters can view your profile when you apply.",
  },
  {
    value: "public",
    label: "Public",
    description: "Your headline and skills may appear in search results.",
  },
] as const;

type Props = {
  profile: DashboardProfile;
  hasPrimaryResume: boolean;
};

export function ProfileEditorForm({ profile, hasPrimaryResume }: Props) {
  const router = useRouter();
  const [skillDraft, setSkillDraft] = useState("");
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultValues = useMemo<ProfileFormValues>(
    () => ({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      headline: profile.headline ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
      skills: profile.skills ?? [],
      preferences: {
        remote: profile.preferences?.remote,
        employmentTypes: profile.preferences?.employmentTypes ?? [],
        preferredLocations: profile.preferences?.preferredLocations ?? [],
        openToRelocate: profile.preferences?.openToRelocate ?? false,
      },
      profile_visibility: profile.profile_visibility ?? "private",
    }),
    [profile],
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const watched = useWatch({ control: form.control });
  const skills = watched?.skills ?? [];
  const completion = calculateProfileCompletion({
    ...(watched as ProfileFormValues),
    hasPrimaryResume,
  });

  function addSkill() {
    const value = skillDraft.trim();
    if (!value) return;
    const current = form.getValues("skills");
    if (current.includes(value)) {
      setSkillDraft("");
      return;
    }
    form.setValue("skills", [...current, value], { shouldValidate: true });
    setSkillDraft("");
  }

  function removeSkill(index: number) {
    const current = form.getValues("skills");
    form.setValue(
      "skills",
      current.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  }

  async function onSubmit(values: ProfileFormValues) {
    setFormError(null);
    setFormMessage(null);
    const result = await updateProfileAction(values);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    setFormMessage(result.message ?? "Saved");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form
        className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="full_name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="full_name"
              className="field-input mt-1"
              {...form.register("full_name")}
            />
            {form.formState.errors.full_name && (
              <p className="field-error">{form.formState.errors.full_name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="headline" className="text-sm font-medium">
              Headline
            </label>
            <input id="headline" className="field-input mt-1" {...form.register("headline")} />
          </div>
          <div>
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <input id="location" className="field-input mt-1" {...form.register("location")} />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="field-input mt-1"
              {...form.register("phone")}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium">
              About you
            </label>
            <textarea
              id="bio"
              rows={5}
              className="field-input mt-1"
              {...form.register("bio")}
            />
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Skills</legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="field-input flex-1"
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              placeholder="Add a skill"
              aria-label="New skill"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button type="button" className="btn-secondary" onClick={addSkill}>
              Add skill
            </button>
          </div>
          <ul className="flex flex-wrap gap-2" role="list">
            {skills.map((skill, index) => (
              <li key={`${skill}-${index}`}>
                <button
                  type="button"
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                  onClick={() => removeSkill(index)}
                  aria-label={`Remove skill ${skill}`}
                >
                  {skill} <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
          {form.formState.errors.skills && (
            <p className="field-error">{form.formState.errors.skills.message}</p>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Job preferences</legend>
          <div>
            <label htmlFor="remote" className="text-sm font-medium">
              Work style
            </label>
            <select
              id="remote"
              className="field-input mt-1"
              {...form.register("preferences.remote", {
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
            >
              <option value="">Select…</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
              <option value="any">Open to any</option>
            </select>
          </div>
          <div>
            <label htmlFor="employmentTypes" className="text-sm font-medium">
              Employment types (comma-separated)
            </label>
            <input
              id="employmentTypes"
              className="field-input mt-1"
              defaultValue={(profile.preferences?.employmentTypes ?? []).join(", ")}
              onBlur={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean);
                form.setValue("preferences.employmentTypes", values, {
                  shouldValidate: true,
                });
              }}
            />
          </div>
          <div>
            <label htmlFor="preferredLocations" className="text-sm font-medium">
              Preferred locations (comma-separated)
            </label>
            <input
              id="preferredLocations"
              className="field-input mt-1"
              defaultValue={(profile.preferences?.preferredLocations ?? []).join(", ")}
              onBlur={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean);
                form.setValue("preferences.preferredLocations", values, {
                  shouldValidate: true,
                });
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("preferences.openToRelocate")} />
            Open to relocation
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Profile visibility</legend>
          {VISIBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <input
                type="radio"
                value={option.value}
                className="mt-1"
                {...form.register("profile_visibility")}
              />
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-sm text-zinc-600 dark:text-zinc-400">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {formError && (
          <p className="field-error" role="alert">
            {formError}
          </p>
        )}
        {formMessage && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
            {formMessage}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save profile"}
        </button>
      </form>

      <ProfileCompletionCard completion={completion} />
    </div>
  );
}
