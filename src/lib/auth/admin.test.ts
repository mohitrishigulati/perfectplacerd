import { describe, expect, it, vi } from "vitest";
import { userIsAdmin } from "@/lib/auth/admin";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockSupabase(result: {
  data: { user_id: string } | null;
  error: Error | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  return {
    client: { from } as unknown as SupabaseClient<Database>,
    from,
    eq,
  };
}

describe("userIsAdmin", () => {
  it("returns true when admin_users row exists", async () => {
    const { client, from, eq } = createMockSupabase({
      data: { user_id: "admin-1" },
      error: null,
    });

    await expect(userIsAdmin(client, "admin-1")).resolves.toBe(true);
    expect(from).toHaveBeenCalledWith("admin_users");
    expect(eq).toHaveBeenCalledWith("user_id", "admin-1");
  });

  it("returns false when no row or query error", async () => {
    const noRow = createMockSupabase({ data: null, error: null });
    await expect(userIsAdmin(noRow.client, "user-1")).resolves.toBe(false);

    const withError = createMockSupabase({
      data: null,
      error: new Error("db"),
    });
    await expect(userIsAdmin(withError.client, "user-1")).resolves.toBe(false);
  });
});
