import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const { requireAdminMock, fromMock, storageFromMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(async () => ({ id: "admin-1", email: "admin@example.com" })),
  fromMock: vi.fn(),
  storageFromMock: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: fromMock,
    storage: { from: storageFromMock },
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createResumeDownloadUrlAction } from "@/app/admin/actions";

describe("resume download security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires admin before issuing a signed URL", async () => {
    fromMock.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { storage_path: "user/resume.pdf", file_name: "resume.pdf" },
            error: null,
          }),
        }),
      }),
    });
    storageFromMock.mockReturnValue({
      createSignedUrl: async () => ({
        data: { signedUrl: "https://example.com/signed" },
        error: null,
      }),
    });

    await createResumeDownloadUrlAction("resume-1");
    expect(requireAdminMock).toHaveBeenCalledWith("/admin/candidates");
  });

  it("does not return a URL when resume is missing", async () => {
    fromMock.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    });

    const result = await createResumeDownloadUrlAction("missing");
    expect(result.ok).toBe(false);
    expect(result.url).toBeUndefined();
  });
});
