import { NextResponse } from "next/server";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { categories as seedCategories, zones as seedZones } from "@/data/seed";
import {
  CURRENT_CONDUCT_VERSION,
  CURRENT_POLICY_VERSION,
  createProviderManagementToken,
  mergeProviderLifecycleNotes,
} from "@/lib/provider-lifecycle";
import { createProviderPasswordSecret } from "@/lib/provider-password";
import { createDemoProviderApplication } from "@/lib/provider-store";
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
      facebookUrl: String(formData.get("facebookUrl") ?? ""),
      instagramUrl: String(formData.get("instagramUrl") ?? ""),
      tiktokUrl: String(formData.get("tiktokUrl") ?? ""),
      whatsappBusinessUrl: String(formData.get("whatsappBusinessUrl") ?? ""),
      websiteUrl: String(formData.get("websiteUrl") ?? ""),
      availableForBulkOrders: String(formData.get("availableForBulkOrders") ?? "") === "on",
      minimumOrderQuantity: String(formData.get("minimumOrderQuantity") ?? ""),
      productionCapacity: String(formData.get("productionCapacity") ?? ""),
      leadTime: String(formData.get("leadTime") ?? ""),
      deliveryArea: String(formData.get("deliveryArea") ?? ""),
      password: String(formData.get("password") ?? ""),
      passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
      ageConfirmed: String(formData.get("ageConfirmed") ?? "") === "on",
      conductAccepted: String(formData.get("conductAccepted") ?? "") === "on",
      policyAccepted: String(formData.get("policyAccepted") ?? "") === "on",
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
      const { provider, managementToken } = createDemoProviderApplication(payload, locale);
      revalidateMarketplacePaths(provider.slug);

      return NextResponse.json({
        ok: true,
        demoMode: true,
        providerId: provider.id,
        providerSlug: provider.slug,
        manageUrl: `/${locale}/join/manage?provider=${provider.id}&token=${managementToken}`,
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

    const acceptedAt = new Date().toISOString();
    const managementToken = createProviderManagementToken();
    const passwordSecret = createProviderPasswordSecret(payload.password);

    const userUpsert = await supabase.from("users").upsert(
      {
        full_name: payload.fullName,
        phone_number: primaryPhone,
        role: "provider",
      },
      {
        onConflict: "phone_number",
      },
    );

    if (userUpsert.error) {
      throw new Error(localizeServerWriteError("user", locale));
    }

    const selectedCategory = seedCategories.find((category) => category.slug === payload.categorySlug);
    const categoryUpsert = await supabase.from("categories").upsert(
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

    if (categoryUpsert.error) {
      throw new Error(localizeServerWriteError("category", locale));
    }

    const providerInsertBase = {
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
      approval_status: "pending" as const,
      is_verified: false,
      featured: false,
      profile_photo_url: "/placeholders/provider-avatar.svg",
    };

    let { data: providerRecord, error: providerError } = await supabase
      .from("providers")
      .insert({
        ...providerInsertBase,
        facebook_url: payload.facebookUrl || null,
        instagram_url: payload.instagramUrl || null,
        tiktok_url: payload.tiktokUrl || null,
        whatsapp_business_url: payload.whatsappBusinessUrl || null,
        website_url: payload.websiteUrl || null,
        available_for_bulk_orders: payload.availableForBulkOrders ?? false,
        minimum_order_quantity: payload.minimumOrderQuantity || null,
        production_capacity: payload.productionCapacity || null,
        lead_time: payload.leadTime || null,
        delivery_area: payload.deliveryArea || null,
      })
      .select("id")
      .single();

    if (providerError) {
      const fallbackInsert = await supabase
        .from("providers")
        .insert(providerInsertBase)
        .select("id")
        .single();
      providerRecord = fallbackInsert.data;
      providerError = fallbackInsert.error;
    }

    if (providerError || !providerRecord) {
      throw providerError ?? new Error("Unable to create provider.");
    }

    const providerId = providerRecord.id;

    const serviceInsert = await supabase.from("provider_services").insert({
      provider_id: providerId,
      category_slug: payload.categorySlug,
      is_primary: true,
    });

    if (serviceInsert.error) {
      console.error("provider-signups:provider_services_insert_failed", {
        locale,
        providerId,
        categorySlug: payload.categorySlug,
        error: serviceInsert.error,
      });
      await cleanupFailedProviderSignup(supabase, providerId);
      throw new Error(localizeServerWriteError("service", locale));
    }

    if (payload.zones.length > 0) {
      const normalizedZoneSlugs = Array.from(new Set(payload.zones.map((zone) => zone.trim()).filter(Boolean)));
      const selectedZones = normalizedZoneSlugs
        .map((zoneSlug) => seedZones.find((zone) => zone.slug === zoneSlug))
        .filter((zone): zone is (typeof seedZones)[number] => Boolean(zone));

      if (selectedZones.length !== normalizedZoneSlugs.length) {
        console.error("provider-signups:invalid_zone_payload", {
          locale,
          providerId,
          zones: payload.zones,
        });
        await cleanupFailedProviderSignup(supabase, providerId);
        throw new Error(localizeServerWriteError("zone_invalid", locale));
      }

      const zonesUpsert = await upsertSelectedZones(
        supabase,
        selectedZones.map((zone) => ({
          slug: zone.slug,
          province_slug: zone.provinceSlug,
          wilaya: zone.wilaya,
          name_ar: zone.name.ar,
          name_fr: zone.name.fr,
        })),
      );

      if (zonesUpsert.error) {
        console.error("provider-signups:zones_upsert_failed", {
          locale,
          providerId,
          zones: normalizedZoneSlugs,
          error: zonesUpsert.error,
        });
        await cleanupFailedProviderSignup(supabase, providerId);
        throw new Error(localizeServerWriteError("zone_seed", locale));
      }

      const areaInsert = await supabase.from("service_areas").insert(
        normalizedZoneSlugs.map((zoneSlug) => ({
          provider_id: providerId,
          zone_slug: zoneSlug,
        })),
      );

      if (areaInsert.error) {
        console.error("provider-signups:service_areas_insert_failed", {
          locale,
          providerId,
          zones: normalizedZoneSlugs,
          error: areaInsert.error,
        });
        await cleanupFailedProviderSignup(supabase, providerId);
        throw new Error(localizeServerWriteError("zone", locale));
      }
    }

    if ((payload.weekdays?.length ?? 0) > 0) {
      const availabilityInsert = await supabase.from("availability").insert(
        payload.weekdays!.map((weekday) => ({
          provider_id: providerId,
          day_key: weekday,
          label_ar: weekdayLabels[weekday]?.ar ?? weekday,
          label_fr: weekdayLabels[weekday]?.fr ?? weekday,
          start_time: payload.startTime ?? "08:00",
          end_time: payload.endTime ?? "18:00",
        })),
      );

      if (availabilityInsert.error) {
        console.error("provider-signups:availability_insert_failed", {
          locale,
          providerId,
          weekdays: payload.weekdays,
          error: availabilityInsert.error,
        });
        await cleanupFailedProviderSignup(supabase, providerId);
        throw new Error(localizeServerWriteError("availability", locale));
      }
    }

    if (payload.workPhotoNames.length > 0) {
      const photoInsert = await supabase.from("provider_photos").insert(
        payload.workPhotoNames.slice(0, 3).map((photoName, index) => ({
          provider_id: providerId,
          url: `/gallery/work-${(index % 3) + 1}.svg`,
          alt_text: photoName,
          sort_order: index,
        })),
      );

      if (photoInsert.error) {
        console.error("provider-signups:gallery_insert_failed", {
          locale,
          providerId,
          workPhotoNames: payload.workPhotoNames,
          error: photoInsert.error,
        });
        await cleanupFailedProviderSignup(supabase, providerId);
        throw new Error(localizeServerWriteError("gallery", locale));
      }
    }

    const verificationNotes = mergeProviderLifecycleNotes(
      "",
      {
        ageConfirmed: payload.ageConfirmed,
        conductAccepted: payload.conductAccepted,
        policyAccepted: payload.policyAccepted,
        acceptedAt,
        conductVersion: CURRENT_CONDUCT_VERSION,
        policyVersion: CURRENT_POLICY_VERSION,
        statusOverride: "submitted",
        managementToken,
        passwordSalt: passwordSecret.salt,
        passwordHash: passwordSecret.hash,
      },
      [
        payload.profilePhotoName ? `Profile photo: ${payload.profilePhotoName}` : "",
        payload.workPhotoNames.length > 0 ? `Work photos: ${payload.workPhotoNames.join(", ")}` : "",
        payload.facebookUrl ? `Facebook: ${payload.facebookUrl}` : "",
        payload.instagramUrl ? `Instagram: ${payload.instagramUrl}` : "",
        payload.tiktokUrl ? `TikTok: ${payload.tiktokUrl}` : "",
        payload.whatsappBusinessUrl ? `WhatsApp Business: ${payload.whatsappBusinessUrl}` : "",
        payload.websiteUrl ? `Website: ${payload.websiteUrl}` : "",
        payload.availableForBulkOrders
          ? `Bulk orders: yes${payload.minimumOrderQuantity ? ` | MOQ ${payload.minimumOrderQuantity}` : ""}${payload.productionCapacity ? ` | Capacity ${payload.productionCapacity}` : ""}${payload.leadTime ? ` | Lead time ${payload.leadTime}` : ""}${payload.deliveryArea ? ` | Delivery ${payload.deliveryArea}` : ""}`
          : "",
        payload.ageConfirmed ? (locale === "ar" ? "أكد 16+" : "Confirmed 16+") : "",
        payload.conductAccepted ? (locale === "ar" ? "وافق على قواعد السلوك والأمان" : "Accepted code of conduct and safety rules") : "",
        payload.policyAccepted ? (locale === "ar" ? "وافق على الشروط والسياسات ذات الصلة" : "Accepted applicable policies and terms") : "",
      ],
    );

    const verificationInsert = await supabase.from("provider_verifications").insert({
      provider_id: providerId,
      status: "pending",
      document_name: payload.verificationDocumentName ?? null,
      notes: verificationNotes,
    });

    if (verificationInsert.error) {
      console.error("provider-signups:verification_insert_failed", {
        locale,
        providerId,
        error: verificationInsert.error,
      });
      await cleanupFailedProviderSignup(supabase, providerId);
      throw new Error(localizeServerWriteError("verification", locale));
    }

    revalidateMarketplacePaths(generatedSlug);

    return NextResponse.json({
      ok: true,
      providerId,
      providerSlug: generatedSlug,
      manageUrl: `/${locale}/join/manage?provider=${providerId}&token=${managementToken}`,
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

    if (issue.message === "age_confirmation_required") {
      return locale === "ar"
        ? "يجب تأكيد أن عمرك 16 سنة أو أكثر قبل إرسال الطلب."
        : "Vous devez confirmer avoir au moins 16 ans avant d'envoyer la candidature.";
    }

    if (issue.message === "conduct_acceptance_required") {
      return locale === "ar"
        ? "يجب الموافقة على قواعد السلوك والأمان قبل إرسال الطلب."
        : "Vous devez accepter le code de conduite et les règles de sécurité avant d'envoyer la candidature.";
    }

    if (issue.message === "policy_acceptance_required") {
      return locale === "ar"
        ? "يجب الموافقة على الشروط والسياسات ذات الصلة قبل إرسال الطلب."
        : "Vous devez accepter les conditions et politiques applicables avant d'envoyer la candidature.";
    }

    if (issue.message === "password_confirmation_mismatch") {
      return locale === "ar"
        ? "تأكيد كلمة المرور غير مطابق."
        : "La confirmation du mot de passe ne correspond pas.";
    }

    if (issue.path[0] === "password") {
      return locale === "ar"
        ? "اختر كلمة مرور من 8 أحرف أو أكثر لحماية لوحة مزود الخدمة."
        : "Choisissez un mot de passe d’au moins 8 caractères pour protéger votre espace prestataire.";
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

function localizeServerWriteError(
  step: "user" | "category" | "service" | "zone" | "zone_invalid" | "zone_seed" | "availability" | "gallery" | "verification",
  locale: "ar" | "fr",
) {
  if (locale === "ar") {
    return {
      user: "تعذر حفظ بيانات الحساب الأساسية.",
      category: "تعذر حفظ فئة النشاط المختارة.",
      service: "تعذر ربط النشاط بالفئة المختارة.",
      zone: "تعذر حفظ مناطق الخدمة.",
      zone_invalid: "قيمة الولاية أو المنطقة المختارة غير صالحة. اختر منطقة الخدمة مرة أخرى.",
      zone_seed: "تعذر تجهيز مناطق الخدمة المختارة قبل حفظها. حاول مرة أخرى.",
      availability: "تعذر حفظ أوقات التوفر.",
      gallery: "تعذر حفظ صور الأعمال.",
      verification: "تعذر حفظ وثيقة التحقق وبيانات المراجعة.",
    }[step];
  }

  return {
    user: "Impossible d'enregistrer les informations de base du compte.",
    category: "Impossible d'enregistrer la catégorie sélectionnée.",
    service: "Impossible de relier le profil à la catégorie choisie.",
    zone: "Impossible d'enregistrer les zones de service.",
    zone_invalid: "La wilaya ou la zone choisie n'est pas valide. Merci de la sélectionner de nouveau.",
    zone_seed: "Impossible de préparer les zones choisies avant l'enregistrement. Merci de réessayer.",
    availability: "Impossible d'enregistrer les disponibilités.",
    gallery: "Impossible d'enregistrer les photos de réalisations.",
    verification: "Impossible d'enregistrer le document de vérification et les données de revue.",
  }[step];
}

async function upsertSelectedZones(
  supabase: NonNullable<ReturnType<typeof createServerSupabaseClient>>,
  rows: Array<{
    slug: string;
    province_slug: string;
    wilaya: string;
    name_ar: string;
    name_fr: string;
  }>,
) {
  const primaryAttempt = await supabase.from("zones").upsert(rows, { onConflict: "slug" });

  if (!primaryAttempt.error) {
    return primaryAttempt;
  }

  if (!("message" in primaryAttempt.error) || !String(primaryAttempt.error.message).includes("province_slug")) {
    return primaryAttempt;
  }

  return supabase.from("zones").upsert(
    rows.map(({ slug, wilaya, name_ar, name_fr }) => ({
      slug,
      wilaya,
      name_ar,
      name_fr,
    })),
    { onConflict: "slug" },
  );
}

async function cleanupFailedProviderSignup(
  supabase: NonNullable<ReturnType<typeof createServerSupabaseClient>>,
  providerId: string,
) {
  await supabase.from("providers").delete().eq("id", providerId);
}
