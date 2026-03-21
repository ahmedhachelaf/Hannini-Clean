import { NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { providerSignupSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

const weekdayLabels: Record<string, { ar: string; fr: string }> = {
  sat: { ar: "السبت", fr: "Samedi" },
  sun: { ar: "الأحد", fr: "Dimanche" },
  mon: { ar: "الاثنين", fr: "Lundi" },
  tue: { ar: "الثلاثاء", fr: "Mardi" },
  wed: { ar: "الأربعاء", fr: "Mercredi" },
  thu: { ar: "الخميس", fr: "Jeudi" },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const profilePhoto = formData.get("profilePhoto");
    const verificationDocument = formData.get("verificationDocument");
    const workPhotos = formData.getAll("workPhotos");

    const payload = providerSignupSchema.parse({
      fullName: String(formData.get("fullName") ?? ""),
      workshopName: String(formData.get("workshopName") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
      whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
      categorySlug: String(formData.get("categorySlug") ?? ""),
      zones: formData.getAll("zones").map(String),
      hourlyRate: Number(formData.get("hourlyRate") ?? 0),
      travelFee: Number(formData.get("travelFee") ?? 0),
      yearsExperience: Number(formData.get("yearsExperience") ?? 0),
      shortDescription: String(formData.get("shortDescription") ?? ""),
      languages: formData.getAll("languages").map(String),
      googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
      weekdays: formData.getAll("weekdays").map(String),
      startTime: String(formData.get("startTime") ?? ""),
      endTime: String(formData.get("endTime") ?? ""),
      profilePhotoName: profilePhoto instanceof File && profilePhoto.size > 0 ? profilePhoto.name : undefined,
      workPhotoNames: workPhotos
        .filter((photo): photo is File => photo instanceof File && photo.size > 0)
        .map((photo) => photo.name),
      verificationDocumentName:
        verificationDocument instanceof File && verificationDocument.size > 0 ? verificationDocument.name : undefined,
    });

    const generatedSlug = `${slugify(payload.workshopName || payload.fullName)}-${Date.now().toString(36).slice(-5)}`;

    if (!hasSupabaseServerEnv()) {
      return NextResponse.json({
        ok: true,
        demoMode: true,
        providerId: `demo-provider-${Date.now().toString(36)}`,
        message: "Your application has been received and is pending review.",
      });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    await supabase.from("users").upsert(
      {
        full_name: payload.fullName,
        phone_number: payload.phoneNumber,
        role: "provider",
      },
      {
        onConflict: "phone_number",
      },
    );

    const { data: providerRecord, error: providerError } = await supabase
      .from("providers")
      .insert({
        slug: generatedSlug,
        display_name: payload.fullName,
        workshop_name: payload.workshopName || null,
        phone_number: payload.phoneNumber,
        whatsapp_number: payload.whatsappNumber,
        hourly_rate: payload.hourlyRate,
        travel_fee: payload.travelFee,
        years_experience: payload.yearsExperience,
        bio_ar: payload.shortDescription,
        bio_fr: payload.shortDescription,
        tagline_ar: payload.workshopName || payload.fullName,
        tagline_fr: payload.workshopName || payload.fullName,
        google_maps_url: payload.googleMapsUrl,
        response_time_minutes: 60,
        completed_jobs_count: 0,
        rating_average: 0,
        review_count: 0,
        approval_status: "pending",
        is_verified: false,
        featured: false,
        profile_photo_url: "/placeholders/provider-avatar.svg",
      })
      .select("id")
      .single();

    if (providerError) {
      throw providerError;
    }

    const providerId = providerRecord.id;

    await supabase.from("provider_services").insert({
      provider_id: providerId,
      category_slug: payload.categorySlug,
      is_primary: true,
    });

    if (payload.zones.length > 0) {
      await supabase.from("service_areas").insert(
        payload.zones.map((zoneSlug) => ({
          provider_id: providerId,
          zone_slug: zoneSlug,
        })),
      );
    }

    if (payload.weekdays.length > 0) {
      await supabase.from("availability").insert(
        payload.weekdays.map((weekday) => ({
          provider_id: providerId,
          day_key: weekday,
          label_ar: weekdayLabels[weekday]?.ar ?? weekday,
          label_fr: weekdayLabels[weekday]?.fr ?? weekday,
          start_time: payload.startTime,
          end_time: payload.endTime,
        })),
      );
    }

    const photoNames = payload.workPhotoNames.length > 0 ? payload.workPhotoNames : ["sample-1", "sample-2", "sample-3"];
    await supabase.from("provider_photos").insert(
      photoNames.slice(0, 3).map((photoName, index) => ({
        provider_id: providerId,
        url: `/gallery/work-${(index % 3) + 1}.svg`,
        alt_text: photoName,
        sort_order: index,
      })),
    );

    await supabase.from("provider_verifications").insert({
      provider_id: providerId,
      status: "pending",
      document_name: payload.verificationDocumentName ?? null,
      notes: [
        payload.profilePhotoName ? `Profile photo: ${payload.profilePhotoName}` : "",
        payload.workPhotoNames.length > 0 ? `Work photos: ${payload.workPhotoNames.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    });

    return NextResponse.json({
      ok: true,
      providerId,
      message: "Your application has been received and is pending review.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to submit provider application.",
      },
      { status: 400 },
    );
  }
}
