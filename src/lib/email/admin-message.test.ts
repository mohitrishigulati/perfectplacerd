import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildAdminMessageEmail } from "@/lib/email/admin-message";

describe("buildAdminMessageEmail", () => {
  it("keeps the subject as-is and turns newlines into line breaks", () => {
    const email = buildAdminMessageEmail({
      subject: "Following up",
      message: "Line one\nLine two",
    });
    expect(email.subject).toBe("Following up");
    expect(email.html).toContain("Line one<br>Line two");
  });

  it("escapes HTML in the message body", () => {
    const email = buildAdminMessageEmail({
      subject: "Hi",
      message: "<img src=x onerror=alert(1)>",
    });
    expect(email.html).not.toContain("<img");
    expect(email.html).toContain("&lt;img");
  });
});
