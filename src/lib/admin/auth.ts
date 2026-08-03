import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/session";

/** Ensures the current request is an authenticated admin (server-only). */
export async function assertAdmin(nextPath = "/admin"): Promise<SessionUser> {
  return requireAdmin(nextPath);
}
