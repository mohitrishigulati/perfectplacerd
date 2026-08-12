import { Suspense } from "react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getSessionUser } from "@/lib/auth/session";

async function SiteHeaderWithSession() {
  const user = await Promise.race([
    getSessionUser(),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 2_500);
    }),
  ]);

  return <SiteHeader userSignedIn={Boolean(user)} />;
}

type Props = {
  children: React.ReactNode;
  /** Extra classes for the content wrapper below the header. */
  contentClassName?: string;
};

/**
 * Public chrome that paints immediately. Session is optional UI-only and must
 * not block the first byte — slow Auth was blanking production for visitors.
 */
export function MarketingChrome({ children, contentClassName }: Props) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--pp-cream)] text-[var(--pp-ink)]">
      <Suspense fallback={<SiteHeader userSignedIn={false} />}>
        <SiteHeaderWithSession />
      </Suspense>
      {contentClassName ? (
        <div className={contentClassName}>{children}</div>
      ) : (
        <main className="flex-1">{children}</main>
      )}
      <SiteFooter />
    </div>
  );
}
