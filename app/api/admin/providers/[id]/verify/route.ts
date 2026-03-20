import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ ok: true, demoMode: true, message: "Verified in demo mode." });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Supabase unavailable." }, { status: 500 });
  }

  const { error } = await supabase.from("providers").update({ is_verified: true }).eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }

  await supabase.from("provider_verifications").update({ status: "verified" }).eq("provider_id", id);

  return NextResponse.json({ ok: true });
}
