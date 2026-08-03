// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { messageCandidateActionMock, createResumeDownloadUrlActionMock } = vi.hoisted(() => ({
  messageCandidateActionMock: vi.fn(async () => ({ ok: true, message: "Message sent." })),
  createResumeDownloadUrlActionMock: vi.fn(async () => ({ ok: true, url: "https://example.com/resume.pdf" })),
}));

vi.mock("@/app/admin/actions", () => ({
  messageCandidateAction: messageCandidateActionMock,
  createResumeDownloadUrlAction: createResumeDownloadUrlActionMock,
}));

import { AdminCandidatesTable } from "@/components/admin/admin-candidates-table";
import type { AdminCandidateRow } from "@/lib/admin/queries";

const CANDIDATES: AdminCandidateRow[] = [
  {
    id: "candidate-1",
    email: "jane@example.com",
    full_name: "Jane Doe",
    headline: "VP Engineering",
    location: "Mumbai",
    profile_visibility: "recruiters",
    skills: ["React", "Leadership"],
    updated_at: "2026-08-01T00:00:00.000Z",
    primaryResume: null,
  },
  {
    id: "candidate-2",
    email: "sam@example.com",
    full_name: "Sam Rao",
    headline: "Head of Sales",
    location: "Chennai",
    profile_visibility: "private",
    skills: ["Negotiation"],
    updated_at: "2026-08-02T00:00:00.000Z",
    primaryResume: null,
  },
];

describe("AdminCandidatesTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters candidates by the search box", () => {
    render(<AdminCandidatesTable candidates={CANDIDATES} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Sam Rao")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: "chennai" },
    });

    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Sam Rao")).toBeInTheDocument();
  });

  it("shows a no-match message when nothing filters in", () => {
    render(<AdminCandidatesTable candidates={CANDIDATES} />);

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: "nonexistent-skill-xyz" },
    });

    expect(screen.getByText(/no candidates match/i)).toBeInTheDocument();
  });

  it("sends a message to the candidate via the message form", async () => {
    render(<AdminCandidatesTable candidates={CANDIDATES} />);

    fireEvent.click(screen.getByText("Jane Doe"));
    fireEvent.click(screen.getByText("Message candidate"));

    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Following up" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Are you still interested in this role?" },
    });
    fireEvent.click(screen.getByText("Send message"));

    await waitFor(() => {
      expect(messageCandidateActionMock).toHaveBeenCalledWith({
        candidateId: "candidate-1",
        subject: "Following up",
        message: "Are you still interested in this role?",
      });
    });
    await screen.findByText("Message sent.");
  });
});
