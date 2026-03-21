import { NextResponse } from "next/server";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { categories as seedCategories, zones as seedZones } from "@/data/seed";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { providerSignupSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { ZodError } from "zod";

const weekdayLabels: Record<string, { ar: string; fr: string }> = {
  sat: { ar: "السبت", fr: "Samedi" },
  sun: { ar: "الأحد", fr: "Dimanche" },
  mon: { ar: "الاثنين", fr: "Lundi" },
  tue: { ar: "الثلاثاء", fr: "Mardi" },
  wed: { ar: "الأربعاء", fr: "Mercredi" },
  thu: { ar: "الخميس", fr: "Jeudi" },
};

export async function POST(request: Request) {
  let locale: "ar" | "fr" = "ar";

  try {
    const formData = await request.formData();
    locale = String(formData.get("locale") ?? "ar") === "fr" ? "fr" : "ar";
    const profilePhoto = formData.get("profilePhoto");
    const verificationDocument = formData.get("verificationDocument");
    const workPhotos = formData.getAll("workPhotos");

    const payload = providerSignupSchema.parse({
      profileType: String(formData.get("profileType") ?? "service_provider"),
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

    const primaryPhone = payload.phoneNumber || payload.whatsappNumber;
    const primaryWhatsapp = payload.whatsappNumber || payload.phoneNumber;
    const generatedSlug = `${slugify(payload.workshopName || payload.fullName)}-${Date.now().toString(36).slice(-5)}`;
    const primaryZone = seedZones.find((zone) => zone.slug === payload.zones[0]);
    const fallbackMapsUrl =
      payload.googleMapsUrl ||
      `https://maps.google.com/?q=${encodeURIComponent(
        `${primaryZone?.name.fr ?? payload.zones[0]} ${primaryZone?.provinceName.fr ?? "Algeria"}`,
      )}`;

    if (!hasSupabaseServerEnv()) {
      return NextResponse.json({
        ok: true,
        demoMode: true,
        providerId: `demo-provider-${Date.now().toString(36)}`,
        providerSlug: generatedSlug,
        message:
          locale === "ar"
            ? "تم استلام طلبك بنجاح وهو الآن قيد المراجعة."
            : "Votre demande a bien été reçue et reste maintenant en attente de revue.",
      });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    await supabase.from("users").upsert(
      {
        full_name: payload.fullName,
        phone_number: primaryPhone,
        role: "provider",
      },
      {
        onConflict: "phone_number",
      },
    );

    const selectedCategory = seedCategories.find((category) => category.slug === payload.categorySlug);
    await supabase.from("categories").upsert(
      {
        slug: payload.categorySlug,
        icon: selectedCategory?.icon ?? "🧰",
        name_ar: selectedCategory?.name.ar ?? payload.categorySlug,
        name_fr: selectedCategory?.name.fr ?? payload.categorySlug,
        description_ar: selectedCategory?.description.ar ?? selectedCategory?.name.ar ?? payload.categorySlug,
        description_fr: selectedCategory?.description.fr ?? selectedCategory?.name.fr ?? payload.categorySlug,
      },
      { onConflict: "slug" },
    );

    const { data: providerRecord, error: providerError } = await supabase
      .from("providers")
      .insert({
        slug: generatedSlug,
        display_name: payload.fullName,
        workshop_name: payload.workshopName || null,
        phone_number: primaryPhone,
        whatsapp_number: primaryWhatsapp,
        hourly_rate: payload.hourlyRate ?? 0,
        travel_fee: payload.travelFee ?? 0,
        years_experience: payload.yearsExperience ?? 0,
        bio_ar: payload.shortDescription,
        bio_fr: payload.shortDescription,
        tagline_ar: payload.workshopName || payload.fullName,
        tagline_fr: payload.workshopName || payload.fullName,
        google_maps_url: fallbackMapsUrl,
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

    if ((payload.weekdays?.length ?? 0) > 0) {
      await supabase.from("availability").insert(
        payload.weekdays!.map((weekday) => ({
          provider_id: providerId,
          day_key: weekday,
          label_ar: weekdayLabels[weekday]?.ar ?? weekday,
          label_fr: weekdayLabels[weekday]?.fr ?? weekday,
          start_time: payload.startTime ?? "08:00",
          end_time: payload.endTime ?? "18:00",
        })),
      );
    }

    if (payload.workPhotoNames.length > 0) {
      await supabase.from("provider_photos").insert(
        payload.workPhotoNames.slice(0, 3).map((photoName, index) => ({
          provider_id: providerId,
          url: `/gallery/work-${(index % 3) + 1}.svg`,
          alt_text: photoName,
          sort_order: index,
        })),
      );
    }

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

    revalidateMarketplacePaths(generatedSlug);

    return NextResponse.json({
      ok: true,
      providerId,
      providerSlug: generatedSlug,
      message:
        locale === "ar"
          ? "تم استلام طلبك بنجاح وهو الآن قيد المراجعة."
          : "Votre demande a bien été reçue et reste maintenant en attente de revue.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: localizeSignupError(error, locale),
      },
      { status: 400 },
    );
  }
}

function localizeSignupError(error: unknown, locale: "ar" | "fr") {
  if (error instanceof ZodError) {
    const issue = error.issues[0];

    if (!issue) {
      return locale === "ar" ? "يرجى مراجعة المعلومات وإعادة الإرسال." : "Merci de vérifier les informations puis de réessayer.";
    }

    if (issue.message === "phone_or_whatsapp_required") {
      return locale === "ar"
        ? "يرجى إدخال رقم هاتف أو رقم واتساب واحد على الأقل."
        : "Veuillez renseigner au moins un numéro de téléphone ou WhatsApp.";
    }

    if (issue.path[0] === "shortDescription") {
      return locale === "ar"
        ? "يرجى إضافة وصف قصير وبسيط عن نشاطك أو خدمتك."
        : "Veuillez ajouter une courte description simple de votre activité ou service.";
    }

    if (issue.path[0] === "zones") {
      return locale === "ar"
        ? "يرجى اختيار ولاية ومدينة أو منطقة واحدة على الأقل."
        : "Veuillez choisir au moins une wilaya et une ville ou zone.";
    }

    if (issue.path[0] === "categorySlug") {
      return locale === "ar" ? "يرجى اختيار الفئة المناسبة." : "Veuillez choisir la bonne catégorie.";
    }

    if (issue.path[0] === "fullName") {
      return locale === "ar" ? "يرجى إدخال الاسم أو اسم المشروع." : "Veuillez saisir votre nom ou le nom du projet.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return locale === "ar" ? "تعذر إرسال الطلب حالياً." : "Impossible d'envoyer la demande pour le moment.";
}
