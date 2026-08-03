import "server-only";

import { redirect } from "next/navigation";
import { userIsAdmin } from "@/lib/auth/admin";
import { AUTH_PATH, sanitizeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string | undefined;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const query = nextPath
      ? `?next=${encodeURIComponent(sanitizeNextPath(nextPath))}`
      : "";
    redirect(`${AUTH_PATH}${query}`);
  }
  return user;
}

export async function requireAdmin(nextPath?: string): Promise<SessionUser> {
  const user = await requireUser(nextPath);
  const supabase = await createClient();
  const isAdmin = await userIsAdmin(supabase, user.id);

  if (!isAdmin) {
    redirect(`${AUTH_PATH}?error=admin_required`);
  }

  return user;
}

export async function getIsAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) {
    return false;
  }
  const supabase = await createClient();
  return userIsAdmin(supabase, user.id);
}
