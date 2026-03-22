import { NextResponse } from "next/server";
import { mergeBookingLifecycleDescription } from "@/lib/booking-lifecycle";
import { updateDemoBooking } from "@/lib/booking-store";
import { getAuthenticatedProvider } from "@/lib/provider-auth";
import { getBookingById } from "@/lib/repository";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const provider = await getAuthenticatedProvider();

  if (!provider) {
    return NextResponse.json({ ok: false, message: "Provider session required." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | {
        action?: "confirm" | "decline" | "reschedule" | "complete";
        providerNote?: string;
        proposedDate?: string;
        proposedTime?: string;
      }
    | null;

  if (!body?.action) {
    return NextResponse.json({ ok: false, message: "Missing action." }, { status: 400 });
  }

  const booking = await getBookingById(id);

  if (!booking || booking.providerId !== provider.id) {
    return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });
  }

  const nextStatus =
    body.action === "confirm"
      ? "confirmed"
      : body.action === "decline"
        ? "cancelled"
        : body.action === "complete"
          ? "completed"
          : booking.status;

  const nextDescription = mergeBookingLifecycleDescription(
    booking.issueDescription,
    {
      providerNote: body.providerNote?.trim() || undefined,
      proposedDate: body.action === "reschedule" ? body.proposedDate?.trim() || booking.date : booking.proposedDate,
      proposedTime: body.action === "reschedule" ? body.proposedTime?.trim() || booking.time : booking.proposedTime,
      customerAccessToken: booking.customerAccessToken,
      notificationRequested: booking.notificationRequested,
      issuePhotoNames: booking.issuePhotoNames,
      isBusinessBuyer: booking.isBusinessBuyer,
      quantityNeeded: booking.quantityNeeded,
      productionNeed: booking.productionNeed,
      requestedLeadTime: booking.requestedLeadTime,
      deliveryAreaNeeded: booking.deliveryAreaNeeded,
      updatedAt: new Date().toISOString(),
    },
  );

  if (!hasSupabaseServerEnv()) {
    const updated = updateDemoBooking(id, provider.id, {
      status: nextStatus,
      issueDescription: nextDescription,
      providerNote: body.providerNote?.trim() || undefined,
      proposedDate: body.action === "reschedule" ? body.proposedDate?.trim() || booking.date : booking.proposedDate,
      proposedTime: body.action === "reschedule" ? body.proposedTime?.trim() || booking.time : booking.proposedTime,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return NextResponse.json({ ok: false, message: "Unable to update booking." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Booking updated." });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Supabase unavailable." }, { status: 500 });
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status: nextStatus,
      issue_description: nextDescription,
    })
    .eq("id", id)
    .eq("provider_id", provider.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: "Booking updated." });
}
