import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildContactInquiryEmail } from "@/lib/email/contact-inquiry";

describe("buildContactInquiryEmail", () => {
  it("includes the inquiry type label and contact details", () => {
    const email = buildContactInquiryEmail({
      inquiryType: "employer",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+91 9876543210",
      company: "Acme Corp",
      message: "Looking to fill a VP Engineering role.",
    });

    expect(email.subject).toContain("Employer / client mandate");
    expect(email.subject).toContain("Jane Doe");
    expect(email.html).toContain("jane@example.com");
    expect(email.html).toContain("Acme Corp");
    expect(email.html).toContain("+91 9876543210");
  });

  it("omits optional phone/company lines when not provided", () => {
    const email = buildContactInquiryEmail({
      inquiryType: "candidate",
      name: "Sam",
      email: "sam@example.com",
      message: "Interested in registering as a candidate.",
    });

    expect(email.html).not.toContain("Phone:");
    expect(email.html).not.toContain("Company:");
  });

  it("escapes HTML in the message body", () => {
    const email = buildContactInquiryEmail({
      inquiryType: "general",
      name: "Sam",
      email: "sam@example.com",
      message: "<img src=x onerror=alert(1)>",
    });

    expect(email.html).not.toContain("<img");
    expect(email.html).toContain("&lt;img");
  });
});
