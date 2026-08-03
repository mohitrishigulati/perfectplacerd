import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const { redirectMock, getUserMock, fromMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  getUserMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase/public-env", () => ({
  isSupabasePublicEnvConfigured: () => true,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
  })),
}));

import { getSessionUser, requireAdmin, requireUser } from "@/lib/auth/session";

describe("session validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSessionUser returns null without a user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    await expect(getSessionUser()).resolves.toBeNull();
  });

  it("getSessionUser returns mapped user", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1", email: "a@example.com" } },
      error: null,
    });
    await expect(getSessionUser()).resolves.toEqual({
      id: "u1",
      email: "a@example.com",
    });
  });

  it("requireUser redirects when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    await expect(requireUser("/dashboard")).rejects.toThrow(
      "REDIRECT:/auth?next=%2Fdashboard",
    );
  });

  it("requireAdmin redirects when user is not in admin_users", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1", email: "a@example.com" } },
      error: null,
    });
    fromMock.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    });

    await expect(requireAdmin("/admin")).rejects.toThrow(
      "REDIRECT:/auth?error=admin_required",
    );
  });
});
