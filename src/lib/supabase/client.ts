import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { requireSupabasePublicEnv } from "@/lib/supabase/public-env";

export function createClient() {
  const { url, publicKey } = requireSupabasePublicEnv();
  return createBrowserClient<Database>(url, publicKey);
}
