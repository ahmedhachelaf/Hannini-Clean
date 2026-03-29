import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createServerSupabaseClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { createDemoSupportCase } from "@/lib/support-store";
import { supportCaseSchema } from "@/lib/validation";

type Locale = "ar" | "fr";

function parseUuidOrNull(value: string): string | null {
  if (!value || !value.trim()) return null;
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRe.test(value.trim()) ? value.trim() : null;
}

function getLocalizedSupportMessage(locale: Locale, code: string) {
  if (locale === "ar") {
    return {
      env_missing: "خدمة الدعم غير مهيأة حالياً. تحقق من إعدادات الخادم.",
      validation_name: "يرجى إدخال اسمك الكامل.",
      validation_phone: "يرجى إدخال رقم هاتفك.",
      validation_message: "يرجى وصف المشكلة بوضوح (10 أحرف على الأقل).",
      insert_failed: "تعذر حفظ طلبك. يرجى المحاولة مجدداً.",
      table_missing: "جدول طلبات الدعم غير موجود حالياً في قاعدة البيانات.",
      schema_mismatch: "بنية جدول الدعم غير مكتملة. شغّل ترحيل قاعدة البيانات ثم أعد المحاولة.",
      permission_denied: "صلاحيات قاعدة البيانات تمنع حفظ طلب الدعم حالياً.",
      success_demo: "تم إنشاء طلب الدعم في الوضع التجريبي.",
      success: "تم إرسال طلب الدعم بنجاح.",
    }[code] ?? "تعذر إرسال الطلب. يرجى المحاولة مجدداً.";
  }

  return {
    env_missing: "Le service de support n'est pas configuré pour le moment. Vérifiez la configuration serveur.",
    validation_name: "Merci de saisir votre nom complet.",
    validation_phone: "Merci de saisir votre numéro de téléphone.",
    validation_message: "Merci de décrire le problème clairement (10 caractères minimum).",
    insert_failed: "Impossible d'enregistrer votre demande. Réessayez.",
    table_missing: "La table de support est absente de la base de données.",
    schema_mismatch: "Le schéma de support est incomplet. Exécutez la migration puis réessayez.",
    permission_denied: "Les permissions de la base empêchent l'enregistrement du support.",
    success_demo: "Demande de support créée en mode démo.",
    success: "Demande de support envoyée avec succès.",
  }[code] ?? "Impossible d'envoyer la demande. Réessayez.";
}

function getSupportFieldErrors(locale: Locale, error: ZodError) {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = String(issue.path[0] ?? "");
    if (!path || fields[path]) continue;

    if (path === "reporterName") {
      fields.reporterName = getLocalizedSupportMessage(locale, "validation_name");
    } else if (path === "phoneNumber") {
      fields.phoneNumber = getLocalizedSupportMessage(locale, "validation_phone");
    } else if (path === "message") {
      fields.message = getLocalizedSupportMessage(locale, "validation_message");
    } else {
      fields[path] = locale === "ar" ? "يرجى مراجعة هذا الحقل." : "Merci de vérifier ce champ.";
    }
  }

  return fields;
}

function buildSupportMessageWithFlags(message: string, flags: { blockContact: boolean; isSensitive: boolean; reporterName: string; reporterPhone: string }) {
  const tags = [
    flags.blockContact ? "[request_safety_block]" : "",
    flags.isSensitive ? "[privacy_sensitive]" : "",
    flags.reporterName ? `[reporter_name:${flags.reporterName}]` : "",
    flags.reporterPhone ? `[reporter_phone:${flags.reporterPhone}]` : "",
  ]
    .filter(Boolean)
    .join("");

  return `${tags}${message}`;
}

export async function POST(request: Request) {
  console.log("[HANNINI DEBUG] Function called:", "support:submit", new Date().toISOString());
  let locale: Locale = "ar";

  try {
    const formData = await request.formData();
    locale = String(formData.get("locale") ?? "ar") === "fr" ? "fr" : "ar";
    const attachmentNames = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File && value.size > 0)
      .map((file) => file.name);

    const payload = supportCaseSchema.parse({
      actorRole: String(formData.get("actorRole") ?? ""),
      category: String(formData.get("category") ?? ""),
      requestSafetyBlock:
        String(formData.get("blockContact") ?? formData.get("requestSafetyBlock") ?? "") === "on",
      privacySensitive:
        String(formData.get("isSensitive") ?? formData.get("privacySensitive") ?? "") === "on",
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      reporterName: String(formData.get("reporterName") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? formData.get("reporterPhone") ?? ""),
      email: String(formData.get("email") ?? formData.get("reporterEmail") ?? ""),
      bookingReference: String(formData.get("bookingReference") ?? formData.get("bookingRef") ?? ""),
      providerId: String(formData.get("providerId") ?? formData.get("providerRef") ?? ""),
      providerSlug: String(formData.get("providerSlug") ?? ""),
      attachmentNames,
    });

    const legacyTaggedMessage = buildSupportMessageWithFlags(payload.message, {
      blockContact: payload.requestSafetyBlock,
      isSensitive: payload.privacySensitive,
      reporterName: payload.reporterName,
      reporterPhone: payload.phoneNumber,
    });

    console.log("[HANNINI DEBUG] Form data extracted:", {
      has_name: Boolean(payload.reporterName),
      has_phone: Boolean(payload.phoneNumber),
      has_description: Boolean(payload.message),
      description_length: payload.message.length,
      block_contact: payload.requestSafetyBlock,
      is_sensitive: payload.privacySensitive,
    });

    if (!hasSupabaseServerEnv()) {
      const supportCase = createDemoSupportCase({
        actorRole: payload.actorRole,
        category: payload.category,
        status: "open",
        requestSafetyBlock: payload.requestSafetyBlock,
        privacySensitive: payload.privacySensitive,
        subject: payload.subject,
        message: payload.message,
        reporterName: payload.reporterName,
        reporterPhone: payload.phoneNumber,
        phoneNumber: payload.phoneNumber || undefined,
        email: payload.email || undefined,
        bookingId: payload.bookingReference || undefined,
        providerId: payload.providerId || undefined,
        providerSlug: payload.providerSlug || undefined,
        attachmentNames: payload.attachmentNames,
      });

      return NextResponse.json({
        ok: true,
        demoMode: true,
        caseId: supportCase.id,
        message: getLocalizedSupportMessage(locale, "success_demo"),
      });
    }

    const supabase = createServerSupabaseClient();
    if (!supabase) {
      throw new Error("missing_supabase_env");
    }

    const bookingUuid = parseUuidOrNull(payload.bookingReference);
    const providerUuid = parseUuidOrNull(payload.providerId);
    let interactionVerified = false;
    let resolvedBookingId = bookingUuid;
    let resolvedProviderId = providerUuid;

    if (payload.bookingReference) {
      console.log("[HANNINI DEBUG] Supabase call:", {
        table: "bookings",
        operation: "lookup",
        payload_keys: bookingUuid ? ["id"] : ["phone_number"],
      });

      const bookingLookup =
        bookingUuid
          ? await supabase.from("bookings").select("id, provider_id, phone_number").eq("id", bookingUuid).maybeSingle()
          : await supabase
              .from("bookings")
              .select("id, provider_id, phone_number")
              .eq("phone_number", payload.bookingReference)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

      console.log("[HANNINI DEBUG] Supabase result:", {
        error: bookingLookup.error?.message,
        error_code: bookingLookup.error?.code,
        error_details: bookingLookup.error?.details,
        data_received: Boolean(bookingLookup.data),
      });

      if (bookingLookup.data) {
        interactionVerified = true;
        resolvedBookingId = bookingLookup.data.id;
        resolvedProviderId = resolvedProviderId ?? bookingLookup.data.provider_id ?? null;
      }
    }

    const fullPayload = {
      actor_role: payload.actorRole,
      issue_category: payload.category,
      status: "open",
      request_safety_block: payload.requestSafetyBlock,
      privacy_sensitive: payload.privacySensitive,
      subject: payload.subject,
      message: payload.message,
      phone_number: payload.phoneNumber || null,
      reporter_name: payload.reporterName,
      reporter_phone: payload.phoneNumber || null,
      email: payload.email || null,
      booking_id: resolvedBookingId,
      provider_id: resolvedProviderId,
      provider_slug: payload.providerSlug || null,
      reported_provider_id: resolvedProviderId,
      interaction_verified: interactionVerified,
      attachment_names: payload.attachmentNames,
    };

    console.log("[HANNINI DEBUG] Supabase call:", {
      table: "support_cases",
      operation: "insert",
      payload_keys: Object.keys(fullPayload),
    });

    let { data: supportCase, error } = await supabase.from("support_cases").insert(fullPayload).select("id").single();

    console.log("[HANNINI DEBUG] Supabase result:", {
      error: error?.message,
      error_code: error?.code,
      error_details: error?.details,
      data_received: Boolean(supportCase),
    });

    if (error) {
      const fallbackPayload = {
        actor_role: payload.actorRole,
        issue_category: payload.category,
        status: "open",
        request_safety_block: payload.requestSafetyBlock,
        privacy_sensitive: payload.privacySensitive,
        subject: payload.subject,
        message: legacyTaggedMessage,
        phone_number: payload.phoneNumber || null,
        email: payload.email || null,
        booking_id: resolvedBookingId,
        provider_id: resolvedProviderId,
        provider_slug: payload.providerSlug || null,
        attachment_names: payload.attachmentNames,
      };

      console.log("[HANNINI DEBUG] Supabase call:", {
        table: "support_cases",
        operation: "fallback_insert",
        payload_keys: Object.keys(fallbackPayload),
      });

      const fallbackInsert = await supabase.from("support_cases").insert(fallbackPayload).select("id").single();
      supportCase = fallbackInsert.data;
      error = fallbackInsert.error;

      console.log("[HANNINI DEBUG] Supabase result:", {
        error: fallbackInsert.error?.message,
        error_code: fallbackInsert.error?.code,
        error_details: fallbackInsert.error?.details,
        data_received: Boolean(fallbackInsert.data),
      });
    }

    if (error || !supportCase) {
      const normalizedCode =
        error?.code === "42P01"
          ? "table_missing"
          : error?.code === "42703"
            ? "schema_mismatch"
            : error?.code === "42501"
              ? "permission_denied"
              : "insert_failed";

      return NextResponse.json(
        {
          ok: false,
          code: normalizedCode,
          message: getLocalizedSupportMessage(locale, normalizedCode),
        },
        { status: 400 },
      );
    }

    console.log("[HANNINI DEBUG] Supabase call:", {
      table: "support_messages",
      operation: "insert",
      payload_keys: ["support_case_id", "author_role", "author_name", "message", "attachment_names"],
    });

    const { error: msgError } = await supabase.from("support_messages").insert({
      support_case_id: supportCase.id,
      author_role: payload.actorRole,
      author_name: payload.reporterName,
      message: payload.message,
      attachment_names: payload.attachmentNames,
    });

    console.log("[HANNINI DEBUG] Supabase result:", {
      error: msgError?.message,
      error_code: msgError?.code,
      error_details: msgError?.details,
      data_received: !msgError,
    });

    revalidatePath("/ar/admin");
    revalidatePath("/fr/admin");
    revalidatePath("/ar/support");
    revalidatePath("/fr/support");

    return NextResponse.json({
      ok: true,
      caseId: supportCase.id,
      message: getLocalizedSupportMessage(locale, "success"),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "validation",
          message: getLocalizedSupportMessage(locale, "insert_failed"),
          fields: getSupportFieldErrors(locale, error),
        },
        { status: 400 },
      );
    }

    console.error("[HANNINI DEBUG] Caught error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "UnknownError",
    });

    const code = error instanceof Error && error.message === "missing_supabase_env" ? "env_missing" : "insert_failed";

    return NextResponse.json(
      {
        ok: false,
        code,
        message: getLocalizedSupportMessage(locale, code),
      },
      { status: 400 },
    );
  }
}
