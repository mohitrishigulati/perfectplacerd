// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { createJobActionMock, updateJobActionMock, replaceMock, refreshMock } = vi.hoisted(() => ({
  createJobActionMock: vi.fn(async () => ({ ok: true, id: "job-new", message: "Opportunity draft created." })),
  updateJobActionMock: vi.fn(async () => ({ ok: true, message: "Opportunity saved." })),
  replaceMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/app/admin/actions", () => ({
  createJobAction: createJobActionMock,
  updateJobAction: updateJobActionMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}));

import { AdminJobForm } from "@/components/admin/admin-job-form";
import type { Tables } from "@/types/database";

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Head of Growth" },
  });
  fireEvent.change(screen.getByLabelText("Description"), {
    target: { value: "A description that is definitely twenty characters or more." },
  });
}

describe("AdminJobForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a validation error and does not submit when the title is missing", async () => {
    render(<AdminJobForm mode="create" />);

    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "A description that is definitely twenty characters or more." },
    });
    fireEvent.click(screen.getByText("Create draft"));

    await screen.findByText("Title is required");
    expect(createJobActionMock).not.toHaveBeenCalled();
  });

  it("rejects a salary range where the minimum is above the maximum", async () => {
    render(<AdminJobForm mode="create" />);

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText("Salary min"), { target: { value: "200000" } });
    fireEvent.change(screen.getByLabelText("Salary max"), { target: { value: "100000" } });
    fireEvent.click(screen.getByText("Create draft"));

    await screen.findByText("Minimum salary must be less than or equal to maximum salary");
    expect(createJobActionMock).not.toHaveBeenCalled();
  });

  it("auto-generates the slug from the title when left blank, then creates the job", async () => {
    render(<AdminJobForm mode="create" />);

    fillRequiredFields();
    expect(screen.getByLabelText("Slug")).toHaveValue("");
    fireEvent.click(screen.getByText("Create draft"));

    await waitFor(() => {
      expect(createJobActionMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Head of Growth", slug: "head-of-growth" }),
      );
    });
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/admin/jobs/job-new/edit");
    });
  });

  it("prefills from an existing job in edit mode and calls updateJobAction", async () => {
    const job = {
      id: "job-1",
      title: "VP Engineering",
      slug: "vp-engineering",
      description: "An existing opportunity description of sufficient length.",
      location: "Remote",
      employment_type: "",
      department: "",
      industry: "",
      work_mode: "",
      experience_level: "",
      salary_min: "",
      salary_max: "",
      salary_currency: "USD",
    } as unknown as Tables<"jobs">;

    render(<AdminJobForm mode="edit" job={job} />);

    expect(screen.getByLabelText("Title")).toHaveValue("VP Engineering");

    fireEvent.click(screen.getByText("Save changes"));

    await waitFor(() => {
      expect(updateJobActionMock).toHaveBeenCalledWith(
        "job-1",
        expect.objectContaining({ title: "VP Engineering" }),
      );
    });
    expect(refreshMock).toHaveBeenCalled();
  });
});
