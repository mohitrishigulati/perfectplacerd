import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { logDbError } from "@/lib/errors/map-db-error";
import { PUBLIC_GENERIC_ERROR } from "@/lib/errors/public-messages";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("export_candidate_data", {
    target_user_id: user.id,
  });

  if (error) {
    logDbError("api.dashboard.export", error);
    return NextResponse.json({ error: PUBLIC_GENERIC_ERROR }, { status: 500 });
  }

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="perfect-placer-export-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
