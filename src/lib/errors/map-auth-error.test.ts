import { describe, expect, it } from "vitest";
import {
  assertPublicAuthMessage,
  isRateLimitedAuthError,
  mapAuthError,
} from "@/lib/errors/map-auth-error";
import { PUBLIC_OTP_RATE_LIMIT } from "@/lib/errors/public-messages";

describe("mapAuthError", () => {
  it("maps HTTP 429 to a friendly rate-limit message", () => {
    const mapped = mapAuthError("", 429);
    expect(mapped.kind).toBe("rate_limit");
    expect(mapped.message).toBe(PUBLIC_OTP_RATE_LIMIT);
    assertPublicAuthMessage(mapped.message);
  });

  it("maps over_email_send_rate_limit without provider details", () => {
    const mapped = mapAuthError("over_email_send_rate_limit");
    expect(mapped.message).toBe(PUBLIC_OTP_RATE_LIMIT);
    assertPublicAuthMessage(mapped.message);
  });

  it("detects rate limit signals", () => {
    expect(isRateLimitedAuthError("Email rate limit exceeded")).toBe(true);
    expect(isRateLimitedAuthError(undefined, 429)).toBe(true);
  });

  it("never exposes infrastructure in public messages", () => {
    const samples = [
      mapAuthError("over_email_send_rate_limit"),
      mapAuthError("smtp relay failed"),
      mapAuthError("invalid token"),
      mapAuthError("", 429),
    ];
    for (const mapped of samples) {
      assertPublicAuthMessage(mapped.message);
      expect(mapped.message.toLowerCase()).not.toContain("supabase");
      expect(mapped.message.toLowerCase()).not.toContain("smtp");
    }
  });
});
