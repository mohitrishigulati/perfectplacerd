import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { fromMock, sendContactInquiryEmailMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  sendContactInquiryEmailMock: vi.fn(async () => true),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

vi.mock("@/lib/email/contact-inquiry", () => ({
  sendContactInquiryEmail: sendContactInquiryEmailMock,
}));

import { submitContactInquiryAction } from "@/app/(marketing)/contact/actions";

describe("submitContactInquiryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid submission before touching the database", async () => {
    const result = await submitContactInquiryAction({
      inquiryType: "general",
      name: "",
      email: "not-an-email",
      message: "short",
    });

    expect(result.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("stores the inquiry and emails the team on success", async () => {
    const insertMock = vi.fn(async () => ({ error: null }));
    fromMock.mockReturnValueOnce({ insert: insertMock });

    const result = await submitContactInquiryAction({
      inquiryType: "candidate",
      name: "Sam Rao",
      email: "sam@example.com",
      message: "I'd like to register as a candidate for leadership roles.",
    });

    expect(result.ok).toBe(true);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        inquiry_type: "candidate",
        name: "Sam Rao",
        email: "sam@example.com",
      }),
    );
    expect(sendContactInquiryEmailMock).toHaveBeenCalled();
  });

  it("still reports success when the notification email fails", async () => {
    fromMock.mockReturnValueOnce({ insert: vi.fn(async () => ({ error: null })) });
    sendContactInquiryEmailMock.mockRejectedValueOnce(new Error("resend_http_500"));

    const result = await submitContactInquiryAction({
      inquiryType: "general",
      name: "Sam Rao",
      email: "sam@example.com",
      message: "Just checking something about your services.",
    });

    expect(result.ok).toBe(true);
  });

  it("reports a database error", async () => {
    fromMock.mockReturnValueOnce({
      insert: vi.fn(async () => ({ error: { message: "boom", code: "23505" } })),
    });

    const result = await submitContactInquiryAction({
      inquiryType: "general",
      name: "Sam Rao",
      email: "sam@example.com",
      message: "Just checking something about your services.",
    });

    expect(result.ok).toBe(false);
    expect(sendContactInquiryEmailMock).not.toHaveBeenCalled();
  });
});
