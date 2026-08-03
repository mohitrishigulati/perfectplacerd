import { CLIENT_NAMES, CREDIBILITY_STATS } from "@/content/marketing";

export function TrustStrip() {
  return (
    <section
      aria-label="Credibility"
      className="border-y border-[var(--pp-border)] bg-[var(--pp-navy-mid)]"
    >
      <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6" role="list">
        {CREDIBILITY_STATS.map((stat) => (
          <li key={stat.label} className="text-center sm:text-left">
            <p className="text-3xl font-semibold tabular-nums text-[var(--pp-gold)]">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-medium text-white">{stat.label}</p>
            <p className="mt-0.5 text-xs text-[var(--pp-muted)]">{stat.sub}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ClientTrustGrid({ compact }: { compact?: boolean }) {
  return (
    <section aria-labelledby="clients-trust-heading" className="py-10">
      <h2
        id="clients-trust-heading"
        className="text-center text-xl font-semibold text-[var(--pp-navy)]"
      >
        The company we keep
      </h2>
      {!compact && (
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600">
          A selection of organisations who have trusted us with leadership
          mandates — conglomerates, MNCs and high-growth challengers.
        </p>
      )}
      <ul
        className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-2 px-4"
        role="list"
      >
        {CLIENT_NAMES.map((name) => (
          <li
            key={name}
            className="rounded-full border border-[var(--pp-border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--pp-navy)] shadow-sm"
          >
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
}
