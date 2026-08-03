import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function userIsAdmin(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data != null;
}
