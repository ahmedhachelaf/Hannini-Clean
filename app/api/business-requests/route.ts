import { NextResponse } from "next/server";
import { createDemoBusinessRequest } from "@/lib/business-request-store";
import { revalidateMarketplacePaths } from "@/lib/revalidation";
import { normalizeAlgerianPhone } from "@/lib/phone";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { businessRequestSchema } from "@/lib/validation";
import type { BusinessRequestSubmissionResult } from "@/lib/types";
import { ZodError } from "zod";

export async function POST(request: Request) {
  let locale: "ar" | "fr" = "ar";

  try {
    const formData = await request.formData();
    locale = String(formData.get("locale") ?? "ar") === "fr" ? "fr" : "ar";
    const attachmentNames = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File && value.size > 0)
      .map((file) => file.name);

    const payload = businessRequestSchema.parse({
      companyName: String(formData.get("companyName") ?? ""),
      phone: normalizeAlgerianPhone(String(formData.get("phone") ?? "")),
      email: String(formData.get("email") ?? ""),
      categorySlug: String(formData.get("categorySlug") ?? ""),
      wilayaCode: String(formData.get("wilayaCode") ?? ""),
      commune: String(formData.get("commune") ?? ""),
      password: String(formData.get("password") ?? ""),
      passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
      whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
      description: String(formData.get("description") ?? ""),
      websiteUrl: String(formData.get("websiteUrl") ?? ""),
      googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
      attachmentNames,
      consentAccepted: String(formData.get("consentAccepted") ?? "") === "on",
    });

    if (!hasSupabaseServerEnv()) {
      const businessRequest = createDemoBusinessRequest({
        ...payload,
        email: payload.email || undefined,
        status: "new",
        matchedProviderIds: [],
        adminNotes: "",
      });

      return NextResponse.json({
        ok: true,
        demoMode: true,
        requestId: businessRequest.id,
        message:
          locale === "ar"
            ? "تم استلام طلب شركتك وسيظهر الآن في لوحة الإدارة للمراجعة."
            : "La demande entreprise a été reçue et apparaît maintenant dans l'admin pour revue.",
      } satisfies BusinessRequestSubmissionResult);
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    let { data, error } = await supabase
      .from("business_requests")
      .insert({
        company_name: payload.companyName,
        contact_name: payload.companyName,
        phone: payload.phone,
        email: payload.email || null,
        category_slug: payload.categorySlug,
        description: payload.description || null,
        wilaya_code: payload.wilayaCode,
        commune: payload.commune,
        wilaya_slug: payload.wilayaCode,
        frequency: "one_time",
        timeline: null,
        budget: null,
        preferred_provider_type: "either",
        attachment_names: payload.attachmentNames,
        status: "new",
        matched_provider_ids: [],
        admin_notes: null,
        consent_accepted: payload.consentAccepted,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("business-requests:insert_failed", { error });
      const businessRequest = createDemoBusinessRequest({
        ...payload,
        email: payload.email || undefined,
        status: "new",
        matchedProviderIds: [],
        adminNotes: "",
      });

      return NextResponse.json({
        ok: true,
        demoMode: true,
        requestId: businessRequest.id,
        message:
          locale === "ar"
            ? "تم استلام طلب شركتك وسيظهر الآن في لوحة الإدارة للمراجعة."
            : "La demande entreprise a été reçue et apparaît maintenant dans l'admin pour revue.",
      } satisfies BusinessRequestSubmissionResult);
    }

    revalidateMarketplacePaths();

    return NextResponse.json({
      ok: true,
      requestId: data.id,
      message:
        locale === "ar"
          ? "تم استلام طلب شركتك وسيظهر الآن في لوحة الإدارة للمراجعة."
          : "La demande entreprise a été reçue et apparaît maintenant dans l'admin pour revue.",
    } satisfies BusinessRequestSubmissionResult);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: localizeBusinessRequestError(error, locale),
      } satisfies BusinessRequestSubmissionResult,
      { status: 400 },
    );
  }
}

function localizeBusinessRequestError(error: unknown, locale: "ar" | "fr") {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];

    if (firstIssue?.message === "consent_required") {
      return locale === "ar"
        ? "يرجى الموافقة على مراجعة الطلب قبل الإرسال."
        : "Merci d'accepter la revue manuelle avant l'envoi.";
    }

    return locale === "ar"
      ? "يرجى مراجعة الحقول المطلوبة ثم إعادة المحاولة."
      : "Merci de vérifier les champs obligatoires puis de réessayer.";
  }

  return error instanceof Error
    ? error.message
    : locale === "ar"
      ? "تعذر إرسال الطلب حالياً."
      : "Impossible d'envoyer la demande pour le moment.";
}
