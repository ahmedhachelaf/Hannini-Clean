import { NextResponse } from "next/server";
import {
  createAnonSupabaseClient,
  getEmailVerificationMode,
  getPendingProviderVerification,
  getVerificationConstants,
  getVerificationDeliveryLabel,
  getVerificationErrorMessage,
  normalizeVerificationTarget,
  setPendingProviderVerification,
  validateVerificationTarget,
} from "@/lib/provider-contact-verification";

type StartVerificationPayload = {
  locale?: string;
  target?: string;
  resend?: boolean;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as StartVerificationPayload | null;
    const locale = payload?.locale === "fr" ? "fr" : "ar";
    const rawTarget = String(payload?.target ?? "");
    const target = normalizeVerificationTarget("email", rawTarget);
    const constants = getVerificationConstants();
    const emailVerificationMode = getEmailVerificationMode();

    if (!validateVerificationTarget("email", rawTarget)) {
      return NextResponse.json(
        { ok: false, message: getVerificationErrorMessage("invalid_target", locale) },
        { status: 400 },
      );
    }

    const existingPending = await getPendingProviderVerification();
    if (
      existingPending &&
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
                ? "خدمة التحقق عبر البريد الإلكتروني غير مهيأة حالياً. أضف مفاتيح Supabase Auth إلى Vercel أولاً."
                : "Le service de vérification par e-mail n'est pas configuré pour le moment. Ajoutez d'abord les variables Supabase Auth dans Vercel.",
          },
          { status: 503 },
        );
      }

      const pending = await setPendingProviderVerification({ method: "email", target });
      return NextResponse.json({
        ok: true,
        demoMode: true,
        pending,
        delivery: getVerificationDeliveryLabel(locale),
        retryAfterSeconds: constants.resendCooldownSeconds,
        expiresInSeconds: constants.ttlSeconds,
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
      payload_keys: ["email", "options.shouldCreateUser", "options.data"],
    });

    const startResult = await supabase.auth.signInWithOtp({
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
        target,
        error: startResult.error,
      });

      const normalizedError = startResult.error.message.toLowerCase();
      const isRateLimited = normalizedError.includes("rate") || normalizedError.includes("too many");
      const isEmailConfigIssue = normalizedError.includes("email") || normalizedError.includes("provider disabled");

      return NextResponse.json(
        {
          ok: false,
          message: isRateLimited
            ? locale === "ar"
              ? "لقد طلبت رموزاً كثيرة. انتظر دقيقة ثم حاول مجدداً."
              : "Trop de demandes de code. Attendez une minute puis réessayez."
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

    const pending = await setPendingProviderVerification({ method: "email", target });

    return NextResponse.json({
      ok: true,
      pending,
      delivery: getVerificationDeliveryLabel(locale),
      retryAfterSeconds: constants.resendCooldownSeconds,
      expiresInSeconds: constants.ttlSeconds,
      emailVerificationMode,
      message:
        locale === "ar"
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
