import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  OTP_COOLDOWN_STORAGE_KEY,
  OTP_SEND_COOLDOWN_MS,
  cooldownRemainingSeconds,
  formatSendAgainMessage,
  isOtpSendBlocked,
  normalizeOtpTokenInput,
  readCooldownRemainingMs,
  startOtpSendCooldown,
} from "@/lib/auth/otp-send-cooldown";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe("otp send cooldown", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  afterEach(() => {
    storage.clear();
  });

  it("starts a 60-second cooldown after a successful send", () => {
    const now = 1_000_000;
    startOtpSendCooldown(now, storage);
    expect(storage.getItem(OTP_COOLDOWN_STORAGE_KEY)).toBe(
      String(now + OTP_SEND_COOLDOWN_MS),
    );
    expect(cooldownRemainingSeconds(now + 1_000, storage)).toBe(59);
  });

  it("persists cooldown in session storage semantics", () => {
    const now = 2_000_000;
    startOtpSendCooldown(now, storage);
    const restored = createMemoryStorage();
    restored.setItem(
      OTP_COOLDOWN_STORAGE_KEY,
      storage.getItem(OTP_COOLDOWN_STORAGE_KEY)!,
    );
    expect(readCooldownRemainingMs(now + 5_000, restored)).toBe(
      OTP_SEND_COOLDOWN_MS - 5_000,
    );
  });

  it("formats countdown copy", () => {
    expect(formatSendAgainMessage(47)).toBe("Send again in 47 seconds.");
  });

  it("blocks duplicate sends while pending or cooling down", () => {
    expect(isOtpSendBlocked({ submitting: true, cooldownSeconds: 0 })).toBe(
      true,
    );
    expect(isOtpSendBlocked({ submitting: false, cooldownSeconds: 12 })).toBe(
      true,
    );
    expect(isOtpSendBlocked({ submitting: false, cooldownSeconds: 0 })).toBe(
      false,
    );
  });

  it("normalizes pasted OTP input to six digits", () => {
    expect(normalizeOtpTokenInput("12 34-56")).toBe("123456");
    expect(normalizeOtpTokenInput("1234567890")).toBe("123456");
  });
});
