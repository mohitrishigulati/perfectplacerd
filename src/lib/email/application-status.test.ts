import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildApplicationStatusChangedEmail } from "@/lib/email/application-status";

describe("buildApplicationStatusChangedEmail", () => {
  it("labels each status in plain English", () => {
    const email = buildApplicationStatusChangedEmail({
      jobTitle: "Head of Growth",
      status: "accepted",
    });
    expect(email.subject).toBe("Your application for Head of Growth is now Accepted");
    expect(email.html).toContain("Accepted");
  });

  it("escapes HTML in the job title before embedding it", () => {
    const email = buildApplicationStatusChangedEmail({
      jobTitle: "<img src=x onerror=alert(1)>",
      status: "rejected",
    });
    expect(email.html).not.toContain("<img");
    expect(email.html).toContain("&lt;img");
  });
});
