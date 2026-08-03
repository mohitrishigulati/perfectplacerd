import { z } from "zod";

export const resumeSuggestionFieldSchema = z.enum([
  "full_name",
  "phone",
  "headline",
  "location",
  "bio",
  "skills",
  "preferred_locations",
]);

export const applyResumeSuggestionsSchema = z.object({
  resumeId: z.string().uuid(),
  acceptedFields: z
    .array(resumeSuggestionFieldSchema)
    .min(1, "Select at least one field to apply"),
  overwriteExisting: z.boolean().optional().default(false),
});

export type ApplyResumeSuggestionsInput = z.infer<
  typeof applyResumeSuggestionsSchema
>;

export type SuggestionFieldKey = z.infer<typeof resumeSuggestionFieldSchema>;
