import { NextResponse } from "next/server";
import { buildBookingDescription, createCustomerBookingAccessToken, stripBookingLifecycleTags } from "@/lib/booking-lifecycle";
import { buildWhatsAppUrl } from "@/lib/phone";
import { createDemoBooking } from "@/lib/booking-store";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { getProviderById } from "@/lib/repository";
import { bookingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let locale: "ar" | "fr" = "ar";

  try {
    const contentType = request.headers.get("content-type") ?? "";
    locale = resolveBookingLocale(request);
    const payload =
      contentType.includes("multipart/form-data")
        ? bookingSchema.parse(await readFormPayload(request))
        : bookingSchema.parse(await request.json());
    const provider = await getProviderById(payload.providerId, true);

    if (!provider) {
      return NextResponse.json({ ok: false, message: "Provider not found." }, { status: 404 });
    }

    const customerAccessToken = createCustomerBookingAccessToken();
    const issueSummary = buildBookingDescription(payload, locale, customerAccessToken);
    const whatsappIssueSummary = stripBookingLifecycleTags(issueSummary);

    const whatsappMessage =
      `Bonjour / السلام عليكم. Booking via Hannini:\n` +
        `Client: ${payload.customerName}\n` +
        `Phone: ${payload.phoneNumber}\n` +
        `Date: ${payload.date} ${payload.time}\n` +
        `Address: ${payload.address}\n` +
        `Maps: ${payload.googleMapsUrl}\n` +
        `Issue: ${whatsappIssueSummary}`;
    const whatsappUrl = buildWhatsAppUrl(provider.whatsappNumber, whatsappMessage);

    if (!hasSupabaseServerEnv()) {
      const booking = createDemoBooking(payload, {
        issueDescription: issueSummary,
        customerAccessToken,
      });

      return NextResponse.json({
        ok: true,
        demoMode: true,
        bookingId: booking.id,
        statusUrl: `/${locale}/bookings/${booking.id}?token=${customerAccessToken}`,
        message:
          locale === "ar"
            ? "تم حفظ الطلب داخلياً، ويمكن لمزوّد الخدمة والإدارة متابعته الآن."
            : "La demande a bien été enregistrée en interne et peut maintenant être suivie par le prestataire et l’admin.",
        whatsappUrl: whatsappUrl ?? undefined,
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
      statusUrl: `/${locale}/bookings/${data.id}?token=${customerAccessToken}`,
      message:
        locale === "ar"
          ? "تم حفظ الطلب داخلياً، ويمكن متابعته من صفحة الحالة مع استمرار خيار واتساب للتأكيد."
          : "La demande est bien enregistrée en interne. Vous pouvez suivre son statut, et WhatsApp reste disponible pour confirmation.",
      whatsappUrl: whatsappUrl ?? undefined,
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

function resolveBookingLocale(request: Request): "ar" | "fr" {
  const fromHeader = request.headers.get("x-hannini-locale");

  if (fromHeader === "fr") {
    return "fr";
  }

  const referer = request.headers.get("referer") ?? "";
  return referer.includes("/fr/") ? "fr" : "ar";
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
