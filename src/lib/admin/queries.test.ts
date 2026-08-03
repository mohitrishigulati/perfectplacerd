import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { assertAdminMock, fromMock } = vi.hoisted(() => ({
  assertAdminMock: vi.fn(async () => ({ id: "admin-1", email: "admin@example.com" })),
  fromMock: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  assertAdmin: assertAdminMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

import { getAdminOverviewStats } from "@/lib/admin/queries";

const NOW = new Date("2026-08-04T00:00:00.000Z");

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe("getAdminOverviewStats", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("buckets applications by status, recency window, and job", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "jobs") {
        return {
          select: (columns: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.head) {
              return Promise.resolve({ count: 4 });
            }
            return Promise.resolve({
              data: [
                { id: "job-1", title: "Head of Growth" },
                { id: "job-2", title: "VP Engineering" },
              ],
            });
          },
        };
      }
      if (table === "profiles") {
        return { select: () => Promise.resolve({ count: 12 }) };
      }
      if (table === "applications") {
        return {
          select: () =>
            Promise.resolve({
              data: [
                { job_id: "job-1", status: "submitted", created_at: daysAgo(1) },
                { job_id: "job-1", status: "under_review", created_at: daysAgo(2) },
                { job_id: "job-1", status: "accepted", created_at: daysAgo(10) },
                { job_id: "job-2", status: "submitted", created_at: daysAgo(9) },
                { job_id: "job-2", status: "rejected", created_at: daysAgo(20) },
              ],
            }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const stats = await getAdminOverviewStats();

    expect(assertAdminMock).toHaveBeenCalledWith("/admin");
    expect(stats.jobs).toBe(4);
    expect(stats.candidates).toBe(12);
    expect(stats.applications).toBe(5);
    expect(stats.statusFunnel).toEqual({
      submitted: 2,
      under_review: 1,
      accepted: 1,
      rejected: 1,
      withdrawn: 0,
    });
    expect(stats.applicationsLast7Days).toBe(2);
    expect(stats.applicationsPrevious7Days).toBe(2);
    expect(stats.topJobs).toEqual([
      { id: "job-1", title: "Head of Growth", applicationCount: 3 },
      { id: "job-2", title: "VP Engineering", applicationCount: 2 },
    ]);
  });
});
