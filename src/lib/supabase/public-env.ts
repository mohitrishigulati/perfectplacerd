/** Browser-safe Supabase URL from env. */
export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/**
 * Supabase dashboard may label this the publishable key; older docs use anon key.
 * Either env var works.
 */
export function getSupabasePublicKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabasePublicEnvConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();
  return Boolean(url && key && url.startsWith("https://"));
}

export function requireSupabasePublicEnv(): { url: string; publicKey: string } {
  const url = getSupabaseUrl();
  const publicKey = getSupabasePublicKey();

  if (!url || !publicKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or Supabase public key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY). Copy .env.example to .env.local.",
    );
  }

  return { url, publicKey };
}
