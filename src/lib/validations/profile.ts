import { z } from "zod";

export const profileVisibilitySchema = z.enum([
  "private",
  "recruiters",
  "public",
]);

export const jobPreferencesSchema = z.object({
  remote: z.enum(["onsite", "hybrid", "remote", "any"]).optional(),
  employmentTypes: z.array(z.string().trim().min(1)).max(10).optional(),
  preferredLocations: z.array(z.string().trim().min(1)).max(10).optional(),
  openToRelocate: z.boolean().optional(),
});

export const profileFormSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),
  headline: z.string().trim().max(160).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  skills: z
    .array(z.string().trim().min(1).max(60))
    .max(30, "Add up to 30 skills"),
  preferences: jobPreferencesSchema,
  profile_visibility: profileVisibilitySchema,
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type JobPreferences = z.infer<typeof jobPreferencesSchema>;
export type ProfileVisibility = z.infer<typeof profileVisibilitySchema>;

export const resumeUploadSchema = z.object({
  title: z.string().trim().min(1, "Resume title is required").max(120),
});

export const deleteAccountSchema = z.object({
  confirm: z
    .string()
    .refine((value) => value === "DELETE", {
      message: "Type DELETE to confirm account removal",
    }),
});

export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
