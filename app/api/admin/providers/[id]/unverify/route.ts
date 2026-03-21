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
    return NextResponse.json({ ok: true, demoMode: true, message: "Provider marked unverified in demo mode." });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Supabase unavailable." }, { status: 500 });
  }

  const providerUpdate = await supabase.from("providers").update({ is_verified: false }).eq("id", id);

  if (providerUpdate.error) {
    return NextResponse.json({ ok: false, message: providerUpdate.error.message }, { status: 400 });
  }

  const verificationUpdate = await supabase.from("provider_verifications").upsert(
    {
      provider_id: id,
      status: "pending",
      notes: "Verification badge removed by admin.",
    },
    { onConflict: "provider_id" },
  );

  if (verificationUpdate.error) {
    return NextResponse.json({ ok: false, message: verificationUpdate.error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: "Provider marked as unverified." });
}
