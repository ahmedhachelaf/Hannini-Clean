import { NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { getProviderById } from "@/lib/repository";
import { bookingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const payload =
      contentType.includes("multipart/form-data")
        ? bookingSchema.parse(await readFormPayload(request))
        : bookingSchema.parse(await request.json());
    const provider = await getProviderById(payload.providerId, true);

    if (!provider) {
      return NextResponse.json({ ok: false, message: "Provider not found." }, { status: 404 });
    }

    const issueSummary = [
      payload.issueDescription,
      payload.notificationRequested ? "Notification requested: yes" : null,
      payload.isBusinessBuyer ? "Business buyer inquiry: yes" : null,
      payload.quantityNeeded ? `Quantity needed: ${payload.quantityNeeded}` : null,
      payload.productionNeed ? `Production need: ${payload.productionNeed}` : null,
      payload.requestedLeadTime ? `Lead time requested: ${payload.requestedLeadTime}` : null,
      payload.deliveryAreaNeeded ? `Delivery area needed: ${payload.deliveryAreaNeeded}` : null,
      payload.issuePhotoNames.length > 0 ? `Issue photos: ${payload.issuePhotoNames.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappMessage = encodeURIComponent(
      `Bonjour / السلام عليكم. Booking via Henini:\n` +
        `Client: ${payload.customerName}\n` +
        `Phone: ${payload.phoneNumber}\n` +
        `Date: ${payload.date} ${payload.time}\n` +
        `Address: ${payload.address}\n` +
        `Maps: ${payload.googleMapsUrl}\n` +
        `Issue: ${issueSummary}`,
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
        issue_description: issueSummary,
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

async function readFormPayload(request: Request) {
  const formData = await request.formData();
  const files = formData
    .getAll("issuePhotos")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .map((file) => file.name);

  return {
    providerId: String(formData.get("providerId") ?? ""),
    providerSlug: String(formData.get("providerSlug") ?? ""),
    customerName: String(formData.get("customerName") ?? ""),
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    selectedService: String(formData.get("selectedService") ?? ""),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    zoneSlug: String(formData.get("zoneSlug") ?? ""),
    address: String(formData.get("address") ?? ""),
    googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
    issueDescription: String(formData.get("issueDescription") ?? ""),
    notificationRequested: String(formData.get("notificationRequested") ?? "") === "on",
    isBusinessBuyer: String(formData.get("isBusinessBuyer") ?? "") === "on",
    quantityNeeded: String(formData.get("quantityNeeded") ?? ""),
    productionNeed: String(formData.get("productionNeed") ?? ""),
    requestedLeadTime: String(formData.get("requestedLeadTime") ?? ""),
    deliveryAreaNeeded: String(formData.get("deliveryAreaNeeded") ?? ""),
    issuePhotoNames: files,
    preferredContactMethod: String(formData.get("preferredContactMethod") ?? ""),
  };
}
