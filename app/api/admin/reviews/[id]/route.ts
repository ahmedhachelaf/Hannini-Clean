import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { findDemoReview, updateDemoReviewStatus } from "@/lib/review-store";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const reviewModerationSchema = z.object({
  status: z.enum(["pending_review", "approved", "rejected"]),
  adminNote: z.string().optional().default(""),
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
    const payload = reviewModerationSchema.parse(await request.json());

    if (!hasSupabaseServerEnv()) {
      const review = updateDemoReviewStatus(id, payload);

      if (!review) {
        return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
      }

      revalidateMarketplacePaths();
      return NextResponse.json({ ok: true, demoMode: true, message: "Review moderation updated in demo mode." });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    const { data: existingReview, error: reviewError } = await supabase
      .from("reviews")
      .select("id, provider_id")
      .eq("id", id)
      .maybeSingle();

    if (reviewError) {
      throw reviewError;
    }

    if (!existingReview) {
      const fallbackReview = findDemoReview(id);

      if (!fallbackReview) {
        return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
      }

      updateDemoReviewStatus(id, payload);
      revalidateMarketplacePaths();
      return NextResponse.json({ ok: true, demoMode: true, message: "Review moderation updated in demo mode." });
    }

    let updateResult = await supabase
      .from("reviews")
      .update({
        status: payload.status,
        admin_note: payload.adminNote.trim() || null,
      })
      .eq("id", id);

    if (updateResult.error && /status|admin_note/i.test(updateResult.error.message)) {
      throw new Error("Review moderation columns are missing. Run the latest Supabase migration.");
    }

    if (updateResult.error) {
      throw updateResult.error;
    }

    const approvedRatings = await supabase
      .from("reviews")
      .select("rating")
      .eq("provider_id", existingReview.provider_id)
      .eq("status", "approved");

    let ratings = approvedRatings.data ?? [];

    if (approvedRatings.error) {
      const fallbackRatings = await supabase
        .from("reviews")
        .select("rating")
        .eq("provider_id", existingReview.provider_id);

      if (fallbackRatings.error) {
        throw approvedRatings.error;
      }

      ratings = fallbackRatings.data ?? [];
    }

    const reviewCount = ratings.length;
    const ratingAverage = reviewCount > 0 ? ratings.reduce((sum, row) => sum + row.rating, 0) / reviewCount : 0;

    const providerUpdate = await supabase
      .from("providers")
      .update({
        rating_average: Number(ratingAverage.toFixed(2)),
        review_count: reviewCount,
      })
      .eq("id", existingReview.provider_id);

    if (providerUpdate.error) {
      throw providerUpdate.error;
    }

    revalidateMarketplacePaths();
    return NextResponse.json({ ok: true, message: "Review moderation updated." });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to update review moderation.",
      },
      { status: 400 },
    );
  }
}
