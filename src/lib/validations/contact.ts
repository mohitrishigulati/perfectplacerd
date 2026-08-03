import { z } from "zod";

export const contactInquiryTypeSchema = z.enum(["candidate", "employer", "general"]);

export const contactInquirySchema = z.object({
  inquiryType: contactInquiryTypeSchema,
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (at least 10 characters)")
    .max(3000),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
