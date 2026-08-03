import { describe, expect, it } from "vitest";
import {
  formatSendAgainMessage,
  getSendOtpButtonLabel,
  isOtpSendBlocked,
} from "@/components/auth/use-otp-send-cooldown";

describe("OTP send UI guards", () => {
  it("shows pending label while submitting", () => {
    expect(
      getSendOtpButtonLabel({ submitting: true, cooldownSeconds: 0 }),
    ).toBe("Sending…");
  });

  it("shows cooldown label for 60-second resend window", () => {
    expect(
      getSendOtpButtonLabel({ submitting: false, cooldownSeconds: 60 }),
    ).toBe(formatSendAgainMessage(60));
  });

  it("prevents duplicate submission while pending", () => {
    expect(isOtpSendBlocked({ submitting: true, cooldownSeconds: 0 })).toBe(
      true,
    );
  });
});
