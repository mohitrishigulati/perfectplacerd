import { z } from "zod";

export const candidateMessageSchema = z.object({
  subject: z.string().trim().min(3, "Subject is required").max(150),
  message: z.string().trim().min(10, "Message is required").max(5000),
});

export type CandidateMessageInput = z.infer<typeof candidateMessageSchema>;
