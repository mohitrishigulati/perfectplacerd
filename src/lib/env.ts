import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  supabasePublicKey: z.string().min(1),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

/** Validates public env vars (use when wiring Supabase or at app bootstrap). */
export function getClientEnv(): ClientEnv {
  const supabasePublicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return clientEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublicKey,
  });
}
