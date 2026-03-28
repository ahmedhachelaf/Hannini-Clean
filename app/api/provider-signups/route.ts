import { NextResponse } from "next/server";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { categories as seedCategories, zones as seedZones } from "@/data/seed";
import { getWilayaByCode, getZoneSlugForCommune } from "@/data/algeria-locations";
import {
  CURRENT_CONDUCT_VERSION,
  CURRENT_POLICY_VERSION,
  createProviderManagementToken,
  mergeProviderLifecycleNotes,
} from "@/lib/provider-lifecycle";
import { createProviderPasswordSecret } from "@/lib/provider-password";
import {
  clearProviderVerificationCookies,
  getVerificationErrorMessage,
  getVerifiedProviderContact,
  normalizeVerificationTarget,
} from "@/lib/provider-contact-verification";
import { createDemoProviderApplication } from "@/lib/provider-store";
import { isValidAlgerianPhone, normalizeAlgerianPhone } from "@/lib/phone";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { providerSignupSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { ZodError } from "zod";

export async function POST(request: Request) {
  let locale: "ar" | "fr" = "ar";

  try {
    const formData = await request.formData();
    locale = String(formData.get("locale") ?? "ar") === "fr" ? "fr" : "ar";
    const profilePhoto = formData.get("profilePhoto");
    const verificationDocument = formData.get("verificationDocument");
    const workPhotos = formData.getAll("workPhotos");
    const certificateFiles = formData.getAll("certificateFiles");

    const payload = providerSignupSchema.parse({
      profileType: String(formData.get("profileType") ?? "service_provider"),
      fullName: String(formData.get("fullName") ?? ""),
      categorySlug: String(formData.get("categorySlug") ?? ""),
      wilayaCode: String(formData.get("wilayaCode") ?? ""),
      commune: String(formData.get("commune") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
      password: String(formData.get("password") ?? ""),
      passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
      ageConfirmed: String(formData.get("ageConfirmed") ?? "") === "on",
      conductAccepted: String(formData.get("conductAccepted") ?? "") === "on",
      policyAccepted: String(formData.get("policyAccepted") ?? "") === "on",
      workshopName: String(formData.get("workshopName") ?? ""),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
      shortDescription: String(formData.get("shortDescription") ?? ""),
      yearsExperience: Number(formData.get("yearsExperience") ?? 0),
      googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
      websiteUrl: String(formData.get("websiteUrl") ?? ""),
      facebookUrl: String(formData.get("facebookUrl") ?? ""),
      instagramUrl: String(formData.get("instagramUrl") ?? ""),
      tiktokUrl: String(formData.get("tiktokUrl") ?? ""),
      profilePhotoName: profilePhoto instanceof File && profilePhoto.size > 0 ? profilePhoto.name : undefined,
      workPhotoNames: workPhotos
        .filter((photo): photo is File => photo instanceof File && photo.size > 0)
        .map((photo) => photo.name),
      certificateFileNames: certificateFiles
        .filter((file): file is File => file instanceof File && file.size > 0)
        .map((file) => file.name),
      verificationDocumentName:
        verificationDocument instanceof File && verificationDocument.size > 0 ? verificationDocument.name : undefined,
      qualificationNotes: String(formData.get("qualificationNotes") ?? ""),
    });
    const verifiedContact = await getVerifiedProviderContact();

    const normalizedPhone = normalizeAlgerianPhone(payload.phoneNumber);
    if (!isValidAlgerianPhone(normalizedPhone)) {
      throw new Error(locale === "ar" ? "يرجى إدخال رقم هاتف جزائري صالح." : "Veuillez saisir un numéro algérien valide.");
    }

    if (!verifiedContact) {
      throw new Error(getVerificationErrorMessage("not_verified", locale));
    }

    const verifiedTargetMatches =
      (verifiedContact.method === "phone" &&
        normalizeVerificationTarget("phone", normalizedPhone) === verifiedContact.target) ||
      (verifiedContact.method === "email" &&
        normalizeVerificationTarget("email", payload.email || "") === verifiedContact.target);

    if (!verifiedTargetMatches) {
      throw new Error(getVerificationErrorMessage("not_verified", locale));
    }

    const primaryPhone = normalizedPhone;
    const primaryWhatsapp = normalizeAlgerianPhone(payload.whatsappNumber);

    if (!isValidAlgerianPhone(primaryWhatsapp)) {
      throw new Error(locale === "ar" ? "يرجى إدخال رقم واتساب جزائري صالح." : "Veuillez saisir un numéro WhatsApp algérien valide.");
    }

    const profileEmail = payload.email || (verifiedContact.method === "email" ? verifiedContact.target : "");
    const generatedSlug = `${slugify(payload.workshopName || payload.fullName)}-${Date.now().toString(36).slice(-5)}`;
    const zoneSlug = getZoneSlugForCommune(payload.wilayaCode, payload.commune);
    const primaryZone = seedZones.find((zone) => zone.slug === zoneSlug);
    const wilaya = getWilayaByCode(payload.wilayaCode);
    const fallbackMapsUrl =
      normalizeWebUrl(payload.googleMapsUrl) ||
      `https://maps.google.com/?q=${encodeURIComponent(
        `${payload.commune} ${wilaya?.name_fr ?? "Algeria"}`,
      )}`;
    const socialLinks = {
      facebook_url: normalizeSocialUrl(payload.facebookUrl, "facebook"),
      instagram_url: normalizeSocialUrl(payload.instagramUrl, "instagram"),
      tiktok_url: normalizeSocialUrl(payload.tiktokUrl, "tiktok"),
      website_url: normalizeWebUrl(payload.websiteUrl),
    };

    if (!hasSupabaseServerEnv()) {
      const { provider, managementToken } = createDemoProviderApplication(
        {
          ...payload,
          email: profileEmail,
          phoneNumber: normalizedPhone,
          whatsappNumber: primaryWhatsapp,
          zones: [zoneSlug],
        },
        locale,
      );
      revalidateMarketplacePaths(provider.slug);
      await clearProviderVerificationCookies();

      return NextResponse.json({
        ok: true,
        demoMode: true,
        providerId: provider.id,
        providerSlug: provider.slug,
        manageUrl: `/${locale}/join/manage?provider=${provider.id}&token=${managementToken}`,
        loginUrl: `/${locale}/provider/login`,
        dashboardUrl: `/${locale}/dashboard`,
        message:
          locale === "ar"
            ? "تم استلام طلبك بنجاح. يمكنك تسجيل الدخول لاحقاً ببريدك الإلكتروني أو رقمك وكلمة المرور لمتابعة حالة المراجعة."
            : "Votre demande a bien été reçue. Vous pourrez vous reconnecter plus tard avec votre e-mail ou votre numéro et votre mot de passe pour suivre l’état de la revue.",
      });
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    const acceptedAt = new Date().toISOString();
    const managementToken = createProviderManagementToken();
    const passwordSecret = createProviderPasswordSecret(payload.password);

    if (!String(verifiedContact.authUserId).startsWith("demo-")) {
      const authUpdate = await supabase.auth.admin.updateUserById(verifiedContact.authUserId, {
        password: payload.password,
        ...(verifiedContact.method === "phone"
          ? { phone: verifiedContact.target }
          : { email: profileEmail || verifiedContact.target }),
        user_metadata: {
          providerProfile: {
            fullName: payload.fullName,
            profileType: payload.profileType,
            phoneNumber: primaryPhone,
            email: profileEmail || null,
          },
        },
      });

      if (authUpdate.error) {
        console.error("provider-signups:auth_user_update_failed", {
          locale,
          authUserId: verifiedContact.authUserId,
          method: verifiedContact.method,
          target: verifiedContact.target,
          error: authUpdate.error,
        });
        throw new Error(
          locale === "ar"
            ? "تم التحقق من جهة الاتصال لكن تعذر تجهيز حساب الدخول. حاول مرة أخرى."
            : "Le contact est vérifié mais le compte de connexion n'a pas pu être préparé. Réessayez.",
        );
      }
    }

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
      years_experience: payload.yearsExperience ?? 0,
      bio_ar: payload.shortDescription || payload.fullName,
      bio_fr: payload.shortDescription || payload.fullName,
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
      wilaya_code: payload.wilayaCode,
      commune: payload.commune,
      profile_photo_url: "/placeholders/provider-avatar.svg",
    };

    let { data: providerRecord, error: providerError } = await supabase
      .from("providers")
      .insert({
        ...providerInsertBase,
        email: profileEmail || null,
        auth_user_id: verifiedContact.authUserId,
        phone_verified: verifiedContact.method === "phone",
        email_verified: verifiedContact.method === "email",
        verification_method: verifiedContact.method,
        contact_verified_at: verifiedContact.verifiedAt,
        ...socialLinks,
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
      console.error("provider-signups:provider_insert_failed", {
        locale,
        fullName: payload.fullName,
        phoneNumber: primaryPhone,
        categorySlug: payload.categorySlug,
        wilayaCode: payload.wilayaCode,
        commune: payload.commune,
        error: providerError,
      });
      throw new Error(localizeServerWriteError("provider", locale));
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

    if (zoneSlug) {
      const normalizedZoneSlugs = [zoneSlug];
      const selectedZones = normalizedZoneSlugs
        .map((zoneSlug) => seedZones.find((zone) => zone.slug === zoneSlug))
        .filter((zone): zone is (typeof seedZones)[number] => Boolean(zone));

      if (selectedZones.length !== normalizedZoneSlugs.length) {
        console.error("provider-signups:invalid_zone_payload", {
          locale,
          providerId,
          zones: [zoneSlug],
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
        accountEmail: profileEmail,
        phoneVerified: verifiedContact.method === "phone",
        emailVerified: verifiedContact.method === "email",
        verificationMethod: verifiedContact.method,
        contactVerifiedAt: verifiedContact.verifiedAt,
        verifiedAuthUserId: verifiedContact.authUserId,
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
        payload.certificateFileNames.length > 0 ? `Certificates: ${payload.certificateFileNames.join(", ")}` : "",
        payload.qualificationNotes ? `Qualifications: ${payload.qualificationNotes}` : "",
        socialLinks.facebook_url ? `Facebook: ${socialLinks.facebook_url}` : "",
        socialLinks.instagram_url ? `Instagram: ${socialLinks.instagram_url}` : "",
        socialLinks.tiktok_url ? `TikTok: ${socialLinks.tiktok_url}` : "",
        socialLinks.website_url ? `Website: ${socialLinks.website_url}` : "",
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
    await clearProviderVerificationCookies();

    return NextResponse.json({
      ok: true,
      providerId,
      providerSlug: generatedSlug,
      manageUrl: `/${locale}/join/manage?provider=${providerId}&token=${managementToken}`,
      loginUrl: `/${locale}/provider/login`,
      dashboardUrl: `/${locale}/dashboard`,
      message:
        locale === "ar"
          ? "تم استلام طلبك بنجاح. يمكنك تسجيل الدخول لاحقاً ببريدك الإلكتروني أو رقمك وكلمة المرور لمتابعة حالة المراجعة."
          : "Votre demande a bien été reçue. Vous pourrez vous reconnecter plus tard avec votre e-mail ou votre numéro et votre mot de passe pour suivre l’état de la revue.",
    });
  } catch (error) {
    console.error("provider-signups:request_failed", formatSignupErrorForLog(error));
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

    if (issue.message === "whatsapp_required") {
      return locale === "ar"
        ? "رقم واتساب مطلوب حتى يتمكن الزبائن من التواصل معك بسرعة."
        : "Le numéro WhatsApp est requis pour que les clients puissent vous contacter rapidement.";
    }

    if (issue.message === "whatsapp_invalid" || issue.path[0] === "whatsappNumber") {
      return locale === "ar"
        ? "يرجى إدخال رقم واتساب جزائري صالح."
        : "Veuillez saisir un numéro WhatsApp algérien valide.";
    }

    if (issue.path[0] === "password") {
      return locale === "ar"
        ? "اختر كلمة مرور من 8 أحرف أو أكثر لحماية لوحة مزود الخدمة."
        : "Choisissez un mot de passe d’au moins 8 caractères pour protéger votre espace prestataire.";
    }

    if (issue.path[0] === "wilayaCode") {
      return locale === "ar" ? "يرجى اختيار الولاية." : "Veuillez choisir la wilaya.";
    }

    if (issue.path[0] === "commune") {
      return locale === "ar" ? "يرجى اختيار البلدية." : "Veuillez choisir la commune.";
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

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return locale === "ar" ? "تعذر إرسال الطلب حالياً." : "Impossible d'envoyer la demande pour le moment.";
}

function localizeServerWriteError(
  step: "user" | "category" | "provider" | "service" | "zone" | "zone_invalid" | "zone_seed" | "availability" | "gallery" | "verification",
  locale: "ar" | "fr",
) {
  if (locale === "ar") {
    return {
      user: "تعذر حفظ بيانات الحساب الأساسية.",
      category: "تعذر حفظ فئة النشاط المختارة.",
      provider: "تعذر حفظ بيانات الملف الأساسي. يرجى مراجعة البيانات ثم المحاولة مرة أخرى.",
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
    provider: "Impossible d'enregistrer les données principales du profil. Merci de vérifier les informations puis de réessayer.",
    service: "Impossible de relier le profil à la catégorie choisie.",
    zone: "Impossible d'enregistrer les zones de service.",
    zone_invalid: "La wilaya ou la zone choisie n'est pas valide. Merci de la sélectionner de nouveau.",
    zone_seed: "Impossible de préparer les zones choisies avant l'enregistrement. Merci de réessayer.",
    availability: "Impossible d'enregistrer les disponibilités.",
    gallery: "Impossible d'enregistrer les photos de réalisations.",
    verification: "Impossible d'enregistrer le document de vérification et les données de revue.",
  }[step];
}

function normalizeWebUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function normalizeSocialUrl(value: string | undefined, platform: "facebook" | "instagram" | "tiktok") {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@/, "");
  if (!handle) {
    return null;
  }

  if (platform === "facebook") {
    return `https://www.facebook.com/${handle}`;
  }

  if (platform === "instagram") {
    return `https://www.instagram.com/${handle}`;
  }

  return `https://www.tiktok.com/@${handle}`;
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

function formatSignupErrorForLog(error: unknown) {
  if (error instanceof ZodError) {
    return {
      type: "zod",
      issues: error.issues,
    };
  }

  if (error instanceof Error) {
    return {
      type: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    type: typeof error,
    value: error,
  };
}
