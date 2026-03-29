import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/lib/app-origin";
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
  console.log("[HANNINI DEBUG] Function called:", "provider-verification:start", new Date().toISOString());
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
      { ok: false, message: getVerificationErrorMessage("unsupported_phone", locale) },
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
  const callbackUrl = new URL("/auth/provider-verification", getAppBaseUrl());
  callbackUrl.searchParams.set("locale", locale);

  if (!supabase) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          ok: false,
          message:
            locale === "ar"
              ? "خدمة التحقق غير مهيأة حالياً. فعّل إعدادات Supabase Auth أولاً."
              : "Le service de vérification n'est pas configuré pour le moment. Activez d'abord Supabase Auth.",
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
        : emailVerificationMode === "otp"
          ? ["email", "options.shouldCreateUser", "options.data"]
          : ["email", "options.shouldCreateUser", "options.emailRedirectTo", "options.data"],
  });

  const startResult =
    method === "phone"
      ? await supabase.auth.signInWithOtp({
          phone: target,
          options: { shouldCreateUser: true, channel: phoneChannel },
        })
      : emailVerificationMode === "otp"
        ? await supabase.auth.signInWithOtp({
            email: target,
            options: {
              shouldCreateUser: true,
              data: {
                is_provider_signup: true,
              },
            },
          })
        : await supabase.auth.signInWithOtp({
            email: target,
            options: {
              shouldCreateUser: true,
              emailRedirectTo: callbackUrl.toString(),
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
      error: startResult.error,
    });

    return NextResponse.json(
      {
        ok: false,
        message:
          startResult.error.message.toLowerCase().includes("rate") || startResult.error.message.toLowerCase().includes("too many")
            ? locale === "ar"
              ? "لقد طلبت رموزاً كثيرة. انتظر دقيقة ثم حاول مجدداً."
              : "Trop de demandes de code. Attendez une minute puis réessayez."
            : startResult.error.message.toLowerCase().includes("phone") || startResult.error.message.toLowerCase().includes("sms")
              ? getVerificationErrorMessage("unsupported_phone", locale)
              : locale === "ar"
                ? "تعذر إرسال رمز التحقق الآن. حاول مرة أخرى بعد قليل."
                : "Impossible d'envoyer le code de vérification pour le moment. Réessayez dans un instant.",
      },
      { status: startResult.error.message.toLowerCase().includes("rate") ? 429 : 400 },
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
        : emailVerificationMode === "otp"
          ? locale === "ar"
            ? "أرسلنا رمز تحقق من 6 أرقام إلى بريدك الإلكتروني."
            : "Nous avons envoyé un code de vérification à 6 chiffres à votre e-mail."
          : locale === "ar"
            ? "أرسلنا رابط تحقق إلى بريدك الإلكتروني. افتح الرسالة واضغط على الرابط لإكمال التحقق."
            : "Nous avons envoyé un lien de vérification à votre e-mail. Ouvrez le message puis cliquez sur le lien pour terminer la vérification.",
  });
}
