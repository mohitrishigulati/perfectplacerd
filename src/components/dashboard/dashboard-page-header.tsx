import Link from "next/link";

type DashboardPageHeaderProps = {
  title: string;
  description: string;
  action?: { href: string; label: string };
};

export function DashboardPageHeader({
  title,
  description,
  action,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>
      {action && (
        <Link href={action.href} className="btn-secondary shrink-0">
          {action.label}
        </Link>
      )}
    </div>
  );
}
