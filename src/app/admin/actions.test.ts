import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const { requireAdminMock, fromMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(async () => ({ id: "admin-1", email: "admin@example.com" })),
  fromMock: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { setJobStatusAction } from "@/app/admin/actions";

describe("admin server actions authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls requireAdmin before changing job status", async () => {
    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { status: "draft" }, error: null }),
        }),
      }),
    });
    fromMock.mockReturnValueOnce({
      update: () => ({
        eq: async () => ({ error: null }),
      }),
    });

    await setJobStatusAction("job-1", "publish");
    expect(requireAdminMock).toHaveBeenCalledWith("/admin/jobs/job-1/edit");
  });
});
