import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/lib/app-origin";
import {
  createAnonSupabaseClient,
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
  const payload = (await request.json().catch(() => null)) as StartVerificationPayload | null;
  const locale = payload?.locale === "fr" ? "fr" : "ar";
  const method = payload?.method === "phone" ? "phone" : "email";
  const requestedChannel = payload?.channel === "whatsapp" ? "whatsapp" : "sms";
  const rawTarget = String(payload?.target ?? "");
  const target = normalizeVerificationTarget(method, rawTarget);
  const constants = getVerificationConstants();
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
      message:
        locale === "ar"
          ? "وضع تجريبي: استخدم الرمز 111111 لإكمال التحقق."
          : "Mode démo : utilisez le code 111111 pour terminer la vérification.",
    });
  }

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
            emailRedirectTo: callbackUrl.toString(),
          },
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
          locale === "ar"
            ? "تعذر إرسال رمز التحقق الآن. حاول مرة أخرى بعد قليل."
            : "Impossible d'envoyer le code de vérification pour le moment. Réessayez dans un instant.",
      },
      { status: 400 },
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
    message:
      method === "phone"
        ? locale === "ar"
          ? `تم إرسال رمز التحقق عبر ${getVerificationDeliveryLabel(method, locale, phoneChannel)}.`
          : `Un code de vérification a été envoyé par ${getVerificationDeliveryLabel(method, locale, phoneChannel)}.`
        : locale === "ar"
          ? "أرسلنا رمز تحقق من 6 أرقام إلى بريدك الإلكتروني. إذا استمر البريد في إرسال رابط سحري بدل الرمز، فغيّر قالب Magic Link في Supabase ليستخدم الرمز."
          : "Nous avons envoyé un code de vérification à 6 chiffres à votre e-mail. Si Supabase envoie encore un magic link, remplacez le modèle Magic Link par un modèle OTP dans Supabase.",
  });
}
