import { NextResponse } from "next/server";
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

    if (!hasSupabaseServerEnv()) {
      return NextResponse.json({
        ok: true,
        demoMode: true,
        message: "Review captured in demo mode. Configure Supabase to persist records.",
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

    const { error } = await supabase.from("reviews").insert({
      booking_id: payload.bookingId,
      provider_id: payload.providerId,
      customer_name: payload.customerName,
      rating: payload.rating,
      review_text: payload.comment,
    });

    if (error) {
      throw error;
    }

    const { data: ratings, error: ratingsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("provider_id", payload.providerId);

    if (ratingsError) {
      throw ratingsError;
    }

    const reviewCount = ratings.length;
    const ratingAverage = ratings.reduce((sum, row) => sum + row.rating, 0) / reviewCount;

    await supabase
      .from("providers")
      .update({
        rating_average: Number(ratingAverage.toFixed(2)),
        review_count: reviewCount,
      })
      .eq("id", payload.providerId);

    return NextResponse.json({
      ok: true,
      message: "Review saved successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to save review.",
      },
      { status: 400 },
    );
  }
}
