import { NextResponse } from "next/server";
import {
  createAnonSupabaseClient,
  getPendingProviderVerification,
  getVerificationConstants,
  getVerificationDeliveryLabel,
  getVerificationErrorMessage,
  isPhoneVerificationEnabled,
  normalizeVerificationTarget,
  setPendingProviderVerification,
  validateVerificationTarget,
  type ProviderVerificationMethod,
} from "@/lib/provider-contact-verification";

type StartVerificationPayload = {
  locale?: string;
  method?: ProviderVerificationMethod;
  target?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as StartVerificationPayload | null;
  const locale = payload?.locale === "fr" ? "fr" : "ar";
  const method = payload?.method === "phone" ? "phone" : "email";
  const rawTarget = String(payload?.target ?? "");
  const target = normalizeVerificationTarget(method, rawTarget);
  const constants = getVerificationConstants();

  if (method === "phone" && !isPhoneVerificationEnabled()) {
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
              ? "خدمة التحقق غير مهيأة حالياً. فعّل إعدادات Supabase Auth أولاً."
              : "Le service de vérification n'est pas configuré pour le moment. Activez d'abord Supabase Auth.",
        },
        { status: 503 },
      );
    }

    const pending = await setPendingProviderVerification({ method, target });
    return NextResponse.json({
      ok: true,
      demoMode: true,
      pending,
      delivery: getVerificationDeliveryLabel(method, locale),
      retryAfterSeconds: constants.resendCooldownSeconds,
      expiresInSeconds: constants.ttlSeconds,
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
          options: { shouldCreateUser: true },
        })
      : await supabase.auth.signInWithOtp({
          email: target,
          options: { shouldCreateUser: true },
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

  const pending = await setPendingProviderVerification({ method, target });

  return NextResponse.json({
    ok: true,
    pending,
    delivery: getVerificationDeliveryLabel(method, locale),
    retryAfterSeconds: constants.resendCooldownSeconds,
    expiresInSeconds: constants.ttlSeconds,
    message:
      locale === "ar"
        ? `تم إرسال رمز التحقق عبر ${getVerificationDeliveryLabel(method, locale)}.`
        : `Un code de vérification a été envoyé par ${getVerificationDeliveryLabel(method, locale)}.`,
  });
}
