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
    return NextResponse.json({ ok: true, demoMode: true, message: "Approved in demo mode." });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Supabase unavailable." }, { status: 500 });
  }

  const { error } = await supabase.from("providers").update({ approval_status: "approved" }).eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }

  await supabase.from("provider_verifications").upsert(
    {
      provider_id: id,
      status: "verified",
      notes: "Application approved by admin.",
    },
    { onConflict: "provider_id" },
  );

  return NextResponse.json({ ok: true });
}
