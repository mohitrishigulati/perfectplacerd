import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const MAX_RESUME_UPLOADS_PER_HOUR = 15;
export const MAX_RESUME_PARSES_PER_HOUR = 20;

const WINDOW_MS = 60 * 60 * 1000;

type Client = SupabaseClient<Database>;

export async function recordResumeProcessingEvent(
  supabase: Client,
  userId: string,
  eventType: "upload" | "parse",
  resumeId?: string,
): Promise<void> {
  await supabase.from("resume_processing_events").insert({
    user_id: userId,
    event_type: eventType,
    resume_id: resumeId ?? null,
  });
}

export async function isResumeProcessingRateLimited(
  supabase: Client,
  userId: string,
  eventType: "upload" | "parse",
  limit: number,
): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from("resume_processing_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", since);

  if (error) {
    return false;
  }
  return (count ?? 0) >= limit;
}
