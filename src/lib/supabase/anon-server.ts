import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  getSupabasePublicKey,
  getSupabaseUrl,
} from "@/lib/supabase/public-env";

/** Cookie-less Supabase client for sitemap/metadata (no request context). */
export function createAnonDatabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();
  if (!url || !key) {
    return null;
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
