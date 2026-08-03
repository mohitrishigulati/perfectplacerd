import type { ApplicationStatus } from "@/types/database";

export function canWithdrawApplication(status: ApplicationStatus): boolean {
  return status === "submitted" || status === "under_review";
}

export type WithdrawInteractionPhase =
  | "idle"
  | "confirming"
  | "pending"
  | "success"
  | "error";

export function canStartWithdrawRequest(options: {
  phase: WithdrawInteractionPhase;
  applicationId: string;
  pendingApplicationId: string | null;
}): boolean {
  if (options.pendingApplicationId !== null) {
    return false;
  }
  return options.phase === "idle" || options.phase === "error";
}

export function shouldDisableWithdrawConfirm(options: {
  phase: WithdrawInteractionPhase;
}): boolean {
  return options.phase === "pending";
}
