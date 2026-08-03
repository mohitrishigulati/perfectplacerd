import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { runSyntheticResumeChecks } from "@/lib/resumes/e2e-synthetic-checks";

export const dynamic = "force-dynamic";

export default async function ResumeProcessingFixturePage() {
  const cookieStore = await cookies();
  if (cookieStore.get("pp-e2e-fixture")?.value !== "1") {
    notFound();
  }

  const checks = await runSyntheticResumeChecks();
  const allPass = checks.every((check) => check.pass);

  return (
    <main className="mx-auto max-w-2xl p-6 font-mono text-sm">
      <h1 className="text-lg font-semibold">Resume processing fixture</h1>
      <p data-all-pass={allPass ? "true" : "false"}>
        {allPass ? "ALL_CHECKS_PASS" : "CHECKS_FAILED"}
      </p>
      <ul className="mt-4 space-y-2">
        {checks.map((check) => (
          <li key={check.id} data-check-id={check.id} data-pass={check.pass}>
            {check.id}: {check.pass ? "pass" : "fail"} ({check.detail})
          </li>
        ))}
      </ul>
    </main>
  );
}
