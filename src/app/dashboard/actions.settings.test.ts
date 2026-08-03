import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { requireUserMock, fromMock, updateUserMock } = vi.hoisted(() => ({
  requireUserMock: vi.fn(async () => ({
    id: "11111111-1111-1111-1111-111111111111",
    email: "candidate@example.com",
  })),
  fromMock: vi.fn(),
  updateUserMock: vi.fn(
    async (): Promise<{ error: { message: string } | null }> => ({ error: null }),
  ),
}));

vi.mock("@/lib/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: fromMock,
    auth: { updateUser: updateUserMock },
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  updateEmailAction,
  updateNotificationPreferencesAction,
} from "@/app/dashboard/actions";

describe("account settings actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateUserMock.mockResolvedValue({ error: null });
  });

  it("updateEmailAction rejects an invalid email", async () => {
    const result = await updateEmailAction({ email: "not-an-email" });
    expect(result.ok).toBe(false);
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("updateEmailAction asks Supabase to update the email with a redirect", async () => {
    const result = await updateEmailAction({ email: "new@example.com" });

    expect(result.ok).toBe(true);
    expect(updateUserMock).toHaveBeenCalledWith(
      { email: "new@example.com" },
      expect.objectContaining({ emailRedirectTo: expect.any(String) }),
    );
  });

  it("updateEmailAction reports a generic error when Supabase rejects it", async () => {
    updateUserMock.mockResolvedValueOnce({ error: { message: "boom" } });

    const result = await updateEmailAction({ email: "new@example.com" });
    expect(result.ok).toBe(false);
  });

  it("updateNotificationPreferencesAction updates the candidate's own profile row", async () => {
    const eqMock = vi.fn(async () => ({ error: null }));
    fromMock.mockReturnValueOnce({
      update: (values: Record<string, unknown>) => {
        expect(values).toEqual({ notify_application_status: false });
        return { eq: eqMock };
      },
    });

    const result = await updateNotificationPreferencesAction({
      notifyApplicationStatus: false,
    });

    expect(result.ok).toBe(true);
    expect(eqMock).toHaveBeenCalledWith("id", "11111111-1111-1111-1111-111111111111");
  });

  it("updateNotificationPreferencesAction rejects a non-boolean value", async () => {
    const result = await updateNotificationPreferencesAction({
      notifyApplicationStatus: "yes",
    });
    expect(result.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
