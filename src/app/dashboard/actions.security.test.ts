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

vi.mock("@/lib/resumes/rate-limit", () => ({
  isResumeProcessingRateLimited: vi.fn(async () => false),
  recordResumeProcessingEvent: vi.fn(async () => {}),
  MAX_RESUME_UPLOADS_PER_HOUR: 15,
  MAX_RESUME_PARSES_PER_HOUR: 20,
}));

import {
  registerResumeAction,
  withdrawApplicationAction,
} from "@/app/dashboard/actions";

const VALID_OBJECT_ID = "22222222-2222-4222-8222-222222222222";

function pdfBlob(): Blob {
  const bytes = new TextEncoder().encode(
    "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n",
  );
  return new Blob([bytes]);
}

describe("dashboard application security actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageRemoveMock.mockResolvedValue({ error: null });
    storageFromMock.mockReturnValue({
      download: async () => ({
        data: pdfBlob(),
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

  it("registerResumeAction inserts the new resume without deleting prior resume rows", async () => {
    // Demotion of the previous primary resume is handled atomically by the
    // resumes_enforce_single_primary DB trigger, not by the app, so this
    // only needs to verify the insert happens and nothing deletes rows.
    const insertSingle = vi.fn(async () => ({
      data: { id: "resume-new" },
      error: null,
    }));

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
        delete: vi.fn(() => {
          throw new Error("resume delete should not run on replace");
        }),
      };
    });

    const storagePath = `${USER_ID}/${VALID_OBJECT_ID}/file.pdf`;

    const result = await registerResumeAction({
      title: "Primary resume",
      storagePath,
      fileName: "file.pdf",
      mimeType: "application/pdf",
      byteSize: 100,
    });

    expect(result.ok).toBe(true);
    expect(insertSingle).toHaveBeenCalled();
    expect(storageRemoveMock).not.toHaveBeenCalled();
  });
});
