import { NextResponse } from "next/server";
import {
  createAnonSupabaseClient,
  getEmailVerificationMode,
  getDefaultPhoneVerificationChannel,
  getEnabledPhoneVerificationChannels,
  getPendingProviderVerification,
  getVerificationConstants,
  getVerificationDeliveryLabel,
  getVerificationErrorMessage,
  isPhoneVerificationEnabled,
  isPhoneVerificationChannelEnabled,
  normalizeVerificationTarget,
  setPendingProviderVerification,
  validateVerificationTarget,
  type ProviderPhoneVerificationChannel,
  type ProviderVerificationMethod,
} from "@/lib/provider-contact-verification";

type StartVerificationPayload = {
  locale?: string;
  method?: ProviderVerificationMethod;
  channel?: ProviderPhoneVerificationChannel;
  target?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as StartVerificationPayload | null;
    const locale = payload?.locale === "fr" ? "fr" : "ar";
    const method = payload?.method === "phone" ? "phone" : "email";
    const requestedChannel = payload?.channel === "whatsapp" ? "whatsapp" : "sms";
    const rawTarget = String(payload?.target ?? "");
    const target = normalizeVerificationTarget(method, rawTarget);
    const constants = getVerificationConstants();
    const emailVerificationMode = getEmailVerificationMode();
    const phoneChannel = method === "phone" ? requestedChannel ?? getDefaultPhoneVerificationChannel() : undefined;

    if (method === "phone" && !isPhoneVerificationEnabled()) {
      return NextResponse.json(
        { ok: false, message: getVerificationErrorMessage("unsupported_phone", locale) },
        { status: 400 },
      );
    }

    if (method === "phone" && phoneChannel && !isPhoneVerificationChannelEnabled(phoneChannel)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            phoneChannel === "whatsapp"
              ? getVerificationErrorMessage("unsupported_whatsapp", locale)
              : getVerificationErrorMessage("unsupported_phone", locale),
        },
        { status: 400 },
      );
    }

    if (!validateVerificationTarget(method, rawTarget)) {
      return NextResponse.json(
        { ok: false, message: getVerificationErrorMessage("invalid_target", locale) },
        { status: 400 },
      );
    }

    const existingPending = await getPendingProviderVerification();
    if (
      existingPending &&
      existingPending.method === method &&
      existingPending.target === target &&
      Date.parse(existingPending.resendAvailableAt) > Date.now()
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: getVerificationErrorMessage("cooldown", locale),
          retryAfterSeconds: Math.max(1, Math.ceil((Date.parse(existingPending.resendAvailableAt) - Date.now()) / 1000)),
          enabledPhoneChannels: getEnabledPhoneVerificationChannels(),
        },
        { status: 429 },
      );
    }

    const supabase = createAnonSupabaseClient();

    if (!supabase) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            ok: false,
            message:
              locale === "ar"
                ? "خدمة التحقق غير مهيأة حالياً. أضف مفاتيح Supabase Auth إلى Vercel أولاً."
                : "Le service de vérification n'est pas configuré pour le moment. Ajoutez d'abord les variables Supabase Auth dans Vercel.",
          },
          { status: 503 },
        );
      }

      const pending = await setPendingProviderVerification({ method, target, channel: phoneChannel });
      return NextResponse.json({
        ok: true,
        demoMode: true,
        pending,
        delivery: getVerificationDeliveryLabel(method, locale, phoneChannel),
        retryAfterSeconds: constants.resendCooldownSeconds,
        expiresInSeconds: constants.ttlSeconds,
        enabledPhoneChannels: getEnabledPhoneVerificationChannels(),
        emailVerificationMode,
        message:
          locale === "ar"
            ? "وضع تجريبي: استخدم الرمز 111111 لإكمال التحقق."
            : "Mode démo : utilisez le code 111111 pour terminer la vérification.",
      });
    }

    console.log("[HANNINI DEBUG] Supabase call:", {
      table: "auth",
      operation: "signInWithOtp",
      payload_keys:
        method === "phone"
          ? ["phone", "options.shouldCreateUser", "options.channel"]
          : ["email", "options.shouldCreateUser", "options.data"],
    });

    const startResult =
      method === "phone"
        ? await supabase.auth.signInWithOtp({
            phone: target,
            options: { shouldCreateUser: true, channel: phoneChannel },
          })
        : await supabase.auth.signInWithOtp({
            email: target,
            options: {
              shouldCreateUser: true,
              data: {
                is_provider_signup: true,
              },
            },
          });

    console.log("[HANNINI DEBUG] Supabase result:", {
      error: startResult.error?.message,
      error_code: startResult.error?.code,
      error_details: startResult.error?.message,
      data_received: Boolean(startResult.data),
    });

    if (startResult.error) {
      console.error("provider-verification:start_failed", {
        method,
        target,
        channel: phoneChannel,
        error: startResult.error,
      });

      const normalizedError = startResult.error.message.toLowerCase();
      const isRateLimited = normalizedError.includes("rate") || normalizedError.includes("too many");
      const isPhoneConfigIssue = normalizedError.includes("phone") || normalizedError.includes("sms");
      const isWhatsAppConfigIssue = normalizedError.includes("whatsapp");
      const isEmailConfigIssue = normalizedError.includes("email") || normalizedError.includes("provider disabled");

      return NextResponse.json(
        {
          ok: false,
          message: isRateLimited
            ? locale === "ar"
              ? "لقد طلبت رموزاً كثيرة. انتظر دقيقة ثم حاول مجدداً."
              : "Trop de demandes de code. Attendez une minute puis réessayez."
            : isWhatsAppConfigIssue
              ? getVerificationErrorMessage("unsupported_whatsapp", locale)
              : isPhoneConfigIssue
                ? getVerificationErrorMessage("unsupported_phone", locale)
                : isEmailConfigIssue
                  ? locale === "ar"
                    ? "تعذر إرسال رمز البريد الإلكتروني. تأكد من تفعيل Email Auth في Supabase وأن قالب البريد يستخدم {{ .Token }}."
                    : "Impossible d'envoyer le code e-mail. Vérifiez que Email Auth est activé dans Supabase et que le modèle contient bien {{ .Token }}."
                  : locale === "ar"
                    ? "تعذر إرسال رمز التحقق الآن. حاول مرة أخرى بعد قليل."
                    : "Impossible d'envoyer le code de vérification pour le moment. Réessayez dans un instant.",
        },
        { status: isRateLimited ? 429 : 400 },
      );
    }

    const pendingWithChannel = await setPendingProviderVerification({ method, target, channel: phoneChannel });

    return NextResponse.json({
      ok: true,
      pending: pendingWithChannel,
      delivery: getVerificationDeliveryLabel(method, locale, phoneChannel),
      retryAfterSeconds: constants.resendCooldownSeconds,
      expiresInSeconds: constants.ttlSeconds,
      enabledPhoneChannels: getEnabledPhoneVerificationChannels(),
      emailVerificationMode,
      message:
        method === "phone"
          ? locale === "ar"
            ? `تم إرسال رمز التحقق عبر ${getVerificationDeliveryLabel(method, locale, phoneChannel)}.`
            : `Un code de vérification a été envoyé par ${getVerificationDeliveryLabel(method, locale, phoneChannel)}.`
          : locale === "ar"
            ? "أرسلنا رمز تحقق من 6 أرقام إلى بريدك الإلكتروني."
            : "Nous avons envoyé un code de vérification à 6 chiffres à votre e-mail.",
    });
  } catch (error) {
    console.error("[HANNINI DEBUG] Caught error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return NextResponse.json(
      {
        ok: false,
        message:
          "تعذر بدء خطوة التحقق حالياً. راجع إعدادات Supabase Auth وسجلات الخادم ثم حاول مجدداً.",
      },
      { status: 500 },
    );
  }
}
