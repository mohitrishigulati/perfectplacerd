import { describe, expect, it } from "vitest";
import {
  canStartWithdrawRequest,
  canWithdrawApplication,
  shouldDisableWithdrawConfirm,
} from "@/lib/applications/withdraw-eligibility";

describe("canWithdrawApplication", () => {
  it("allows withdrawal for submitted and under_review", () => {
    expect(canWithdrawApplication("submitted")).toBe(true);
    expect(canWithdrawApplication("under_review")).toBe(true);
  });

  it("blocks terminal statuses", () => {
    expect(canWithdrawApplication("accepted")).toBe(false);
    expect(canWithdrawApplication("rejected")).toBe(false);
    expect(canWithdrawApplication("withdrawn")).toBe(false);
  });
});

describe("withdraw interaction guards", () => {
  it("prevents duplicate requests while pending", () => {
    expect(
      canStartWithdrawRequest({
        phase: "idle",
        applicationId: "a1",
        pendingApplicationId: "a1",
      }),
    ).toBe(false);
  });

  it("disables confirm while pending", () => {
    expect(shouldDisableWithdrawConfirm({ phase: "pending" })).toBe(true);
  });
});
