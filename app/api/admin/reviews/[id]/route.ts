import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { findDemoReview, updateDemoReviewStatus } from "@/lib/review-store";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const reviewModerationSchema = z.object({
  status: z.enum(["pending_review", "approved", "rejected"]),
  adminNote: z.string().optional().default(""),
  moderationReason: z.string().optional().default(""),
  providerReplyStatus: z.enum(["none", "pending", "approved", "rejected"]).optional(),
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
      console.error("admin-review-moderation:review_lookup_failed", reviewError);
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

    const reviewPatch: Record<string, string | null> = {
      status: payload.status,
      admin_note: payload.adminNote.trim() || null,
      moderation_reason: payload.moderationReason.trim() || null,
    };

    if (payload.providerReplyStatus) {
      reviewPatch.provider_reply_status = payload.providerReplyStatus;
    }

    let updateResult = await supabase
      .from("reviews")
      .update(reviewPatch)
      .eq("id", id);

    if (updateResult.error && /status|admin_note|moderation_reason|provider_reply_status/i.test(updateResult.error.message)) {
      throw new Error("Review moderation columns are missing. Run the latest Supabase migration.");
    }

    if (updateResult.error) {
      console.error("admin-review-moderation:update_failed", updateResult.error);
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
        console.error("admin-review-moderation:rating_lookup_failed", approvedRatings.error);
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
      console.error("admin-review-moderation:provider_metrics_failed", providerUpdate.error);
      throw providerUpdate.error;
    }

    revalidateMarketplacePaths();
    return NextResponse.json({ ok: true, message: "Review moderation updated." });
  } catch (error) {
    console.error("admin-review-moderation:unexpected_error", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to update review moderation.",
      },
      { status: 400 },
    );
  }
}
