import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AdminJobFormE2EFixture } from "./fixture-client";

export const dynamic = "force-dynamic";

export default async function AdminJobFormFixturePage() {
  const cookieStore = await cookies();
  if (cookieStore.get("pp-e2e-fixture")?.value !== "1") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="sr-only">Admin job form E2E fixture</h1>
      <AdminJobFormE2EFixture />
    </main>
  );
}
