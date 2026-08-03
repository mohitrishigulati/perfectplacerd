import type { ProfileCompletionResult } from "@/lib/profile/completion";

type Props = {
  completion: ProfileCompletionResult;
};

export function ProfileCompletionCard({ completion }: Props) {
  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="profile-completion-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="profile-completion-heading"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Profile completion
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {completion.completedCount} of {completion.totalCount} items complete
          </p>
        </div>
        <p
          className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50"
          aria-live="polite"
        >
          {completion.percent}
          <span className="text-base font-normal text-zinc-500">%</span>
        </p>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completion.percent}
        aria-labelledby="profile-completion-heading"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width]"
          style={{ width: `${completion.percent}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2" role="list">
        {completion.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
            <span
              className={
                item.complete
                  ? "font-medium text-emerald-700 dark:text-emerald-400"
                  : "text-zinc-500"
              }
            >
              {item.complete ? "Done" : "Incomplete"}
              <span className="sr-only">
                {item.complete ? "" : ` — ${item.label} not complete`}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
