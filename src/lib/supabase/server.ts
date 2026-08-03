import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { requireSupabasePublicEnv } from "@/lib/supabase/public-env";

export async function createClient() {
  const { url, publicKey } = requireSupabasePublicEnv();

  const cookieStore = await cookies();

  return createServerClient<Database>(url, publicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignored when called from a Server Component without mutable cookies.
        }
      },
    },
  });
}
