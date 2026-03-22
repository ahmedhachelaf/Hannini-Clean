import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateDemoBusinessRequest } from "@/lib/business-request-store";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { z } from "zod";

const businessRequestUpdateSchema = z.object({
  status: z.enum(["new", "under_review", "matched", "closed", "rejected"]),
  adminNotes: z.string().optional().default(""),
  matchedProviderIds: z.array(z.string()).default([]),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const payload = businessRequestUpdateSchema.parse({
      status: String(formData.get("status") ?? ""),
      adminNotes: String(formData.get("adminNotes") ?? ""),
      matchedProviderIds: formData.getAll("matchedProviderIds").map(String),
    });

    if (!hasSupabaseServerEnv()) {
      const businessRequest = updateDemoBusinessRequest(id, {
        status: payload.status,
        matchedProviderIds: payload.matchedProviderIds,
        adminNotes: payload.adminNotes,
      });

      if (!businessRequest) {
        return NextResponse.json({ ok: false, message: "Business request not found." }, { status: 404 });
      }

      return NextResponse.json({ ok: true, demoMode: true, message: "Business request updated in demo mode." });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    const { error } = await supabase
      .from("business_requests")
      .update({
        status: payload.status,
        admin_notes: payload.adminNotes || null,
        matched_provider_ids: payload.matchedProviderIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      const fallbackRequest = updateDemoBusinessRequest(id, {
        status: payload.status,
        matchedProviderIds: payload.matchedProviderIds,
        adminNotes: payload.adminNotes,
      });

      if (!fallbackRequest) {
        throw error;
      }

      return NextResponse.json({ ok: true, demoMode: true, message: "Business request updated in demo mode." });
    }

    revalidateMarketplacePaths();

    return NextResponse.json({ ok: true, message: "Business request updated." });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to update business request.",
      },
      { status: 400 },
    );
  }
}
