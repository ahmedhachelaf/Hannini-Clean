import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedProvider } from "@/lib/provider-auth";
import { findDemoReview, saveDemoProviderReply } from "@/lib/review-store";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const replySchema = z.object({
  reply: z.string().min(6).max(600),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const provider = await getAuthenticatedProvider();

  if (!provider) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const payload = replySchema.parse(await request.json());
    const reply = payload.reply.trim();

    if (!hasSupabaseServerEnv()) {
      const demoReview = findDemoReview(id);

      if (!demoReview || demoReview.providerId !== provider.id) {
        return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
      }

      const updatedReview = saveDemoProviderReply(id, provider.id, reply);

      if (!updatedReview) {
        return NextResponse.json(
          { ok: false, message: "Only approved reviews can receive a public provider reply." },
          { status: 400 },
        );
      }

      return NextResponse.json({
        ok: true,
        demoMode: true,
        message: "Reply saved and sent to admin review.",
      });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id, provider_id, status, provider_reply")
      .eq("id", id)
      .maybeSingle();

    if (reviewError) {
      console.error("provider-review-reply:review_lookup_failed", reviewError);
      throw reviewError;
    }

    if (!review || review.provider_id !== provider.id) {
      return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
    }

    if (review.status !== "approved") {
      return NextResponse.json(
        { ok: false, message: "Only approved reviews can receive a public provider reply." },
        { status: 400 },
      );
    }

    const update = await supabase
      .from("reviews")
      .update({
        provider_reply: reply,
        provider_reply_status: "pending",
        provider_reply_created_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (update.error && /provider_reply|provider_reply_status|provider_reply_created_at/i.test(update.error.message)) {
      console.error("provider-review-reply:missing_columns", update.error);
      return NextResponse.json(
        { ok: false, message: "Review reply columns are missing. Run the latest Supabase migration." },
        { status: 400 },
      );
    }

    if (update.error) {
      console.error("provider-review-reply:update_failed", update.error);
      throw update.error;
    }

    revalidateMarketplacePaths(provider.slug);

    return NextResponse.json({
      ok: true,
      message: "Reply saved and sent to admin review.",
    });
  } catch (error) {
    console.error("provider-review-reply:unexpected_error", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to save provider reply.",
      },
      { status: 400 },
    );
  }
}
