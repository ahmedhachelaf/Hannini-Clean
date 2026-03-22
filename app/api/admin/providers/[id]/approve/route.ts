import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateProviderModeration } from "@/lib/provider-moderation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = await updateProviderModeration({
    providerId: id,
    approvalStatus: "approved",
    adminNote: typeof body.note === "string" ? body.note : undefined,
  });

  if ("demoMode" in result && result.demoMode) {
    return NextResponse.json({ ok: true, demoMode: true, message: "Provider approved in demo mode." });
  }

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: "Provider approved." });
}
