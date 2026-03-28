import { NextResponse } from "next/server";
import { createDemoReview } from "@/lib/review-store";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { getBookingById } from "@/lib/repository";
import { reviewSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = reviewSchema.parse(await request.json());
    const booking = await getBookingById(payload.bookingId);

    if (!booking || booking.providerId !== payload.providerId) {
      return NextResponse.json({ ok: false, message: "Booking not found for this provider." }, { status: 404 });
    }

    if (booking.customerAccessToken !== payload.customerAccessToken) {
      return NextResponse.json({ ok: false, message: "Customer access token is required for this review." }, { status: 403 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ ok: false, message: "Only completed bookings can receive a review." }, { status: 400 });
    }

    if (!hasSupabaseServerEnv()) {
      const { review, reason } = createDemoReview(payload);

      if (!review || reason === "duplicate") {
        return NextResponse.json({ ok: false, message: "A review already exists for this booking." }, { status: 400 });
      }

      return NextResponse.json({
        ok: true,
        demoMode: true,
        message: "Review received and queued for moderation in demo mode.",
      });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", payload.bookingId)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json({ ok: false, message: "A review already exists for this booking." }, { status: 400 });
    }

    const reviewInsertPayload = {
      booking_id: payload.bookingId,
      provider_id: payload.providerId,
      customer_name: payload.customerName,
      reviewer_phone: booking.phoneNumber,
      rating: payload.rating,
      review_text: payload.comment,
      status: "pending_review",
      admin_note: null,
      interaction_verified: true,
      moderation_reason: null,
    };

    let { error } = await supabase.from("reviews").insert(reviewInsertPayload);

    if (error && /status|admin_note|reviewer_phone|interaction_verified|moderation_reason/i.test(error.message)) {
      const fallbackInsert = await supabase.from("reviews").insert({
        booking_id: payload.bookingId,
        provider_id: payload.providerId,
        customer_name: payload.customerName,
        rating: payload.rating,
        review_text: payload.comment,
      });

      error = fallbackInsert.error;
    }

    if (error) {
      console.error("reviews:create_failed", error);
      throw error;
    }

    const { data: ratings, error: ratingsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("provider_id", payload.providerId)
      .eq("status", "approved");

    if (ratingsError) {
      const fallbackRatings = await supabase
        .from("reviews")
        .select("rating")
        .eq("provider_id", payload.providerId);

      if (fallbackRatings.error) {
        console.error("reviews:rating_lookup_failed", ratingsError);
        throw ratingsError;
      }

      const reviewCount = fallbackRatings.data.length;
      const ratingAverage = reviewCount > 0
        ? fallbackRatings.data.reduce((sum, row) => sum + row.rating, 0) / reviewCount
        : 0;

      await supabase
        .from("providers")
        .update({
          rating_average: Number(ratingAverage.toFixed(2)),
          review_count: reviewCount,
        })
        .eq("id", payload.providerId);

      return NextResponse.json({
        ok: true,
        message: "Review received successfully.",
      });
    }

    const reviewCount = ratings.length;
    const ratingAverage = reviewCount > 0 ? ratings.reduce((sum, row) => sum + row.rating, 0) / reviewCount : 0;

    await supabase
      .from("providers")
      .update({
        rating_average: Number(ratingAverage.toFixed(2)),
        review_count: reviewCount,
      })
      .eq("id", payload.providerId);

    return NextResponse.json({
      ok: true,
      message: "Review received for a verified completed service and queued for moderation.",
    });
  } catch (error) {
    console.error("reviews:unexpected_error", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to save review.",
      },
      { status: 400 },
    );
  }
}
