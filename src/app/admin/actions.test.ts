import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const { requireAdminMock, fromMock, sendApplicationStatusChangedEmailMock } =
  vi.hoisted(() => ({
    requireAdminMock: vi.fn(async () => ({ id: "admin-1", email: "admin@example.com" })),
    fromMock: vi.fn(),
    sendApplicationStatusChangedEmailMock: vi.fn(async () => true),
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

vi.mock("@/lib/email/application-status", () => ({
  sendApplicationStatusChangedEmail: sendApplicationStatusChangedEmailMock,
}));

import { setJobStatusAction, updateApplicationStatusAction } from "@/app/admin/actions";

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

  it("emails the candidate after a successful application status change", async () => {
    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { candidate_id: "candidate-1" },
              error: null,
            }),
          }),
        }),
      }),
    });
    fromMock.mockReturnValueOnce({
      update: () => ({
        eq: () => ({
          eq: async () => ({ error: null }),
        }),
      }),
    });
    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { email: "candidate@example.com" },
            error: null,
          }),
        }),
      }),
    });
    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { title: "Head of Growth" }, error: null }),
        }),
      }),
    });

    const result = await updateApplicationStatusAction({
      applicationId: "app-1",
      jobId: "job-1",
      status: "under_review",
    });

    expect(result.ok).toBe(true);
    expect(sendApplicationStatusChangedEmailMock).toHaveBeenCalledWith({
      to: "candidate@example.com",
      jobTitle: "Head of Growth",
      status: "under_review",
    });
  });

  it("still reports success when the notification email fails", async () => {
    sendApplicationStatusChangedEmailMock.mockRejectedValueOnce(
      new Error("resend_http_500"),
    );

    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { candidate_id: "candidate-1" },
              error: null,
            }),
          }),
        }),
      }),
    });
    fromMock.mockReturnValueOnce({
      update: () => ({
        eq: () => ({
          eq: async () => ({ error: null }),
        }),
      }),
    });
    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { email: "candidate@example.com" },
            error: null,
          }),
        }),
      }),
    });
    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { title: "Head of Growth" }, error: null }),
        }),
      }),
    });

    const result = await updateApplicationStatusAction({
      applicationId: "app-1",
      jobId: "job-1",
      status: "rejected",
    });

    expect(result.ok).toBe(true);
  });
});
