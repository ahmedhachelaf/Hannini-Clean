import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateProviderModeration } from "@/lib/provider-moderation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  const result = await updateProviderModeration({
    providerId: id,
    approvalStatus: "needs_more_info",
    verification: {
      status: "pending",
      notes: "[needs_more_info] Additional business details requested by admin.",
    },
  });

  if ("demoMode" in result && result.demoMode) {
    return NextResponse.json({ ok: true, demoMode: true, message: "Provider flagged for more info in demo mode." });
  }

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: "Provider marked as needs more info." });
}
