import { describe, expect, it } from "vitest";
import { authEmailSchema, authOtpSchema } from "@/lib/validations/auth";

describe("auth validation schemas", () => {
  it("validates email", () => {
    expect(authEmailSchema.safeParse({ email: "user@example.com" }).success).toBe(
      true,
    );
    expect(authEmailSchema.safeParse({ email: "not-an-email" }).success).toBe(
      false,
    );
  });

  it("validates otp token length", () => {
    expect(
      authOtpSchema.safeParse({ email: "user@example.com", token: "123456" })
        .success,
    ).toBe(true);
    expect(
      authOtpSchema.safeParse({ email: "user@example.com", token: "12" }).success,
    ).toBe(false);
  });
});
