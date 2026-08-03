import { z } from "zod";
import { EXPERIENCE_LEVELS, WORK_MODES } from "@/lib/opportunities/filters";

export const adminJobFormSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(160),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  employment_type: z.string().trim().max(80).optional().or(z.literal("")),
  department: z.string().trim().max(80).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  work_mode: z.enum(WORK_MODES).optional().or(z.literal("")),
  experience_level: z.enum(EXPERIENCE_LEVELS).optional().or(z.literal("")),
  salary_min: z.union([z.literal(""), z.coerce.number().int().min(0)]).optional(),
  salary_max: z.union([z.literal(""), z.coerce.number().int().min(0)]).optional(),
  salary_currency: z.string().trim().length(3),
});

export type AdminJobFormValues = z.infer<typeof adminJobFormSchema>;

export const applicationStatusSchema = z.enum([
  "submitted",
  "under_review",
  "rejected",
  "accepted",
  "withdrawn",
]);

export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>;
