import { z } from "zod";

export const authEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const authOtpSchema = z.object({
  email: z.string().trim().email(),
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

export type AuthEmailSchema = z.infer<typeof authEmailSchema>;
export type AuthOtpSchema = z.infer<typeof authOtpSchema>;
