import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const {
  requireAdminMock,
  fromMock,
  sendApplicationStatusChangedEmailMock,
  sendAdminMessageEmailMock,
  isEmailConfiguredMock,
} = vi.hoisted(() => ({
  requireAdminMock: vi.fn(async () => ({ id: "admin-1", email: "admin@example.com" })),
  fromMock: vi.fn(),
  sendApplicationStatusChangedEmailMock: vi.fn(async () => true),
  sendAdminMessageEmailMock: vi.fn(async () => true),
  isEmailConfiguredMock: vi.fn(() => true),
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

vi.mock("@/lib/email/admin-message", () => ({
  sendAdminMessageEmail: sendAdminMessageEmailMock,
}));

vi.mock("@/lib/email/send", () => ({
  isEmailConfigured: isEmailConfiguredMock,
}));

import {
  messageCandidateAction,
  setJobStatusAction,
  updateApplicationStatusAction,
} from "@/app/admin/actions";

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
            data: { email: "candidate@example.com", notify_application_status: true },
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

  it("skips the notification email when the candidate opted out", async () => {
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
            data: { email: "candidate@example.com", notify_application_status: false },
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
      status: "accepted",
    });

    expect(result.ok).toBe(true);
    expect(sendApplicationStatusChangedEmailMock).not.toHaveBeenCalled();
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
            data: { email: "candidate@example.com", notify_application_status: true },
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

  it("messageCandidateAction refuses to send when email isn't configured", async () => {
    isEmailConfiguredMock.mockReturnValueOnce(false);

    const result = await messageCandidateAction({
      candidateId: "candidate-1",
      subject: "Following up",
      message: "Are you still interested in this role?",
    });

    expect(result.ok).toBe(false);
    expect(sendAdminMessageEmailMock).not.toHaveBeenCalled();
  });

  it("messageCandidateAction rejects a too-short message", async () => {
    const result = await messageCandidateAction({
      candidateId: "candidate-1",
      subject: "Hi",
      message: "short",
    });

    expect(result.ok).toBe(false);
    expect(sendAdminMessageEmailMock).not.toHaveBeenCalled();
  });

  it("messageCandidateAction emails the candidate's address", async () => {
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

    const result = await messageCandidateAction({
      candidateId: "candidate-1",
      subject: "Following up",
      message: "Are you still interested in this role?",
    });

    expect(result.ok).toBe(true);
    expect(sendAdminMessageEmailMock).toHaveBeenCalledWith({
      to: "candidate@example.com",
      subject: "Following up",
      message: "Are you still interested in this role?",
    });
  });
});
