import { NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { getProviderById } from "@/lib/repository";
import { bookingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = bookingSchema.parse(await request.json());
    const provider = await getProviderById(payload.providerId, true);

    if (!provider) {
      return NextResponse.json({ ok: false, message: "Provider not found." }, { status: 404 });
    }

    const whatsappMessage = encodeURIComponent(
      `Bonjour / السلام عليكم. Booking via Henini:\n` +
        `Client: ${payload.customerName}\n` +
        `Phone: ${payload.phoneNumber}\n` +
        `Date: ${payload.date} ${payload.time}\n` +
        `Address: ${payload.address}\n` +
        `Maps: ${payload.googleMapsUrl}\n` +
        `Issue: ${payload.issueDescription}`,
    );

    if (!hasSupabaseServerEnv()) {
      return NextResponse.json({
        ok: true,
        demoMode: true,
        bookingId: `demo-booking-${Date.now().toString(36)}`,
        message: "Booking captured in demo mode. Configure Supabase to persist records.",
        whatsappUrl: `https://wa.me/${provider.whatsappNumber}?text=${whatsappMessage}`,
      });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    await supabase.from("users").upsert(
      {
        full_name: payload.customerName,
        phone_number: payload.phoneNumber,
        role: "customer",
      },
      {
        onConflict: "phone_number",
      },
    );

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        provider_id: payload.providerId,
        customer_name: payload.customerName,
        phone_number: payload.phoneNumber,
        service_slug: payload.selectedService,
        booking_date: payload.date,
        booking_time: payload.time,
        zone_slug: payload.zoneSlug,
        address: payload.address,
        google_maps_url: payload.googleMapsUrl,
        issue_description: payload.issueDescription,
        preferred_contact_method: payload.preferredContactMethod,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      bookingId: data.id,
      message: "Booking saved successfully.",
      whatsappUrl: `https://wa.me/${provider.whatsappNumber}?text=${whatsappMessage}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to save booking.",
      },
      { status: 400 },
    );
  }
}
