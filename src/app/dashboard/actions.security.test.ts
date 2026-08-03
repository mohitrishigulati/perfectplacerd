import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const USER_ID = "11111111-1111-1111-1111-111111111111";

const { requireUserMock, fromMock, storageFromMock, rpcMock, storageRemoveMock } =
  vi.hoisted(() => ({
    requireUserMock: vi.fn(async () => ({
      id: "11111111-1111-1111-1111-111111111111",
      email: "c@example.com",
    })),
    fromMock: vi.fn(),
    storageFromMock: vi.fn(),
    rpcMock: vi.fn(),
    storageRemoveMock: vi.fn(),
  }));

vi.mock("@/lib/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: fromMock,
    storage: { from: storageFromMock },
    rpc: rpcMock,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  registerResumeAction,
  withdrawApplicationAction,
} from "@/app/dashboard/actions";

describe("dashboard application security actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageRemoveMock.mockResolvedValue({ error: null });
    storageFromMock.mockReturnValue({
      download: async () => ({
        data: new Blob(["x".repeat(100)]),
        error: null,
      }),
      remove: storageRemoveMock,
    });
  });

  it("withdrawApplicationAction calls withdraw_application RPC", async () => {
    rpcMock.mockResolvedValue({ error: null });

    const result = await withdrawApplicationAction("app-123");

    expect(rpcMock).toHaveBeenCalledWith("withdraw_application", {
      p_application_id: "app-123",
    });
    expect(result.ok).toBe(true);
  });

  it("registerResumeAction inserts and demotes primary without deleting prior resume rows", async () => {
    const insertSingle = vi.fn(async () => ({
      data: { id: "resume-new" },
      error: null,
    }));
    const demoteChain = vi.fn().mockResolvedValue({ error: null });

    fromMock.mockImplementation((table: string) => {
      if (table !== "resumes") {
        return {};
      }
      return {
        insert: () => ({
          select: () => ({
            single: insertSingle,
          }),
        }),
        update: () => ({
          eq: () => ({
            neq: () => ({
              eq: demoteChain,
            }),
          }),
        }),
        delete: vi.fn(() => {
          throw new Error("resume delete should not run on replace");
        }),
      };
    });

    const storagePath = `${USER_ID}/new-id/file.pdf`;

    const result = await registerResumeAction({
      title: "Primary resume",
      storagePath,
      fileName: "file.pdf",
      mimeType: "application/pdf",
      byteSize: 100,
    });

    expect(result.ok).toBe(true);
    expect(insertSingle).toHaveBeenCalled();
    expect(demoteChain).toHaveBeenCalled();
    expect(storageRemoveMock).not.toHaveBeenCalled();
  });
});
