// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const {
  updateApplicationStatusActionMock,
  createResumeDownloadUrlActionMock,
  refreshMock,
} = vi.hoisted(() => ({
  updateApplicationStatusActionMock: vi.fn(async () => ({ ok: true, message: "Application status updated." })),
  createResumeDownloadUrlActionMock: vi.fn(async () => ({ ok: true, url: "https://example.com/resume.pdf" })),
  refreshMock: vi.fn(),
}));

vi.mock("@/app/admin/actions", () => ({
  updateApplicationStatusAction: updateApplicationStatusActionMock,
  createResumeDownloadUrlAction: createResumeDownloadUrlActionMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { AdminApplicationsPanel } from "@/components/admin/admin-applications-panel";
import type { AdminApplicationRow } from "@/lib/admin/queries";

const APPLICATIONS: AdminApplicationRow[] = [
  {
    id: "app-1",
    status: "submitted",
    created_at: "2026-08-01T00:00:00.000Z",
    cover_letter: null,
    candidate: {
      id: "candidate-1",
      email: "jane@example.com",
      full_name: "Jane Doe",
      headline: "VP Engineering",
      location: "Mumbai",
      phone: null,
      profile_visibility: "recruiters",
    },
    resume: { id: "resume-1", title: "Resume", file_name: "jane.pdf", updated_at: "2026-08-01T00:00:00.000Z" },
  },
];

describe("AdminApplicationsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty state when there are no applicants", () => {
    render(<AdminApplicationsPanel jobId="job-1" applications={[]} />);
    expect(screen.getByText("No applicants yet.")).toBeInTheDocument();
  });

  it("changes the application status and refreshes on success", async () => {
    render(<AdminApplicationsPanel jobId="job-1" applications={APPLICATIONS} />);

    fireEvent.change(screen.getByLabelText("Application status"), {
      target: { value: "accepted" },
    });

    await waitFor(() => {
      expect(updateApplicationStatusActionMock).toHaveBeenCalledWith({
        applicationId: "app-1",
        jobId: "job-1",
        status: "accepted",
      });
    });
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("shows an error and does not refresh when the status update fails", async () => {
    updateApplicationStatusActionMock.mockResolvedValueOnce({
      ok: false,
      message: "Could not update status.",
    });

    render(<AdminApplicationsPanel jobId="job-1" applications={APPLICATIONS} />);

    fireEvent.change(screen.getByLabelText("Application status"), {
      target: { value: "rejected" },
    });

    await screen.findByText("Could not update status.");
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("downloads the candidate's resume", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<AdminApplicationsPanel jobId="job-1" applications={APPLICATIONS} />);

    fireEvent.click(screen.getByText("Download"));

    await waitFor(() => {
      expect(createResumeDownloadUrlActionMock).toHaveBeenCalledWith("resume-1");
    });
    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/resume.pdf",
      "_blank",
      "noopener,noreferrer",
    );
    openSpy.mockRestore();
  });
});
