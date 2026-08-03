"use client";

import { useEffect, useState } from "react";
import {
  cooldownRemainingSeconds,
  formatSendAgainMessage,
  isOtpSendBlocked,
  startOtpSendCooldown,
} from "@/lib/auth/otp-send-cooldown";

export function useOtpSendCooldown() {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    const tick = () => {
      setCooldownSeconds(cooldownRemainingSeconds());
    };
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  function beginCooldownAfterSuccessfulSend() {
    startOtpSendCooldown();
    setCooldownSeconds(cooldownRemainingSeconds());
  }

  return { cooldownSeconds, beginCooldownAfterSuccessfulSend };
}

export function getSendOtpButtonLabel(options: {
  submitting: boolean;
  cooldownSeconds: number;
}): string {
  if (options.submitting) {
    return "Sending…";
  }
  if (options.cooldownSeconds > 0) {
    return formatSendAgainMessage(options.cooldownSeconds);
  }
  return "Send sign-in code";
}

export { isOtpSendBlocked, formatSendAgainMessage };
