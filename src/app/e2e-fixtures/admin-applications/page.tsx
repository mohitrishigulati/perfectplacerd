import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AdminApplicationsE2EFixture } from "./fixture-client";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsFixturePage() {
  const cookieStore = await cookies();
  if (cookieStore.get("pp-e2e-fixture")?.value !== "1") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="sr-only">Admin applications panel E2E fixture</h1>
      <AdminApplicationsE2EFixture />
    </main>
  );
}
