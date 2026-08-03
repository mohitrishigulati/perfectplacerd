"use client";

import { useMemo, useState } from "react";
import { createResumeDownloadUrlAction } from "@/app/admin/actions";
import type { AdminCandidateRow } from "@/lib/admin/queries";

function matchesQuery(candidate: AdminCandidateRow, query: string): boolean {
  const haystack = [
    candidate.full_name,
    candidate.email,
    candidate.headline,
    candidate.location,
    ...candidate.skills,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function AdminCandidatesTable({
  candidates,
}: {
  candidates: AdminCandidateRow[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return candidates;
    }
    return candidates.filter((candidate) => matchesQuery(candidate, query));
  }, [candidates, search]);

  async function onDownload(resumeId: string) {
    setError(null);
    const result = await createResumeDownloadUrlAction(resumeId);
    if (!result.ok || !result.url) {
      setError(result.message ?? "Something went wrong");
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  if (candidates.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600">
        No candidate profiles yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="candidate-search" className="sr-only">
          Search candidates
        </label>
        <input
          id="candidate-search"
          type="search"
          className="field-input max-w-sm"
          placeholder="Search by name, email, headline, location, or skill"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      {filteredCandidates.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600">
          No candidates match &quot;{search.trim()}&quot;.
        </p>
      ) : (
        <ul className="space-y-3" role="list">
          {filteredCandidates.map((candidate) => {
            const expanded = expandedId === candidate.id;
            return (
              <li
                key={candidate.id}
                className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                  aria-expanded={expanded}
                  onClick={() => setExpandedId(expanded ? null : candidate.id)}
                >
                  <span>
                    <span className="block font-medium">
                      {candidate.full_name ?? "Unnamed candidate"}
                    </span>
                    <span className="block text-sm text-zinc-600 dark:text-zinc-400">
                      {candidate.email}
                    </span>
                  </span>
                  <span className="text-xs uppercase tracking-wide text-zinc-500">
                    {expanded ? "Hide" : "View profile"}
                  </span>
                </button>
                {expanded && (
                  <div className="border-t border-zinc-200 px-4 py-4 text-sm dark:border-zinc-800">
                    <dl className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-zinc-500">Headline</dt>
                        <dd>{candidate.headline ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Location</dt>
                        <dd>{candidate.location ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Visibility</dt>
                        <dd>{candidate.profile_visibility}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-zinc-500">Skills</dt>
                        <dd>{candidate.skills.length ? candidate.skills.join(", ") : "—"}</dd>
                      </div>
                    </dl>
                    {candidate.primaryResume && (
                      <button
                        type="button"
                        className="btn-secondary mt-4"
                        onClick={() => onDownload(candidate.primaryResume!.id)}
                      >
                        Download primary resume
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
