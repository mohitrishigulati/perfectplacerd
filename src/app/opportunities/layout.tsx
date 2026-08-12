import { MarketingChrome } from "@/components/marketing/marketing-chrome";

export default function OpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingChrome contentClassName="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {children}
    </MarketingChrome>
  );
}
