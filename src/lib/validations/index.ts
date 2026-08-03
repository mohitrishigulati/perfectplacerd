import { z } from "zod";

/** Shared Zod schemas for React Hook Form (`@hookform/resolvers/zod`) go here. */
export const placeholderSchema = z.object({
  note: z.literal("Add form schemas in src/lib/validations"),
});

export type PlaceholderSchema = z.infer<typeof placeholderSchema>;
