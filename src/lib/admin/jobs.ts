import type { JobStatus } from "@/types/database";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  published: "Published",
  paused: "Paused",
  closed: "Closed",
  archived: "Archived",
};

export type JobStatusAction = "publish" | "pause" | "close" | "archive";

const TRANSITIONS: Record<JobStatusAction, JobStatus> = {
  publish: "published",
  pause: "paused",
  close: "closed",
  archive: "archived",
};

export function resolveJobStatusAction(action: JobStatusAction): JobStatus {
  return TRANSITIONS[action];
}

export function canPerformJobStatusAction(
  current: JobStatus,
  action: JobStatusAction,
): boolean {
  const next = TRANSITIONS[action];
  if (current === next) return false;

  switch (action) {
    case "publish":
      return ["draft", "paused", "closed"].includes(current);
    case "pause":
      return current === "published";
    case "close":
      return current === "published" || current === "paused";
    case "archive":
      return current !== "archived";
    default:
      return false;
  }
}

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
