export const OTP_SEND_COOLDOWN_MS = 60_000;
export const OTP_COOLDOWN_STORAGE_KEY = "pp.auth.otpSendCooldownUntil";

export function readCooldownRemainingMs(
  now = Date.now(),
  storage: Pick<Storage, "getItem"> = getSessionStorage(),
): number {
  const raw = storage.getItem(OTP_COOLDOWN_STORAGE_KEY);
  if (!raw) {
    return 0;
  }
  const until = Number(raw);
  if (!Number.isFinite(until) || until <= now) {
    return 0;
  }
  return until - now;
}

export function startOtpSendCooldown(
  now = Date.now(),
  storage: Pick<Storage, "setItem"> = getSessionStorage(),
): void {
  storage.setItem(OTP_COOLDOWN_STORAGE_KEY, String(now + OTP_SEND_COOLDOWN_MS));
}

export function cooldownRemainingSeconds(
  now = Date.now(),
  storage: Pick<Storage, "getItem"> = getSessionStorage(),
): number {
  const remainingMs = readCooldownRemainingMs(now, storage);
  if (remainingMs <= 0) {
    return 0;
  }
  return Math.ceil(remainingMs / 1000);
}

export function formatSendAgainMessage(seconds: number): string {
  const safe = Math.max(0, seconds);
  return `Send again in ${safe} seconds.`;
}

export function isOtpSendBlocked(state: {
  submitting: boolean;
  cooldownSeconds: number;
}): boolean {
  return state.submitting || state.cooldownSeconds > 0;
}

export function normalizeOtpTokenInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

function getSessionStorage(): Storage {
  if (typeof sessionStorage === "undefined") {
    throw new Error("sessionStorage is not available");
  }
  return sessionStorage;
}
