type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <div className="border-b border-[var(--pp-border)] bg-[var(--pp-navy)] px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--pp-gold)]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--pp-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export function ProseSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-zinc mx-auto max-w-3xl px-4 py-12 sm:px-6 prose-headings:font-serif prose-headings:text-[var(--pp-navy)] prose-a:text-[var(--pp-gold-dark)]">
      {children}
    </div>
  );
}
